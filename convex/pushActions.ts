"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import webpush from "web-push";

// 3. Internal action: sendPushToOrg

export const sendPushToOrg = internalAction({
  args: {
    orgId: v.string(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.runQuery(internal.pushMutations.getSubscriptionsByOrg, {
      orgId: args.orgId,
    });

    if (!subscriptions || subscriptions.length === 0) return;

    try {
      webpush.setVapidDetails(
        "mailto:support@yoosr.app",
        process.env.VAPID_PUBLIC_KEY as string,
        process.env.VAPID_PRIVATE_KEY as string
      );
    } catch (e) {
      // Missing environment variables or malformed VAPID keys
      return;
    }

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
    });

    await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        try {
          const parsedSubscription = JSON.parse(sub.subscription);

          const allowedEndpoints = [
            "https://fcm.googleapis.com",
            "https://updates.push.services.mozilla.com",
            "https://notify.windows.com",
            "https://push.apple.com",
          ];
          const endpoint = parsedSubscription?.endpoint ?? "";
          const isTrusted = allowedEndpoints.some((origin) => endpoint.startsWith(origin));
          if (!isTrusted) return;

          await webpush.sendNotification(parsedSubscription, payload);
        } catch (error: any) {
          if (error?.statusCode === 410 || error?.statusCode === 404) {
            await ctx.runMutation(internal.pushMutations.removePushSubscription, {
              userId: sub.userId,
            });
          }
          // Silently ignore all other errors
        }
      })
    );
  },
});

// 4. Internal action: sendPushToAgent

export const sendPushToAgent = internalAction({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.runQuery(internal.pushMutations.getSubscriptionByUser, {
      userId: args.userId,
    });

    if (!sub) return;

    try {
      const webpush = (await import("web-push")).default;
      webpush.setVapidDetails(
        "mailto:support@yoosr.app",
        process.env.VAPID_PUBLIC_KEY as string,
        process.env.VAPID_PRIVATE_KEY as string
      );
    } catch (e) {
      // Missing environment variables or malformed VAPID keys
      return; // return silently on configuration error
    }

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
    });

    try {
      const parsedSubscription = JSON.parse(sub.subscription);

      const allowedEndpoints = [
        "https://fcm.googleapis.com",
        "https://updates.push.services.mozilla.com",
        "https://notify.windows.com",
        "https://push.apple.com",
      ];
      const endpoint = parsedSubscription?.endpoint ?? "";
      const isTrusted = allowedEndpoints.some((origin) => endpoint.startsWith(origin));
      if (!isTrusted) return;

      await webpush.sendNotification(parsedSubscription, payload);
    } catch (error: any) {
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        await ctx.runMutation(internal.pushMutations.removePushSubscription, {
          userId: args.userId,
        });
      }
      // Silently ignore all other errors
    }
  },
});
