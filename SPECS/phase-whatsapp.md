# WhatsApp Integration — Spec
## `SPECS/phase-whatsapp.md`

---

## Goal
Enable Yoosr projects to receive and send WhatsApp messages through Meta Cloud API using customer-owned credentials (Model B), routing them through the same bot engine and agent inbox as all other channels.

---

## Scope

**IN:**
- Add `"whatsapp"` to the channel enum in schema
- Credential storage (phoneNumberId, accessToken, verifyToken) encrypted — same pattern as Messenger/Instagram
- Extend `/webhooks/meta` HTTP endpoint to parse WhatsApp webhook payloads (different structure from Messenger)
- Extend `sendMetaMessage` action to send WhatsApp text messages via Cloud API
- Add WhatsApp credential form to Integrations settings page
- Bot engine sends outbound replies via WhatsApp when conversation.channel === "whatsapp"

**OUT:**
- WhatsApp template messages (HSM) — not required for session messages within 24h window
- Media messages (images, audio, documents) — text only in this phase
- WhatsApp Business API on-premise (Meta Cloud API only)
- Read receipts / delivery status webhooks
- Phone number provisioning UI — customer registers their number on Meta side

---

## Critical API Knowledge

### Webhook payload shape — WhatsApp (DIFFERENT from Messenger)

Messenger/Instagram use: `entry[].messaging[]`
WhatsApp uses: `entry[].changes[].value.messages[]`

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "<WABA_ID>",
    "changes": [{
      "field": "messages",
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550001234",
          "phone_number_id": "<PHONE_NUMBER_ID>"
        },
        "contacts": [{
          "profile": { "name": "Customer Name" },
          "wa_id": "15559998888"
        }],
        "messages": [{
          "from": "15559998888",
          "id": "wamid.XXXX",
          "timestamp": "1714000000",
          "text": { "body": "Hello, I need help" },
          "type": "text"
        }]
      }
    }]
  }]
}
```

**Detection logic:** `payload.object === "whatsapp_business_account"` — use this to branch inside `/webhooks/meta` before touching `entry[].messaging`.

**Webhook verification:** Confirmed: GET handler uses a single global `WEBHOOK_VERIFY_TOKEN` env var shared across all channels. No per-project verify token lookup needed. The `verifyToken` stored in the integrations credentials is for customer reference only (they paste it into the Meta dashboard).

### Send message API — WhatsApp (DIFFERENT endpoint and body)

**Endpoint:**
```
POST https://graph.facebook.com/v24.0/{phoneNumberId}/messages
Authorization: Bearer {accessToken}
Content-Type: application/json
```

> ⚠️ API version: use **v24.0**. Versions below v22.0 were expired by Meta on September 9, 2025. v23.0 expires June 9, 2026 — too close to use for a new integration. v24.0 was released October 8, 2025 and has a longer runway (~Feb 2027 based on Meta's cadence). Define the version as a named constant (e.g. `GRAPH_API_VERSION = "v24.0"`) so a future bump is a one-line change.

**Body:**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "<customer_phone_number_with_country_code>",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "Your reply text here"
  }
}
```

**Success response:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "15559998888", "wa_id": "15559998888" }],
  "messages": [{ "id": "wamid.XXXX" }]
}
```

**Error response shape (same as Graph API):**
```json
{
  "error": {
    "message": "...",
    "type": "OAuthException",
    "code": 190,
    "fbtrace_id": "..."
  }
}
```

### 24-hour session window
WhatsApp only allows free-form text replies within 24 hours of the customer's last message. Outside this window, a pre-approved template message is required. **This phase does NOT handle template messages.** The bot engine should send replies normally — if the window has expired, Meta will return an error. Log it but do not crash.

---

## Schema Changes

### 1. Channel enum — `schema.ts`
```ts
// Before
channel: v.optional(v.union(v.literal("widget"), v.literal("messenger"), v.literal("instagram"), v.literal("telegram")))

