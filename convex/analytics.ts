import { query, mutation, internalMutation, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { checkProjectOwnership } from "./utils";

// Generic pagination wrapper to avoid implicit 'any'
type PageResult<T> = { page: T[]; continueCursor: string | null; isDone: boolean };

// Minimal types for pagination results
type ConvWithCreationTime = { _creationTime: number; [key: string]: unknown };
type ConvWithStatus = ConvWithCreationTime & { status?: number; assignedTo?: string; resolvedBy?: string; visitorId?: string };
type MsgWithSender = ConvWithCreationTime & { senderType: string };
type TokenUsage = { createdAt: number; model: string; tokensUsed: number; [key: string]: unknown };
type ConvWithTags = ConvWithCreationTime & { tags?: string[] };

// ---------------------------------------------------------------------------
// Existing queries (kept for backward compat)
// ---------------------------------------------------------------------------

export const _paginateConversationsForStats = internalQuery({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .paginate(args.paginationOpts);
    },
});

export const getConversationStats = action({
    args: {
        projectId: v.id("projects"),
        from: v.optional(v.number()),
        to: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, open: 0, closed: 0 };

        let total = 0;
        let open = 0;
        let closed = 0;
        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const pageResult: PageResult<ConvWithStatus> = await ctx.runQuery(internal.analytics._paginateConversationsForStats, {
                projectId: args.projectId,
                paginationOpts: { cursor, numItems: 200 },
            });
            for (const c of pageResult.page) {
                if (args.from && c._creationTime < args.from) continue;
                if (args.to && c._creationTime > args.to) continue;

                total++;
                if (c.status === 100 || c.status === 200) {
                    open++;
                } else if (c.status === 1000) {
                    closed++;
                }
            }
            cursor = pageResult.continueCursor;
            isDone = pageResult.isDone;
        }

        return { total, open, closed };
    },
});

export const _paginateConversationsForVisitors = internalQuery({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .paginate(args.paginationOpts);
    },
});

export const getVisitorStats = action({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalVisitors: 0 };

        const uniqueVisitors = new Set<string>();
        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const pageResult: PageResult<ConvWithStatus> = await ctx.runQuery(internal.analytics._paginateConversationsForVisitors, {
                projectId: args.projectId,
                paginationOpts: { cursor, numItems: 200 },
            });
            for (const c of pageResult.page) {
                uniqueVisitors.add(c.visitorId ?? "unknown");
            }
            cursor = pageResult.continueCursor;
            isDone = pageResult.isDone;
        }

        return { totalVisitors: uniqueVisitors.size };
    },
});

export const _paginateMessagesForStats = internalQuery({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .paginate(args.paginationOpts);
    },
});

export const getMessageStats = action({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, visitorMessages: 0, agentMessages: 0 };

        let total = 0;
        let visitorMessages = 0;
        let agentMessages = 0;
        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const pageResult: PageResult<MsgWithSender> = await ctx.runQuery(internal.analytics._paginateMessagesForStats, {
                projectId: args.projectId,
                paginationOpts: { cursor, numItems: 200 },
            });
            for (const m of pageResult.page) {
                total++;
                if (m.senderType === "visitor") {
                    visitorMessages++;
                } else if (m.senderType === "agent") {
                    agentMessages++;
                }
            }
            cursor = pageResult.continueCursor;
            isDone = pageResult.isDone;
        }

        return { total, visitorMessages, agentMessages };
    },
});

// ---------------------------------------------------------------------------
// Analytics queries — date-range filtered
// ---------------------------------------------------------------------------

/**
 * Conversation volume split by handledBy (bot vs agent) over a date range.
 * Returns daily buckets for the chart + totals.
 */
export const _checkProjectOwnership = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const orgId = (identity as { org_id?: string }).org_id;
        if (!orgId) return null;
        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== orgId) return null;
        return project;
    }
});

export const _paginateConversationsForVolume = internalQuery({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .paginate(args.paginationOpts);
    },
});

