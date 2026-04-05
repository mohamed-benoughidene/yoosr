# Part 08: Backend Utilities & Helpers — Analysis Findings

## 📊 Visual Map

```
convex/
├── utils.ts                      → 3 shared utility functions (auth helpers)
├── lib/
│   ├── crypto.ts                 → AES-GCM encrypt/decrypt utilities
│   └── env.ts                    → Environment variable validation helper
├── convex.config.ts              → Convex app config + rate-limiter plugin
├── http.ts                       → HTTP router: 15 routes (widget, webhooks, CORS)
├── crons.ts                      → 4 cron jobs (auto-close, cleanup, presence, retry)
├── openrouter.ts                 → OpenRouter LLM client wrapper (2 functions)
├── openrouter_api.ts             → OpenRouter API key management (4 queries/mutations + 1 action)
├── aiFlowBuilder.ts              → AI flow generation via LLM (1 action)
├── getAny.ts                     → Generic data fetcher (1 internal query)
├── _generated/                   → Auto-generated Convex code (5 files, DO NOT EDIT)
└── [other domain files]          → queries, mutations, schemas (not in this chunk's scope)
```

## 📁 File Inventory

| File | Purpose | Lines |
|------|---------|-------|
| `convex/utils.ts` | Shared utility functions for backend (auth/project access helpers) | ~50 |
| `convex/lib/crypto.ts` | AES-GCM encryption/decryption for secrets | ~30 |
| `convex/lib/env.ts` | Environment variable validation helper | ~25 |
| `convex/convex.config.ts` | Convex instance configuration + rate-limiter plugin | ~7 |
| `convex/http.ts` | HTTP API endpoints (webhooks, widget, CORS preflight) | ~430 |
| `convex/crons.ts` | Scheduled/cron job definitions (4 jobs) | ~25 |
| `convex/openrouter.ts` | OpenRouter (AI model) integration via OpenAI SDK | ~90 |
| `convex/openrouter_api.ts` | OpenRouter API key CRUD + test action | ~140 |
| `convex/aiFlowBuilder.ts` | AI flow building logic via LLM prompt engineering | ~170 |
| `convex/getAny.ts` | Generic data fetching utility (getFirstProject) | ~6 |
| `convex/_generated/` | Auto-generated Convex code (api.d.ts, api.js, dataModel.d.ts, server.d.ts, server.js) | — |

**Files NOT found that were expected:** None — all listed files exist.

