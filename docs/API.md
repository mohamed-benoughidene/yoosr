# API Reference

> Public API endpoints, webhook integrations, and outbound RestHooks for the Yoosr platform.

**Last reviewed:** 2026-04-10

---

## Quick Start

| What you need | Where to find it |
|---------------|------------------|
| **Base URL (Next.js)** | `https://app.yoosr.com` (or your domain) |
| **Base URL (Convex HTTP)** | `https://<project>.convex.site` — from `NEXT_PUBLIC_CONVEX_SITE_URL` |
| **Widget endpoints** | Convex base URL + `/widget/*` |
| **Webhook endpoints** | Convex base URL + `/webhooks/*` |
| **Outbound webhooks** | Managed via Dashboard → Settings → Webhooks |

---

## Widget API

The widget API enables embedded chat widgets to communicate with Yoosr. All endpoints are **public** (no auth) with CORS support and rate limiting.

### Endpoints at a Glance

| Method | Path | Purpose | Rate Limit |
|--------|------|---------|------------|
| `POST` | `/widget/conversations` | Create conversation | 5 req/min |
| `GET` | `/widget/conversations` | Find by visitor | — |
| `GET` | `/widget/conversations/get` | Get conversation | — |
| `POST` | `/widget/conversations/rate` | Submit CSAT rating | — |
| `POST` | `/widget/messages` | Send message | 20 req/min (burst 5) |
| `GET` | `/widget/messages` | Get messages | — |
| `GET` | `/widget/project` | Get project config | — |
| `POST` | `/widget/upload-url` | Generate upload URL | — |

---

### Create Conversation

```
POST /widget/conversations
```

Creates a new conversation from the embedded widget. Optionally sends an initial message.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | **Yes** | Project ID from widget config |
| `visitorName` | string | No | Visitor display name |
| `visitorEmail` | string | No | Visitor email (creates contact record) |
| `visitorPhone` | string | No | Visitor phone (creates contact record) |
| `visitorId` | string | No | Persistent identifier for session resumption |
| `initialMessage` | string | No | First message text |

**Response `200`:**
```json
{ "conversationId": "conv_abc123" }
```

**Response `400`:**
```json
{ "error": "projectId is required" }
```

**Response `429`:**
```json
{ "error": "Rate limit exceeded. Try again later." }
```

**Side effects:**
- Creates contact record if email/phone provided
- Fires `conversation.opened` webhook
- Triggers smart routing (bot → available agents → unassigned queue)

---

### Send Message

```
POST /widget/messages
```

