import { query, mutation, internalMutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

// Paginated activity log query — sorted newest first
export const getActivityLog = query({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { page: [], isDone: true, continueCursor: "" };

        const result = await ctx.db
            .query("activity_logs")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .paginate(args.paginationOpts);

        return result;
    },
});

// Legacy list query (kept for backward compat)
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("activity_logs")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .take(100);
    },
});

// Public mutation — used from dashboard admin actions
export const log = mutation({
    args: {
        projectId: v.id("projects"),
        actionType: v.string(),
        description: v.optional(v.string()),
        metadata: v.optional(v.any()),
        // Rich fields
        action: v.optional(v.string()),
        targetType: v.optional(v.string()),
        targetId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        return await ctx.db.insert("activity_logs", {
            projectId: args.projectId,
            userId: identity?.subject,
            actorId: identity?.subject,
            actorName: identity?.name ?? identity?.email ?? "Unknown",
            actionType: args.actionType,
            action: args.action ?? args.actionType,
            description: args.description,
            metadata: args.metadata,
            targetType: args.targetType,
            targetId: args.targetId,
            createdAt: Date.now(),
        });
    },
});

// Internal mutation — called from other Convex functions
export const logActivityInternal = internalMutation({
    args: {
        projectId: v.id("projects"),
        actorId: v.optional(v.string()),
        actorName: v.optional(v.string()),
        action: v.string(),
        targetType: v.string(),
        targetId: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("activity_logs", {
            projectId: args.projectId,
            userId: args.actorId,
            actorId: args.actorId,
            actorName: args.actorName ?? "System",
            actionType: args.action,
            action: args.action,
            targetType: args.targetType,
            targetId: args.targetId,
            metadata: args.metadata,
            createdAt: Date.now(),
        });
    },
});