**Additional files discovered in `convex/` (outside this chunk's scope):** 35 domain files (schema.ts, auth.config.ts, bots.ts, messages.ts, conversations.ts, webhooks.ts, integrations.ts, etc.)

## ✅ Analysis Checklist

### [x] What utility functions exist in `utils.ts`?
`convex/utils.ts` exports exactly **3 utility functions**:
1. **`requireAdmin(identity)`** (sync) — Throws `ConvexError` if identity is null or `org_role !== "org:admin"`. Used for admin-gating mutations.
2. **`assertProjectOwnership(ctx, projectId, identity)`** (async) — Fetches project by ID, throws `ConvexError` if `project.orgId !== identity.org_id`. Returns `Doc<"projects">`.
3. **`checkProjectOwnership(ctx, projectId, identity)`** (async) — Same logic as `assertProjectOwnership` but returns `null` instead of throwing. Non-asserting variant.

All three functions use the `identity` pattern derived from Convex's auth (`org_id`, `org_role`).

### [x] Are utilities reusable and well-organized?
**Yes, with minor concerns.** The utilities follow a clear pattern:
- Authorization helpers accept a common `identity` shape (`{ org_role?: string } | null` or `{ org_id?: string }`).
- `assertProjectOwnership` and `checkProjectOwnership` are DRY — one throws, one returns null. Both use the same DB lookup pattern with `ctx.db.get(projectId)`.
- **Concern:** The `identity` type is loosely typed (`{ org_id?: string }` rather than a proper interface). This is repeated across multiple files (also in `openrouter_api.ts`), suggesting a missing shared type definition.

### [x] What's in the `lib/` directory?
Two files:
1. **`convex/lib/crypto.ts`** — Implements AES-GCM encryption/decryption for storing secrets in the database:
   - `encryptSecret(plaintext, keyHex)` → returns `base64(iv):base64(ciphertext)` format
   - `decryptSecret(encrypted, keyHex)` → reverses the above
   - `hexToBytes(hex)` → private helper for key conversion
   - Uses Web Crypto API (`crypto.subtle`), not Node.js crypto module.

2. **`convex/lib/env.ts`** — Single function `requireEnv(name, value)`:
   - In production: throws descriptive error if value is missing
   - In development: logs warning and returns empty string
   - Used to validate `ENCRYPTION_KEY` before use in `openrouter_api.ts`

### [x] How are external API calls structured? (OpenRouter, etc.)
**OpenRouter pattern** (`convex/openrouter.ts`):
- Uses the `openai` npm package with custom `baseURL: "https://openrouter.ai/api/v1"` — reuses OpenAI SDK as a generic LLM client.
- `getClient(apiKey?)` — creates OpenAI client, falls back to `process.env.OPENROUTER_API_KEY`, throws if neither available.
- Two exported functions:
  - `callAITask(systemPrompt, userMessage, model?, projectDefaultModel?, apiKey?)` — single-shot LLM call, `temperature: 0.3`
  - `callAIAssistant(systemPrompt, conversationHistory, model?, projectDefaultModel?, apiKey?)` — multi-turn with full history, `temperature: 0.7`
- Both return `LLMResult { text, tokensUsed, model }` with consistent shape.
- Model fallback chain: `model arg → projectDefaultModel → "openrouter/free"`.

**OpenRouter API management** (`convex/openrouter_api.ts`):
- `saveOpenRouterKey` mutation — encrypts key via `encryptSecret()` before storing in `projects.openRouterApiKey`
- `clearOpenRouterKey` mutation — clears key and defaultModel
- `getOpenRouterKeyStatus` query — decrypts and returns masked key (`sk-or-••••XXXX`)
- `testOpenRouterKey` action — makes live API call to verify key works, returns `{ ok, model, message, error }`
- `getProjectByOrgIdInternal` internalQuery — helper for other modules

**AI Flow Builder** (`convex/aiFlowBuilder.ts`):
- `generateFlow` action — takes plain-language prompt, calls `callAITask()` with extensive system prompt defining node types, schemas, layout rules
- 30-second timeout via `Promise.race`
- Strips markdown code fences, parses JSON, validates `nodes`/`edges` arrays

### [x] Is there error handling for API failures?
**Yes, with varying coverage:**

1. **OpenRouter** (`openrouter.ts`):
   - `getClient()` throws `Error("Missing OPENROUTER_API_KEY environment variable")` if no key
   - `callAITask` / `callAIAssistant`: No try/catch — exceptions propagate to caller
   - No timeout at this layer (timeout is in `aiFlowBuilder.ts` caller)

2. **OpenRouter API test** (`openrouter_api.ts:testOpenRouterKey`):
   - Proper try/catch around fetch
   - Checks `response.ok`, returns `{ ok: false, error: "status: statusText" }`
   - Catches network errors and returns `{ ok: false, error: errorMessage }`

3. **Meta/WhatsApp webhooks** (`http.ts`):
   - Full try/catch around POST handler
   - Returns 200 "OK" on error (per Meta webhook requirements — prevents retry loops)
   - Logs errors via `console.error`

4. **Telegram webhooks** (`http.ts`):
   - Full try/catch
   - Returns 200 "OK" on error (prevents relentless retries from Telegram)
   - Logs errors via `console.error`

5. **AI Flow Builder** (`aiFlowBuilder.ts`):
   - 30-second timeout via `Promise.race`
   - JSON parse error with truncated context (first 200 chars)
   - Validates `nodes` and `edges` are arrays

### [x] Are there retry mechanisms?
**Limited retry logic:**
- **Cron-based retry:** `crons.ts` has `retryUnassignedConversations` cron (every 5 minutes) — this retries routing for conversations that weren't successfully assigned.
- **No HTTP-level retry** in `openrouter.ts` — if an LLM call fails, it throws immediately.
- **No exponential backoff** anywhere in the codebase.
- **Webhook retry:** External platforms (Meta, Telegram) handle retries themselves — the code returns 200 even on errors to prevent infinite retry loops from the external provider.

### [x] What HTTP endpoints are exposed?
**15 routes total** in `convex/http.ts`:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/clerk-webhook` | Clerk user/org sync webhook |
| POST | `/widget/conversations` | Create conversation from widget (rate-limited) |
| POST | `/widget/messages` | Send message from widget (rate-limited) |
| OPTIONS | `/widget/conversations` | CORS preflight |
| OPTIONS | `/widget/messages` | CORS preflight |
| OPTIONS | `/widget/project` | CORS preflight |
| OPTIONS | `/widget/upload-url` | CORS preflight |
| OPTIONS | `/widget/conversations/get` | CORS preflight |
| OPTIONS | `/widget/conversations/rate` | CORS preflight |
| GET | `/widget/project` | Fetch project config for widget |
| GET | `/widget/conversations/get` | Fetch conversation public data |
| POST | `/widget/conversations/rate` | Rate conversation (CSAT) |
| GET | `/widget/conversations` | Find existing conversation by visitor |
| GET | `/widget/messages` | Fetch messages for conversation |
| POST | `/widget/upload-url` | Generate upload URL for files |
| GET | `/webhooks/meta` | Meta (WhatsApp/Messenger/Instagram) verification |
| POST | `/webhooks/meta` | Meta incoming messages |
| GET | `/webhooks/telegram` | Telegram verification (stub — always returns 200) |
| POST | `/webhooks/telegram` | Telegram incoming messages |

### [x] How are webhooks handled?
**Three webhook integrations:**

1. **Clerk** (`/clerk-webhook`):
   - Handles `user.created`, `user.updated` → calls `internal.profiles.upsertFromClerk`
   - Handles `organization.deleted` → finds project by orgId, removes it
   - No signature verification (relies on Clerk's webhook security)

2. **Meta** (`/webhooks/meta` — WhatsApp/Messenger/Instagram):
   - GET: Hub mode verification with `hub.verify_token` check against all enabled integrations
   - POST: Full signature verification using `X-Hub-Signature-256` header
   - Uses `constantTimeCompare()` to prevent timing attacks (custom implementation, ~10 lines)
   - Decrypts `app_secret` per-integration via `decryptSecret()`
   - Verifies HMAC-SHA256 signature using Web Crypto API
   - Routes to different channels: `whatsapp`, `messenger`, `instagram`
   - Identifies integration by `phone_number_id` (WhatsApp), `page_id` (Messenger), or `page_id` (Instagram)

3. **Telegram** (`/webhooks/telegram`):
   - GET: Stub — always returns 200 (verification not implemented)
   - POST: Verifies `X-Telegram-Bot-Api-Secret-Token` header
   - Looks up integration by webhook secret via `findTelegramByWebhookSecret` (uses denormalized index for O(log n) lookup)
   - Extracts chat, sender, message from Telegram message body

### [x] What cron jobs are defined?
**4 cron jobs** in `convex/crons.ts`:

| Job | Interval | Target Function |
|-----|----------|----------------|
| Auto-close inactive conversations | Every 5 minutes | `internal.conversations.autoCloseInactive` |
| Cleanup old notifications | Every 24 hours | `internal.notifications.cleanupOldNotifications` |
| Cleanup stale presence | Every 60 seconds | `internal.profiles.cleanupStalePresence` |
| Retry unassigned conversations | Every 5 minutes | `internal.routing.retryUnassignedConversations` |

### [x] Are scheduled tasks idempotent?
**Cannot fully verify** — the target functions (`autoCloseInactive`, `cleanupOldNotifications`, `cleanupStalePresence`, `retryUnassignedConversations`) are defined in other domain files not fully in this chunk's scope. However:
- The cron job names suggest idempotent design (cleanup jobs that run on intervals should be safe to re-run).
- `retryUnassignedConversations` implies it queries for a specific state and retries — likely idempotent if it only targets unassigned conversations.
- **Recommendation:** Review the target mutation implementations to confirm idempotency guarantees.

### [x] How is rate limiting implemented? (`@convex-dev/rate-limiter`)
**Configured in two places:**

1. **`convex.config.ts`** — Imports and registers `@convex-dev/rate-limiter` plugin:
   ```ts
   import rateLimiter from "@convex-dev/rate-limiter/convex.config";
   const app = defineApp();
   app.use(rateLimiter);
   ```

2. **`convex/http.ts`** — Creates RateLimiter instance with **2 rate limit rules**:
   - `createConversation`: Fixed window, 5 requests per 60 seconds (per visitorId or projectId)
   - `sendMessage`: Token bucket, 20 requests per 60 seconds, capacity 5 (per visitorId or conversationId)

   Both use `{ throws: false }` pattern — returns `{ ok }` object, allowing the handler to return 429 response instead of throwing.

### [x] What's the AI integration pattern?
**Three-layer AI architecture:**

1. **Infrastructure layer** (`openrouter.ts`):
   - Generic OpenAI SDK wrapper with OpenRouter base URL
   - Two function types: single-task (`callAITask`, temp 0.3) and multi-turn assistant (`callAIAssistant`, temp 0.7)
   - Returns standardized `LLMResult { text, tokensUsed, model }`

2. **Key management layer** (`openrouter_api.ts`):
   - CRUD for API keys: save (encrypted), clear, status (masked), test (live call)
   - Keys stored encrypted in `projects.openRouterApiKey` field
   - Uses `ENCRYPTION_KEY` env var for encryption

3. **Application layer** (`aiFlowBuilder.ts`):
   - `generateFlow` action converts natural language to React Flow nodes/edges
   - Uses extensive system prompt defining 15+ node types with exact data shapes
   - 30-second timeout, JSON parsing with fallback, schema validation

### [x] Are there caching patterns for external API calls?
**No explicit caching** found for external API calls:
- `openrouter.ts` makes fresh API calls every time
- `openrouter_api.ts:testOpenRouterKey` makes a live test call each time
- No in-memory caching, no Convex query caching of LLM responses
- The only "caching" is Convex's inherent reactive query caching for database reads

### [x] How are API keys and secrets managed?
**Good security practices observed:**

1. **Encryption at rest:** All secrets encrypted with AES-GCM via `convex/lib/crypto.ts`
   - Keys stored as `base64(iv):base64(ciphertext)` format
   - Uses `ENCRYPTION_KEY` environment variable (hex-encoded)

2. **Environment variable validation:** `requireEnv()` from `convex/lib/env.ts`
   - Throws in production if missing
   - Warns in development (doesn't crash)

3. **Key masking:** `getOpenRouterKeyStatus` returns masked key `sk-or-••••XXXX` (last 4 chars)

4. **Per-integration secrets:** Meta webhooks decrypt `app_secret` per-integration from credentials

5. **Timing attack prevention:** `constantTimeCompare()` function in `http.ts` for webhook signature verification

6. **No hardcoded secrets:** No API keys visible in source code

### [x] Is there logging/monitoring infrastructure?
**Minimal logging:**
- `console.error()` used in webhook error handlers (Meta, Telegram)
- `console.warn()` used in `requireEnv()` for development warnings
- **No structured logging** — just raw `console.error`/`console.warn`
- **No monitoring/metrics** — no Sentry, no request logging, no performance tracking
- **No audit logging** in these utility files (though `activityLogs.ts` exists as a separate domain file)
- **No log levels** — all errors logged at same level

## 🔍 Key Patterns to Identify

1. **Utility function organization:** Clean separation — `utils.ts` for auth helpers, `lib/` for infrastructure (crypto, env validation). Functions are small, single-purpose, and well-documented with JSDoc.

2. **External API integration patterns:** 
   - OpenAI SDK reused as generic LLM client (custom baseURL)
   - Standardized result type (`LLMResult`) across all LLM calls
   - API key encryption at rest (AES-GCM)
   - Per-integration credential decryption in webhooks

3. **Error handling strategies:**
   - Webhooks: Always return 200 to prevent external retry loops
   - LLM calls: Timeout at caller level, exceptions propagate from low-level functions
   - Signature verification: Constant-time comparison for security

4. **Rate limiting approach:**
   - Uses `@convex-dev/rate-limiter` package
   - Different algorithms per endpoint (fixed window vs token bucket)
   - Keyed by visitor identity where available, falls back to project/conversation

5. **Cron job patterns:**
   - Uses `crons.interval()` exclusively (no `crons.monthly()` etc.)
   - Shortest interval: 60 seconds (presence cleanup)
   - All target `internal.*` functions

6. **Security-conscious design:**
   - AES-GCM encryption for all stored secrets
   - Constant-time string comparison for webhook signatures
   - HMAC-SHA256 verification for Meta webhooks
   - Environment variable validation in production

## ⚠️ Potential Concerns

| Severity | Concern | Details |
|----------|---------|---------|
| **HIGH** | No retry logic for LLM calls | `openrouter.ts` functions throw immediately on failure. If OpenRouter is down, AI features break completely with no fallback or retry. |
| **HIGH** | Telegram webhook GET returns 200 unconditionally | `http.ts` line ~370: GET `/webhooks/telegram` always returns 200 without verification. This means anyone can verify a webhook without a valid token. |
| **MEDIUM** | No structured logging or monitoring | All error logging uses raw `console.error`. No correlation IDs, no log levels, no monitoring integration. Makes debugging production issues difficult. |
| **MEDIUM** | Loosely typed `identity` objects | Throughout `utils.ts` and `openrouter_api.ts`, identity is cast as `(identity as unknown as { org_id: string })` — fragile pattern that bypasses type safety. |
| **MEDIUM** | No timeout on OpenRouter API calls in `openrouter.ts` | Only `aiFlowBuilder.ts` adds a 30s timeout. Direct `callAITask`/`callAIAssistant` callers have no timeout protection. |
| **LOW** | 6 redundant CORS OPTIONS routes | 6 separate OPTIONS handlers doing identical work could be consolidated or handled by middleware. |
| **LOW** | Cron idempotency not verified | Target functions for cron jobs are in other files — idempotency should be confirmed during Part 15 (features) analysis. |
| **LOW** | No caching for external API calls | Every LLM call hits OpenRouter. For high-traffic scenarios, caching common responses could reduce costs and latency. |
| **LOW** | `getAny.ts` provides minimal utility | Only exports `getFirstProject` (6 lines). File name doesn't match its purpose. Consider renaming or removing. |
