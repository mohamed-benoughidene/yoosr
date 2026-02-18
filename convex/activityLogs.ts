import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List activity logs for a project
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

// Log an activity
export const log = mutation({
    args: {
        projectId: v.id("projects"),
        actionType: v.string(),
        description: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        return await ctx.db.insert("activity_logs", {
            projectId: args.projectId,
            userId: identity?.subject,
            actionType: args.actionType,
            description: args.description,
            metadata: args.metadata,
        });
    },
});
