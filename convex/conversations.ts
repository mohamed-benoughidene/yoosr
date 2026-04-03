import { Id } from "./_generated/dataModel";
import { query, mutation, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { decryptSecret } from "./lib/crypto";

const GRAPH_API_VERSION = "v24.0";

// List conversations for a project
export const list = query({
    args: {
        projectId: v.id("projects"),
        departmentId: v.optional(v.id("departments")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.neq(q.field("status"), 1000))
            .order("desc")
            .take(100);

        if (args.departmentId) {
            return conversations.filter((c) => c.departmentId === args.departmentId || c.departmentId === undefined);
        }

        return conversations;
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

export const listUnassignedInternal = internalQuery({
    args: { projectId: v.id("projects"), limit: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId_status", (q) => q.eq("projectId", args.projectId).eq("status", 100))
            .filter((q) => q.eq(q.field("assignedTo"), undefined))
            .take(args.limit);
    },
});

export const listStaleUnassignedInternal = internalQuery({
    args: { projectId: v.id("projects"), limit: v.number(), threshold: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId_status", (q) => q.eq("projectId", args.projectId).eq("status", 100))
            .filter((q) => q.and(
                q.eq(q.field("assignedTo"), undefined),
                q.lt(q.field("updatedAt"), args.threshold)
            ))
            .take(args.limit);
    },
});

// Get the real-time bot state for the design studio debugger
export const getBotState = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("conversation_bot_state")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .first();
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
            status: 100, // 100: unassigned
            lastMessage: "Started a new conversation",
            unreadCount: 0,
            updatedAt: Date.now(),
        });



        // Track conversation count for quotas
        const usageDesc = await ctx.db.query("project_usage")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .first();
        if (usageDesc) {
            await ctx.db.patch(usageDesc._id, { conversationsCount: usageDesc.conversationsCount + 1 });
        } else {
            await ctx.db.insert("project_usage", {
                projectId: args.projectId,
                tokensConsumed: 0,
                conversationsCount: 1,
                billingCycleStart: Date.now()
            });
        }
        // Trigger smart routing engine
        await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
            conversationId,
            projectId: args.projectId,
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
        priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...updates } = args;
        const cleanUpdates: Record<string, unknown> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        // HITL Safeguards: if manually assigning, status becomes 200 and botPaused is cleared
        if (args.assignedTo) {
            cleanUpdates.status = 200;
            cleanUpdates.botPaused = true; // Human has taken over — pause the bot to prevent it from interfering.
            const conversation = await ctx.db.get(args.id);
            if (conversation) {
                const participants = conversation.participants || [];
                if (!participants.includes(args.assignedTo)) {
                    participants.push(args.assignedTo);
                }
                cleanUpdates.participants = participants;
            }
        }

        const conversation = await ctx.db.get(args.id);

        await ctx.db.patch(args.id, cleanUpdates);

        if (conversation) {
            // Check for assignment changes
            if (args.assignedTo && args.assignedTo !== conversation.assignedTo) {
                await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
                    projectId: conversation.projectId,
                    recipientId: args.assignedTo,
                    type: "assigned",
                    conversationId: args.id,
                    title: "Conversation assigned to you",
                    body: conversation.visitorName || args.id,
                });

                await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToAgent, {
                    userId: args.assignedTo,
                    title: "Conversation assigned to you",
                    body: conversation.visitorName || "A visitor needs your help",
                });

                await ctx.runMutation(internal.activityLogs.logActivityInternal, {
                    projectId: conversation.projectId,
                    actorId: identity.subject,
                    actorName: identity.name ?? identity.email ?? "Unknown",
                    action: "conversation_assigned",
                    targetType: "conversation",
                    targetId: args.id,
                    metadata: { assignedTo: args.assignedTo },
                });

                // Wire agent.assigned webhook
                await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
                    projectId: conversation.projectId,
                    event: "agent.assigned",
                    payload: {
                        conversationId: args.id,
                        projectId: conversation.projectId,
                        assignedTo: args.assignedTo,
                    },
                });
            }

            // Check for resolution
            if (Number(args.status) === 1000 && conversation.status !== 1000) {
                // Wire conversation.closed webhook
                await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
                    projectId: conversation.projectId,
                    event: "conversation.closed",
                    payload: { conversationId: args.id, projectId: conversation.projectId },
                });

                if (conversation.assignedTo && conversation.assignedTo !== identity.subject) {
                    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
                        projectId: conversation.projectId,
                        recipientId: conversation.assignedTo,
                        type: "resolved",
                        conversationId: args.id,
                        title: "Conversation resolved",
                    });
                }
            }
        }
    },
});

