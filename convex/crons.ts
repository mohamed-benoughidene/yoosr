import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for inactive conversations every 5 minutes
crons.interval(
    "auto-close inactive conversations",
    { minutes: 5 },
    internal.conversations.autoCloseInactive,
);

export default crons;
