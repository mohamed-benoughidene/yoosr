import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const createNotification = internalMutation({
    args: {
        projectId: v.id("projects"),
        recipientId: v.string(),
        type: v.union(
            v.literal("new_message"),
            v.literal("assigned"),
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
                await ctx.db.delete(notif._id);
            }
        }
    },
});

export const listForCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call");
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
            .filter((q) => q.eq(q.field("projectId"), project._id))
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

        // Count unread
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_project_recipient", (q) =>
                q.eq("projectId", project._id).eq("recipientId", userId)
            )
            .filter((q) => q.eq(q.field("read"), false))
            .take(500); // TODO: replace with paginated aggregation

        return notifications.length;
    },
});

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated call");

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) throw new Error("Notification not found");

        if (notification.recipientId !== identity.subject) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.notificationId, { read: true });
    },
});

export const markAllRead = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated call");

        const orgId = identity.org_id;
        const userId = identity.subject;

        if (!orgId) return;

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId as string))
            .first();

        if (!project) return;

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_project_recipient", (q) =>
                q.eq("projectId", project._id).eq("recipientId", userId)
            )
            .filter((q) => q.eq(q.field("read"), false))
            .take(500); // TODO: replace with paginated aggregation

        for (const notif of notifications) {
            await ctx.db.patch(notif._id, { read: true });
        }
    },
});

export const clearAll = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated call");

        const orgId = identity.org_id;
        const userId = identity.subject;

        if (!orgId) return;

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId as string))
            .first();

        if (!project) return;

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_project_recipient", (q) =>
                q.eq("projectId", project._id).eq("recipientId", userId)
            )
            .take(500); // TODO: replace with paginated aggregation

        for (const notif of notifications) {
            await ctx.db.delete(notif._id);
        }
    },
});

export const cleanupOldNotifications = internalMutation({
    args: {},
    handler: async (ctx) => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const oldNotifications = await ctx.db
            .query("notifications")
            .filter((q) => q.lt(q.field("createdAt"), sevenDaysAgo))
            .take(500); // TODO: replace with paginated aggregation

        for (const notif of oldNotifications) {
            await ctx.db.delete(notif._id);
        }
    },
});
