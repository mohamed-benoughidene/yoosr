import { query, mutation, internalMutation, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { encryptSecret, decryptSecret } from "./lib/crypto";
import { requireAdmin } from "./utils";

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
        requireAdmin(identity as any);
        if (!identity) throw new Error("Not authenticated");

        // Check if we already have this provider for this project
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();

        if (existing) {
            const updates: Record<string, any> = {};
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
            const updates: Record<string, any> = {};
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
        const identity = await ctx.auth.getUserIdentity() as any;
        requireAdmin(identity);
        if (!identity) throw new Error("Not authenticated");

        const integration = await ctx.db.get(args.id);
        if (!integration) throw new Error("Integration not found");

        const project = await ctx.db.get(integration.projectId);
        if (!project || project.orgId !== identity.org_id) {
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

        const key = process.env.INTEGRATIONS_ENCRYPTION_KEY;
        if (!key) throw new Error("Encryption key not configured");

        // Save raw first so the record exists
        await ctx.runMutation(internal.integrations.upsertInternal, {
            projectId: args.projectId,
            provider: args.provider,
            credentials: args.credentials,
            enabled: args.enabled,
        });

        // Encrypt the sensitive token per provider
        let encryptedCredentials = { ...args.credentials };

        if (args.provider === "telegram" && args.credentials.bot_token) {
            encryptedCredentials.bot_token = await encryptSecret(args.credentials.bot_token, key);
        }

        if ((args.provider === "messenger" || args.provider === "instagram") && args.credentials.access_token) {
            encryptedCredentials.access_token = await encryptSecret(args.credentials.access_token, key);
        }

        if (args.provider === "whatsapp" && args.credentials.access_token) {
            encryptedCredentials.access_token = await encryptSecret(args.credentials.access_token, key);
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

export const registerTelegramWebhook = action({
    args: {
        botToken: v.string(),
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const webhookUrl = `${process.env.CONVEX_SITE_URL}/webhooks/telegram`;
        
        const response = await fetch(`https://api.telegram.org/bot${args.botToken}/setWebhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: webhookUrl,
                secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(result.description || "Failed to set Telegram webhook");
        }

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

        const key = process.env.INTEGRATIONS_ENCRYPTION_KEY;
        if (!key) throw new Error("Encryption key not configured");

        const credentials = row.credentials as any;
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
            (i) => (i.credentials as any)?.phone_number_id === args.phoneNumberId
        );
    },
});
