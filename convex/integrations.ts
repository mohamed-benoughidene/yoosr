import { query, mutation, internalMutation, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { encryptSecret, decryptSecret } from "./lib/crypto";
import { requireAdmin } from "./utils";
import { requireEnv } from "./lib/env";

// List integrations for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(100);
    },
});

// Create or update an integration
export const upsert = mutation({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.optional(v.any()),
        enabled: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        // Check if we already have this provider for this project
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();

        if (existing) {
            const updates: Record<string, unknown> = {};
            if (args.credentials !== undefined) updates.credentials = args.credentials;
            if (args.enabled !== undefined) updates.enabled = args.enabled;
            await ctx.db.patch(existing._id, updates);
            return existing._id;
        } else {
            return await ctx.db.insert("integrations", {
                projectId: args.projectId,
                provider: args.provider,
                credentials: args.credentials ?? {},
                enabled: args.enabled ?? false,
            });
        }
    },
});

export const upsertInternal = internalMutation({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.optional(v.any()),
        enabled: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();
        if (existing) {
            const updates: Record<string, unknown> = {};
            if (args.credentials !== undefined) updates.credentials = args.credentials;
            if (args.enabled !== undefined) updates.enabled = args.enabled;
            await ctx.db.patch(existing._id, updates);
            return existing._id;
        } else {
            return await ctx.db.insert("integrations", {
                projectId: args.projectId,
                provider: args.provider,
                credentials: args.credentials ?? {},
                enabled: args.enabled ?? false,
            });
        }
    },
});

