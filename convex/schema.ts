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
        updatedAt: v.optional(v.number()),
    }).index("by_userId", ["userId"]),

    // Projects
    projects: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        ownerId: v.string(), // Clerk user ID
        status: v.optional(v.string()), // "active" | "inactive" | "archived"
        widgetConfig: v.optional(v.any()), // JSON config for widget appearance
    }).index("by_ownerId", ["ownerId"]),

    // Project members (team)
    project_members: defineTable({
        projectId: v.id("projects"),
        userId: v.optional(v.string()), // Clerk user ID (null if invited but not joined)
        role: v.string(), // "owner" | "administrator" | "agent"
        status: v.string(), // "available" | "unavailable"
        invitedEmail: v.optional(v.string()),
        invitedAt: v.optional(v.number()),
    })
        .index("by_projectId", ["projectId"])
        .index("by_userId", ["userId"]),

    // Conversations (chat threads from visitors)
    conversations: defineTable({
        projectId: v.id("projects"),
        visitorId: v.optional(v.string()),
        visitorName: v.optional(v.string()),
        assignedTo: v.optional(v.string()), // Clerk user ID of assigned agent
        status: v.optional(v.string()), // "open" | "resolved"
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
        nodes: v.any(), // ReactFlow Node[]
        edges: v.any(), // ReactFlow Edge[]
        variables: v.optional(v.any()), // Flow-level variables
    }).index("by_botId", ["botId"]),

    // Activity logs
    activity_logs: defineTable({
        projectId: v.id("projects"),
        userId: v.optional(v.string()), // Clerk user ID (null for system events)
        actionType: v.string(), // "login", "update_project", etc.
        description: v.optional(v.string()),
        metadata: v.optional(v.any()), // JSON
        ipAddress: v.optional(v.string()),
    })
        .index("by_projectId", ["projectId"])
        .index("by_actionType", ["actionType"]),

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
});
