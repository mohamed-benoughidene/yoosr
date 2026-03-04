import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Existing queries (kept for backward compat)
// ---------------------------------------------------------------------------

export const getConversationStats = query({
    args: {
        projectId: v.id("projects"),
        from: v.optional(v.number()),
        to: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, open: 0, closed: 0 };

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const filtered = conversations.filter(c => {
            if (args.from && c._creationTime < args.from) return false;
            if (args.to && c._creationTime > args.to) return false;
            return true;
        });

        const total = filtered.length;
        const open = filtered.filter((c) => c.status === 100 || c.status === 200).length;
        const closed = filtered.filter((c) => c.status === 1000).length;

        return { total, open, closed };
    },
});

export const getVisitorStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalVisitors: 0 };

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const uniqueVisitors = new Set(conversations.map((c) => c.visitorId ?? "unknown"));
        return { totalVisitors: uniqueVisitors.size };
    },
});

export const getMessageStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, visitorMessages: 0, agentMessages: 0 };

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const visitorMessages = messages.filter((m) => m.senderType === "visitor").length;
        const agentMessages = messages.filter((m) => m.senderType === "agent").length;

        return { total: messages.length, visitorMessages, agentMessages };
    },
});

// ---------------------------------------------------------------------------
// Analytics queries — date-range filtered
// ---------------------------------------------------------------------------

/**
 * Conversation volume split by handledBy (bot vs agent) over a date range.
 * Returns daily buckets for the chart + totals.
 */
export const getConversationVolume = query({
    args: {
        projectId: v.id("projects"),
        from: v.number(), // Unix ms
        to: v.number(),   // Unix ms
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, botHandled: 0, agentHandled: 0, daily: [] };

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const filtered = conversations.filter(c => {
            if (c._creationTime < args.from) return false;
            if (c._creationTime > args.to) return false;
            return true;
        });

        let botHandled = 0;
        let agentHandled = 0;

        // Build daily buckets
        const buckets: Record<string, { bot: number; agent: number }> = {};
        for (const c of filtered) {
            const handledBy = (c.assignedTo || c.resolvedBy) ? "agent" : "bot";
            if (handledBy === "bot") botHandled++;
            else agentHandled++;

            const day = new Date(c._creationTime).toISOString().slice(0, 10);
            if (!buckets[day]) buckets[day] = { bot: 0, agent: 0 };

            if (handledBy === "bot") buckets[day].bot++;
            else buckets[day].agent++;
        }

        const daily = Object.entries(buckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, counts]) => ({
                date,
                bot: counts.bot,
                agent: counts.agent,
                total: counts.bot + counts.agent,
            }));

        return { total: filtered.length, botHandled, agentHandled, daily };
    },
});

/**
 * Token usage summed over a date range, grouped by model.
 */
export const getTokenUsage = query({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalTokens: 0, byModel: [] };

        const rows = await ctx.db
            .query("token_usage")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.and(
                q.gte(q.field("createdAt"), args.from),
                q.lte(q.field("createdAt"), args.to)
            ))
            .collect();

        const grouped: Record<string, number> = {};
        let totalTokens = 0;
        for (const row of rows) {
            grouped[row.model] = (grouped[row.model] ?? 0) + row.tokensUsed;
            totalTokens += row.tokensUsed;
        }

        const byModel = Object.entries(grouped).map(([model, tokens]) => ({ model, tokens }));

        return { totalTokens, byModel };
    },
});

/**
 * Top unanswered queries sorted by count descending.
 */