// Internal update without auth checks
export const updateInternal = internalMutation({
    args: {
        id: v.id("conversations"),
        status: v.optional(v.number()),
        assignedTo: v.optional(v.string()),
        unreadCount: v.optional(v.number()),
        participants: v.optional(v.array(v.string())),
        departmentId: v.optional(v.id("departments")),
        botPaused: v.optional(v.boolean()),
        botId: v.optional(v.string()),
        clearBotId: v.optional(v.boolean()),
        priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))),
    },
    handler: async (ctx, args) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, clearBotId, ...updates } = args;
        const cleanUpdates: Record<string, unknown> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        if (clearBotId) {
            cleanUpdates["botId"] = undefined;
        }

        await ctx.db.patch(args.id, cleanUpdates);
    }
});

// Update conversation status generically with botPaused support
export const updateConversationStatus = mutation({
    args: {
        id: v.id("conversations"),
        status: v.number(),
        botPaused: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const updates: { status: 100 | 200 | 1000; updatedAt: number; botPaused?: boolean } = {
            status: args.status as 100 | 200 | 1000,
            updatedAt: Date.now(),
        };

        if (args.botPaused !== undefined) {
            updates.botPaused = args.botPaused;
        }

        await ctx.db.patch(args.id, updates);
    }
});

