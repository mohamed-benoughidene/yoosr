/**
 * Internal cron job handlers for data retention / TTL cleanup.
 * These are called by the cron jobs defined in convex/crons.ts.
 * Each handler deletes records older than a retention period using .take(N)
 * to avoid transaction size limits.
 */
import { internalMutation } from "./_generated/server";

// ============================================================
// Retention periods (documented for reference):
// - activity_logs: 90 days
// - webhook_deliveries: 30 days
// - token_usage: 90 days
// - csat_ratings: 180 days
// - conversation_events: 30 days
// - unanswered_queries: 90 days
// - project_usage: 90 days
// - soft_deleted_records: 30 days after deletion
// ============================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Delete activity_logs older than 90 days (batch of 1000).
 */
export const cleanupActivityLogs = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 90 * MS_PER_DAY;
        const logs = await ctx.db
            .query("activity_logs")
            .filter((q) => q.lte(q.field("createdAt"), cutoff))
            .take(1000);
        for (const log of logs) {
            await ctx.db.delete(log._id);
        }
        if (logs.length > 0) {
            console.log(`Cleaned up ${logs.length} activity logs older than 90 days`);
        }
    },
});

/**
 * Delete webhook_deliveries older than 30 days (batch of 1000).
 */
export const cleanupWebhookDeliveries = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 30 * MS_PER_DAY;
        const deliveries = await ctx.db
            .query("webhook_deliveries")
            .filter((q) => q.lte(q.field("timestamp"), cutoff))
            .take(1000);
        for (const delivery of deliveries) {
            await ctx.db.delete(delivery._id);
        }
        if (deliveries.length > 0) {
            console.log(`Cleaned up ${deliveries.length} webhook deliveries older than 30 days`);
        }
    },
});

/**
 * Delete token_usage older than 90 days (batch of 1000).
 */
export const cleanupTokenUsage = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 90 * MS_PER_DAY;
        const usage = await ctx.db
            .query("token_usage")
            .filter((q) => q.lte(q.field("createdAt"), cutoff))
            .take(1000);
        for (const record of usage) {
            await ctx.db.delete(record._id);
        }
        if (usage.length > 0) {
            console.log(`Cleaned up ${usage.length} token usage records older than 90 days`);
        }
    },
});

/**
 * Delete csat_ratings older than 180 days (batch of 1000).
 */
export const cleanupCsatRatings = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 180 * MS_PER_DAY;
        const ratings = await ctx.db
            .query("csat_ratings")
            .filter((q) => q.lte(q.field("createdAt"), cutoff))
            .take(1000);
        for (const rating of ratings) {
            await ctx.db.delete(rating._id);
        }
        if (ratings.length > 0) {
            console.log(`Cleaned up ${ratings.length} csat ratings older than 180 days`);
        }
    },
});

/**
 * Delete conversation_events older than 30 days (batch of 1000).
 */
export const cleanupConversationEvents = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 30 * MS_PER_DAY;
        const events = await ctx.db
            .query("conversation_events")
            .filter((q) => q.lte(q.field("createdAt"), cutoff))
            .take(1000);
        for (const event of events) {
            await ctx.db.delete(event._id);
        }
        if (events.length > 0) {
            console.log(`Cleaned up ${events.length} conversation events older than 30 days`);
        }
    },
});

/**
 * Delete unanswered_queries older than 90 days (batch of 1000).
 */
export const cleanupUnansweredQueries = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 90 * MS_PER_DAY;
        // unanswered_queries doesn't have a createdAt index, so we use lastAskedAt
        const allQueries = await ctx.db
            .query("unanswered_queries")
            .take(1000);
        const expired = allQueries.filter((q) => q.lastAskedAt < cutoff);
        for (const record of expired) {
            await ctx.db.delete(record._id);
        }
        if (expired.length > 0) {
            console.log(`Cleaned up ${expired.length} unanswered queries older than 90 days`);
        }
    },
});

/**
 * Delete project_usage older than 90 days (batch of 1000).
 */
export const cleanupProjectUsage = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 90 * MS_PER_DAY;
        const usage = await ctx.db
            .query("project_usage")
            .filter((q) => q.lte(q.field("billingCycleStart"), cutoff))
            .take(1000);
        for (const record of usage) {
            await ctx.db.delete(record._id);
        }
        if (usage.length > 0) {
            console.log(`Cleaned up ${usage.length} project usage records older than 90 days`);
        }
    },
});

/**
 * Permanently delete soft-deleted records older than 30 days.
 * This runs weekly to clean up records that were soft-deleted but not yet hard-deleted.
 */
export const cleanupOldSoftDeletes = internalMutation({
    args: {},
    handler: async (ctx) => {
        const cutoff = Date.now() - 30 * MS_PER_DAY;
        const tables = [
            "conversations",
            "messages",
            "bots",
            "bot_flows",
            "contacts",
            "orders",
            "projects",
            "knowledge_bases",
            "knowledge_base_sources",
            "knowledge_base_chunks",
            "departments",
            "labels",
            "canned_responses",
            "integrations",
            "webhook_subscriptions",
            "notifications",
            "push_subscriptions",
            "activity_logs",
            "conversation_events",
            "csat_ratings",
            "token_usage",
            "unanswered_queries",
            "project_usage",
            "webhook_deliveries",
        ] as const;

        let totalDeleted = 0;

        for (const table of tables) {
            const oldRecords = await ctx.db
                .query(table)
                .filter((q) => q.lt(q.field("deletedAt"), cutoff))
                .take(500);

            for (const record of oldRecords) {
                await ctx.db.delete(record._id);
                totalDeleted++;
            }

            if (oldRecords.length > 0) {
                console.log(`Permanently deleted ${oldRecords.length} soft-deleted ${table} records older than 30 days`);
            }
        }

        if (totalDeleted > 0) {
            console.log(`Total permanently deleted soft-deleted records: ${totalDeleted}`);
        }

        return { deleted: totalDeleted };
    },
});

/**
 * Delete conversations and their messages that have expired (expiresAt < now).
 * Runs daily at 3 AM UTC. Uses softDelete() for safety, then permanently deletes
 * messages belonging to soft-deleted conversations.
 */
export const cleanupExpiredConversations = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // Step 1: Find expired conversations
        const expiredConversations = await ctx.db
            .query("conversations")
            .filter((q) => q.and(
                q.lt(q.field("expiresAt"), now),
                q.eq(q.field("deletedAt"), undefined), // only active conversations
            ))
            .take(500);

        if (expiredConversations.length === 0) {
            return { conversationsSoftDeleted: 0, messagesSoftDeleted: 0 };
        }

        // Step 2: Soft-delete expired conversations
        for (const convo of expiredConversations) {
            await ctx.db.patch(convo._id, { deletedAt: now });
        }

        // Step 3: Soft-delete all messages belonging to expired conversations
        let messagesDeleted = 0;
        for (const convo of expiredConversations) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", convo._id))
                .take(1000);

            for (const msg of messages) {
                await ctx.db.patch(msg._id, { deletedAt: now });
                messagesDeleted++;
            }
        }

        console.log(
            `TTL cleanup: soft-deleted ${expiredConversations.length} expired conversations and ${messagesDeleted} messages`
        );

        return {
            conversationsSoftDeleted: expiredConversations.length,
            messagesSoftDeleted: messagesDeleted,
        };
    },
});
