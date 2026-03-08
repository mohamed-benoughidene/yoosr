# Messenger Integration Audit for Telegram Implementation

This report covers the end-to-end details of how Facebook Messenger was integrated into Yoosr. This should serve as the blueprint and pattern for implementing the Telegram integration.

## 1. Schema Changes

Modifications were made to `convex/schema.ts` to support external channels:

*   **`conversations` table**:
    *   `channel: v.optional(v.union(v.literal("widget"), v.literal("messenger"), v.literal("instagram")))`
    *   `channelSenderId: v.optional(v.string())`
*   **`messages` table**:
    *   `channel: v.optional(v.string())`
    *   `channelMessageId: v.optional(v.string())`
*   **`integrations` table** (already existed but handles credentials):
    *   `provider: v.string()` (e.g. `"messenger"`)
    *   `credentials: v.optional(v.any())` (stores encrypted tokens, in this case `page_id` and `access_token`)
    *   `enabled: v.optional(v.boolean())`

## 2. HTTP Webhook Handler

The webhook logic lives in **`convex/http.ts`**.

*   **Route Path**: `/webhooks/meta`
*   **Verification (GET)**: Checks if `hub.mode === "subscribe"` and `hub.verify_token === process.env.WEBHOOK_VERIFY_TOKEN`. If matched, returns the `hub.challenge` string.
*   **Payload Parsing (POST)**:
    *   Loops through `body.entry` and `entry.messaging`.
    *   Extracts `pageId` from `entry.id`.
    *   Extracts `senderId` from `messaging.sender.id`.
    *   Extracts `messageText` from `messaging.message.text`.
    *   Extracts `messageId` from `messaging.message.mid`.
    *   Ignores echoes (`messaging.message.is_echo === true`).
    *   Determines channel: `body.object === "instagram" ? "instagram" : "messenger"`.
*   **Conversation/Message Creation**: Calls `ctx.runMutation(internal.conversations.createOrUpdateFromMeta)` to process the actual message into the database. Let's look at how that mutation works below.

## 3. Convex Functions

Specific functions were added to **`convex/conversations.ts`** to support Messenger:

*   **`createOrUpdateFromMeta`** (internalMutation):
    *   **Deduplication**: Checks if `channelMessageId` already exists in `messages`.
    *   **Integration Check**: Looks up the `integrations` table for the matching `pageId` and `enabled === true`.
    *   **Conversation**: Finds the open conversation using `channelSenderId === args.senderId && status !== 1000`. If none, creates a new one with `status: 100` (unassigned).
    *   **Message**: Inserts the new message into the `messages` table with `senderType: "visitor"`.
    *   **Routing/Bot Trigger**:
        *   If new conversation: fires `internal.routing.routeConversation`.
        *   If existing and assigned to bot: fires `internal.bot.executeNextBlock`.
*   **`sendMetaMessage`** (internalAction):
    *   Fetches the conversation, validates `channel` is `"messenger"` or `"instagram"`, and checks for `channelSenderId`.
    *   Retrieves `access_token` from the `integrations` table for the project.
    *   Performs a `POST` request to `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}` sending the `content` to the `recipient.id` (`channelSenderId`).
*   **`relayToMeta`** (mutation):
    *   A public wrapper that verifies authentication (`ctx.auth.getUserIdentity()`) and schedules the internal action `sendMetaMessage` via `ctx.scheduler.runAfter`.
    *   Called directly from the client (e.g., `src/components/dashboard/monitor/chat-display.tsx` on line 107) after normal `api.messages.sendMessage` is successful.

## 4. Integrations Settings UI

The UI for configuring Messenger lives in **`src/app/dashboard/settings/integrations/page.tsx`**.

*   **Messenger Card Configuration**:
    *   Defined in the `INTEGRATIONS` constant array.
    *   `id`: `"messenger"`.
    *   `category`: `"channel"`.
    *   `icon`: `💬` (color: `bg-indigo-100 text-indigo-700`).
    *   `fields`: `page_id` (text) and `access_token` (password).
    *   `instructions`: "Create an app at developers.facebook.com."
*   **Save/Status Logic**:
    *   When the user submits, it saves to Convex using `useMutation(api.integrations.upsert)`.
    *   The `enabled` toggle switch maps to the `enabled` field.
    *   Status is displayed as a green badge: **"Connected"** if `enabled` is true.

## 5. Channel Display in UI

The channel type is visually indicated throughout the monitor and chat displays. 
Found in both **`src/components/chat/ConversationList.tsx`** and **`src/components/dashboard/monitor/conversation-list.tsx`**.

*   **Badges/Icons**:
    *   For `channel === "messenger"`, the UI displays a specialized icon.
    *   Uses a `Tooltip` component revealing "Messenger".
    *   The trigger contains an icon: `<MessageCircle className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500/10" />`.
    *   Also has an inline channel indicator using `getChannelIcon(item.channel)` which dynamically provides an icon depending on the string.

## 6. Conversation Model Details

When a new Meta conversation is initialized during the webhook flow (`createOrUpdateFromMeta`), the following specific fields are populated:

*   `visitorId`: Bound to `args.senderId` (the Messenger user's ID).
*   `visitorName`: Hardcoded to `"Messenger User"` (or `"Instagram User"`).
*   `channel`: `"messenger"` (or `"instagram"`).
*   `channelSenderId`: `args.senderId`.
*   `status`: `100` (unassigned).
*   `unreadCount`: `0` initially, then incremented during the patch step immediately after message insertion.
*   `projectId`: Inherited from the matched integration.

## 7. Helpers or Utilities

There are no broad utility helpers added explicitly for Messenger inside `utils.ts` — most of the specific webhook logic is siloed tightly within `conversations.ts` and `http.ts`. 

However:
*   **Tokens**: The environment variable `WEBHOOK_VERIFY_TOKEN` is used securely via `process.env`. Telegram will likely need its own environment variable for the webhook secret token or to validate request origins.
*   **Typings**: `channel` relies heavily on `v.union` definitions in `schema.ts`. Adding Telegram will require extending these literal arrays (e.g., adding `v.literal("telegram")`).