// Internal: create conversation from widget (no auth required)
export const createFromWidget = internalMutation({
    args: {
        projectId: v.id("projects"),
        visitorName: v.optional(v.string()),
        visitorEmail: v.optional(v.string()),
        visitorPhone: v.optional(v.string()),
        visitorId: v.optional(v.string()),
        initialMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const conversationId = await ctx.db.insert("conversations", {
            projectId: args.projectId,
            visitorName: args.visitorName ?? "Visitor",
            visitorEmail: args.visitorEmail,
            visitorPhone: args.visitorPhone,
            visitorId: args.visitorId,
            status: 100, // 100: unassigned
            lastMessage: "Started a new conversation",
            unreadCount: 0,
            updatedAt: Date.now(),
        });

        const project = await ctx.db.get(args.projectId);

        // Track conversation count for quotas
        const usageDesc = await ctx.db.query("project_usage")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .first();
        if (usageDesc) {
            await ctx.db.patch(usageDesc._id, { conversationsCount: usageDesc.conversationsCount + 1 });
        } else {
            await ctx.db.insert("project_usage", {
                projectId: args.projectId,
                tokensConsumed: 0,
                conversationsCount: 1,
                billingCycleStart: Date.now()
            });
        }
        // Sync to Contacts table if we have contact info
        if (args.visitorEmail || args.visitorPhone) {
            // Check if contact exists by email or phone
            let contactId;
            if (args.visitorEmail) {
                const byEmail = await ctx.db
                    .query("contacts")
                    .withIndex("by_projectId_email", (q) => q.eq("projectId", args.projectId).eq("email", args.visitorEmail!))
                    .first();
                if (byEmail) contactId = byEmail._id;
            }
            if (!contactId && args.visitorPhone) {
                const byPhone = await ctx.db
                    .query("contacts")
                    .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
                    .filter((q) => q.eq(q.field("phone"), args.visitorPhone))
                    .first();
                if (byPhone) contactId = byPhone._id;
            }

            if (contactId) {
                // Update existing
                await ctx.db.patch(contactId, {
                    name: args.visitorName || undefined,
                    phone: args.visitorPhone || undefined,
                    email: args.visitorEmail || undefined,
                    conversationId: conversationId, // Update latest convo link
                });
            } else {
                // Create new
                await ctx.db.insert("contacts", {
                    projectId: args.projectId,
                    name: args.visitorName ?? "Visitor",
                    email: args.visitorEmail,
                    phone: args.visitorPhone,
                    conversationId: conversationId,
                });
            }
        }

        // Read project settings to optionally inject welcome message into history permanently
        const widgetConfig = (project?.widgetConfig as Record<string, unknown>) || {};
        const enableWelcome = widgetConfig.enableWelcomeNotification ?? true;
        const welcomeMsg = "system.welcome";

        if (enableWelcome) {
            await ctx.db.insert("messages", {
                conversationId,
                projectId: args.projectId,
                senderType: "bot",
                content: welcomeMsg,
                type: "system",
            });
        }

        if (args.initialMessage) {
            const firstMessageId = await ctx.db.insert("messages", {
                conversationId,
                projectId: args.projectId,
                senderType: "visitor",
                senderId: args.visitorId,
                content: args.initialMessage,
            });

            // Fire webhook for the initial visitor message (was previously missed)
            await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
                projectId: args.projectId,
                event: "message.create",
                payload: {
                    messageId: firstMessageId,
                    conversationId,
                    content: args.initialMessage,
                    senderType: "visitor",
                },
            });
        }

        // Wire conversation.opened webhook
        await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
            projectId: args.projectId,
            event: "conversation.opened",
            payload: { conversationId, projectId: args.projectId },
        });

        await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToOrg, {
            orgId: project?.orgId ?? "",
            title: "New conversation",
            body: args.visitorName ?? "A visitor started a conversation",
        });

        // Trigger smart routing engine
        await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
            conversationId,
            projectId: args.projectId,
            initialMessage: args.initialMessage,
        });

        return conversationId;
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
            .take(500); // TODO: replace with paginated aggregation

        return conversations.find((c) => c.visitorId === args.visitorId && (c.status === 100 || c.status === 200)) ?? null;
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
            status: 1000, // 1000: resolved
            lastMessage: "Conversation resolved",
            updatedAt: Date.now(),
            resolvedBy: identity.subject,
        });

        await ctx.scheduler.runAfter(0, internal.conversations.logConversationEvent, {
            projectId: conversation.projectId,
            conversationId: args.id,
            handledBy: "agent",
            closed: true,
        });

        // Wire conversation.closed webhook
        await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
            projectId: conversation.projectId,
            event: "conversation.closed",
            payload: { conversationId: args.id, projectId: conversation.projectId },
        });

        // Notify assigned agent if someone else resolved it
        if (conversation.assignedTo && conversation.assignedTo !== identity.subject) {
            await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
                projectId: conversation.projectId,
                recipientId: conversation.assignedTo,
                type: "resolved",
                conversationId: args.id,
                title: "Conversation resolved",
            });
        }

        // Trigger generative tags extraction
        await ctx.scheduler.runAfter(0, internal.tags.extractGenerativeTags, {
            conversationId: args.id,
            projectId: conversation.projectId,
        });

        // Send a system message so visitor knows
        await ctx.db.insert("messages", {
            conversationId: args.id,
            projectId: conversation.projectId,
            senderType: "bot",
            content: "system.resolved",
            type: "system",
        });

        if (conversation.channel === "telegram") {
            await ctx.scheduler.runAfter(0, internal.conversations.sendTelegramMessage, {
                conversationId: args.id,
                content: "This conversation has been resolved. Thank you!",
            });
        }

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: conversation.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "conversation_resolved",
            targetType: "conversation",
            targetId: args.id,
        });
    },
});

