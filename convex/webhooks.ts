import { internalAction, internalQuery, internalMutation, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireAdmin } from "./utils";
import { authError, notFoundError, forbiddenError } from "./errors";

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

        // Fan-out delivery tasks
        for (const sub of subscriptions) {
            await ctx.scheduler.runAfter(0, internal.webhooks.deliverWebhook, {
                subscriptionId: sub._id,
                projectId: args.projectId,
                event: args.event,
                payload: args.payload,
                attempt: 1,
            });
        }
    },
});

export const getSubscriptionById = internalQuery({
    args: { subscriptionId: v.id("webhook_subscriptions") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.subscriptionId);
    }
});

export const logDelivery = internalMutation({
    args: {
        subscriptionId: v.id("webhook_subscriptions"),
        projectId: v.id("projects"),
        event: v.string(),
        url: v.string(),
        attempt: v.number(),
        success: v.boolean(),
        statusCode: v.optional(v.number()),
        error: v.optional(v.string()),
        timestamp: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("webhook_deliveries", {
            subscriptionId: args.subscriptionId,
            projectId: args.projectId,
            event: args.event,
            url: args.url,
            attempt: args.attempt,
            success: args.success,
            statusCode: args.statusCode,
            error: args.error,
            timestamp: args.timestamp,
        });
    }
});

export const deliverWebhook = internalAction({
    args: {
        subscriptionId: v.id("webhook_subscriptions"),
        projectId: v.id("projects"),
        event: v.string(),
        payload: v.any(),
        attempt: v.number(),
    },
    handler: async (ctx, args) => {
        const sub = await ctx.runQuery(internal.webhooks.getSubscriptionById, {
            subscriptionId: args.subscriptionId,
        });

        if (!sub || !sub.isActive) return;

        let success = false;
        let statusCode: number | undefined;
        let errorMessage: string | undefined;

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
                signal: AbortSignal.timeout(10000),
            });

            statusCode = response.status;
            success = response.ok;
            
            if (!response.ok) {
                errorMessage = `Webhook failed with status ${response.status}`;
            }
        } catch (error: unknown) {
            success = false;
            const err = error as { message?: string };
            errorMessage = err.message || String(error);
        }

        // Log the delivery attempt
        await ctx.runMutation(internal.webhooks.logDelivery, {
            subscriptionId: args.subscriptionId,
            projectId: args.projectId,
            event: args.event,
            url: sub.url,
            attempt: args.attempt,
            success,
            statusCode,
            error: errorMessage,
            timestamp: Date.now(),
        });

        // Retry logic
        if (!success && args.attempt < 3) {
            const nextAttempt = args.attempt + 1;
            const delayMs = nextAttempt === 2 ? 60000 : 300000;
            
            await ctx.scheduler.runAfter(delayMs, internal.webhooks.deliverWebhook, {
                subscriptionId: args.subscriptionId,
                projectId: args.projectId,
                event: args.event,
                payload: args.payload,
                attempt: nextAttempt,
            });
        }
    }
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
            .take(50);

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
            .take(100);
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
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();

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
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();

        await ctx.db.patch(args.id, { isActive: args.isActive });
    }
});

export const remove = mutation({
    args: { id: v.id("webhook_subscriptions") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as { org_id: string; org_role?: string } | null;
        requireAdmin(identity);
        if (!identity) throw authError();

        const subscription = await ctx.db.get(args.id);
        if (!subscription) throw notFoundError("Webhook subscription");

        const project = await ctx.db.get(subscription.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw forbiddenError();
        }

        await ctx.db.delete(args.id);
    }
});

/**
 * One-time migration to backfill secrets for existing webhook subscriptions
 */
export const backfillWebhookSecrets = mutation({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });
        if (!identity) throw authError();

        // Scope to the caller's project only
        const subscriptions = await ctx.db
            .query("webhook_subscriptions")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();
        let updatedCount = 0;

        for (const sub of subscriptions) {
            // Check if secret is missing or empty
            if (!sub.secret) {
                const bytes = new Uint8Array(32);
                crypto.getRandomValues(bytes);
                const secret = Array.from(bytes)
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");

                await ctx.db.patch(sub._id, { secret });
                updatedCount++;
            }
        }
        return { updated: updatedCount, total: subscriptions.length };
    }
});
