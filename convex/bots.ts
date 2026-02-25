import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// List bots for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("bots")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});

// Get a single bot
export const get = query({
    args: { id: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db.get(args.id);
    },
});

// Create a bot
export const create = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        type: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const botId = await ctx.db.insert("bots", {
            projectId: args.projectId,
            name: args.name,
            description: args.description,
            type: args.type,
            status: "draft",
            configuration: {},
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "bot_created",
            targetType: "bot",
            targetId: botId,
            metadata: { name: args.name, type: args.type },
        });

        return botId;
    },
});

// Update a bot
export const update = mutation({
    args: {
        id: v.id("bots"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        configuration: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const { id, ...updates } = args;
        const cleanUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }
        await ctx.db.patch(args.id, cleanUpdates);
    },
});

// Delete a bot
export const remove = mutation({
    args: { id: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const bot = await ctx.db.get(args.id);
        if (!bot) throw new Error("Bot not found");

        // Delete associated bot flows
        const flows = await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.id))
            .collect();

        for (const flow of flows) {
            await ctx.db.delete(flow._id);
        }

        await ctx.db.delete(args.id);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: bot.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "bot_updated", // "deleted" maps to bot_updated label in UI
            targetType: "bot",
            targetId: args.id,
            metadata: { name: bot.name, change: "deleted" },
        });
    },
});
