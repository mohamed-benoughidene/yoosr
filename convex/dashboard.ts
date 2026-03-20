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
            .take(1);
        const botsCount = bots.length;

        // 2. Fetch active and recent conversations (exclude resolved)
        const unassignedConversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId_status", q => q.eq("projectId", args.projectId).eq("status", 100))
            .take(250);
            
        const assignedConversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId_status", q => q.eq("projectId", args.projectId).eq("status", 200))
            .take(250);

        const allConversations = [...unassignedConversations, ...assignedConversations];

        // Live Stats Row
        const openConversations = allConversations.filter(c => c.status === 100 || c.status === 200);
        const waitingConversations = allConversations.filter(c => c.status === 100);
        const myAssigned = openConversations.filter(c => c.assignedTo === identity.subject);

        // Fetch online teammates — query profiles directly by org
        const project = await ctx.db.get(args.projectId);
        const orgProfiles = project ? await ctx.db
            .query("profiles")
            .withIndex("by_orgId", q => q.eq("orgId", project.orgId))
            .take(500) : [];

        const onlineTeammatesCount = orgProfiles.filter(
            p => p.isAvailable === true
        ).length;

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
        // Moved to separate paginated query in the frontend to optimize reads.

        // 5. Today's Snapshot (needs ALL conversations including resolved)
        const snapshotConversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .filter(q => q.gte(q.field("_creationTime"), startOfYesterdayMs))
            .take(500); // TODO: replace with paginated aggregation

        const conversationsToday = snapshotConversations.filter(c => (c._creationTime ?? 0) >= startOfTodayMs);
        const conversationsYesterday = snapshotConversations.filter(c =>
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
            .filter(q => q.gte(q.field("createdAt"), startOfTodayMs))
            .take(500); // TODO: replace with paginated aggregation

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
            todaySnapshot: {
                todayCount,
                diffFromYesterday: todayCount - yesterdayCount,
                botResolvedToday,
                avgWaitTimeTodayMs
            }
        };
    }
});