// After
channel: v.optional(v.union(v.literal("widget"), v.literal("messenger"), v.literal("instagram"), v.literal("telegram"), v.literal("whatsapp")))
```

### 2. WhatsApp credentials — `integrations` table

No changes to the projects table. WhatsApp credentials are stored as a row in the existing `integrations` table:

```
provider: "whatsapp"
credentials: {
  phone_number_id: string,   // plaintext
  access_token: string,      // stored encrypted via encryptSecret
  verify_token: string       // plaintext — customer reference only
}
enabled: boolean
```

This is the same pattern used by messenger, instagram, and telegram rows in the same table.

---

## Backend

### 1. Credential handling in `integrations.ts`

**Encryption branch in `saveChannelIntegration` action:**
Add a whatsapp branch alongside the existing messenger/instagram and telegram branches:
```ts
if (args.provider === "whatsapp" && args.credentials.access_token) {
  encryptedCredentials.access_token = await encryptSecret(args.credentials.access_token, key);
}
```

**`getDecryptedWhatsAppCredentials` internalQuery (new):**
- Args: `{ projectId: v.id("projects") }`
- Finds the integrations row where `provider === "whatsapp"` and `projectId` matches
- If not found: returns `null`
- Decrypts `credentials.access_token` using `decryptSecret` + `process.env.INTEGRATIONS_ENCRYPTION_KEY`
- Returns: `{ phoneNumberId: string, accessToken: string, verifyToken: string, enabled: boolean }`
- This is `internalQuery` only — never exposed to the frontend

### 2. Extend `/webhooks/meta` HTTP endpoint

**Signature validation (add if missing — confirmed missing in audit):**
At the top of the POST handler, before any payload parsing:
- Read raw body as text, then parse as JSON
- Read `X-Hub-Signature-256` header (format: `sha256=<hex>`)
- Compute HMAC-SHA256 of the raw body using `process.env.META_APP_SECRET` as key
- If header is missing or digest does not match: return HTTP 403
- If `META_APP_SECRET` env var is not set: log a warning and skip validation (allows local dev)

**WhatsApp branch (add at top of POST handler, before existing messenger/instagram logic):**

```
if body.object === "whatsapp_business_account":
  for each entry in body.entry:
    for each change in entry.changes where change.field === "messages":
      1. Extract phone_number_id from change.value.metadata.phone_number_id
      2. Look up integrations row where provider === "whatsapp", enabled === true,
         credentials.phone_number_id === phone_number_id
      3. If not found: continue (webhook must always return 200)
      4. If change.value.messages is absent or empty: continue silently
         (this is a status-update payload with statuses[] — not an error)
      5. For each message in change.value.messages[]:
         - Skip if message.type !== "text"
         - Resolve senderId: find entry in change.value.contacts[] where wa_id === message.from;
           use that wa_id as senderId. Fall back to message.from if contacts[] absent.
           Note: phone numbers arrive WITHOUT a leading + (e.g. "213555001234") — store as-is.
         - Resolve senderName: contacts[].profile.name for matching contact, fall back to senderId
         - Call ctx.runMutation(internal.conversations.createOrUpdateFromMeta, {
             projectId: integration.projectId,
             channel: "whatsapp",
             channelSenderId: senderId,
             senderName: senderName,
             content: message.text.body,
             channelMessageId: message.id,   // idempotency key — createOrUpdateFromMeta deduplicates on this
           })
  return new Response("OK", { status: 200 })
else:
  continue to existing messenger/instagram handler
```

> **Async note:** If `createOrUpdateFromMeta` ever triggers the bot engine synchronously (adding latency), switch to `ctx.scheduler.runAfter(0, ...)` so the handler returns 200 within milliseconds. Meta deactivates slow webhooks.

### 3. Extend `sendMetaMessage` action

Add a third branch for `channel === "whatsapp"` alongside the existing messenger and instagram branches.

Define at module level (outside the action):
```ts
const GRAPH_API_VERSION = "v24.0";
```

WhatsApp branch logic:
```
1. Call ctx.runQuery(internal.integrations.getDecryptedWhatsAppCredentials, { projectId: conversation.projectId })
2. If result is null or result.enabled is false: log and return undefined
3. POST to https://graph.facebook.com/${GRAPH_API_VERSION}/${result.phoneNumberId}/messages
   Headers: Authorization: Bearer ${result.accessToken}, Content-Type: application/json
   Body:
     {
       messaging_product: "whatsapp",
       recipient_type: "individual",
       to: conversation.channelSenderId,
       type: "text",
       text: { preview_url: false, body: content }
     }
4. If response not ok:
   - Parse error JSON
   - Log error.code + error.message
   - Known codes: 131047 (session expired), 130429 (rate limit), 131048 (spam limit),
     131056 (per-recipient limit), 190 (token expired/invalid)
   - Return undefined — do NOT throw
