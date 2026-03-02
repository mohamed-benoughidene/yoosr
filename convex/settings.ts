import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

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
            .collect();

        // Enrich each department with its assigned members and their profiles
        // TODO: Query members from Clerk Organization membership
        const enrichedMembers: any[] = [];

        return departments.map(dept => ({
            ...dept,
            members: enrichedMembers,
        }));
    },
});

export const createDepartment = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        routingMode: v.optional(v.string()),
        botId: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const id = await ctx.db.insert("departments", args);
        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "department_updated",
            targetType: "department",
            targetId: id,
            metadata: { name: args.name, change: "created" },
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
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const { id, ...updates } = args;
        const clean: Record<string, any> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);
    },
});

export const removeDepartment = mutation({
    args: { id: v.id("departments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        await ctx.db.delete(args.id);
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
            .collect();
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
        if (!identity) throw new Error("Not authenticated");
        return await ctx.db.insert("canned_responses", {
            ...args,
            createdBy: identity.subject,
        });
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
        if (!identity) throw new Error("Not authenticated");
        const { id, ...updates } = args;
        const clean: Record<string, any> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);
    },
});

export const removeCannedResponse = mutation({
    args: { id: v.id("canned_responses") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        await ctx.db.delete(args.id);
    },
});

// ========================
// LABELS
// ========================



export const createLabel = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        return await ctx.db.insert("labels", {
            ...args,
            createdBy: identity.subject,
        });
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
        if (!identity) throw new Error("Not authenticated");
        const { id, ...updates } = args;
        const clean: Record<string, any> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);
    },
});

export const removeLabel = mutation({
    args: { id: v.id("labels") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        await ctx.db.delete(args.id);
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
        if (!identity) throw new Error("Not authenticated");

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
