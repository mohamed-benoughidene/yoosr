/**
 * Structured logging utility for Convex functions.
 *
 * In development: pretty-print with emoji icons.
 * In production: JSON output for log aggregation (Datadog, CloudWatch, etc.).
 *
 * Each log entry includes:
 * - level: debug | info | warn | error
 * - message: human-readable description
 * - timestamp: ISO 8601 timestamp
 * - projectId: optional, the project context
 * - userId: optional, the user context
 * - ...additional metadata
 *
 * TODO: Migrate remaining console.error/warn calls to logger:
 * - convex/knowledge.ts: lines 73, 119, 124, 172, 210, 216, 229, 250, 255
 * - convex/bot.ts: lines 111, 347, 391, 409, 867
 * - convex/tags.ts: lines 73, 83
 * - convex/routing.ts: line 199
 * - convex/conversations.ts: lines 1114, 1163, 1170, 1337, 1341
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    projectId?: string;
    userId?: string;
    conversationId?: string;
    [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
    };

    // In development: pretty-print with emoji
    if (process.env.NODE_ENV === "development") {
        const icon = { debug: "🔵", info: "ℹ️", warn: "⚠️", error: "❌" }[level];
        const meta = metadata ? JSON.stringify(metadata, null, 2) : "";
        console[level === "warn" || level === "error" ? level : "log"](
            `${icon} [${entry.timestamp}] ${message}`,
            meta
        );
        return;
    }

    // In production: JSON for log aggregation
    const outputFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    outputFn(JSON.stringify(entry));
}

export const logger = {
    debug: (msg: string, meta?: Record<string, unknown>) => formatLog("debug", msg, meta),
    info: (msg: string, meta?: Record<string, unknown>) => formatLog("info", msg, meta),
    warn: (msg: string, meta?: Record<string, unknown>) => formatLog("warn", msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) => formatLog("error", msg, meta),
};
