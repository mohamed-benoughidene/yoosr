import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { authError, notFoundError, forbiddenError } from "./errors";
import { softDelete } from "./lib/softDelete";

export const createNotification = internalMutation({
    args: {
        projectId: v.id("projects"),
        recipientId: v.string(),
        type: v.union(
            v.literal("new_message"),
            v.literal("assigned"),
            v.literal("unassigned_conversation"),
            v.literal("escalation"),
            v.literal("resolved")
        ),
        conversationId: v.id("conversations"),
        title: v.string(),
        body: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            ...args,
            read: false,
            createdAt: Date.now(),
        });

        // After inserting, check how many notifications this recipientId has total
        // if over 50, delete the oldest ones to bring it back to 50
        const userNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
            .order("desc")
            .take(100);

        if (userNotifications.length > 50) {
            const toDelete = userNotifications.slice(50);
            for (const notif of toDelete) {
                await softDelete(ctx, "notifications", notif._id);
            }
        }
    },
});

export const listForCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw authError();
        }

        const orgId = identity.org_id;
        const userId = identity.subject;

        if (!orgId) {
            return [];
        }

        // Find the project where orgId matches
        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId as string))
            .first();

        if (!project) {
            return [];
        }

        // Returns the 30 most recent notifications for the current user
        // ordered by createdAt descending
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
            .order("desc")
            .filter((q) => q.and(
                q.eq(q.field("projectId"), project._id),
                q.eq(q.field("deletedAt"), undefined)
            ))
            .take(30);

        return notifications;
    },
});

export const unreadCount = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return 0;
        }

        const orgId = identity.org_id;
        const userId = identity.subject;

        if (!orgId) return 0;

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId as string))
            .first();

        if (!project) return 0;

        // Count unread — use 51 as sentinel for "50+" to avoid scanning beyond
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_project_recipient", (q) =>
                q.eq("projectId", project._id).eq("recipientId", userId)
            )
            .filter((q) => q.and(
                q.eq(q.field("read"), false),
                q.eq(q.field("deletedAt"), undefined)
            ))
            .take(51);

        return notifications.length >= 51 ? 999 : notifications.length; // 999 = "99+" sentinel for frontend
    },
});

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) throw notFoundError("Notification");

        if (notification.recipientId !== identity.subject) {
            throw forbiddenError();
        }

        await ctx.db.patch(args.notificationId, { read: true });
    },
});

export const markAllRead = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        const orgId = identity.org_id;
        const userId = identity.subject;

        if (!orgId) return;

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId as string))
            .first();

        if (!project) return;

        // Mark all unread as read — bounded batch to avoid runaway reads
        const MAX_BATCH = 200;
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_project_recipient", (q) =>
                q.eq("projectId", project._id).eq("recipientId", userId)
            )
            .filter((q) => q.eq(q.field("read"), false))
            .take(MAX_BATCH);

        for (const notif of notifications) {
            await ctx.db.patch(notif._id, { read: true });
        }
    },
});

export const clearAll = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        const orgId = identity.org_id;
        const userId = identity.subject;

        if (!orgId) return;

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId as string))
            .first();

        if (!project) return;

        // Delete in bounded batches
        const MAX_BATCH = 200;
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_project_recipient", (q) =>
                q.eq("projectId", project._id).eq("recipientId", userId)
            )
            .take(MAX_BATCH);

        for (const notif of notifications) {
            await softDelete(ctx, "notifications", notif._id);
        }
    },
});

export const cleanupOldNotifications = internalMutation({
    args: {},
    handler: async (ctx) => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        // Delete in bounded batches — cron will run repeatedly so old entries will be cleaned over time
        const MAX_BATCH = 500;
        const oldNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_createdAt", (q) => q.lt("createdAt", sevenDaysAgo))
            .take(MAX_BATCH);

        for (const notif of oldNotifications) {
            await softDelete(ctx, "notifications", notif._id);
        }
    },
});
