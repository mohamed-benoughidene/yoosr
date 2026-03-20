import { query } from "./_generated/server";
import { v } from "convex/values";

export const listLabels = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db
            .query("labels")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(200); // TODO: replace with paginated aggregation
    },
});
