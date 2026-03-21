# Opus Planning Prompt — F-1: Messenger / Instagram Channel

> Paste this entire prompt to Opus. It will read the relevant files and produce an implementation spec.
> Save the output. Claude will then write the Flash/Pro implementation prompts from it.

---

## Prompt

You are planning the completion of the Messenger and Instagram channel integration for a Convex-based customer support SaaS platform called Yoosr.

## Context

Yoosr supports multiple inbound channels (widget, Telegram, WhatsApp, Messenger, Instagram). The platform uses:
- Convex for backend, real-time database, and HTTP endpoints
- Next.js App Router frontend
- Clerk Organizations for multi-tenancy
- Each channel integration stores credentials in the `integrations` table (`projectId`, `provider`, `credentials`, `enabled`)

## Current state

The following already exists:
- `integrations` table with credential storage
- `convex/integrations.ts` with `saveChannelIntegration` action (encrypts and saves credentials)
- `convex/http.ts` with a working Meta webhook handler:
  - `GET /webhooks/meta` — webhook verification (hub.challenge response)
  - `POST /webhooks/meta` — incoming webhook with HMAC-SHA256 validation
- `convex/conversations.ts` with `createOrUpdateFromMeta` internalMutation and `sendMetaMessage` internalAction
- The dashboard integrations settings page already has UI for connecting Messenger/Instagram

## What is missing

The incoming webhook handler at `POST /webhooks/meta` exists but does not correctly parse and route Messenger and Instagram message payloads into conversations. WhatsApp is handled but Messenger/Instagram message objects have a different payload structure.

## What to do

Read the following files in full before producing your plan:
- `convex/http.ts` — the full Meta webhook handler
- `convex/conversations.ts` — `createOrUpdateFromMeta` and `sendMetaMessage`
- `convex/integrations.ts` — how credentials are stored and looked up
- `convex/schema.ts` — conversations table, especially `channel`, `channelSenderId` fields
- `convex/messages.ts` — how messages are stored

Also read the Meta Webhook documentation behavior (from your training knowledge):
- Messenger webhook payload structure (messaging array, sender.id, recipient.id, message.text, message.attachments)
- Instagram webhook payload structure (same shape as Messenger but `object: "instagram"`)
- How to identify which page/IGID received the message (to look up the right project/integration)

## What to produce

Output a complete implementation spec in this format:

```
## F-1 — Messenger / Instagram Channel Spec

### Current handler behavior
[What the existing POST /webhooks/meta handler does today — which channels it handles, which it skips]

### Messenger payload structure
[The exact payload shape for an incoming Messenger text message and attachment message]

### Instagram payload structure
[The exact payload shape for an incoming Instagram text message — how it differs from Messenger]

### Lookup strategy
[How to identify which project owns the incoming message:
  - What field in the payload identifies the receiving page/account
  - How to query the integrations table to find the right project
  - What index or lookup function is needed]

### Conversation creation/update strategy
[How createOrUpdateFromMeta should be called — what fields map to what]

### Outbound reply strategy
[How sendMetaMessage should send replies back — Graph API endpoint, required fields, difference between Messenger and Instagram send API]

### New or modified functions
[List each function: name, type, file, what changes]

### Settings UI gaps
[Anything missing in the dashboard integrations page for Messenger/Instagram setup — App ID, Page token, IGID, webhook verification token fields]

### Implementation order
[Numbered sequence]
```

Do not write any code yet. Produce only the spec.