Sends a visitor message. If the conversation is resolved, creates a new one automatically.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversationId` | string | **Yes** | Conversation ID |
| `content` | string | **Yes** | Message text |
| `visitorId` | string | No | Visitor identifier |
| `fileId` | string | No | Convex storage ID for attachment |
| `fileName` | string | No | Original file name |

**Response `200`:**
```json
{ "messageId": "msg_xyz789", "conversationId": "conv_abc123" }
```

**Side effects:**
- Triggers routing (if first message)
- Triggers bot execution (if bot is enabled)
- Fires `message.create` webhook

---

### Get Project Config

```
GET /widget/project?projectId=<id>
```

Fetches public project configuration for widget initialization.

**Query Params:**

| Param | Type | Required |
|-------|------|----------|
| `projectId` | string | **Yes** |

**Response `200`:**
```json
{
  "name": "My Support",
  "widgetConfig": {
    "branding": { "primaryColor": "#0ea5e9" },
    "welcomeMessage": "How can we help?",
    "locale": "en"
  },
  "widgetLocale": "en"
}
```

---

### Get Conversation

```
GET /widget/conversations/get?id=<id>
```

Fetches public-safe conversation data (internal fields excluded).

**Query Params:**

| Param | Type | Required |
|-------|------|----------|
| `id` | string | **Yes** |

**Response `200`:**
```json
{
  "_id": "conv_abc123",
  "status": 1,
  "rating": null,
  "projectId": "proj_xyz"
}
```

---

### Find Conversation by Visitor

```
GET /widget/conversations?projectId=<id>&visitorId=<vid>
```

Finds an existing active conversation for a returning visitor.

**Query Params:**

| Param | Type | Required |
|-------|------|----------|
| `projectId` | string | **Yes** |
| `visitorId` | string | **Yes** |

**Response `200`:** Conversation object or `null`.

---

### Rate Conversation

```
POST /widget/conversations/rate
```

Submits a CSAT rating (1–5) with optional feedback.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | **Yes** | Conversation ID |
| `rating` | number | **Yes** | 1–5 rating |
| `feedback` | string | No | Feedback comment |

**Response `200`:**
```json
{ "success": true }
```

---

### Get Messages

```
GET /widget/messages?conversationId=<id>
```

Fetches message history (internal messages excluded).

**Query Params:**

| Param | Type | Required |
|-------|------|----------|
| `conversationId` | string | **Yes** |

**Response `200`:**
```json
[
  {
    "_id": "msg_1",
    "conversationId": "conv_abc123",
    "content": "Hello!",
    "senderType": "visitor",
    "senderId": "visitor_123",
    "createdAt": 1712345678000
  }
]
```

---

### Generate Upload URL

```
POST /widget/upload-url
```

Generates a Convex storage upload URL for file attachments.

**Response `200`:**
```json
{ "uploadUrl": "https://<convex-site>.convex.site/api/upload/..." }
```

---

## Webhook Integrations (Inbound)

These endpoints receive events from external messaging platforms and route them into Yoosr.

### Meta Webhook — WhatsApp / Messenger / Instagram

```
POST /webhooks/meta
```

Receives incoming messages from Meta platforms. Verified via `X-Hub-Signature-256` HMAC-SHA256.

**Request Headers:**

| Header | Description |
|--------|-------------|
| `X-Hub-Signature-256` | `sha256=<hex>` — HMAC-SHA256 using per-integration `app_secret` (AES-GCM encrypted), constant-time comparison |

**Request Body:** Standard Meta webhook JSON. The `object` field determines the platform:
- `whatsapp_business_account` → WhatsApp
- `page` → Messenger
- `instagram` → Instagram

**Response:** `OK` (200). Always 200 per Meta requirements.

**Side effects:**
- Deduplicates by `messageId`
- Creates/updates conversation and contact records
- Triggers bot execution or smart routing

#### Verification (GET)

During webhook subscription setup, Meta sends a verification `GET`:

```
GET /webhooks/meta?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<challenge>
```

**Response:** The `hub.challenge` value (200) if the token matches stored credentials, or `Forbidden` (403).

---

### Telegram Webhook

```
POST /webhooks/telegram
```

Receives incoming Telegram messages. Authenticated via `X-Telegram-Bot-Api-Secret-Token` header.

**Request Headers:**

| Header | Description |
|--------|-------------|
| `X-Telegram-Bot-Api-Secret-Token` | Per-bot secret token set during `setWebhook` |

**Request Body:** Standard Telegram Update JSON.

**Response:** `OK` (200). Always 200 to prevent retry storms. `Forbidden` (403) if token doesn't match.

> **Note:** `GET` requests return `405 Method Not Allowed`. Telegram uses POST-only webhooks.

**Side effects:**
- Creates/updates conversation via `createOrUpdateFromTelegram`
- Triggers bot execution or smart routing
- Fires `message.create` webhook

---

### Clerk Webhook

```
POST /clerk-webhook
```

Syncs Clerk authentication events to Convex.

**Auth:** Svix signature verification using `CLERK_WEBHOOK_SECRET`.

**Events handled:**

| Clerk Event | Action |
|-------------|--------|
| `user.created` | Sync new user profile to Convex `profiles` table |
| `user.updated` | Update existing profile |
| `organization.deleted` | Remove associated projects and schedule data deletion |

**Response:** `OK` (200), `Invalid signature` (401), `Webhook secret not configured` (500).

---

## Outbound Webhooks (RestHooks)

Yoosr sends outbound HTTP POST notifications to subscriber URLs when specific events occur. Manage subscriptions via **Dashboard → Settings → Webhooks**.

### Subscription Management

All CRUD operations use Convex mutations:

```ts
// Create — generates 32-byte hex secret
await ctx.mutation(api.webhooks.create, {
  projectId: "proj_xyz",
  url: "https://your-server.com/webhook",
  events: ["message.create", "conversation.opened"],
});

