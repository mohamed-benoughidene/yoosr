import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getHomeStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const now = Date.now();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTodayMs = startOfToday.getTime();

        const startOfYesterdayMs = startOfTodayMs - 24 * 60 * 60 * 1000;

        // 1. Bots count for onboarding banner
        const bots = await ctx.db
            .query("bots")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();
        const botsCount = bots.length;

        // 2. Fetch active and recent conversations
        const allConversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();

        // Live Stats Row
        const openConversations = allConversations.filter(c => c.status === 100 || c.status === 200);
        const waitingConversations = allConversations.filter(c => c.status === 100);
        const myAssigned = openConversations.filter(c => c.assignedTo === identity.subject);

        // Fetch online teammates
        // Derive org members from profiles of agents who have been assigned to
        // conversations in this project — this is the available agent pool in Convex.
        // Cross-reference with isAvailable (undefined === true by default convention).
        const assignedUserIds = new Set(
            allConversations
                .map(c => c.assignedTo)
                .filter((id): id is string => !!id)
        );

        let onlineTeammatesCount = 0;
        for (const userId of assignedUserIds) {
            const profile = await ctx.db
                .query("profiles")
                .withIndex("by_userId", q => q.eq("userId", userId))
                .first();
            if (profile && (profile.isAvailable === true || profile.isAvailable === undefined)) {
                onlineTeammatesCount++;
            }
        }

        // 3. Live Queue (60% width)
        // 5 most recent open or unassigned (100 or 200)
        const activeQueue = allConversations
            .filter(c => c.status === 100 || c.status === 200)
            .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
            .slice(0, 5);

        // Enrich queue with assigned agent name
        const liveQueue = await Promise.all(activeQueue.map(async (conv) => {
            let assignedAgentName = "Unassigned";
            if (conv.assignedTo) {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", q => q.eq("userId", conv.assignedTo!))
                    .first();
                assignedAgentName = profile?.fullName ?? profile?.email ?? "Agent";
            }
            return {
                _id: conv._id,
                visitorName: conv.visitorName || "Visitor",
                channel: "widget", // legacy support or custom channel
                waitMs: now - (conv._creationTime ?? now),
                assignedAgentName,
                status: conv.status
            };
        }));

        // 4. Recent Activity (40% width)
        const recentActivities = await ctx.db
            .query("activity_logs")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .order("desc")
            .take(10);

        // 5. Today's Snapshot
        const conversationsToday = allConversations.filter(c => (c._creationTime ?? 0) >= startOfTodayMs);
        const conversationsYesterday = allConversations.filter(c =>
            (c._creationTime ?? 0) >= startOfYesterdayMs && (c._creationTime ?? 0) < startOfTodayMs
        );
        const todayCount = conversationsToday.length;
        const yesterdayCount = conversationsYesterday.length;

        // Bot Resolved Today
        const todayEvents = await ctx.db
            .query("conversation_events")
            .withIndex("by_projectId_createdAt", q =>
                q.eq("projectId", args.projectId)
                    .gte("createdAt", startOfTodayMs)
            )
            .collect();

        const botResolvedToday = todayEvents.filter(e => e.handledBy === "bot" && e.closed).length;

        // Avg Wait Time Today 
        // We'll roughly estimate as time from conversation creation to the first message by an agent.
        // For accurate computation, we just fetch agent messages for today's active/closed ones.
        let totalWaitMs = 0;
        let waitCount = 0;

        // To avoid looping hundreds of messages, take top 20 recent convos for today
        const sampledTodayConv = conversationsToday.slice(0, 20);
        for (const conv of sampledTodayConv) {
            const firstAgentMessage = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", q => q.eq("conversationId", conv._id))
                .filter(q => q.eq(q.field("senderType"), "agent"))
                .first();

            if (firstAgentMessage) {
                totalWaitMs += (firstAgentMessage._creationTime - conv._creationTime);
                waitCount++;
            }
        }

        const avgWaitTimeTodayMs = waitCount > 0 ? totalWaitMs / waitCount : null;

        return {
            botsCount,
            liveStats: {
                openCount: openConversations.length,
                waitingCount: waitingConversations.length,
                onlineTeammatesCount,
                myAssignedCount: myAssigned.length
            },
            liveQueue,
            recentActivities,
            todaySnapshot: {
                todayCount,
                diffFromYesterday: todayCount - yesterdayCount,
                botResolvedToday,
                avgWaitTimeTodayMs
            }
        };
    }
});
