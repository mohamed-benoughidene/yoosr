import { query, mutation, action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { encryptSecret, decryptSecret } from "./lib/crypto";
import { requireEnv } from "./lib/env";

// ─── OpenRouter API Key Management (Dedicated Module) ───────────────────────

export const saveOpenRouterKey = mutation({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const orgId = (identity as unknown as { org_id: string }).org_id as string | undefined;
        if (!orgId) throw new ConvexError("No organization selected");

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
            .first();
        if (!project) throw new ConvexError("Project not found");

        const encryptionKey = requireEnv("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);
        if (!encryptionKey) throw new ConvexError("Encryption key not configured");

        const encryptedKey = await encryptSecret(args.key, encryptionKey);
        await ctx.db.patch(project._id, { openRouterApiKey: encryptedKey });
    },
});

export const clearOpenRouterKey = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const orgId = (identity as unknown as { org_id: string }).org_id as string | undefined;
        if (!orgId) throw new ConvexError("No organization selected");

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
            .first();
        if (!project) throw new ConvexError("Project not found");

        await ctx.db.patch(project._id, { openRouterApiKey: undefined, defaultModel: undefined });
    },
});

export const getOpenRouterKeyStatus = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { hasKey: false };

        const orgId = (identity as unknown as { org_id: string }).org_id as string | undefined;
        if (!orgId) return { hasKey: false };

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
            .first();
        if (!project || !project.openRouterApiKey) return { hasKey: false };

        const encryptionKey = requireEnv("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);
        if (!encryptionKey) return { hasKey: false };

        const decrypted = await decryptSecret(project.openRouterApiKey, encryptionKey);
        const last4 = decrypted.slice(-4);
        return { hasKey: true, maskedKey: `sk-or-\u2022\u2022\u2022\u2022${last4}` };
    },
});

export const testOpenRouterKey = action({
    args: {},
    handler: async (ctx): Promise<{ ok: boolean; model?: string; message?: string; error?: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const orgId = (identity as unknown as { org_id: string }).org_id as string | undefined;
        if (!orgId) throw new ConvexError("No organization selected");

        const project = await ctx.runQuery(
            internal.openrouter_api.getProjectByOrgIdInternal,
            { orgId }
        );

        if (!project || !project.openRouterApiKey) {
            return { ok: false, error: "No API key saved" };
        }

        const encryptionKey = requireEnv("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);
        if (!encryptionKey) {
            return { ok: false, error: "Encryption key not configured" };
        }

        const decryptedKey = await decryptSecret(project.openRouterApiKey, encryptionKey);

        const model: string = project.defaultModel || "openrouter/free";

        try {
            const response: Response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${decryptedKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: "Reply with one short sentence confirming you are working." }],
                    max_tokens: 50,
                }),
            });

            if (!response.ok) {
                return { ok: false, error: `${response.status}: ${response.statusText}` };
            }

            const data: { choices?: { message?: { content?: string } }[] } = await response.json();
            const content: string | undefined = data.choices?.[0]?.message?.content;

            return { ok: true, model: model, message: content };
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            return { ok: false, error: errorMessage };
        }
    },
});

// Internal helper
export const getProjectByOrgIdInternal = internalQuery({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();
    },
});