// Join a conversation
export const join = mutation({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        const participants = conversation.participants || [];
        if (!participants.includes(identity.subject)) {
            participants.push(identity.subject);
        }

        const updates: Record<string, unknown> = {
            participants,
            updatedAt: Date.now(),
            botPaused: true,
        };

        const wasUnassigned = !conversation.assignedTo;

        // Auto-assign to first joining agent if unassigned
        if (!conversation.assignedTo) {
            updates.assignedTo = identity.subject;
            updates.status = 200; // Assigned
        }

        // SLA Reset Logic: Mirroring assignToHuman logic from bot.ts
        const project = await ctx.db.get(conversation.projectId);
        if (project && project.slaHours) {
            updates.slaDeadline = Date.now() + (project.slaHours * 60 * 60 * 1000);
            updates.firstResponseAt = undefined;
        }

        await ctx.db.patch(args.id, updates);

        if (wasUnassigned) {
            await ctx.db.insert("messages", {
                conversationId: args.id,
                projectId: conversation.projectId,
                senderType: "bot",
                content: "system.agentConnected",
                type: "system",
            });

            if (conversation.channel === "telegram") {
                await ctx.scheduler.runAfter(0, internal.conversations.sendTelegramMessage, {
                    conversationId: args.id,
                    content: "You are now connected with an agent.",
                });
            }
        }
    },
});

// Leave a conversation
export const leave = mutation({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        const participants = (conversation.participants || []).filter(
            (id) => id !== identity.subject
        );

        const updates: Record<string, unknown> = {
            participants,
            updatedAt: Date.now(),
        };

        // If the agent leaving was the assigned one, clear it out.
        // The business logic could vary here (e.g. keep them assigned but not participating),
        // but typically leaving un-assigns you.
        if (conversation.assignedTo === identity.subject) {
            updates.assignedTo = undefined;
            // Optionally set back to 100 if no other agents, but let's keep it simple for now or check participants
            if (participants.length === 0) {
                updates.status = 100;
            }
        }

        await ctx.db.patch(args.id, updates);
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
        const cleanUpdates: Record<string, unknown> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(id, cleanUpdates);
    },
});