// Delete an integration
export const remove = mutation({
    args: { id: v.id("integrations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        const integration = await ctx.db.get(args.id);
        if (!integration) throw new Error("Integration not found");

        const project = await ctx.db.get(integration.projectId);
        if (!project || project.orgId !== (identity as unknown as { org_id: string }).org_id) {
            throw new ConvexError("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
// Internal: list integrations for a project (no auth required — for use in internal actions)
export const listForProject = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(100);
    },
});

export const saveChannelIntegration = action({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.any(),
        enabled: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const key = requireEnv("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);
        if (!key) throw new Error("Encryption key not configured");

        // Save raw first so the record exists
        await ctx.runMutation(internal.integrations.upsertInternal, {
            projectId: args.projectId,
            provider: args.provider,
            credentials: args.credentials,
            enabled: args.enabled,
        });

        // Encrypt the sensitive token per provider
        const encryptedCredentials: Record<string, unknown> = { ...args.credentials };

        if (args.provider === "telegram" && args.credentials.bot_token) {
            encryptedCredentials.bot_token = await encryptSecret(args.credentials.bot_token, key);
        }

        if ((args.provider === "messenger" || args.provider === "instagram") && args.credentials.access_token) {
            encryptedCredentials.access_token = await encryptSecret(args.credentials.access_token, key);
        }

        if ((args.provider === "messenger" || args.provider === "instagram") && args.credentials.app_secret) {
            encryptedCredentials.app_secret = await encryptSecret(args.credentials.app_secret, key);
        }

        if (args.provider === "whatsapp" && args.credentials.access_token) {
            encryptedCredentials.access_token = await encryptSecret(args.credentials.access_token, key);
        }

        if (args.provider === "whatsapp" && args.credentials.app_secret) {
            encryptedCredentials.app_secret = await encryptSecret(args.credentials.app_secret, key);
        }

        await ctx.runMutation(internal.integrations.patchCredentials, {
            projectId: args.projectId,
            provider: args.provider,
            credentials: encryptedCredentials,
        });

        return { success: true };
    },
});

export const patchCredentials = internalMutation({
    args: { projectId: v.id("projects"), provider: v.string(), credentials: v.any() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();
        if (existing) await ctx.db.patch(existing._id, { credentials: args.credentials });
    }
});

export const patchWebhookSecret = internalMutation({
    args: { projectId: v.id("projects"), provider: v.string(), webhookSecret: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();
        if (existing) {
            const creds = (existing.credentials as Record<string, unknown>) ?? {};
            await ctx.db.patch(existing._id, {
                credentials: { ...creds, webhook_secret: args.webhookSecret },
            });
        }
    }
});

export const registerTelegramWebhook = action({
    args: {
        botToken: v.string(),
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const key = requireEnv("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);
        if (!key) throw new Error("Encryption key not configured");

        // Generate a unique webhook secret for this integration
        const webhookSecret = crypto.randomUUID();

        const webhookUrl = `${process.env.CONVEX_SITE_URL}/webhooks/telegram`;

        const response = await fetch(`https://api.telegram.org/bot${args.botToken}/setWebhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: webhookUrl,
                secret_token: webhookSecret,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(result.description || "Failed to set Telegram webhook");
        }

        // Store the encrypted webhook secret alongside the bot_token
        const encryptedSecret = await encryptSecret(webhookSecret, key);
        await ctx.runMutation(internal.integrations.patchWebhookSecret, {
            projectId: args.projectId,
            provider: "telegram",
            webhookSecret: encryptedSecret,
        });

        return { success: true };
    },
});
export const getDecryptedWhatsAppCredentials = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const row = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), "whatsapp"))
            .first();

        if (!row) return null;

        const key = requireEnv("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);
        if (!key) throw new Error("Encryption key not configured");

        const credentials = row.credentials as { access_token: string; phone_number_id?: string; verify_token?: string };
        const decryptedToken = await decryptSecret(credentials.access_token, key);

        return {
            phoneNumberId: credentials.phone_number_id,
            accessToken: decryptedToken,
            verifyToken: credentials.verify_token,
            enabled: row.enabled ?? false,
        };
    },
});

export const getWhatsAppIntegrationByPhoneNumberId = internalQuery({
    args: { phoneNumberId: v.string() },
    handler: async (ctx, args) => {
        const integrations = await ctx.db
            .query("integrations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("provider"), "whatsapp"),
                    q.eq(q.field("enabled"), true)
                )
            )
            .take(500);

        return integrations.find(
            (i) => (i.credentials as { phone_number_id?: string })?.phone_number_id === args.phoneNumberId
        );
    },
});

export const getMessengerIntegrationByPageId = internalQuery({
    args: { pageId: v.string() },
    handler: async (ctx, args) => {
        const integrations = await ctx.db
            .query("integrations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("provider"), "messenger"),
                    q.eq(q.field("enabled"), true)
                )
            )
            .take(500);

        return integrations.find(
            (i) => (i.credentials as { page_id?: string })?.page_id === args.pageId
        );
    },
});

export const getInstagramIntegrationByPageId = internalQuery({
    args: { pageId: v.string() },
    handler: async (ctx, args) => {
        const integrations = await ctx.db
            .query("integrations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("provider"), "instagram"),
                    q.eq(q.field("enabled"), true)
                )
            )
            .take(500);

        return integrations.find(
            (i) => (i.credentials as { page_id?: string })?.page_id === args.pageId
        );
    },
});

export const getTelegramIntegrationByWebhookSecret = internalQuery({
    args: { webhookSecret: v.string() },
    handler: async (ctx, args) => {
        const integrations = await ctx.db
            .query("integrations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("provider"), "telegram"),
                    q.eq(q.field("enabled"), true)
                )
            )
            .take(500);

        return integrations.find(
            (i) => (i.credentials as { webhook_secret?: string })?.webhook_secret === args.webhookSecret
        );
    },
});

/**
 * Find a Telegram integration by matching the raw (unencrypted) webhook secret.
 * This is used by the HTTP webhook handler to look up the integration.
 */
export const findTelegramByWebhookSecret = internalQuery({
    args: { rawSecret: v.string() },
    handler: async (ctx) => {
        const integrations = await ctx.db
            .query("integrations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("provider"), "telegram"),
                    q.eq(q.field("enabled"), true)
                )
            )
            .take(500);

        // The webhook_secret is stored encrypted, but we store the raw encrypted value
        // so we can compare. However, since we can't decrypt in a query, we need
        // to return all enabled telegram integrations and let the caller decrypt+match.
        return integrations;
    },
});

/**
 * List all enabled Meta integrations (WhatsApp, Messenger, Instagram).
 * Used by the webhook GET handler to verify subscription tokens.
 */
export const listAllEnabledMetaIntegrations = internalQuery({
    args: {},
    handler: async (ctx) => {
        const [whatsapp, messenger, instagram] = await Promise.all([
            ctx.db.query("integrations").withIndex("by_projectId").filter((q) => q.eq(q.field("provider"), "whatsapp")).take(500),
            ctx.db.query("integrations").withIndex("by_projectId").filter((q) => q.eq(q.field("provider"), "messenger")).take(500),
            ctx.db.query("integrations").withIndex("by_projectId").filter((q) => q.eq(q.field("provider"), "instagram")).take(500),
        ]);

        const all = [...whatsapp, ...messenger, ...instagram];
        return all.filter((i) => i.enabled);
    },
});
