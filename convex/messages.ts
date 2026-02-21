import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
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
        let conversationId = args.conversationId;
        const conversation = await ctx.db.get(conversationId);

        if (!conversation) throw new Error("Conversation not found");

        // If conversation is resolved, create a new one
        if (conversation.status === 1000) {
            conversationId = await ctx.db.insert("conversations", {
                projectId: conversation.projectId,
                visitorName: conversation.visitorName,
                visitorId: conversation.visitorId,
                status: 100, // unassigned
                lastMessage: "Started a new conversation",
                unreadCount: 0,
                updatedAt: Date.now(),
            });

            // Trigger routing for newly created conversation
            await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
                conversationId,
                projectId: conversation.projectId,
            });

            // We also need to return this new ID so the client can update
        }

        const messageId = await ctx.db.insert("messages", {
            conversationId: conversationId,
            projectId: conversation.projectId,
            senderType: "visitor",
            senderId: args.senderId,
            content: args.content,
        });

        // Only force status to 100 if it hasn't been assigned yet, to prevent booting agents/bots
        const currentUnread = conversation.status === 1000 ? 1 : (conversation.unreadCount ?? 0) + 1;

        const patchData: any = {
            lastMessage: args.content,
            updatedAt: Date.now(),
            unreadCount: currentUnread,
        };

        if (conversation.status !== 200) {
            patchData.status = 100;
        }

        await ctx.db.patch(conversationId, patchData);

        // Smart routing and bot execution hook
        if (conversation.status === 100 || patchData.status === 100) {
            // Trigger routing if currently in unassigned queue
            await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
                conversationId,
                projectId: conversation.projectId,
            });
        } else if (conversation.status === 200 && conversation.participants && conversation.participants.length > 0 && !conversation.assignedTo) {
            // It is assigned, but `assignedTo` (which tracks human Clerk ID) is null.
            // This means one of the participants is a bot! Let's trigger the execution engine.

            const botIdString = conversation.botId || conversation.participants[0];

            await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                conversationId,
                incomingMessage: args.content,
            });
        }

        return { messageId, conversationId };
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
