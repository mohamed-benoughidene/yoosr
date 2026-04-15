import { query, mutation, internalMutation, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { encryptSecret, decryptSecret } from "./lib/crypto";
import { requireAdmin } from "./utils";
import { requireEnv } from "./lib/env";
import { authError, notFoundError, forbiddenError, userError } from "./errors";
import { softDelete } from "./lib/softDelete";

// List integrations for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .take(100);
    },
});

// Create or update an integration
export const upsert = mutation({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.optional(v.record(v.string(), v.string())),
        enabled: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        // Check if we already have this provider for this project
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();

        // Extract denormalized fields from credentials for indexing
        const creds = args.credentials || {};
        const phoneNumberId = creds["phone_number_id"];
        const pageId = creds["page_id"];
        const webhookSecret = creds["webhook_secret"];

        if (existing) {
            const updates: Record<string, unknown> = {};
            if (args.credentials !== undefined) updates.credentials = args.credentials;
            if (args.enabled !== undefined) updates.enabled = args.enabled;
            if (phoneNumberId !== undefined) updates.phoneNumberId = phoneNumberId;
            if (pageId !== undefined) updates.pageId = pageId;
            if (webhookSecret !== undefined) updates.webhookSecret = webhookSecret;
            await ctx.db.patch(existing._id, updates);
            return existing._id;
        } else {
            return await ctx.db.insert("integrations", {
                projectId: args.projectId,
                provider: args.provider,
                credentials: args.credentials ?? {},
                enabled: args.enabled ?? false,
                phoneNumberId,
                pageId,
                webhookSecret,
            });
        }
    },
});

export const upsertInternal = internalMutation({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.optional(v.record(v.string(), v.string())),
        enabled: v.optional(v.boolean()),
        phoneNumberId: v.optional(v.string()),
        pageId: v.optional(v.string()),
        webhookSecret: v.optional(v.string()),
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
            if (args.phoneNumberId !== undefined) updates.phoneNumberId = args.phoneNumberId;
            if (args.pageId !== undefined) updates.pageId = args.pageId;
            if (args.webhookSecret !== undefined) updates.webhookSecret = args.webhookSecret;
            await ctx.db.patch(existing._id, updates);
            return existing._id;
        } else {
            return await ctx.db.insert("integrations", {
                projectId: args.projectId,
                provider: args.provider,
                credentials: args.credentials ?? {},
                enabled: args.enabled ?? false,
                phoneNumberId: args.phoneNumberId,
                pageId: args.pageId,
                webhookSecret: args.webhookSecret,
            });
        }
    },
});

// Delete an integration
export const remove = mutation({
    args: { id: v.id("integrations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        requireAdmin(identity as unknown as { org_role?: string; org_id: string });

        const integration = await ctx.db.get(args.id);
        if (!integration) throw notFoundError("Integration");

        const project = await ctx.db.get(integration.projectId);
        if (!project || project.orgId !== (identity as unknown as { org_id: string }).org_id) {
            throw forbiddenError();
        }

        await softDelete(ctx, "integrations", args.id);
    },
});
// Internal: list integrations for a project (no auth required — for use in internal actions)
export const listForProject = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .take(100);
    },
});

export const saveChannelIntegration = action({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.record(v.string(), v.string()),
        enabled: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        const key = requireEnv("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);
        if (!key) throw new Error("Encryption key not configured");

        // Extract denormalized fields before encrypting
        const phoneNumberId = args.credentials["phone_number_id"];
        const pageId = args.credentials["page_id"];
        const webhookSecret = args.credentials["webhook_secret"];

        // Save raw first so the record exists
        await ctx.runMutation(internal.integrations.upsertInternal, {
            projectId: args.projectId,
            provider: args.provider,
            credentials: args.credentials,
            enabled: args.enabled,
            phoneNumberId,
            pageId,
            webhookSecret,
        });

        // Encrypt the sensitive token per provider
        const encryptedCredentials: Record<string, string> = { ...args.credentials };

        if (args.provider === "telegram" && args.credentials["bot_token"]) {
            encryptedCredentials["bot_token"] = await encryptSecret(args.credentials["bot_token"], key);
        }

        if ((args.provider === "messenger" || args.provider === "instagram") && args.credentials["access_token"]) {
            encryptedCredentials["access_token"] = await encryptSecret(args.credentials["access_token"], key);
        }

        if ((args.provider === "messenger" || args.provider === "instagram") && args.credentials["app_secret"]) {
            encryptedCredentials["app_secret"] = await encryptSecret(args.credentials["app_secret"], key);
        }

        if (args.provider === "whatsapp" && args.credentials["access_token"]) {
            encryptedCredentials["access_token"] = await encryptSecret(args.credentials["access_token"], key);
        }

        if (args.provider === "whatsapp" && args.credentials["app_secret"]) {
            encryptedCredentials["app_secret"] = await encryptSecret(args.credentials["app_secret"], key);
        }

        await ctx.runMutation(internal.integrations.patchCredentials, {
            projectId: args.projectId,
            provider: args.provider,
            credentials: encryptedCredentials,
            phoneNumberId: args.provider === "whatsapp" ? phoneNumberId : undefined,
            pageId: (args.provider === "messenger" || args.provider === "instagram") ? pageId : undefined,
        });

        return { success: true };
    },
});

