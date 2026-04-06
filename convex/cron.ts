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
