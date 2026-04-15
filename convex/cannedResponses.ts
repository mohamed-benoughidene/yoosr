/**
 * Canned responses — pre-written message templates for agents.
 */
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./utils";
import { authError, notFoundError } from "./errors";
import { softDelete } from "./lib/softDelete";

/**
 * List all canned responses for a project.
 */
export const listCannedResponses = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        return await ctx.db
            .query("canned_responses")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .take(200);
    },
});

/**
 * Create a new canned response (admin only).
 */
export const createCannedResponse = mutation({
    args: {
        projectId: v.id("projects"),
        trigger: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        const id = await ctx.db.insert("canned_responses", {
            ...args,
            createdBy: identity.subject,
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "canned_response_created",
            targetType: "canned_response",
            targetId: id,
            metadata: { trigger: args.trigger },
        });

        return id;
    },
});

/**
 * Update an existing canned response (admin only).
 */
export const updateCannedResponse = mutation({
    args: {
        id: v.id("canned_responses"),
        trigger: v.optional(v.string()),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        const { id, ...updates } = args;
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);

        const cannedResponse = await ctx.db.get(id);
        if (cannedResponse) {
            await ctx.runMutation(internal.activityLogs.logActivityInternal, {
                projectId: cannedResponse.projectId,
                actorId: identity.subject,
                actorName: identity.name ?? identity.email ?? "Unknown",
                action: "canned_response_updated",
                targetType: "canned_response",
                targetId: id,
            });
        }
    },
});

/**
 * Delete a canned response (admin only).
 */
export const removeCannedResponse = mutation({
    args: { id: v.id("canned_responses") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        const cannedResponse = await ctx.db.get(args.id);
        if (!cannedResponse) throw notFoundError("Canned response");

        await softDelete(ctx, "canned_responses", args.id);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: cannedResponse.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "canned_response_deleted",
            targetType: "canned_response",
            targetId: args.id,
        });
    },
});
