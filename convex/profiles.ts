import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (profile === null) {
            return null;
        }

        if (profile.orgId !== (identity as any).org_id) {
            throw new Error("Unauthorized");
        }

        return profile;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const orgId = (identity as any).org_id;
        if (!orgId) {
            throw new Error("No organization context");
        }

        return await ctx.db
            .query("profiles")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
            .take(100);
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
        if (!identity) return;

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

        console.log("identity.org_id:", (identity as any).org_id);

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
                orgId: (identity as any).org_id,
                updatedAt: Date.now(),
                isAvailable: false,
                lastSeenAt: Date.now(),
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
            const identityOrgId = (identity as any).org_id;
            if (identityOrgId && identityOrgId !== existing.orgId) {
                updates.orgId = identityOrgId;
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

// Update agent availability
export const setAvailability = mutation({
    args: {
        isAvailable: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isAvailable: args.isAvailable,
                orgId: (identity as any).org_id,
                updatedAt: Date.now(),
                lastSeenAt: Date.now(),
            });
        } else {
            await ctx.db.insert("profiles", {
                userId: identity.subject,
                isAvailable: args.isAvailable,
                orgId: (identity as any).org_id,
                updatedAt: Date.now(),
                lastSeenAt: Date.now(),
            });
        }

        if (args.isAvailable && (identity as any).org_id) {
            await ctx.scheduler.runAfter(0, internal.routing.retryRoutingForAgent, {
                orgId: (identity as any).org_id,
            });
        }
    },
});

// Update only the lastSeenAt timestamp for heartbeat
export const updateHeartbeat = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastSeenAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    },
});

// Internal: mark agent as offline (used by sendBeacon)
export const setOffline = internalMutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isAvailable: false,
                updatedAt: Date.now(),
            });
        }
    },
});

// Internal: mark stale agents as offline
export const cleanupStalePresence = internalMutation({
    args: {},
    handler: async (ctx) => {
        const threshold = Date.now() - 90000;
        // Known limitation: This is a global cron that runs across all orgs.
        // We use .take(500) to prevent runaway bandwidth.
        // Revisit this when per-org cron scheduling is available.
        const onlineProfiles = await ctx.db
            .query("profiles")
            .filter((q) => q.eq(q.field("isAvailable"), true))
            .take(500);

        for (const profile of onlineProfiles) {
            if (profile.lastSeenAt && profile.lastSeenAt < threshold) {
                await ctx.db.patch(profile._id, {
                    isAvailable: false,
                    updatedAt: Date.now(),
                });
            }
        }
    },
});
