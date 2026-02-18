import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// List messages for a conversation (real-time by default!)
export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();
    },
});

// List recent visitor messages for a project (for notifications)
export const listRecentByProject = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("messages")
            .withIndex("by_projectId_senderType", (q) =>
                q.eq("projectId", args.projectId).eq("senderType", "visitor")
            )
            .order("desc")
            .take(10);
    },
});

// Send a message (works for both agents and visitors)
export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        senderType: v.string(), // "visitor" | "agent" | "bot"
        senderId: v.optional(v.string()),
        attachments: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // Get the conversation to find the projectId
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: conversation.projectId,
            senderType: args.senderType,
            senderId: args.senderId,
            content: args.content,
            attachments: args.attachments,
        });

        // Update the conversation's last message and timestamp
        const updateData: Record<string, any> = {
            lastMessage: args.content,
            updatedAt: Date.now(),
        };

        // If it's a visitor message, increment unread count
        if (args.senderType === "visitor") {
            updateData.unreadCount = (conversation.unreadCount ?? 0) + 1;
        }

        await ctx.db.patch(args.conversationId, updateData);

        return messageId;
    },
});

// Internal: send message from widget (no auth required)
export const sendFromWidget = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        senderId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: conversation.projectId,
            senderType: "visitor",
            senderId: args.senderId,
            content: args.content,
        });

        await ctx.db.patch(args.conversationId, {
            lastMessage: args.content,
            updatedAt: Date.now(),
            unreadCount: (conversation.unreadCount ?? 0) + 1,
        });

        return messageId;
    },
});

// Internal: list messages for widget (no auth required)
export const listPublic = internalQuery({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();
    },
});
