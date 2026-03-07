import { internalAction, internalQuery, query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { requireAdmin } from "./utils";

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
                const bodyString = JSON.stringify({
                    event: args.event,
                    projectId: args.projectId,
                    timestamp: Date.now(),
                    data: args.payload,
                });

                const encoder = new TextEncoder();
                const key = await crypto.subtle.importKey(
                    "raw",
                    encoder.encode(sub.secret),
                    { name: "HMAC", hash: "SHA-256" },
                    false,
                    ["sign"]
                );

                const signatureBuffer = await crypto.subtle.sign(
                    "HMAC",
                    key,
                    encoder.encode(bodyString)
                );

                const signatureHex = Array.from(new Uint8Array(signatureBuffer))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");

                const response = await fetch(sub.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Yoosr-Event": args.event,
                        "X-Yoosr-Signature": `sha256=${signatureHex}`
                    },
                    body: bodyString,
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
        requireAdmin(identity as any);
        if (!identity) throw new Error("Unauthorized");

        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        const secret = Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        const newId = await ctx.db.insert("webhook_subscriptions", {
            projectId: args.projectId,
            url: args.url,
            events: args.events,
            secret,
            isActive: true,
        });

        return await ctx.db.get(newId);
    }
});

export const update = mutation({
    args: {
        id: v.id("webhook_subscriptions"),
        isActive: v.boolean()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as any);
        if (!identity) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, { isActive: args.isActive });
    }
});

export const remove = mutation({
    args: { id: v.id("webhook_subscriptions") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as any;
        requireAdmin(identity);
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

/**
 * One-time migration to backfill secrets for existing webhook subscriptions
 */
export const backfillWebhookSecrets = mutation({
    args: {},
    handler: async (ctx) => {
        const subscriptions = await ctx.db.query("webhook_subscriptions").collect();
        let updatedCount = 0;

        for (const sub of subscriptions) {
            // Check if secret is missing or empty
            if (!(sub as any).secret) {
                const bytes = new Uint8Array(32);
                crypto.getRandomValues(bytes);
                const secret = Array.from(bytes)
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");

                await ctx.db.patch(sub._id, { secret } as any);
                updatedCount++;
            }
        }
        return { updated: updatedCount, total: subscriptions.length };
    }
});
