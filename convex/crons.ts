import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for inactive conversations every 5 minutes
crons.interval(
    "auto-close inactive conversations",
    { minutes: 5 },
    internal.conversations.autoCloseInactive,
);

// Cleanup notifications older than 7 days
crons.interval(
    "cleanup old notifications",
    { hours: 24 },
    internal.notifications.cleanupOldNotifications,
);
// Cleanup stale agent presence
crons.interval(
    "cleanup stale presence",
    { seconds: 60 },
    internal.profiles.cleanupStalePresence,
);

// Retry routing for unassigned conversations every 5 minutes
crons.interval(
    "retry unassigned conversations",
    { minutes: 5 },
    internal.routing.retryUnassignedConversations,
);

// ============================================================
// Data retention / TTL cleanup cron jobs
// These prevent append-only tables from growing indefinitely.
// Each runs on a staggered schedule to avoid simultaneous execution.
// ============================================================

/**
 * Cleanup activity_logs older than 90 days.
 * Runs Sunday at 2:00 AM.
 */
crons.cron(
    "cleanup activity logs",
    "0 2 * * 0", // Sunday 2 AM
    internal.cron.cleanupActivityLogs,
);

/**
 * Cleanup webhook_deliveries older than 30 days.
 * Runs Monday at 2:30 AM.
 */
crons.cron(
    "cleanup webhook deliveries",
    "30 2 * * 1", // Monday 2:30 AM
    internal.cron.cleanupWebhookDeliveries,
);

/**
 * Cleanup token_usage older than 90 days.
 * Runs Tuesday at 3:00 AM.
 */
crons.cron(
    "cleanup token usage",
    "0 3 * * 2", // Tuesday 3 AM
    internal.cron.cleanupTokenUsage,
);

/**
 * Cleanup csat_ratings older than 180 days.
 * Runs Wednesday at 3:30 AM.
 */
crons.cron(
    "cleanup csat ratings",
    "30 3 * * 3", // Wednesday 3:30 AM
    internal.cron.cleanupCsatRatings,
);

/**
 * Cleanup conversation_events older than 30 days.
 * Runs Thursday at 4:00 AM.
 */
crons.cron(
    "cleanup conversation events",
    "0 4 * * 4", // Thursday 4 AM
    internal.cron.cleanupConversationEvents,
);

/**
 * Cleanup unanswered_queries older than 90 days.
 * Runs Friday at 4:30 AM.
 */
crons.cron(
    "cleanup unanswered queries",
    "30 4 * * 5", // Friday 4:30 AM
    internal.cron.cleanupUnansweredQueries,
);

/**
 * Cleanup project_usage older than 90 days.
 * Runs Saturday at 5:00 AM.
 */
crons.cron(
    "cleanup project usage",
    "0 5 * * 6", // Saturday 5 AM
    internal.cron.cleanupProjectUsage,
);

/**
 * Soft-delete expired conversations and their messages (TTL cleanup).
 * Runs daily at 3:00 AM.
 */
crons.cron(
    "cleanup expired conversations",
    "0 3 * * *", // Daily 3 AM
    internal.cron.cleanupExpiredConversations,
);

/**
 * Permanently delete soft-deleted records older than 30 days.
 * Runs Sunday at 6:00 AM (after other cleanup jobs).
 */
crons.cron(
    "cleanup old soft deletes",
    "0 6 * * 0", // Sunday 6 AM
    internal.cron.cleanupOldSoftDeletes,
);

export default crons;
