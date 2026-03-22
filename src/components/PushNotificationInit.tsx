"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function PushNotificationInit() {
  const registerPushSubscription = useMutation(api.pushMutations.registerPushSubscription);

  useEffect(() => {
    async function initPush() {
      try {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          return;
        }

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
        }

        const subscriptionStr = JSON.stringify(subscription);
        await registerPushSubscription({ subscription: subscriptionStr });
      } catch (error) {
        // Silently ignore all initialization errors
        console.error("Failed to initialize push notifications", error);
      }
    }

    initPush();
  }, [registerPushSubscription]);

  return null;
}