// Internal: deferred conversation metadata update (used by sendFromWidget to avoid OCC conflicts)
export const updateMetadataInternal = internalMutation({
    args: {
        id: v.id("conversations"),
        lastMessage: v.string(),
        unreadCount: v.number(),
        setStatusUnassigned: v.boolean(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        const patch: Record<string, unknown> = {
            lastMessage: args.lastMessage,
            updatedAt: Date.now(),
            unreadCount: args.unreadCount,
        };

        if (args.setStatusUnassigned && conversation.status === 100) {
            patch.status = 100;
        }

        await ctx.db.patch(args.id, patch);
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

// Rate a conversation (called from widget)
export const rate = internalMutation({
    args: {
        id: v.id("conversations"),
        rating: v.number(),
        feedback: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Validation
        if (args.rating < 1 || args.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        await ctx.db.patch(args.id, {
            rating: args.rating,
            feedback: args.feedback,
            updatedAt: Date.now(),
        });
    },
});

// Transfer a conversation to a specific department
export const transferToDepartment = mutation({
    args: {
        id: v.id("conversations"),
        departmentId: v.id("departments"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        const department = await ctx.db.get(args.departmentId);
        if (!department) throw new Error("Department not found");

        await ctx.db.patch(args.id, {
            assignedTo: undefined,
            status: 100, // 100: unassigned
            departmentId: args.departmentId,
            updatedAt: Date.now(),
            attributes: {
                ...(conversation.attributes || {}),
                department: department.name,
            }
        });

        // Trigger smart routing engine for the new department
        await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
            conversationId: args.id,
            projectId: conversation.projectId,
            departmentId: args.departmentId,
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: conversation.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "conversation_department_changed",
            targetType: "conversation",
            targetId: args.id,
            metadata: { departmentId: args.departmentId },
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
            .take(100);

        const now = Date.now();

        for (const conv of openConversations) {
            if (conv.status === 1000) continue;

            // Get project config for auto-close timeout
            const project = await ctx.db.get(conv.projectId);
            if (!project) continue;

            const config = project.widgetConfig as Record<string, unknown> | undefined;
            const autoCloseMinutes = (config?.autoCloseMinutes as number) ?? 30;

            // Skip if auto-close is disabled
            if (autoCloseMinutes <= 0) continue;

            const timeoutMs = autoCloseMinutes * 60 * 1000;
            const lastActivity = conv.updatedAt ?? 0;

            if (now - lastActivity > timeoutMs) {
                await ctx.db.patch(conv._id, {
                    status: 1000,
                    lastMessage: "Conversation auto-closed due to inactivity",
                    updatedAt: now,
                });

                await ctx.scheduler.runAfter(0, internal.conversations.logConversationEvent, {
                    projectId: conv.projectId,
                    conversationId: conv._id,
                    handledBy: "agent",
                    closed: true,
                });

                // Wire conversation.closed webhook
                await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
                    projectId: conv.projectId,
                    event: "conversation.closed",
                    payload: { conversationId: conv._id, projectId: conv.projectId },
                });

                // Trigger generative tags extraction
                await ctx.scheduler.runAfter(0, internal.tags.extractGenerativeTags, {
                    conversationId: conv._id,
                    projectId: conv.projectId,
                });

                await ctx.db.insert("messages", {
                    conversationId: conv._id,
                    projectId: conv.projectId,
                    senderType: "bot",
                    content: "system.inactiveClosed",
                    type: "system",
                });

                if (conv.channel === "telegram") {
                    await ctx.scheduler.runAfter(0, internal.conversations.sendTelegramMessage, {
                        conversationId: conv._id,
                        content: "This conversation was automatically closed due to inactivity.",
                    });
                }
            }
        }

        if (openConversations.length === 100) {
            await ctx.scheduler.runAfter(0, internal.conversations.autoCloseInactive, {});
        }
    },
});

// Internal: get conversation by ID (no auth check, for widget API)
export const getInternal = internalQuery({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get conversations for the monitor view
export const getConversations = query({
    args: {
        projectId: v.id("projects"),
        departmentId: v.optional(v.id("departments")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        let convos = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.neq(q.field("status"), 1000))
            .order("desc")
            .take(100);

        if (args.departmentId) {
            convos = convos.filter((c) => c.departmentId === args.departmentId);
        }

        // Bulk-fetch profiles for all unique assignedTo userIds (eliminates N+1)
        const uniqueAgentIds = [...new Set(
            convos.map((c) => c.assignedTo).filter((id): id is string => !!id)
        )];
        const profiles = await Promise.all(
            uniqueAgentIds.map((userId) =>
                ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", userId))
                    .first()
            )
        );
        const profileMap = new Map(
            uniqueAgentIds.map((userId, i) => [userId, profiles[i]] as const)
        );

        return convos.map((c) => {
            const visitorName = c.visitorName || "Visitor";
            const initials = visitorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

            let assignedAgent = null;
            if (c.assignedTo) {
                const profile = profileMap.get(c.assignedTo);
                if (profile) {
                    assignedAgent = {
                        name: profile.fullName || profile.username || "Unknown",
                        avatarUrl: profile.avatarUrl,
                    };
                }
            }

            return {
                id: c._id,
                status: c.status ?? 100,
                tags: c.tags ?? [],
                participants: c.participants ?? [],
                createdAt: c._creationTime,
                lastMessage: c.lastMessage ?? "Started a new conversation",
                timestamp: c.updatedAt ?? c._creationTime,
                assignedAgent: assignedAgent,
                assignedTo: c.assignedTo ?? null, // Kept for backwards compatibility in other UI components
                channel: c.channel ?? c.attributes?.channel ?? "web",
                unread: c.unreadCount ?? 0,
                visitorName: visitorName,
                visitorEmail: c.visitorEmail ?? "",
                visitorPhone: c.visitorPhone ?? "",
                visitorAddress: c.visitorAddress ?? "",
                visitorNote: c.visitorNote ?? "",
                user: {
                    name: visitorName,
                    email: c.visitorEmail ?? "",
                    avatar: "",
                    initials: initials || "V",
                },
                details: {
                    department: c.attributes?.department ?? "General",
                    location: c.attributes?.location ?? "Unknown",
                    language: c.attributes?.language ?? "en",
                    os: c.attributes?.os ?? "Unknown",
                    browser: c.attributes?.browser ?? "Unknown",
                    sourcePage: c.attributes?.sourcePage ?? "",
                    ip: c.attributes?.ip ?? "",
                },
                priority: c.priority,
                firstResponseAt: c.firstResponseAt,
                slaDeadline: c.slaDeadline,
                botId: c.botId ?? null,
            };
        });
    },
});

// List resolved conversations for the History page
export const listResolved = query({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { page: [], isDone: true, continueCursor: "" };

        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId_status", (q) =>
                q.eq("projectId", args.projectId).eq("status", 1000)
            )
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

// Create or update conversation from Meta (Messenger / Instagram)
export const createOrUpdateFromMeta = internalMutation({
    args: {
        pageId: v.optional(v.string()),
        phoneNumberId: v.optional(v.string()),
        senderId: v.string(),
        senderName: v.optional(v.string()),
        messageText: v.optional(v.string()),
        messageId: v.string(),
        channel: v.union(v.literal("messenger"), v.literal("instagram"), v.literal("whatsapp"))
    },
    handler: async (ctx, args) => {
        // 1. Deduplicate
        const existingMessage = await ctx.db
            .query("messages")
            .filter(q => q.eq(q.field("channelMessageId"), args.messageId))
            .first();

        if (existingMessage) {
            return;
        }

        // 2. Find the project integration
        let integration: { projectId: Id<"projects">; credentials?: Record<string, unknown> } | undefined;
        if (args.channel === "whatsapp") {
            const rows = await ctx.db
                .query("integrations")
                .filter((q) => q.eq(q.field("provider"), "whatsapp"))
                .filter((q) => q.eq(q.field("enabled"), true))
                .take(500);
            integration = rows.find(
                (i) => i.credentials && (i.credentials as { phone_number_id?: string }).phone_number_id === args.phoneNumberId
            );
        } else {
            const integrations = await ctx.db
                .query("integrations")
                .filter((q) => q.eq(q.field("provider"), args.channel))
                .filter((q) => q.eq(q.field("enabled"), true))
                .take(100);
            integration = integrations.find(
                (i) => i.credentials && i.credentials.page_id === args.pageId
            );
        }

        if (!integration) {
            return;
        }

        // 3. Find or create the conversation
        let conversationId;
        const openConversation = await ctx.db
            .query("conversations")
            .withIndex("by_projectId_channelSenderId", (q) => 
                q.eq("projectId", integration.projectId).eq("channelSenderId", args.senderId)
            )
            .filter((q) => q.neq(q.field("status"), 1000))
            .first();

        const isNew = !openConversation;

        if (openConversation) {
            conversationId = openConversation._id;
        } else {
            conversationId = await ctx.db.insert("conversations", {
                projectId: integration.projectId,
                visitorId: args.senderId,
                visitorName: args.senderName ?? (args.channel === "messenger" ? "Messenger User" : args.channel === "instagram" ? "Instagram User" : "WhatsApp User"),
                channel: args.channel,
                channelSenderId: args.senderId,
                status: 100,
                unreadCount: 0,
                updatedAt: Date.now(),
            });
        }

        // 4. Insert the message
        await ctx.db.insert("messages", {
            conversationId: conversationId,
            projectId: integration.projectId,
            senderType: "visitor",
            senderId: args.senderId,
            content: args.messageText ?? "",
            type: "text",
            channelMessageId: args.messageId,
        });

        // 5. Patch the conversation
        const conversation = await ctx.db.get(conversationId);
        if (conversation) {
            await ctx.db.patch(conversationId, {
                lastMessage: args.messageText ?? "",
                updatedAt: Date.now(),
                unreadCount: (conversation.unreadCount ?? 0) + 1,
            });

            // 6. Trigger Bot Engine or Routing
            if (isNew) {
                // For new conversations, trigger the routing engine which handles bot assignment
                await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
                    conversationId,
                    projectId: integration.projectId,
                    initialMessage: args.messageText ?? "",
                });
            } else if (!conversation.botPaused && conversation.botId) {
                // For existing conversations assigned to a bot, trigger execution directly
                await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                    conversationId,
                    incomingMessage: args.messageText ?? "",
                });
            }
        }
    }
});
// Internal: fetch a conversation by ID without auth guard (for use in internalAction/internalMutation)
export const getById = internalQuery({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Internal action: send a message to a Meta channel (Messenger / Instagram)
export const sendMetaMessage = internalAction({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        channel: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<string | undefined> => {
        // 1. Fetch the conversation
        const conversation = await ctx.runQuery(internal.conversations.getById, { id: args.conversationId });
        if (!conversation) return undefined;

        if (args.channel === "whatsapp" || conversation.channel === "whatsapp") {
            const creds = await ctx.runQuery(internal.integrations.getDecryptedWhatsAppCredentials, {
                projectId: conversation.projectId,
            });
            if (!creds || !creds.enabled) {
                console.log("[sendMetaMessage] WhatsApp integration not found or disabled");
                return undefined;
            }
            const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.phoneNumberId}/messages`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${creds.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: conversation.channelSenderId,
                    type: "text",
                    text: { preview_url: false, body: args.content },
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                const code = err?.error?.code;
                const msg = err?.error?.message;
                const labels: Record<number, string> = {
                    131047: "session expired (24h window closed)",
                    130429: "rate limit hit",
                    131048: "spam rate limit",
                    131056: "per-recipient rate limit",
                    190: "access token expired or invalid",
                };
                console.error(`[sendMetaMessage] WhatsApp error ${code}: ${labels[code] ?? ""} — ${msg}`);
                return undefined;
            }
            const data = await res.json();
            return data?.messages?.[0]?.id;
        }

        // 2. Only proceed for Meta channels
        if (conversation.channel !== "messenger" && conversation.channel !== "instagram") return undefined;

        // 3. Require a sender ID to reply to
        if (!conversation.channelSenderId) return undefined;

        // 4. Fetch the project's integration for this channel
        const integrations: { provider?: string; enabled?: boolean; credentials?: Record<string, unknown> }[] = await ctx.runQuery(internal.integrations.listForProject, {
            projectId: conversation.projectId,
        });

        const integration = (integrations ?? []).find(
            (i) => i.provider === conversation.channel && i.enabled === true
        );

        if (!integration) return undefined;

        const creds = integration.credentials as { access_token?: string } | undefined;
        const rawToken: string = creds?.access_token || "";
        if (!rawToken) return undefined;
        const encKey = process.env.INTEGRATIONS_ENCRYPTION_KEY;
        if (!encKey) return undefined;
        const accessToken = rawToken.includes(":")
            ? await decryptSecret(rawToken, encKey)
            : rawToken;

        // 5. Call Meta Graph API
        try {
            const response: Response = await fetch(
                `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        recipient: { id: conversation.channelSenderId },
                        message: { text: args.content },
                    }),
                }
            );

            if (!response.ok) {
                const err = await response.text();
                console.error("[sendMetaMessage] Meta API error:", err);
                return undefined;
            }

            const data: { message_id?: string } = await response.json();
            return data.message_id as string;
        } catch (err) {
            console.error("[sendMetaMessage] fetch error:", err);
        }

        return undefined;
    },
});

