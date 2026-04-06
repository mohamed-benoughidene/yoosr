import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { assertProjectOwnership } from "./utils";
import { CONVERSATION_STATUS } from "./types";
import { authError, notFoundError } from "./errors";

// List messages for a conversation (real-time by default!)
export const list = query({
    args: {
        conversationId: v.id("conversations"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { page: [], isDone: true, continueCursor: "" };
        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("desc")
            .paginate(args.paginationOpts);
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        // Get the conversation to find the projectId
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw notFoundError("Conversation");

        // Verify caller has access to the conversation's project
        await assertProjectOwnership(ctx, conversation.projectId, identity as { org_id?: string });

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: conversation.projectId,
            senderType: args.senderType,
            senderId: args.senderId,
            content: args.content,
            attachments: args.attachments,
        });

        // Update the conversation's last message and timestamp
        const updateData: Record<string, unknown> = {
            lastMessage: args.content,
            updatedAt: Date.now(),
        };

        // If it's a visitor message, increment unread count
        if (args.senderType === "visitor") {
            updateData.unreadCount = (conversation.unreadCount ?? 0) + 1;

            if (conversation.assignedTo) {
                await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
                    projectId: conversation.projectId,
                    recipientId: conversation.assignedTo,
                    type: "new_message",
                    conversationId: args.conversationId,
                    title: "New message",
                    body: args.content.substring(0, 80),
                });
            }
        }

        await ctx.db.patch(args.conversationId, updateData);

        // Fire outbound RestHook webhook
        await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
            projectId: conversation.projectId,
            event: "message.create",
            payload: { messageId, conversationId: args.conversationId, content: args.content, senderType: args.senderType },
        });

        return messageId;
    },
});

// Internal: generate upload URL for widget file attachments (no auth required)
export const generateWidgetUploadUrl = internalMutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// Internal: send message from widget (no auth required)
export const sendFromWidget = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        senderId: v.optional(v.string()),
        fileId: v.optional(v.string()),
        fileName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let conversationId = args.conversationId;
        const conversation = await ctx.db.get(conversationId);

        if (!conversation) throw notFoundError("Conversation");

        // If conversation is resolved, create a new one
        if (conversation.status === CONVERSATION_STATUS.CLOSED) {
            conversationId = await ctx.db.insert("conversations", {
                projectId: conversation.projectId,
                visitorName: conversation.visitorName,
                visitorId: conversation.visitorId,
                status: CONVERSATION_STATUS.UNASSIGNED, // unassigned
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
            ...(args.fileId ? { fileId: args.fileId } : {}),
            ...(args.fileName ? { fileName: args.fileName } : {}),
        });

        // Only force status to 100 if it hasn't been assigned yet, to prevent booting agents/bots
        const currentUnread = conversation.status === CONVERSATION_STATUS.CLOSED ? 1 : (conversation.unreadCount ?? 0) + 1;
        const setStatusUnassigned = conversation.status !== CONVERSATION_STATUS.ASSIGNED;

        // Defer the conversation metadata update to avoid OCC conflicts with routing/bot engine
        await ctx.scheduler.runAfter(0, internal.conversations.updateMetadataInternal, {
            id: conversationId,
            lastMessage: args.content,
            unreadCount: currentUnread,
            setStatusUnassigned,
        });

        if (conversation.assignedTo) {
            await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
                projectId: conversation.projectId,
                recipientId: conversation.assignedTo,
                type: "new_message",
                conversationId: conversationId,
                title: "New message",
                body: args.content.substring(0, 80),
            });
        }

        // Smart routing and bot execution hook
        if (conversation.status === CONVERSATION_STATUS.UNASSIGNED || setStatusUnassigned) {
            // Trigger routing if currently in unassigned queue
            await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
                conversationId,
                projectId: conversation.projectId,
            });
        } else if (conversation.status === CONVERSATION_STATUS.ASSIGNED && conversation.participants && conversation.participants.length > 0 && !conversation.assignedTo) {
            // It is assigned, but `assignedTo` (which tracks human Clerk ID) is null.
            // This means one of the participants is a bot! Let's trigger the execution engine.

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _botIdString = conversation.botId || conversation.participants[0];

            await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                conversationId,
                incomingMessage: args.content,
            });
        }

        // Fire outbound RestHook webhook
        await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
            projectId: conversation.projectId,
            event: "message.create",
            payload: { messageId, conversationId: conversationId, content: args.content, senderType: "visitor" },
        });

        return { messageId, conversationId };
    },
});

