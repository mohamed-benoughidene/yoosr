import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./utils";
import { authError, notFoundError, forbiddenError, userError } from "./errors";

// ========================
// DEPARTMENTS
// ========================

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
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();
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
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();
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

export const removeDepartment = mutation({
    args: { id: v.id("departments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();

        const department = await ctx.db.get(args.id);
        if (!department) throw notFoundError("Department");
        if (department.isDefault) throw userError("Cannot delete the default department");

        await ctx.db.delete(args.id);

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

// ========================
// CANNED RESPONSES
// ========================

export const listCannedResponses = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        return await ctx.db
            .query("canned_responses")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(200);
    },
});

export const createCannedResponse = mutation({
    args: {
        projectId: v.id("projects"),
        trigger: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();
        const id = await ctx.db.insert("canned_responses", {
            ...args,
            createdBy: identity.subject,
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "canned_response_created",
            targetType: "canned_response",
            targetId: id,
            metadata: { trigger: args.trigger },
        });

        return id;
    },
});

export const updateCannedResponse = mutation({
    args: {
        id: v.id("canned_responses"),
        trigger: v.optional(v.string()),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();
        const { id, ...updates } = args;
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);

        const cannedResponse = await ctx.db.get(id);
        if (cannedResponse) {
            await ctx.runMutation(internal.activityLogs.logActivityInternal, {
                projectId: cannedResponse.projectId,
                actorId: identity.subject,
                actorName: identity.name ?? identity.email ?? "Unknown",
                action: "canned_response_updated",
                targetType: "canned_response",
                targetId: id,
            });
        }
    },
});

export const removeCannedResponse = mutation({
    args: { id: v.id("canned_responses") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();

        const cannedResponse = await ctx.db.get(args.id);
        if (!cannedResponse) throw notFoundError("Canned response");

        await ctx.db.delete(args.id);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: cannedResponse.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "canned_response_deleted",
            targetType: "canned_response",
            targetId: args.id,
        });
    },
});


// TODO: move createLabel and removeLabel to convex/labels.ts for consistency.
// All label logic (query + mutations) should live in one file.
// Update imports in the labels settings page after moving.
export const createLabel = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();
        const id = await ctx.db.insert("labels", {
            ...args,
            createdBy: identity.subject,
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "label_created",
            targetType: "label",
            targetId: id,
            metadata: { name: args.name, color: args.color },
        });

        return id;
    },
});

export const updateLabel = mutation({
    args: {
        id: v.id("labels"),
        name: v.optional(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();
        const { id, ...updates } = args;
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);

        const label = await ctx.db.get(id);
        if (label) {
            await ctx.runMutation(internal.activityLogs.logActivityInternal, {
                projectId: label.projectId,
                actorId: identity.subject,
                actorName: identity.name ?? identity.email ?? "Unknown",
                action: "label_updated",
                targetType: "label",
                targetId: id,
                metadata: { ...(args.name && { name: args.name }) },
            });
        }
    },
});

export const removeLabel = mutation({
    args: { id: v.id("labels") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();

        const label = await ctx.db.get(args.id);
        if (!label) throw notFoundError("Label");

        await ctx.db.delete(args.id);

        // Cascade: remove the deleted label name from all conversation tags in this project
        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", label.projectId))
            .take(500);

        for (const conv of conversations) {
            if (conv.tags && conv.tags.includes(label.name)) {
                await ctx.db.patch(conv._id, {
                    tags: conv.tags.filter((t) => t !== label.name),
                });
            }
        }

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: label.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "label_deleted",
            targetType: "label",
            targetId: args.id,
            metadata: { name: label.name },
        });
    },
});

// ========================
// OPERATING HOURS
// ========================

export const getOperatingHours = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const results = await ctx.db
            .query("operating_hours")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();
        return results;
    },
});

export const upsertOperatingHours = mutation({
    args: {
        projectId: v.id("projects"),
        enabled: v.boolean(),
        timezone: v.string(),
        schedule: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();

        const existing = await ctx.db
            .query("operating_hours")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();

        let resultId;
        if (existing) {
            await ctx.db.patch(existing._id, {
                enabled: args.enabled,
                timezone: args.timezone,
                schedule: args.schedule,
            });
            resultId = existing._id;
        } else {
            resultId = await ctx.db.insert("operating_hours", args);
        }

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "operating_hours_updated",
            targetType: "department",
            metadata: { enabled: args.enabled, timezone: args.timezone },
        });

        return resultId;
    },
});
