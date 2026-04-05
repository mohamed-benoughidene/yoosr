import { internalQuery, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authError } from "./errors";

// Internal queries required by actions to fetch subscriptions

export const getSubscriptionsByOrg = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("push_subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const getSubscriptionByUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("push_subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// 1. Internal mutation: savePushSubscription

export const savePushSubscription = internalMutation({
  args: {
    userId: v.string(),
    orgId: v.string(),
    subscription: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        subscription: args.subscription,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.insert("push_subscriptions", {
        userId: args.userId,
        orgId: args.orgId,
        subscription: args.subscription,
        createdAt: Date.now(),
      });
    }
  },
});

// 2. Internal mutation: removePushSubscription

export const removePushSubscription = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const registerPushSubscription = mutation({
  args: { subscription: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw authError();
    await ctx.db
      .query("push_subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first()
      .then(async (existing) => {
        if (existing) {
          await ctx.db.patch(existing._id, {
            subscription: args.subscription,
            createdAt: Date.now(),
          });
        } else {
          const orgId = (identity as unknown as { org_id: string }).org_id;
          await ctx.db.insert("push_subscriptions", {
            userId: identity.subject,
            orgId: orgId ?? "",
            subscription: args.subscription,
            createdAt: Date.now(),
          });
        }
      });
  },
});
