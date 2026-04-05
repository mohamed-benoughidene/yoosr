import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin, checkProjectOwnership } from "./utils";
import { authError, notFoundError } from "./errors";

// List bots for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("bots")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(100);
    },
});

// Get a single bot
export const get = query({
    args: { id: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const bot = await ctx.db.get(args.id);
        if (bot === null) return null;

        const project = await checkProjectOwnership(ctx, bot.projectId, identity as unknown as { org_id: string });
        if (project === null) return null;

        return bot;
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
        requireAdmin(identity as unknown as { org_id: string; org_role?: string });
        if (!identity) throw authError();

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
        requireAdmin(identity as unknown as { org_id: string; org_role?: string });
        if (!identity) throw authError();

        const bot = await ctx.db.get(args.id);
        if (!bot) throw notFoundError("Bot");

        const { ...updates } = args;
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }
        await ctx.db.patch(args.id, cleanUpdates);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: bot.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "bot_updated",
            targetType: "bot",
            targetId: args.id,
            metadata: { name: bot.name },
        });
    },
});

// Internal batch delete for bot flows and the bot itself
export const _deleteBotFlowsBatch = internalMutation({
    args: {
        botId: v.id("bots"),
        projectId: v.id("projects"),
        actorId: v.string(),
        actorName: v.string(),
        botName: v.string(),
    },
    handler: async (ctx, args) => {
        const flows = await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .take(100);

        for (const flow of flows) {
            await ctx.db.delete(flow._id);
        }

        if (flows.length === 100) {
            await ctx.scheduler.runAfter(0, internal.bots._deleteBotFlowsBatch, args);
            return;
        }

        // Final batch - delete the bot record and log activity
        await ctx.db.delete(args.botId);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: args.actorId,
            actorName: args.actorName,
            action: "bot_deleted",
            targetType: "bot",
            targetId: args.botId,
            metadata: { name: args.botName },
        });
    },
});

// Delete a bot
export const remove = mutation({
    args: { id: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_id: string; org_role?: string });
        if (!identity) throw authError();

        const bot = await ctx.db.get(args.id);
        if (!bot) throw notFoundError("Bot");

        await ctx.db.patch(args.id, { status: "deleting" });

        await ctx.scheduler.runAfter(0, internal.bots._deleteBotFlowsBatch, {
            botId: args.id,
            projectId: bot.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            botName: bot.name,
        });
    },
});
