import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get the current user's profile
export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();
    },
});

// Get a profile by userId
export const getByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("profiles").collect();
    },
});

// Update your own profile
export const updateMe = mutation({
    args: {
        fullName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        username: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();

        if (existing) {
            const updates: Record<string, any> = { updatedAt: Date.now() };
            for (const [k, val] of Object.entries(args)) {
                if (val !== undefined) updates[k] = val;
            }
            await ctx.db.patch(existing._id, updates);
        } else {
            await ctx.db.insert("profiles", {
                userId: identity.subject,
                fullName: args.fullName ?? identity.name,
                email: identity.email,
                avatarUrl: args.avatarUrl ?? identity.pictureUrl,
                username: args.username,
                updatedAt: Date.now(),
            });
        }
    },
});

// Internal mutation used by webhooks to sync Clerk user data
export const upsertFromClerk = internalMutation({
    args: {
        userId: v.string(),
        fullName: v.optional(v.string()),
        email: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                fullName: args.fullName,
                email: args.email,
                avatarUrl: args.avatarUrl,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("profiles", {
                userId: args.userId,
                fullName: args.fullName,
                email: args.email,
                avatarUrl: args.avatarUrl,
                updatedAt: Date.now(),
            });
        }
    },
});

// Ensure current user has a profile (called on dashboard load)
// Also syncs email/name from Clerk in case they changed
export const ensureCurrent = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();

        if (!existing) {
            await ctx.db.insert("profiles", {
                userId: identity.subject,
                fullName: identity.name || "Agent",
                email: identity.email,
                avatarUrl: identity.pictureUrl,
                updatedAt: Date.now(),
            });
        } else {
            // Sync profile with latest Clerk data
            const updates: Record<string, unknown> = { updatedAt: Date.now() };
            if (identity.email && identity.email !== existing.email) {
                updates.email = identity.email;
            }
            if (identity.name && identity.name !== existing.fullName) {
                updates.fullName = identity.name;
            }
            if (identity.pictureUrl && identity.pictureUrl !== existing.avatarUrl) {
                updates.avatarUrl = identity.pictureUrl;
            }
            if (Object.keys(updates).length > 1) {
                await ctx.db.patch(existing._id, updates);
            }
        }

        return null;
    },
});

// Internal: seed a profile manually
export const seedProfile = internalMutation({
    args: {
        userId: v.string(),
        fullName: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (!existing) {
            await ctx.db.insert("profiles", {
                userId: args.userId,
                fullName: args.fullName,
                email: args.email,
                updatedAt: Date.now(),
            });
        }
    },
});