export const getConversationVolume = action({
    args: {
        projectId: v.id("projects"),
        from: v.number(), // Unix ms
        to: v.number(),   // Unix ms
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, botHandled: 0, agentHandled: 0, daily: [] };

        const project = await ctx.runQuery(internal.analytics._checkProjectOwnership, { projectId: args.projectId });
        if (!project) return { total: 0, botHandled: 0, agentHandled: 0, daily: [] };

        let total = 0;
        let botHandled = 0;
        let agentHandled = 0;
        const buckets: Record<string, { bot: number; agent: number }> = {};

        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const pageResult: PageResult<ConvWithStatus> = await ctx.runQuery(internal.analytics._paginateConversationsForVolume, {
                projectId: args.projectId,
                paginationOpts: { cursor, numItems: 200 },
            });
            for (const c of pageResult.page) {
                if (c._creationTime < args.from) continue;
                if (c._creationTime > args.to) continue;

                total++;
                const handledBy = (c.assignedTo || c.resolvedBy) ? "agent" : "bot";
                if (handledBy === "bot") botHandled++;
                else agentHandled++;

                const day = new Date(c._creationTime).toISOString().slice(0, 10);
                if (!buckets[day]) buckets[day] = { bot: 0, agent: 0 };

                if (handledBy === "bot") buckets[day].bot++;
                else buckets[day].agent++;
            }
            cursor = pageResult.continueCursor;
            isDone = pageResult.isDone;
        }

        const daily = Object.entries(buckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, counts]) => ({
                date,
                bot: counts.bot,
                agent: counts.agent,
                total: counts.bot + counts.agent,
            }));

        return { total, botHandled, agentHandled, daily };
    },
});

/**
 * Token usage summed over a date range, grouped by model.
 */
export const _paginateTokenUsage = internalQuery({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("token_usage")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .paginate(args.paginationOpts);
    },
});

export const getTokenUsage = action({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalTokens: 0, byModel: [] };

        const project = await ctx.runQuery(internal.analytics._checkProjectOwnership, { projectId: args.projectId });
        if (!project) return { totalTokens: 0, byModel: [] };

        const grouped: Record<string, number> = {};
        let totalTokens = 0;

        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const pageResult: PageResult<TokenUsage> = await ctx.runQuery(internal.analytics._paginateTokenUsage, {
                projectId: args.projectId,
                paginationOpts: { cursor, numItems: 200 },
            });
            for (const row of pageResult.page) {
                if (row.createdAt >= args.from && row.createdAt <= args.to) {
                    grouped[row.model] = (grouped[row.model] ?? 0) + row.tokensUsed;
                    totalTokens += row.tokensUsed;
                }
            }
            cursor = pageResult.continueCursor;
            isDone = pageResult.isDone;
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
            .take(args.limit ?? 20);

        if (args.from !== undefined && args.to !== undefined) {
            results = results.filter(row => row.lastAskedAt >= args.from! && row.lastAskedAt <= args.to!);
        }

        return results.slice(0, args.limit ?? 20);
    },
});

/**
 * CSAT summary: average rating + count per star (1-5).
 * Uses the dedicated csat_ratings table with paginated action loop.
 */
export const getCSATSummary = action({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

        const orgId = (identity as { org_id?: string }).org_id;
        if (!orgId) return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

        // Verify project access via internal query
        const hasAccess = await ctx.runQuery(internal.analytics.checkProjectAccess, {
            projectId: args.projectId,
            orgId,
        });
        if (!hasAccess) return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

        // Paginated loop over csat_ratings table
        let cursor: string | undefined;
        let sum = 0;
        let total = 0;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;

        let done = false;
        while (!done) {
            const pageResult = await ctx.runQuery(internal.analytics.getCSATRatingsPage, {
                projectId: args.projectId,
                from: args.from,
                to: args.to,
                cursor,
                limit: 500,
            });

            for (const r of pageResult.page) {
                const star = Math.min(5, Math.max(1, Math.round(r.rating)));
                distribution[star] = (distribution[star] ?? 0) + 1;
                sum += r.rating;
                total++;
            }

            done = pageResult.isDone;
            cursor = pageResult.continueCursor as string | undefined;
        }

        return {
            average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
            total,
            distribution,
        };
    },
});

export const checkProjectAccess = internalQuery({
    args: {
        projectId: v.id("projects"),
        orgId: v.string(),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        return project?.orgId === args.orgId;
    },
});

export const getCSATRatingsPage = internalQuery({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
        cursor: v.optional(v.string()),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("csat_ratings")
            .withIndex("by_projectId_createdAt", (q) =>
                q.eq("projectId", args.projectId)
                    .gte("createdAt", args.from)
                    .lte("createdAt", args.to)
            )
            .paginate({ cursor: args.cursor ?? null, numItems: args.limit });
    },
});

/**
 * Fetches recent CSAT comments for a project.
 */
