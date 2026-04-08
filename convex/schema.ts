import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { CONVERSATION_STATUS } from "./types";

export default defineSchema({
    // User profiles (synced from Clerk via webhook)
    profiles: defineTable({
        userId: v.string(), // Clerk user ID
        fullName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        username: v.optional(v.string()),
        email: v.optional(v.string()),
        isAvailable: v.optional(v.boolean()),
        lastSeenAt: v.optional(v.number()),
        orgId: v.optional(v.string()), // Added for multi-tenancy support
        updatedAt: v.optional(v.number()),
    }).index("by_userId", ["userId"])
        .index("by_orgId", ["orgId"])
        .index("by_orgId_isAvailable", ["orgId", "isAvailable"]),

    // Projects
    projects: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        orgId: v.string(), // Clerk Organization ID
        status: v.optional(v.string()), // "active" | "inactive" | "archived"
        widgetConfig: v.optional(v.object({
            primaryColor: v.optional(v.string()),
            logoUrl: v.optional(v.string()),
            align: v.optional(v.union(v.literal("left"), v.literal("right"))),
            welcomeDelay: v.optional(v.number()),
            enableWelcomeNotification: v.optional(v.boolean()),
            autoCloseMinutes: v.optional(v.number()),
            preChatFormEnabled: v.optional(v.boolean()),
            contactMethod: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("both"))),
            translations: v.optional(v.object({
                headerTitle: v.optional(v.object({
                    en: v.optional(v.string()),
                    ar: v.optional(v.string()),
                    fr: v.optional(v.string()),
                })),
                welcomeMessage: v.optional(v.object({
                    en: v.optional(v.string()),
                    ar: v.optional(v.string()),
                    fr: v.optional(v.string()),
                })),
                onlineStatus: v.optional(v.object({
                    en: v.optional(v.string()),
                    ar: v.optional(v.string()),
                    fr: v.optional(v.string()),
                })),
                preChatTitle: v.optional(v.object({
                    en: v.optional(v.string()),
                    ar: v.optional(v.string()),
                    fr: v.optional(v.string()),
                })),
                preChatSubtitle: v.optional(v.object({
                    en: v.optional(v.string()),
                    ar: v.optional(v.string()),
                    fr: v.optional(v.string()),
                })),
                startChat: v.optional(v.object({
                    en: v.optional(v.string()),
                    ar: v.optional(v.string()),
                    fr: v.optional(v.string()),
                })),
            })),
        })), // JSON config for widget appearance
        widgetLocale: v.optional(v.union(v.literal("en"), v.literal("ar"), v.literal("fr"))),
        defaultModel: v.optional(v.string()), // Automatically fallback to this AI model
        openRouterApiKey: v.optional(v.string()),
        slaHours: v.optional(v.number()),
    }).index("by_orgId", ["orgId"]),


    // Conversations (chat threads from visitors)
    conversations: defineTable({
        projectId: v.id("projects"),
        visitorId: v.optional(v.string()), // Clerk user ID (external reference, not a Convex doc)
        visitorName: v.optional(v.string()),
        assignedTo: v.optional(v.string()), // Clerk user ID of assigned agent (external reference)
        status: v.optional(v.union(v.literal(CONVERSATION_STATUS.UNASSIGNED), v.literal(CONVERSATION_STATUS.ASSIGNED), v.literal(CONVERSATION_STATUS.CLOSED))), // 100: unassigned, 200: assigned, 1000: closed
        lastMessage: v.optional(v.string()),
        resolvedBy: v.optional(v.string()), // Clerk user ID of who resolved it (external reference)
        visitorEmail: v.optional(v.string()),
        visitorPhone: v.optional(v.string()),
        visitorAddress: v.optional(v.string()),
        visitorNote: v.optional(v.string()),
        unreadCount: v.optional(v.number()),
        rating: v.optional(v.number()), // 1-5
        feedback: v.optional(v.string()), // Optional feedback text
        updatedAt: v.optional(v.number()),
        // Execution engine state — kept for backward compat; new code should use conversation_bot_state
        currentNodeId: v.optional(v.union(v.string(), v.null())),
        botStepCount: v.optional(v.number()),
        executionLog: v.optional(v.array(v.object({
            nodeId: v.string(),
            type: v.string(),
            action: v.string(),
            timestamp: v.number()
        }))),
        botId: v.optional(v.id("bots")), // Reference to bots table
        // Actively used fields: participants, tags, attributes (see routing.ts, conversations.ts, tags.ts, bot.ts)
        participants: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        attributes: v.optional(v.any()), // Bot attribute storage — flexible key-value bag
        // Deprecated legacy fields — kept for backward compatibility with existing data
        leadId: v.optional(v.string()),
        firstText: v.optional(v.string()),
        typing: v.optional(v.any()),
        // HITL Handoff
        botPaused: v.optional(v.boolean()), // true = bot will not respond to new messages
        handoffSource: v.optional(v.string()), // 'bot' = escalated by the bot flow
        departmentId: v.optional(v.id("departments")),
        priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))),
        firstResponseAt: v.optional(v.number()),
        slaDeadline: v.optional(v.number()),
        // External channels
        channel: v.optional(v.union(v.literal("widget"), v.literal("messenger"), v.literal("instagram"), v.literal("telegram"), v.literal("whatsapp"))),
        channelSenderId: v.optional(v.string()),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_status", ["projectId", "status"])
        .index("by_projectId_visitorId", ["projectId", "visitorId"])
        .index("by_projectId_channelSenderId", ["projectId", "channelSenderId"]),

    // Bot execution state — separated from conversations to avoid OCC write conflicts
    conversation_bot_state: defineTable({
        conversationId: v.id("conversations"),
        currentNodeId: v.optional(v.union(v.string(), v.null())),
        botStepCount: v.optional(v.number()),
        executionLog: v.optional(v.array(v.object({
            nodeId: v.string(),
            type: v.string(),
            action: v.string(),
            timestamp: v.number(),
        }))),
        attributes: v.optional(v.any()), // Bot attribute storage — flexible key-value bag
    }).index("by_conversationId", ["conversationId"]),

    // Messages within conversations
    messages: defineTable({
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        senderType: v.string(), // "visitor" | "agent" | "bot"
        senderId: v.optional(v.string()),
        content: v.string(),
        attachments: v.optional(v.any()), // JSON array of attachments (various channel formats)
        fileId: v.optional(v.string()), // Convex storage ID
        fileName: v.optional(v.string()), // Original filename for display
        // Legacy fields
        channel: v.optional(v.string()),
        senderFullname: v.optional(v.string()),
        status: v.optional(v.number()),
        type: v.optional(v.string()),
        channelMessageId: v.optional(v.string()),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_projectId", ["projectId"])
        .index("by_projectId_senderType", ["projectId", "senderType"]),

    // Bots (chatbot/automation configs)
    bots: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        type: v.string(), // "chatbot" | "automation"
        status: v.optional(v.string()), // "draft" | "active" | "archived"
        configuration: v.optional(v.object({
            model: v.optional(v.string()), // AI model name
            temperature: v.optional(v.number()),
            maxTokens: v.optional(v.number()),
            systemPrompt: v.optional(v.string()),
            knowledgeBaseId: v.optional(v.id("knowledge_bases")),
            fallbackBot: v.optional(v.id("bots")),
            additionalSettings: v.optional(v.object({})),
        })), // JSON flow definition
    }).index("by_projectId", ["projectId"]),

    // Bot flows (Design Studio graph data)
    bot_flows: defineTable({
        botId: v.id("bots"),
        slug: v.optional(v.string()), // target identifier for Replace Bot action
        version: v.optional(v.string()),
        nodes: v.array(v.any()), // ReactFlow nodes — full validation deferred; engine validates at runtime
        edges: v.optional(v.array(v.object({
            id: v.string(),
            source: v.string(),
            target: v.string(),
            sourceHandle: v.optional(v.string()),
            targetHandle: v.optional(v.string()),
            type: v.optional(v.string()),
            label: v.optional(v.string()),
            markerEnd: v.optional(v.any()), // ReactFlow arrow marker config
            style: v.optional(v.any()), // CSS style object
        }))), // ReactFlow Edge[]
        executionNodes: v.optional(v.array(v.object({
            _id: v.optional(v.string()), // Node identifier (from node.id)
            name: v.optional(v.any()), // Display name (from data.label or node.type)
            type: v.optional(v.string()),
            actions: v.optional(v.any()), // Action documents
            nextBlock: v.optional(v.string()), // Next node ID
        }))), // Compiled engine schema
        variables: v.optional(v.object({})), // Flow-level variables
    })
        .index("by_botId", ["botId"])
        .index("by_slug", ["slug"]),

    // Activity logs
    activity_logs: defineTable({
        projectId: v.id("projects"),
        userId: v.optional(v.string()), // Clerk user ID (null for system events)
        actionType: v.string(), // "login", "update_project", etc.
        description: v.optional(v.string()),
        metadata: v.optional(v.any()), // JSON — flexible for event-specific data
        ipAddress: v.optional(v.string()),
        // Extended fields for rich activity tracking
        actorId: v.optional(v.string()),
        actorName: v.optional(v.string()),
        action: v.optional(v.string()), // e.g. "teammate_invited", "role_changed"
        targetType: v.optional(v.string()), // e.g. "teammate", "department", "bot"
        targetId: v.optional(v.string()),
        createdAt: v.optional(v.number()),
    })
        .index("by_projectId", ["projectId"])
        .index("by_actionType", ["actionType"])
        .index("by_projectId_createdAt", ["projectId", "createdAt"]),

    // Integrations (telegram, whatsapp, etc.)
    integrations: defineTable({
        projectId: v.id("projects"),
        provider: v.string(), // "telegram", "openai", "whatsapp", "messenger", "instagram"
        credentials: v.optional(v.any()), // JSON (encrypted tokens) — flexible per-provider structure
        enabled: v.optional(v.boolean()),
        // Denormalized lookup fields for O(log n) queries (stored inside credentials but also indexed here)
        phoneNumberId: v.optional(v.string()), // WhatsApp: external_phone_number_id
        pageId: v.optional(v.string()), // Messenger/Instagram: page_id
        webhookSecret: v.optional(v.string()), // Telegram: unique webhook secret per bot
    }).index("by_projectId", ["projectId"])
        .index("by_provider_enabled", ["provider", "enabled"])
        .index("by_provider_phoneNumberId", ["provider", "phoneNumberId"])
        .index("by_provider_pageId", ["provider", "pageId"])
        .index("by_provider_webhookSecret", ["provider", "webhookSecret"]),

    // Departments
    departments: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        routingMode: v.optional(v.string()), // "pooled" | "assigned"
        botId: v.optional(v.id("bots")), // Reference to bots table
        tags: v.optional(v.array(v.string())),
        memberIds: v.optional(v.array(v.string())),
    }).index("by_projectId", ["projectId"]),

    // Canned responses (quick replies)
    canned_responses: defineTable({
        projectId: v.id("projects"),
        trigger: v.string(),
        message: v.string(),
        createdBy: v.optional(v.string()), // Clerk user ID (external reference)
    }).index("by_projectId", ["projectId"]),

    // Labels (for tagging conversations)
    labels: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        color: v.string(), // "red" | "orange" | "yellow" | "green" | "blue" | "violet"
        createdBy: v.optional(v.string()), // Clerk user ID (external reference)
    }).index("by_projectId", ["projectId"]),

    // Operating hours
    operating_hours: defineTable({
        projectId: v.id("projects"),
        enabled: v.boolean(),
        timezone: v.string(),
        schedule: v.array(v.object({
            day: v.string(), // "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
            open: v.optional(v.boolean()), // Whether the business is open on this day
            slots: v.optional(v.array(v.object({
                start: v.string(), // HH:MM format
                end: v.string(), // HH:MM format
            }))), // Time slots for the day
            enabled: v.optional(v.boolean()),
        })), // Array of day schedules
    }).index("by_projectId", ["projectId"]),

    // Knowledge bases
    knowledge_bases: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
    }).index("by_projectId", ["projectId"]),

    // Knowledge base sources (articles, URLs, files)
    knowledge_base_sources: defineTable({
        kbId: v.id("knowledge_bases"),
        type: v.string(), // "url" | "text" | "file"
        value: v.string(),
        status: v.optional(v.string()), // "indexing" | "indexed" | "failed"
    }).index("by_kbId", ["kbId"]),

    // Contacts (saved from conversations)
    contacts: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        note: v.optional(v.string()),
        // Free-text tags — managed by user input. Max 20 tags, max 50 chars each (enforced in contacts.ts)
        tags: v.optional(v.array(v.string())),
        conversationId: v.optional(v.id("conversations")),
    })
        .index("by_projectId", ["projectId"])
        .index("by_conversationId", ["conversationId"])
        .index("by_projectId_email", ["projectId", "email"])
        .index("by_projectId_phone", ["projectId", "phone"]),

    // Knowledge base document chunks + embeddings
    knowledge_base_chunks: defineTable({
        sourceId: v.id("knowledge_base_sources"),
        projectId: v.id("projects"),
        text: v.string(),
        embedding: v.array(v.number()),
        // Vector index for semantic search.
        // Model: nvidia/llama-nemotron-embed-vl-1b-v2 (2048 dimensions)
        // See EMBEDDING_CONFIG in convex/lib/embeddings.ts
        // WARNING: If changing model, update dimensions and re-index all knowledge_base_chunks
    }).vectorIndex("by_embedding", {
        vectorField: "embedding",
        dimensions: 2048, // Dimensions for nvidia/llama-nemotron-embed-vl-1b-v2
        filterFields: ["sourceId", "projectId"],
    }),

    // Conversation events (bot vs agent handling tracking)
    conversation_events: defineTable({
        projectId: v.id("projects"),
        conversationId: v.id("conversations"),
        handledBy: v.union(v.literal("bot"), v.literal("agent")),
        closed: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_createdAt", ["projectId", "createdAt"])
        .index("by_conversationId", ["conversationId"]),

    // CSAT ratings (submitted from chat widget)
    csat_ratings: defineTable({
        projectId: v.id("projects"),
        conversationId: v.id("conversations"),
        rating: v.number(), // 1–5
        comment: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_createdAt", ["projectId", "createdAt"]),

    // AI token usage (logged after every OpenRouter call)
    token_usage: defineTable({
        projectId: v.id("projects"),
        model: v.string(),
        tokensUsed: v.number(),
        operation: v.string(), // "ai_task" | "ai_assistant" | "ask_kb"
        createdAt: v.number(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_createdAt", ["projectId", "createdAt"]),

    // Unanswered queries from Ask KB block
    unanswered_queries: defineTable({
        projectId: v.id("projects"),
        query: v.string(),
        count: v.number(),
        lastAskedAt: v.number(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_count", ["projectId", "count"]),

    // Monthly usage quotas (AI tokens and messages)
    project_usage: defineTable({
        projectId: v.id("projects"),
        tokensConsumed: v.number(),
        conversationsCount: v.number(),
        billingCycleStart: v.number(), // timestamp for start of month
    })
        .index("by_projectId", ["projectId"]),

    // RestHooks webhook subscriptions
    webhook_subscriptions: defineTable({
        projectId: v.id("projects"),
        url: v.string(),
        events: v.array(v.string()), // e.g. ["message.create", "request.close"]
        secret: v.string(), // Cryptographically random secret for payload signing
        isActive: v.boolean(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_isActive", ["projectId", "isActive"]),

    webhook_deliveries: defineTable({
        subscriptionId: v.id("webhook_subscriptions"),
        projectId: v.id("projects"),
        event: v.string(),
        url: v.string(),
        attempt: v.number(),         // 1, 2, or 3
        success: v.boolean(),
        statusCode: v.optional(v.number()),
        error: v.optional(v.string()),
        timestamp: v.number(),       // Date.now()
    })
        .index("by_subscriptionId", ["subscriptionId"])
        .index("by_projectId", ["projectId"])
        .index("by_projectId_event", ["projectId", "event"]),

    // Notifications for agents
    notifications: defineTable({
        projectId: v.id("projects"),
        recipientId: v.string(), // Clerk user ID of the agent who should see this
        type: v.union(
            v.literal("new_message"),
            v.literal("assigned"),
            v.literal("unassigned_conversation"),
            v.literal("escalation"),
            v.literal("resolved")
        ),
        conversationId: v.id("conversations"),
        title: v.string(),
        body: v.optional(v.string()),
        read: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_recipient", ["recipientId", "createdAt"])
        .index("by_project_recipient", ["projectId", "recipientId"])
        .index("by_createdAt", ["createdAt"]),

    // Orders placed through chat or agents
    orders: defineTable({
        projectId: v.id("projects"),
        conversationId: v.optional(v.id("conversations")),
        contactName: v.string(),
        phone: v.optional(v.string()),
        product: v.string(),
        notes: v.optional(v.string()),
        status: v.union(v.literal("new"), v.literal("confirmed"), v.literal("cancelled")),
        agentId: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_conversationId", ["conversationId"])
        .index("by_projectId_status", ["projectId", "status"]),

    // Early Access Feedback & Feature Requests
    feedback: defineTable({
        orgId: v.string(),
        submittedBy: v.string(),
        submitterName: v.string(),
        submitterEmail: v.optional(v.string()),
        type: v.union(v.literal("bug"), v.literal("feature"), v.literal("general")),
        message: v.string(),
        createdAt: v.number(),
    })
        .index("by_org", ["orgId"])
        .index("by_created", ["createdAt"]),

    push_subscriptions: defineTable({
        userId: v.string(),
        orgId: v.string(),
        subscription: v.string(),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_orgId", ["orgId"]),
});

