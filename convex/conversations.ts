import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// List conversations for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();
    },
});

// Get a single conversation
export const get = query({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db.get(args.id);
    },
});

// Create a new conversation (used by widget — public, or by agents)
export const create = mutation({
    args: {
        projectId: v.id("projects"),
        visitorName: v.optional(v.string()),
        visitorId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const conversationId = await ctx.db.insert("conversations", {
            projectId: args.projectId,
            visitorName: args.visitorName ?? "Visitor",
            visitorId: args.visitorId,
            status: "open",
            lastMessage: "Started a new conversation",
            unreadCount: 0,
            updatedAt: Date.now(),
        });
        return conversationId;
    },
});

// Update a conversation (assign, close, etc.)
export const update = mutation({
    args: {
        id: v.id("conversations"),
        status: v.optional(v.string()),
        assignedTo: v.optional(v.string()),
        unreadCount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const { id, ...updates } = args;
        const cleanUpdates: Record<string, any> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(args.id, cleanUpdates);
    },
});

// Internal: create conversation from widget (no auth required)
export const createFromWidget = internalMutation({
    args: {
        projectId: v.id("projects"),
        visitorName: v.optional(v.string()),
        visitorId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("conversations", {
            projectId: args.projectId,
            visitorName: args.visitorName ?? "Visitor",
            visitorId: args.visitorId,
            status: "open",
            lastMessage: "Started a new conversation",
            unreadCount: 0,
            updatedAt: Date.now(),
        });
    },
});

// Internal: find conversation by visitor (for widget, no auth)
export const findByVisitor = internalQuery({
    args: {
        projectId: v.id("projects"),
        visitorId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        return conversations.find((c) => c.visitorId === args.visitorId && c.status === "open") ?? null;
    },
});

// Resolve a conversation
export const resolve = mutation({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        await ctx.db.patch(args.id, {
            status: "resolved",
            lastMessage: "Conversation resolved",
            updatedAt: Date.now(),
        });

        // Send a system message so visitor knows
        await ctx.db.insert("messages", {
            conversationId: args.id,
            projectId: conversation.projectId,
            senderType: "bot",
            content: "This conversation has been resolved. Thank you!",
        });
    },
});

// Update visitor info (inline editing from contact panel)
export const updateVisitorInfo = mutation({
    args: {
        id: v.id("conversations"),
        visitorName: v.optional(v.string()),
        visitorEmail: v.optional(v.string()),
        visitorPhone: v.optional(v.string()),
        visitorAddress: v.optional(v.string()),
        visitorNote: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const { id, ...updates } = args;
        const cleanUpdates: Record<string, any> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(id, cleanUpdates);
    },
});

// Mark conversation as read (reset unread count)
export const markAsRead = mutation({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        await ctx.db.patch(args.id, {
            unreadCount: 0,
            updatedAt: Date.now(),
        });
    },
});

// Internal: auto-close inactive conversations (called by cron)
export const autoCloseInactive = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Get all open conversations
        const openConversations = await ctx.db
            .query("conversations")
            .collect();

        const now = Date.now();

        for (const conv of openConversations) {
            if (conv.status === "resolved") continue;

            // Get project config for auto-close timeout
            const project = await ctx.db.get(conv.projectId);
            if (!project) continue;

            const config = project.widgetConfig as Record<string, any> | undefined;
            const autoCloseMinutes = config?.autoCloseMinutes ?? 30;

            // Skip if auto-close is disabled
            if (autoCloseMinutes <= 0) continue;

            const timeoutMs = autoCloseMinutes * 60 * 1000;
            const lastActivity = conv.updatedAt ?? 0;

            if (now - lastActivity > timeoutMs) {
                await ctx.db.patch(conv._id, {
                    status: "resolved",
                    lastMessage: "Conversation auto-closed due to inactivity",
                    updatedAt: now,
                });

                await ctx.db.insert("messages", {
                    conversationId: conv._id,
                    projectId: conv.projectId,
                    senderType: "bot",
                    content: "This conversation was automatically closed due to inactivity.",
                });
            }
        }
    },
});