// Get messages for the monitor view (Chat display)
export const getMessages = query({
    args: {
        conversationId: v.id("conversations"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        const result = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("desc")
            .paginate(args.paginationOpts);

        return {
            ...result,
            page: result.page.map((m) => {
                const isInternal = m.type === "internal"; // Using 'type' for internal notes, based on schema
                return {
                    id: m._id,
                    content: m.content,
                    senderType: m.senderType, // "visitor" | "agent" | "bot"
                    createdAt: m._creationTime,
                    isInternal: isInternal,
                };
            })
        };
    },
});

// Send a message from the monitor (Agent)
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        content: v.string(),
        isInternal: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw notFoundError("Conversation");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: args.projectId,
            senderType: "agent",
            senderId: identity.subject, // the clerk user id
            content: args.content,
            type: args.isInternal ? "internal" : "text",
        });

        // Update the conversation's last message and timestamp if not internal
        // Standard practice might update it anyway
        const updateData: Record<string, unknown> = {
            updatedAt: Date.now(),
        };

        if (!args.isInternal) {
            updateData.lastMessage = args.content;
        }

        if (conversation.firstResponseAt === undefined) {
            updateData.firstResponseAt = Date.now();
        }

        // Status becomes Assigned since an agent replied
        if (conversation.status !== CONVERSATION_STATUS.ASSIGNED) {
            updateData.status = CONVERSATION_STATUS.ASSIGNED;
        }

        // If an agent replies, we might want to pause the bot to prevent it intercepting
        updateData.botPaused = true;

        // Add the agent to participants if they aren't already
        const participants = conversation.participants || [];
        if (!participants.includes(identity.subject)) {
            participants.push(identity.subject);
            updateData.participants = participants;
        }

        await ctx.db.patch(args.conversationId, updateData);

        // Fire outbound webhook for standard messages
        if (!args.isInternal) {
            await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
                projectId: conversation.projectId,
                event: "message.create",
                payload: {
                    messageId,
                    conversationId: args.conversationId,
                    content: args.content,
                    senderType: "agent"
                },
            });
        }

        return messageId;
    },
});

// Internal: list messages for widget (no auth required)
export const listPublic = internalQuery({
    args: { 
        conversationId: v.id("conversations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 100;
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.neq(q.field("type"), "internal"))
            .take(limit);

        // 1. Collect unique senderIds where senderType is "agent"
        const agentIds = [...new Set(
            messages
                .filter(m => m.senderType === "agent" && m.senderId)
                .map(m => m.senderId as string)
        )];

        // 2. Look up matching profiles from the profiles table using by_userId index
        const profiles = await Promise.all(
            agentIds.map(id =>
                ctx.db.query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", id))
                    .first()
            )
        );

        // 3. Build a map of senderId → firstName (first word of fullName)
        const nameMap = new Map<string, string>();
        profiles.forEach(p => {
            if (p && p.fullName) {
                const firstName = p.fullName.split(" ")[0];
                nameMap.set(p.userId, firstName);
            }
        });

        // 4. Add a senderName field to each message
        return messages.map(msg => {
            let senderName = null;
            if (msg.senderType === "agent" && msg.senderId) {
                senderName = nameMap.get(msg.senderId) ?? null;
            } else if (msg.senderType === "bot") {
                senderName = "AI Assistant";
            }

            return {
                ...msg,
                senderName
            };
        });
    },
});

// Public query to get a storage URL (used instead of non-existent useStorageUrl)
export const getStorageUrl = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

