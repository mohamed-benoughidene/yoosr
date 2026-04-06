/**
 * Operating hours — configure when the bot/agents are available.
 */
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./utils";
import { authError } from "./errors";

/**
 * Get operating hours configuration for a project.
 */
export const getOperatingHours = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const results = await ctx.db
            .query("operating_hours")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();
        return results;
    },
});

/**
 * Create or update operating hours for a project (admin only).
 */
export const upsertOperatingHours = mutation({
    args: {
        projectId: v.id("projects"),
        enabled: v.boolean(),
        timezone: v.string(),
        schedule: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        const existing = await ctx.db
            .query("operating_hours")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();

        let resultId;
        if (existing) {
            await ctx.db.patch(existing._id, {
                enabled: args.enabled,
                timezone: args.timezone,
                schedule: args.schedule,
            });
            resultId = existing._id;
        } else {
            resultId = await ctx.db.insert("operating_hours", args);
        }

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "operating_hours_updated",
            targetType: "department",
            metadata: { enabled: args.enabled, timezone: args.timezone },
        });

        return resultId;
    },
});
