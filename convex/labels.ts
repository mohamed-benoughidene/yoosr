/**
 * Label management — CRUD mutations for conversation labels/tags.
 * The listLabels query already exists in this file.
 */
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./utils";
import { authError, notFoundError } from "./errors";
import { softDelete } from "./lib/softDelete";

/**
 * List all labels for a project.
 */
export const listLabels = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        return await ctx.db
            .query("labels")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .take(200); // TODO: replace with paginated aggregation
    },
});

/**
 * Create a new label (admin only).
 */
export const createLabel = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        const id = await ctx.db.insert("labels", {
            ...args,
            createdBy: identity.subject,
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "label_created",
            targetType: "label",
            targetId: id,
            metadata: { name: args.name, color: args.color },
        });

        return id;
    },
});

/**
 * Update an existing label (admin only).
 */
export const updateLabel = mutation({
    args: {
        id: v.id("labels"),
        name: v.optional(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        const { id, ...updates } = args;
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) if (v !== undefined) clean[k] = v;
        await ctx.db.patch(id, clean);

        const label = await ctx.db.get(id);
        if (label) {
            await ctx.runMutation(internal.activityLogs.logActivityInternal, {
                projectId: label.projectId,
                actorId: identity.subject,
                actorName: identity.name ?? identity.email ?? "Unknown",
                action: "label_updated",
                targetType: "label",
                targetId: id,
                metadata: { ...(args.name && { name: args.name }) },
            });
        }
    },
});

/**
 * Delete a label (admin only). Cascades to remove label name from conversation tags.
 */
export const removeLabel = mutation({
    args: { id: v.id("labels") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        const label = await ctx.db.get(args.id);
        if (!label) throw notFoundError("Label");

        await softDelete(ctx, "labels", args.id);

        // Cascade: remove the deleted label name from all conversation tags in this project
        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", label.projectId))
            .take(500);

        for (const conv of conversations) {
            if (conv.tags && conv.tags.includes(label.name)) {
                await ctx.db.patch(conv._id, {
                    tags: conv.tags.filter((t) => t !== label.name),
                });
            }
        }

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: label.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "label_deleted",
            targetType: "label",
            targetId: args.id,
            metadata: { name: label.name },
        });
    },
});
