# Browser Push Notifications — Spec

## Goal
Deliver real-time browser push notifications to agents when a new conversation
arrives or a conversation is assigned to them, even when the Yoosr tab is closed.

## Scope

IN:
- Permission prompt + subscription registration on dashboard load
- Store push subscriptions per agent in Convex
- Push on new incoming conversation (unassigned)
- Push on conversation assigned to a specific agent
- Unsubscribe / cleanup on permission revoke

OUT:
- Mobile push (deferred)
- Email notifications (deferred)
- Push for other events (new message, resolved, etc.) — deferred
- Per-agent notification preferences UI — deferred

## Schema Changes

New table: push_subscriptions
- userId: v.string() (Clerk user ID)
- orgId: v.string()
- subscription: v.string() (JSON-serialized PushSubscription object)
- createdAt: v.number()
- index: by_userId on [userId]
- index: by_orgId on [orgId]

## Backend

Mutations:
- savePushSubscription(userId, orgId, subscription) — upsert by userId
- removePushSubscription(userId) — delete by userId

Actions:
- sendPushToOrg(orgId, payload) — query all subscriptions for org, send Web Push to each
- sendPushToAgent(userId, payload) — query subscription for userId, send Web Push

Internal triggers (add calls inside existing mutations):
- conversations.createFromWidget → call sendPushToOrg after conversation created
- conversations.update (when assignedTo changes) → call sendPushToAgent for the assigned agent

VAPID keys stored as Convex environment variables:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT (mailto:support@yoosr.app)

## Frontend

- Service worker file at public/sw.js — handles push event, shows notification
- On dashboard layout mount: check Notification.permission, request if not granted,
  register service worker, call savePushSubscription with the resulting subscription
- No dedicated settings UI in this phase — permission handled by browser native prompt

## Acceptance Criteria

1. Agent loads dashboard → browser shows native "Allow notifications?" prompt
2. Agent allows → subscription saved in Convex push_subscriptions table
3. Widget visitor starts a new conversation → agent receives a browser push
   notification with visitor name and initial message, even with tab closed
4. Admin assigns a conversation to an agent → that agent receives a push notification
5. Agent revokes browser permission → no errors thrown, push silently fails gracefully
6. Two agents in same org both receive push on new unassigned conversation

## Dependencies

- VAPID keys must be generated and added to Convex environment variables before
  any backend action will work
- web-push npm package must be installed (free, no provider needed)
- existing conversations.createFromWidget and conversations.update mutations
  must be identified in audit before wiring triggers

## Tasks
Sequential — each maps to a spec section above.
To be written after Mohamed approves this spec.