export const getCSATComments = query({
    args: {
        projectId: v.id("projects"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated: identity required");
        }

        const project = await checkProjectOwnership(ctx, args.projectId, identity as { org_id?: string });
        if (!project) return [];

        const ratings = await ctx.db
            .query("csat_ratings")
            .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .take(args.limit ?? 10);

        return ratings
            .filter((r) => r.comment !== undefined && r.comment !== "")
            .map((r) => ({
                rating: r.rating,
                comment: r.comment as string,
                createdAt: r.createdAt,
            }));
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

        const project = await checkProjectOwnership(ctx, args.projectId, identity as { org_id?: string });
        if (!project) return { tokensConsumed: 0, conversationsCount: 0 };

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
export const _paginateConversationsForTags = internalQuery({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .paginate(args.paginationOpts);
    },
});

export const getTagsSummary = action({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const project = await ctx.runQuery(internal.analytics._checkProjectOwnership, { projectId: args.projectId });
        if (!project) return [];

        const tagCounts: Record<string, number> = {};

        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const pageResult: PageResult<ConvWithTags> = await ctx.runQuery(internal.analytics._paginateConversationsForTags, {
                projectId: args.projectId,
                paginationOpts: { cursor, numItems: 200 },
            });
            for (const conv of pageResult.page) {
                if (conv._creationTime >= args.from && conv._creationTime <= args.to && conv.tags) {
                    for (const tag of conv.tags) {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    }
                }
            }
            cursor = pageResult.continueCursor;
            isDone = pageResult.isDone;
        }

        return Object.entries(tagCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 tags
    }
});

/**
 * Fetches a summary of project usage (conversations, bots, KBs, tokens) for the current billing cycle.
 */
export const getProjectUsageSummary = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const project = await checkProjectOwnership(ctx, args.projectId, identity as { org_id?: string });
        if (!project) throw new Error("Unauthorized: Project does not belong to your organization");

        // 1. Fetch project_usage record
        const usage = await ctx.db
            .query("project_usage")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();

        const billingCycleStart = usage?.billingCycleStart ?? project._creationTime;
        const tokensConsumed = usage?.tokensConsumed ?? 0;

        // 2. Count conversations in the current billing cycle
        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.gte(q.field("_creationTime"), billingCycleStart))
            .collect();

        // 3. Count bots
        const bots = await ctx.db
            .query("bots")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        // 4. Count knowledge bases
        const knowledgeBases = await ctx.db
            .query("knowledge_bases")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        return {
            conversations: conversations.length,
            bots: bots.length,
            knowledgeBases: knowledgeBases.length,
            tokensConsumed,
            billingCycleStart,
        };
    },
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

/**
 * Calculates the SLA breach rate for conversations within a date range.
 * Uses paginated action loop to count ALL conversations, not just first 500.
 */
export const getSLABreachRate = action({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, slaTracked: 0, breached: 0, breachRate: 0 };

        const orgId = (identity as { org_id?: string }).org_id;
        if (!orgId) return { total: 0, slaTracked: 0, breached: 0, breachRate: 0 };

        const hasAccess = await ctx.runQuery(internal.analytics.checkProjectAccess, {
            projectId: args.projectId,
            orgId,
        });
        if (!hasAccess) return { total: 0, slaTracked: 0, breached: 0, breachRate: 0 };

        // Paginated loop over conversations
        let cursor: string | undefined;
        let total = 0;
        let slaTracked = 0;
        let breached = 0;

        let done = false;
        while (!done) {
            const pageResult = await ctx.runQuery(internal.analytics.getSLAConversationsPage, {
                projectId: args.projectId,
                from: args.from,
                to: args.to,
                cursor,
                limit: 500,
            });

            for (const c of pageResult.page) {
                total++;
                if (c.slaDeadline !== undefined && c.firstResponseAt !== undefined) {
                    slaTracked++;
                    if (c.firstResponseAt > c.slaDeadline) {
                        breached++;
                    }
                }
            }

            done = pageResult.isDone;
            cursor = pageResult.continueCursor as string | undefined;
        }

        const breachRateRaw = slaTracked > 0 ? (breached / slaTracked) * 100 : 0;
        const breachRate = Math.round(breachRateRaw * 10) / 10;

        return { total, slaTracked, breached, breachRate };
    },
});

export const getSLAConversationsPage = internalQuery({
    args: {
        projectId: v.id("projects"),
        from: v.number(),
        to: v.number(),
        cursor: v.optional(v.string()),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .paginate({ cursor: args.cursor ?? null, numItems: args.limit });
    },
});

/**
 * Delete an unanswered query by ID.
 * Multi-tenancy check ensuring the query belongs to a project in the user's org.
 */
export const dismissUnansweredQuery = mutation({
    args: { id: v.id("unanswered_queries") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as { org_id?: string } | null;
        if (!identity || !identity.org_id) {
            throw new Error("No active organization found in identity.");
        }

        const queryRow = await ctx.db.get(args.id);
        if (!queryRow) {
            throw new Error("Unanswered query not found");
        }

        // Verify multi-tenancy: does the project this query belongs to match the user's org?
        const project = await ctx.db.get(queryRow.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new Error("Unauthorized: Unanswered query does not belong to your organization.");
        }

        await ctx.db.delete(args.id);
    },
});