// Public-facing mutation: schedule sending the agent reply to Meta channel
// (internalActions can't be called from the frontend directly)
export const relayToMeta = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args): Promise<void> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        await ctx.scheduler.runAfter(0, internal.conversations.sendMetaMessage, {
            conversationId: args.conversationId,
            content: args.content,
        });
    },
});

// Create or update conversation from Telegram
export const createOrUpdateFromTelegram = internalMutation({
    args: {
        chatId: v.string(),
        senderId: v.string(),
        senderName: v.optional(v.string()),
        messageText: v.optional(v.string()),
        messageId: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Deduplicate
        const existingMessage = await ctx.db
            .query("messages")
            .filter(q => q.eq(q.field("channelMessageId"), args.messageId))
            .first();

        if (existingMessage) {
            return;
        }

        // 2. Find the project integration
        const integrations = await ctx.db
            .query("integrations")
            .filter((q) => q.eq(q.field("provider"), "telegram"))
            .filter((q) => q.eq(q.field("enabled"), true))
            .take(100);

        const integration = integrations[0];

        if (!integration) {
            return;
        }

        // 3. Find or create the conversation
        let conversationId;
        const openConversation = await ctx.db
            .query("conversations")
            .withIndex("by_projectId_channelSenderId", (q) => 
                q.eq("projectId", integration.projectId).eq("channelSenderId", args.chatId)
            )
            .filter((q) => q.neq(q.field("status"), 1000))
            .first();

        const isNew = !openConversation;

        if (openConversation) {
            conversationId = openConversation._id;
        } else {
            conversationId = await ctx.db.insert("conversations", {
                projectId: integration.projectId,
                visitorId: args.senderId,
                visitorName: args.senderName ?? "Telegram User",
                channel: "telegram",
                channelSenderId: args.chatId,
                status: 100,
                unreadCount: 0,
                updatedAt: Date.now(),
            });
        }

        // 4. Insert the message
        await ctx.db.insert("messages", {
            conversationId: conversationId,
            projectId: integration.projectId,
            senderType: "visitor",
            senderId: args.senderId,
            content: args.messageText ?? "",
            type: "text",
            channelMessageId: args.messageId,
        });

        // 5. Patch the conversation
        const conversation = await ctx.db.get(conversationId);
        if (conversation) {
            await ctx.db.patch(conversationId, {
                lastMessage: args.messageText ?? "",
                updatedAt: Date.now(),
                unreadCount: (conversation.unreadCount ?? 0) + 1,
            });

            // 6. Trigger Bot Engine or Routing
            if (isNew) {
                await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
                    conversationId,
                    projectId: integration.projectId,
                    initialMessage: args.messageText ?? "",
                });
            } else if (!conversation.botPaused && conversation.botId) {
                await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                    conversationId,
                    incomingMessage: args.messageText ?? "",
                });
            }
        }
    }
});

