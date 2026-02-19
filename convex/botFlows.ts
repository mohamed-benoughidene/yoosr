import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get flow for a bot
export const get = query({
    args: { botId: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();
    },
});

// Save (upsert) flow for a bot
export const save = mutation({
    args: {
        botId: v.id("bots"),
        nodes: v.any(),
        edges: v.any(),
        variables: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Check if flow already exists for this bot
        const existing = await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                nodes: args.nodes,
                edges: args.edges,
                variables: args.variables,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("bot_flows", {
                botId: args.botId,
                nodes: args.nodes,
                edges: args.edges,
                variables: args.variables,
            });
        }
    },
});