// List
await ctx.query(api.webhooks.list, { projectId: "proj_xyz" });

// Toggle
await ctx.mutation(api.webhooks.update, { id: "sub_abc", isActive: false });

// Remove (soft-delete with org ownership check)
await ctx.mutation(api.webhooks.remove, { id: "sub_abc" });
```

### Event Types

| Event | Triggered When |
|-------|---------------|
| `message.create` | A message is sent (agent, visitor, or widget) |
| `conversation.opened` | A new conversation is created |
| `conversation.closed` | A conversation is resolved or manually closed |
| `agent.assigned` | A conversation is assigned to a human agent |
| `contact.created` | A new contact is created |

### Delivery Format

**HTTP POST** to subscriber URL:

**Headers:**
```
Content-Type: application/json
X-Yoosr-Event: message.create
X-Yoosr-Signature: sha256=<hex-hmac>
```

**Body:**
```json
{
  "event": "message.create",
  "projectId": "proj_xyz",
  "timestamp": 1712345678000,
  "data": {
    "conversationId": "conv_abc123",
    "messageId": "msg_xyz789",
    "content": "Hello!",
    "senderType": "visitor"
  }
}
```

### Verifying Signatures

Each delivery is signed with HMAC-SHA256 using the per-subscription secret returned during creation.

```js
const crypto = require("crypto");

function verifySignature(payload, signature, secret) {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook handler:
const isValid = verifySignature(rawBody, req.headers["x-yoosr-signature"], secret);
if (!isValid) return res.status(401).send("Invalid signature");
```

### Retry Policy

| Attempt | Delay | Notes |
|---------|-------|-------|
| 1 | Immediate | Scheduled with 0ms delay |
| 2 | 60 seconds | |
| 3 | 300 seconds (5 min) | Final attempt |

**Request timeout:** 10 seconds (`AbortSignal.timeout(10000)`).

All delivery attempts are logged to the `webhook_deliveries` table with `subscriptionId`, `projectId`, `event`, `url`, `attempt`, `success`, `statusCode`, `error`, and `timestamp`.

---

## Next.js Proxy

### Widget Project Proxy

```
GET /api/widget/project?projectId=<id>
```

Server-side proxy to the Convex `/widget/project` endpoint with 60-second ISR caching. Reduces N+1 requests from widget clients.

**Response:** Same as Convex `/widget/project`, cached for 60 seconds.

---

## Error Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Bad request — missing or invalid parameters |
| `401` | Unauthorized — invalid webhook signature |
| `403` | Forbidden — credential mismatch |
| `404` | Not found — integration not configured |
| `405` | Method not allowed |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Rate Limits

| Endpoint | Limit | Strategy |
|----------|-------|----------|
| `POST /widget/conversations` | 5 req/min per visitorId or projectId | Fixed window |
| `POST /widget/messages` | 20 req/min, burst capacity 5 | Token bucket |

---

## Related Docs

- [`docs/AGENT-SETUP.md`](./AGENT-SETUP.md) — Agent configuration guide
- [`convex/http.ts`](../convex/http.ts) — Source code for all HTTP endpoints
- [`convex/webhooks.ts`](../convex/webhooks.ts) — Source code for outbound webhook system
- [Convex HTTP API docs](https://docs.convex.dev/functions/http-actions) — Convex HTTP endpoint documentation