export const getUnansweredQueries = query({
    args: {
        projectId: v.id("projects"),
        limit: v.optional(v.number()),
        from: v.optional(v.number()),
        to: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        let results = await ctx.db
            .query("unanswered_queries")
            .withIndex("by_projectId_count", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();

        if (args.from !== undefined && args.to !== undefined) {
            results = results.filter(row => row.lastAskedAt >= args.from! && row.lastAskedAt <= args.to!);
        }

        return results.slice(0, args.limit ?? 20);
    },
});

/**
 * CSAT summary: average rating + count per star (1-5).
 */
export const getCSATSummary = query({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        const ratings = conversations.filter(c =>
            c._creationTime >= args.from &&
            c._creationTime <= args.to &&
            c.rating !== undefined
        );

        if (ratings.length === 0) {
            return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
        let sum = 0;
        for (const c of ratings) {
            const star = Math.min(5, Math.max(1, Math.round(c.rating!)));
            distribution[star] = (distribution[star] ?? 0) + 1;
            sum += c.rating!;
        }

        return {
            average: Math.round((sum / ratings.length) * 10) / 10,
            total: ratings.length,
            distribution,
        };
    },
});

/**
 * Fetches the real-time project usage quotas (tokens and conversations).
 */
export const getProjectUsage = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { tokensConsumed: 0, conversationsCount: 0 };

        const usage = await ctx.db
            .query("project_usage")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .first();

        return usage || { tokensConsumed: 0, conversationsCount: 0 };
    }
});

/**
 * Aggregates semantic tags generated by LLMs on closed conversations.
 */
export const getTagsSummary = query({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();

        const tagCounts: Record<string, number> = {};

        for (const conv of conversations) {
            if (conv._creationTime >= args.from && conv._creationTime <= args.to && conv.tags) {
                for (const tag of conv.tags) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
            }
        }

        return Object.entries(tagCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 tags
    }
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Internal — log token usage after an OpenRouter call.
 */
export const logTokenUsage = internalMutation({
    args: {
        projectId: v.id("projects"),
        model: v.string(),
        tokensUsed: v.number(),
        operation: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("token_usage", {
            projectId: args.projectId,
            model: args.model,
            tokensUsed: args.tokensUsed,
            operation: args.operation,
            createdAt: Date.now(),
        });

        // Update real-time usage quotas
        const usageDesc = await ctx.db.query("project_usage")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .first();
        if (usageDesc) {
            await ctx.db.patch(usageDesc._id, { tokensConsumed: usageDesc.tokensConsumed + args.tokensUsed });
        } else {
            await ctx.db.insert("project_usage", {
                projectId: args.projectId,
                tokensConsumed: args.tokensUsed,
                conversationsCount: 0,
                billingCycleStart: Date.now()
            });
        }
    },
});

/**
 * Internal — upsert unanswered query (increment count if exists).
 */
export const logUnansweredQuery = internalMutation({
    args: {
        projectId: v.id("projects"),
        query: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("unanswered_queries")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("query"), args.query))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                count: existing.count + 1,
                lastAskedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("unanswered_queries", {
                projectId: args.projectId,
                query: args.query,
                count: 1,
                lastAskedAt: Date.now(),
            });
        }
    },
});

/**
 * Log a conversation event (bot or agent handled). Called when conversation opens/closes.
 */
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

/**
 * Internal — CSAT write called from http.ts HTTP action.
 */
export const submitCSATInternal = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        rating: v.number(),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        const rating = Math.min(5, Math.max(1, Math.round(args.rating)));

        await ctx.db.insert("csat_ratings", {
            projectId: conversation.projectId,
            conversationId: args.conversationId,
            rating,
            comment: args.comment,
            createdAt: Date.now(),
        });

        // Keep conversations.rating in sync so getCSATSummary (which reads
        // from conversations) reflects ratings submitted via the HTTP endpoint.
        await ctx.db.patch(args.conversationId, {
            rating,
            feedback: args.comment,
        });
    },
});

/**
 * Public mutation — CSAT submission from widget (no auth required).
 */
export const submitCSAT = mutation({
    args: {
        conversationId: v.id("conversations"),
        rating: v.number(),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Clamp rating to 1-5
        const rating = Math.min(5, Math.max(1, Math.round(args.rating)));

        await ctx.db.insert("csat_ratings", {
            projectId: conversation.projectId,
            conversationId: args.conversationId,
            rating,
            comment: args.comment,
            createdAt: Date.now(),
        });

        // Also store on the conversation record for quick access
        await ctx.db.patch(args.conversationId, {
            rating,
            feedback: args.comment,
        });
    },
});