5. On success: return response.messages[0].id
```

The existing messenger and instagram branches must not be touched.

---

## Frontend

### Integrations Settings Page — WhatsApp Section

Pattern: follow the existing Messenger and Instagram credential form sections on the same page.

**Fields:**
| Field | Input type | Note |
|---|---|---|
| Phone Number ID | text | From Meta developer dashboard |
| Access Token | password | Never shown after save — placeholder "Token saved — enter a new value to replace it" if already set |
| Verify Token | text + Generate button | `crypto.randomUUID()` client-side, no fetch |
| Enable WhatsApp | Switch | Maps to `enabled` on the integrations row |

**Behavior:**
- On mount: load existing state via `integrations.list` query filtered to `provider === "whatsapp"`. Prefill phoneNumberId and verifyToken. Access token: placeholder only, never prefill.
- Save: call `saveChannelIntegration` action with `provider: "whatsapp"`, `credentials: { phone_number_id, access_token, verify_token }`, `enabled`
- On save success: toast "WhatsApp connected"
- On save error: toast with error message
- Static collapsed "How to set this up" section with link: "Meta Cloud API setup guide" → `https://developers.facebook.com/docs/whatsapp/cloud-api/get-started` (no fetch)

---

## Acceptance Criteria

1. Schema compiles with `"whatsapp"` added to the channel union — `npx convex dev` shows no type errors
2. Saving WhatsApp credentials via the settings UI writes an integrations row with `provider: "whatsapp"`, encrypted `access_token`, and `enabled: true`
3. `getDecryptedWhatsAppCredentials` internalQuery is never exposed to the frontend — it is `internalQuery` only
4. `POST /webhooks/meta` with a WhatsApp text message payload (`object: "whatsapp_business_account"`) is parsed correctly and calls `createOrUpdateFromMeta` with `channel: "whatsapp"`
5. `POST /webhooks/meta` with a WhatsApp status-update payload (contains `statuses[]` but no `messages[]`) does NOT crash — returns 200 silently
6. Sending the same WhatsApp webhook payload twice produces only one conversation/message record — idempotent on `channelMessageId`
7. `POST /webhooks/meta` with a Messenger payload still works unchanged — WhatsApp branch does not affect it
8. GET `/webhooks/meta` webhook verification still works — verify token challenge is returned correctly
9. `sendMetaMessage` action with `channel: "whatsapp"` calls `https://graph.facebook.com/v24.0/{phoneNumberId}/messages` (via `GRAPH_API_VERSION` constant) with correct body shape
10. A Graph API error from WhatsApp send does not throw — logs `error.code` + `error.message` and returns gracefully
11. WhatsApp section in Integrations settings renders with all four fields, matches visual style of Messenger/Instagram sections, access token never shown in plaintext after saving
12. `npx convex deploy` succeeds with all schema and function changes

---

## Dependencies

- Existing `/webhooks/meta` HTTP endpoint — confirmed ✅
- Existing `sendMetaMessage` action — confirmed ✅
- `saveChannelIntegration` action in `integrations.ts` handles encryption — confirmed ✅
- `createOrUpdateFromMeta` internal mutation accepts `channel`, `channelSenderId`, `channelMessageId` — confirmed ✅
- `getDecryptedWhatsAppCredentials` internalQuery must be added in Task 2 before Task 4 can run

---

## Tasks (sequential — do not start next until previous is verified)

### Task 1 — Schema
Add `"whatsapp"` to the channel enum in schema.ts. No projects table changes needed.
Reference: Schema Changes section, item 1.

### Task 2 — Credential handling
Add whatsapp encryption branch to `saveChannelIntegration`. Add `getDecryptedWhatsAppCredentials` internalQuery.
Reference: Backend section, item 1.

### Task 3 — Webhook parsing
Add X-Hub-Signature-256 validation. Add WhatsApp branch to POST handler calling `createOrUpdateFromMeta`.
Reference: Backend section, item 2 and Critical API Knowledge — Webhook payload shape.

### Task 4 — Send action
Add WhatsApp branch to `sendMetaMessage` action with `GRAPH_API_VERSION` constant.
Reference: Backend section, item 3 and Critical API Knowledge — Send message API.

### Task 5 — Settings UI
Add WhatsApp credential form to Integrations settings page.
Reference: Frontend section.

### Task 6 — Smoke test checklist (manual, no code)
Run through Acceptance Criteria 1–12.

Items 4–9 require live webhook traffic. Use [webhook.site](https://webhook.site) as a request catcher:
- Inbound (AC 4, 5, 6): POST a real-shaped WhatsApp payload to `/webhooks/meta` and verify Convex records
- Outbound (AC 9): temporarily point `sendMetaMessage` at webhook.site to capture full request shape before pointing at real Meta
