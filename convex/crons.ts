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

export default crons;
