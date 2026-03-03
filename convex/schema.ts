import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // User profiles (synced from Clerk via webhook)
    profiles: defineTable({
        userId: v.string(), // Clerk user ID
        fullName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        username: v.optional(v.string()),
        email: v.optional(v.string()),
        isAvailable: v.optional(v.boolean()),
        orgId: v.optional(v.string()), // Added for multi-tenancy support
        updatedAt: v.optional(v.number()),
    }).index("by_userId", ["userId"])
        .index("by_orgId", ["orgId"]),

    // Projects
    projects: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        orgId: v.string(), // Clerk Organization ID
        status: v.optional(v.string()), // "active" | "inactive" | "archived"
        widgetConfig: v.optional(v.any()), // JSON config for widget appearance
    }).index("by_orgId", ["orgId"]),


    // Conversations (chat threads from visitors)
    conversations: defineTable({
        projectId: v.id("projects"),
        visitorId: v.optional(v.string()),
        visitorName: v.optional(v.string()),
        assignedTo: v.optional(v.string()), // Clerk user ID of assigned agent
        status: v.optional(v.union(v.literal(100), v.literal(200), v.literal(1000))), // 100: unassigned, 200: assigned, 1000: closed
        lastMessage: v.optional(v.string()),
        resolvedBy: v.optional(v.string()), // Clerk user ID of who resolved it
        visitorEmail: v.optional(v.string()),
        visitorPhone: v.optional(v.string()),
        visitorAddress: v.optional(v.string()),
        visitorNote: v.optional(v.string()),
        unreadCount: v.optional(v.number()),
        rating: v.optional(v.number()), // 1-5
        feedback: v.optional(v.string()), // Optional feedback text
        updatedAt: v.optional(v.number()),
        // Execution engine state
        currentNodeId: v.optional(v.union(v.string(), v.null())),
        botStepCount: v.optional(v.number()),
        executionLog: v.optional(v.array(v.object({
            nodeId: v.string(),
            type: v.string(),
            action: v.string(),
            timestamp: v.number()
        }))),
        botId: v.optional(v.string()),
        // Legacy fields to prevent schema validation errors
        leadId: v.optional(v.string()),
        firstText: v.optional(v.string()),
        participants: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        attributes: v.optional(v.any()),
        typing: v.optional(v.any()),
        // HITL Handoff
        botPaused: v.optional(v.boolean()), // true = bot will not respond to new messages
        handoffSource: v.optional(v.string()), // 'bot' = escalated by the bot flow
        departmentId: v.optional(v.id("departments")),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_status", ["projectId", "status"]),

    // Messages within conversations
    messages: defineTable({
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        senderType: v.string(), // "visitor" | "agent" | "bot"
        senderId: v.optional(v.string()),
        content: v.string(),
        attachments: v.optional(v.any()), // JSON array
        // Legacy fields
        channel: v.optional(v.string()),
        senderFullname: v.optional(v.string()),
        status: v.optional(v.number()),
        type: v.optional(v.string()),
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
        configuration: v.optional(v.any()), // JSON flow definition
    }).index("by_projectId", ["projectId"]),

    // Bot flows (Design Studio graph data)
    bot_flows: defineTable({
        botId: v.id("bots"),
        slug: v.optional(v.string()), // target identifier for Replace Bot action
        version: v.optional(v.string()),
        nodes: v.array(v.any()), // JSON array of flow nodes
        edges: v.optional(v.any()), // Legacy ReactFlow Edge[]
        executionNodes: v.optional(v.array(v.any())), // Compiled engine schema
        variables: v.optional(v.any()), // Flow-level variables
    })
        .index("by_botId", ["botId"])
        .index("by_slug", ["slug"]),

    // Activity logs
    activity_logs: defineTable({
        projectId: v.id("projects"),
        userId: v.optional(v.string()), // Clerk user ID (null for system events)
        actionType: v.string(), // "login", "update_project", etc.
        description: v.optional(v.string()),
        metadata: v.optional(v.any()), // JSON
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
        provider: v.string(), // "telegram", "openai", "whatsapp"
        credentials: v.optional(v.any()), // JSON (encrypted tokens)
        enabled: v.optional(v.boolean()),
    }).index("by_projectId", ["projectId"]),

    // Departments
    departments: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        routingMode: v.optional(v.string()), // "pooled" | "assigned"
        botId: v.optional(v.string()), // Bot ID if AI-assigned
        tags: v.optional(v.array(v.string())),
        memberIds: v.optional(v.array(v.string())),
    }).index("by_projectId", ["projectId"]),

    // Canned responses (quick replies)
    canned_responses: defineTable({
        projectId: v.id("projects"),
        trigger: v.string(),
        message: v.string(),
        createdBy: v.optional(v.string()), // Clerk user ID
    }).index("by_projectId", ["projectId"]),

    // Labels (for tagging conversations)
    labels: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        color: v.string(), // "red" | "orange" | "yellow" | "green" | "blue" | "violet"
        createdBy: v.optional(v.string()),
    }).index("by_projectId", ["projectId"]),

    // Operating hours
    operating_hours: defineTable({
        projectId: v.id("projects"),
        enabled: v.boolean(),
        timezone: v.string(),
        schedule: v.any(), // JSON array of day schedules
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
        tags: v.optional(v.array(v.string())),
        conversationId: v.optional(v.id("conversations")),
    })
        .index("by_projectId", ["projectId"])
        .index("by_conversationId", ["conversationId"]),

    // Knowledge base document chunks + embeddings
    knowledge_base_chunks: defineTable({
        sourceId: v.id("knowledge_base_sources"),
        projectId: v.id("projects"),
        text: v.string(),
        embedding: v.array(v.number()),
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
        .index("by_projectId_createdAt", ["projectId", "createdAt"]),

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
        secretName: v.optional(v.string()), // Optionally store a secret lookup key 
        isActive: v.boolean(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_isActive", ["projectId", "isActive"]),

    // Notifications for agents
    notifications: defineTable({
        projectId: v.id("projects"),
        recipientId: v.string(), // Clerk user ID of the agent who should see this
        type: v.union(
            v.literal("new_message"),
            v.literal("assigned"),
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
        .index("by_project_recipient", ["projectId", "recipientId"]),
});
