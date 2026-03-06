import { internalAction, internalQuery, query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Action triggered to fetch outbound URLs and fire POST requests
 */
export const fireWebhookEvent = internalAction({
    args: {
        projectId: v.id("projects"),
        event: v.string(),
        payload: v.any(),
    },
    handler: async (ctx, args) => {
        // Fetch active webhook subscriptions for this project
        const subscriptions = await ctx.runQuery(internal.webhooks.getActiveSubscriptions, {
            projectId: args.projectId,
            event: args.event,
        });

        if (!subscriptions || subscriptions.length === 0) return;

        // Fire HTTP POSTs
        const fetchPromises = subscriptions.map(async (sub: any) => {
            try {
                const response = await fetch(sub.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Tiledesk-Event": args.event,
                    },
                    body: JSON.stringify({
                        event: args.event,
                        projectId: args.projectId,
                        timestamp: Date.now(),
                        data: args.payload,
                    }),
                });

                if (!response.ok) {
                    console.error(`Webhook ${sub.url} failed with status ${response.status}`);
                }
            } catch (error) {
                console.error(`Error firing webhook to ${sub.url}:`, error);
            }
        });

        await Promise.allSettled(fetchPromises);
    },
});

/**
 * Internal query to fetch active subscriptions filtering by project and event
 */
export const getActiveSubscriptions = internalQuery({
    args: {
        projectId: v.id("projects"),
        event: v.string(),
    },
    handler: async (ctx, args) => {
        const subs = await ctx.db
            .query("webhook_subscriptions")
            .withIndex("by_projectId_isActive", q =>
                q.eq("projectId", args.projectId).eq("isActive", true)
            )
            .collect();

        return subs.filter(sub => sub.events.includes(args.event));
    }
});

// ---------------------------------------------------------------------------
// Client-facing CRUD
// ---------------------------------------------------------------------------

export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("webhook_subscriptions")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();
    }
});

export const create = mutation({
    args: {
        projectId: v.id("projects"),
        url: v.string(),
        events: v.array(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        return await ctx.db.insert("webhook_subscriptions", {
            projectId: args.projectId,
            url: args.url,
            events: args.events,
            isActive: true,
        });
    }
});

export const update = mutation({
    args: {
        id: v.id("webhook_subscriptions"),
        isActive: v.boolean()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, { isActive: args.isActive });
    }
});

export const remove = mutation({
    args: { id: v.id("webhook_subscriptions") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as any;
        if (!identity) throw new Error("Not authenticated");

        const subscription = await ctx.db.get(args.id);
        if (!subscription) throw new Error("Webhook subscription not found");

        const project = await ctx.db.get(subscription.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new ConvexError("Unauthorized");
        }

        await ctx.db.delete(args.id);
    }
});
