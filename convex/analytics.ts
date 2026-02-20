import { query } from "./_generated/server";
import { v } from "convex/values";

// Get conversation stats for the dashboard
export const getConversationStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, open: 0, closed: 0 };

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const total = conversations.length;
        const open = conversations.filter((c) => c.status === 100 || c.status === 200).length;
        const closed = conversations.filter((c) => c.status === 1000).length;

        return { total, open, closed };
    },
});

// Get visitor stats
export const getVisitorStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalVisitors: 0 };

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const uniqueVisitors = new Set(
            conversations.map((c) => c.visitorId ?? "unknown")
        );

        return { totalVisitors: uniqueVisitors.size };
    },
});

// Get message count stats
export const getMessageStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, visitorMessages: 0, agentMessages: 0 };

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const visitorMessages = messages.filter(
            (m) => m.senderType === "visitor"
        ).length;
        const agentMessages = messages.filter(
            (m) => m.senderType === "agent"
        ).length;

        return {
            total: messages.length,
            visitorMessages,
            agentMessages,
        };
    },
});