// Internal action: send a message to a Telegram channel
export const sendTelegramMessage = internalAction({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Fetch the conversation
        const conversation = await ctx.runQuery(internal.conversations.getById, { id: args.conversationId });
        if (!conversation) return undefined;

        // 2. Only proceed for Telegram channel
        if (conversation.channel !== "telegram") return undefined;

        // 3. Require a sender ID to reply to
        if (!conversation.channelSenderId) return undefined;

        // 4. Fetch the project's integration for this channel
        const integrations: { provider?: string; enabled?: boolean; credentials?: Record<string, unknown> }[] = await ctx.runQuery(internal.integrations.listForProject, {
            projectId: conversation.projectId,
        });

        const integration = (integrations ?? []).find(
            (i) => i.provider === "telegram" && i.enabled === true
        );

        if (!integration) return undefined;

        const creds = integration.credentials as { bot_token?: string } | undefined;
        const rawToken: string | undefined = creds?.bot_token;
        if (!rawToken) return undefined;
        const encKey = process.env.INTEGRATIONS_ENCRYPTION_KEY;
        if (!encKey) return undefined;
        const beforeColon = rawToken.split(":")[0];
        const isEncrypted = !/^\d+$/.test(beforeColon);
        const botToken = isEncrypted
            ? await decryptSecret(rawToken, encKey)
            : rawToken;

        // 5. Call Telegram API
        try {
            const response = await fetch(
                `https://api.telegram.org/bot${botToken}/sendMessage`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: conversation.channelSenderId,
                        text: args.content,
                    }),
                }
            );

            if (!response.ok) {
                const err = await response.text();
                console.error("[sendTelegramMessage] Telegram API error:", err);
                return undefined;
            }
        } catch (err) {
            console.error("[relayToTelegram] Failed to send message:", err);
        }

        return undefined;
    },
});

// Public-facing mutation: schedule sending the agent reply to Telegram channel
export const relayToTelegram = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args): Promise<void> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        await ctx.scheduler.runAfter(0, internal.conversations.sendTelegramMessage, {
            conversationId: args.conversationId,
            content: args.content,
        });
    },
});

export const logConversationEvent = internalMutation({
    args: {
        projectId: v.id("projects"),
        conversationId: v.id("conversations"),
        handledBy: v.union(v.literal("bot"), v.literal("agent")),
        closed: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("conversation_events", {
            projectId: args.projectId,
            conversationId: args.conversationId,
            handledBy: args.handledBy,
            closed: args.closed,
            createdAt: Date.now(),
        });
    },
});

export const getConversationEvents = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const events = await ctx.db
            .query("conversation_events")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .order("asc")
            .collect();

        return events.map(e => ({
            handledBy: e.handledBy,
            closed: e.closed,
            createdAt: e.createdAt,
        }));
    },
});
