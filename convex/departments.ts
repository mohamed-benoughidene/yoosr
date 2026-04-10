/**
 * Department management — CRUD and member operations.
 * Departments are used for routing conversations and organizing team members.
 */
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./utils";
import { authError, notFoundError, forbiddenError, userError } from "./errors";
import { softDelete } from "./lib/softDelete";

/**
 * List all departments for a project.
 */
export const listDepartments = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const departments = await ctx.db
            .query("departments")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(100);

        return departments.map(dept => ({
            ...dept,
            memberIds: dept.memberIds ?? [],
        }));
    },
});

/**
 * Get departments where the current user is a member.
 */
export const getMyDepartments = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject.split("|")[0];

        const departments = await ctx.db
            .query("departments")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(100);

        return departments.filter(d => d.memberIds?.includes(userId));
    },
});

/**
 * Create a new department (admin only).
 */
export const createDepartment = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        routingMode: v.optional(v.string()),
        botId: v.optional(v.id("bots")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        const id = await ctx.db.insert("departments", args);
        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "department_created",
            targetType: "department",
            targetId: id,
            metadata: { name: args.name },
        });
        return id;
    },
});

/**
 * Update an existing department (admin only).
 */
export const updateDepartment = mutation({
    args: {
        id: v.id("departments"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        botId: v.optional(v.id("bots")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        const { id, ...updates } = args;

        const department = await ctx.db.get(id);
        if (!department) throw notFoundError("Department");

        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: department.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "department_updated",
            targetType: "department",
            targetId: id,
            metadata: { ...(args.name && { name: args.name }) },
        });
    },
});

/**
 * Delete a department (admin only). Default department cannot be deleted.
 */
export const removeDepartment = mutation({
    args: { id: v.id("departments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        const department = await ctx.db.get(args.id);
        if (!department) throw notFoundError("Department");
        if (department.isDefault) throw userError("Cannot delete the default department");

        await softDelete(ctx, "departments", args.id);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: department.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "department_deleted",
            targetType: "department",
            targetId: args.id,
            metadata: { name: department.name },
        });
    },
});

/**
 * Add a member to a department (admin only).
 */
export const addMemberToDepartment = mutation({
    args: {
        departmentId: v.id("departments"),
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        const orgId = (identity as unknown as { org_id: string }).org_id;
        if (!orgId) throw authError();

        const department = await ctx.db.get(args.departmentId);
        if (!department) throw notFoundError("Department");

        const project = await ctx.db.get(department.projectId);
        if (!project || project.orgId !== orgId) {
            throw forbiddenError();
        }

        const memberIds = department.memberIds ?? [];
        if (!memberIds.includes(args.clerkUserId)) {
            await ctx.db.patch(args.departmentId, {
                memberIds: [...memberIds, args.clerkUserId],
            });
        }

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: department.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "department_member_added",
            targetType: "department",
            targetId: args.departmentId,
            metadata: { memberId: args.clerkUserId },
        });
    },
});

/**
 * Remove a member from a department (admin only).
 */
export const removeMemberFromDepartment = mutation({
    args: {
        departmentId: v.id("departments"),
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        const orgId = (identity as unknown as { org_id: string }).org_id;
        if (!orgId) throw authError();

        const department = await ctx.db.get(args.departmentId);
        if (!department) throw notFoundError("Department");

        const project = await ctx.db.get(department.projectId);
        if (!project || project.orgId !== orgId) {
            throw forbiddenError();
        }

        const memberIds = department.memberIds ?? [];
        if (memberIds.includes(args.clerkUserId)) {
            await ctx.db.patch(args.departmentId, {
                memberIds: memberIds.filter(id => id !== args.clerkUserId),
            });
        }

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: department.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "department_member_removed",
            targetType: "department",
            targetId: args.departmentId,
            metadata: { memberId: args.clerkUserId },
        });
    },
});