export const patchCredentials = internalMutation({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.record(v.string(), v.string()),
        phoneNumberId: v.optional(v.string()),
        pageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();
        if (existing) {
            const updates: Record<string, unknown> = { credentials: args.credentials };
            if (args.phoneNumberId !== undefined) updates.phoneNumberId = args.phoneNumberId;
            if (args.pageId !== undefined) updates.pageId = args.pageId;
            await ctx.db.patch(existing._id, updates);
        }
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
                webhookSecret: args.webhookSecret, // Denormalized for indexing
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
        if (!identity) throw authError();

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
            throw userError(result.description || "Failed to set Telegram webhook");
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

        const credentials = row.credentials as Record<string, string> | undefined;
        const decryptedToken = credentials ? await decryptSecret(credentials["access_token"], key) : "";

        return {
            phoneNumberId: credentials?.["phone_number_id"],
            accessToken: decryptedToken,
            verifyToken: credentials?.["verify_token"],
            enabled: row.enabled ?? false,
        };
    },
});

export const getWhatsAppIntegrationByPhoneNumberId = internalQuery({
    args: { phoneNumberId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_provider_phoneNumberId", (q) =>
                q.eq("provider", "whatsapp").eq("phoneNumberId", args.phoneNumberId)
            )
            .first();
    },
});

export const getMessengerIntegrationByPageId = internalQuery({
    args: { pageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_provider_pageId", (q) =>
                q.eq("provider", "messenger").eq("pageId", args.pageId)
            )
            .first();
    },
});

export const getInstagramIntegrationByPageId = internalQuery({
    args: { pageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_provider_pageId", (q) =>
                q.eq("provider", "instagram").eq("pageId", args.pageId)
            )
            .first();
    },
});

export const getTelegramIntegrationByWebhookSecret = internalQuery({
    args: { webhookSecret: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_provider_webhookSecret", (q) =>
                q.eq("provider", "telegram").eq("webhookSecret", args.webhookSecret)
            )
            .first();
    },
});

/**
 * Find a Telegram integration by matching the raw (unencrypted) webhook secret.
 * Uses the denormalized webhookSecret index for O(log n) lookup.
 */
export const findTelegramByWebhookSecret = internalQuery({
    args: { rawSecret: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_provider_webhookSecret", (q) =>
                q.eq("provider", "telegram").eq("webhookSecret", args.rawSecret)
            )
            .first();
    },
});

/**
 * List all enabled Meta integrations (WhatsApp, Messenger, Instagram).
 * Uses the by_provider_enabled index for O(log n) lookup.
 */
export const listAllEnabledMetaIntegrations = internalQuery({
    args: {},
    handler: async (ctx) => {
        const [whatsapp, messenger, instagram] = await Promise.all([
            ctx.db.query("integrations").withIndex("by_provider_enabled", (q) => q.eq("provider", "whatsapp").eq("enabled", true)).take(500),
            ctx.db.query("integrations").withIndex("by_provider_enabled", (q) => q.eq("provider", "messenger").eq("enabled", true)).take(500),
            ctx.db.query("integrations").withIndex("by_provider_enabled", (q) => q.eq("provider", "instagram").eq("enabled", true)).take(500),
        ]);

        return [...whatsapp, ...messenger, ...instagram];
    },
});
