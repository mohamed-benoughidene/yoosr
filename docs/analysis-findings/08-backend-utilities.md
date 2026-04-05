# Part 08: Backend Utilities & Helpers - Findings

## 📊 Visual Map

```
convex/
├── utils.ts               → Auth utilities: requireAdmin, assertProjectOwnership, checkProjectOwnership
├── errors.ts              → Error factories: userError, authError, notFoundError, forbiddenError
├── types.ts               → ClerkIdentity type definition
│
├── lib/
│   ├── crypto.ts          → AES-GCM encryption/decryption for secrets at rest
│   └── env.ts             → requireEnv() — production-safe env var validation
│
├── convex.config.ts       → Convex app config — registers @convex-dev/rate-limiter plugin
├── auth.config.ts         → Clerk JWT issuer domain configuration
│
├── http.ts                → HTTP router — 10+ endpoints (Clerk webhook, widget, Meta, Telegram)
├── crons.ts               → 4 scheduled jobs (auto-close, notification cleanup, presence, routing retry)
│
├── openrouter.ts          → OpenAI SDK wrapper for OpenRouter LLM calls (callAITask, callAIAssistant)
├── openrouter_api.ts      → OpenRouter API key CRUD + encryption + testing (5 Convex functions)
├── aiFlowBuilder.ts       → AI-powered flow generation — prompt → React Flow JSON (1 action)
├── getAny.ts              → Bootstrap helper — getFirstProject (1 internalQuery)
│
└── _generated/            → Auto-generated Convex code (DO NOT EDIT)
```

## 📁 File Inventory

| File | Purpose | Functions |
|------|---------|-----------|
| `convex/utils.ts` | Shared auth utility functions | 3 functions (non-Convex) |
| `convex/errors.ts` | Error factory functions | 4 functions (non-Convex) |
| `convex/types.ts` | ClerkIdentity type definition | 0 functions (type only) |
| `convex/lib/crypto.ts` | AES-GCM encryption/decryption | 2 functions: encryptSecret, decryptSecret |
| `convex/lib/env.ts` | Production-safe env validation | 1 function: requireEnv |
| `convex/convex.config.ts` | Convex app configuration | 0 functions (config only) |
| `convex/http.ts` | HTTP router (webhooks, widget endpoints) | 10+ HTTP endpoints |
| `convex/crons.ts` | Scheduled/cron job definitions | 4 cron jobs |
| `convex/openrouter.ts` | OpenAI SDK wrapper for OpenRouter | 2 functions: callAITask, callAIAssistant |
| `convex/openrouter_api.ts` | OpenRouter API key management | 5 Convex functions |
| `convex/aiFlowBuilder.ts` | AI flow generation (prompt → React Flow) | 1 action: generateFlow |
| `convex/getAny.ts` | Bootstrap helper query | 1 internalQuery: getFirstProject |

## ✅ Analysis Checklist

### [x] What utility functions exist in `utils.ts`?
Three utility functions in `convex/utils.ts`:

1. **`requireAdmin(identity: { org_role?: string } | null)`** — Throws `ConvexError("Unauthorized: admin access required")` if identity is null or `org_role !== "org:admin"`. Used in ~25+ mutation handlers.

2. **`assertProjectOwnership(ctx, projectId, identity)`** — Fetches project by ID via `ctx.db.get(projectId)`, throws `ConvexError("Unauthorized")` if project not found or `project.orgId !== identity.org_id`. Returns the `Doc<"projects">` for use in the calling function. Used in ~15+ mutation handlers.

3. **`checkProjectOwnership(ctx, projectId, identity)`** — Same as `assertProjectOwnership` but returns `null` instead of throwing. Used in queries where callers want graceful handling.

### [x] Are utilities reusable and well-organized?
**Yes.** The three utilities are pure functions with no side effects, making them highly reusable. They're organized by concern:
- `utils.ts` — Authorization utilities
- `errors.ts` — Error factory utilities
- `types.ts` — Type definitions
- `lib/crypto.ts` — Cryptographic utilities
- `lib/env.ts` — Environment variable utilities

Each file has a single responsibility. No circular dependencies. All utilities are imported directly where needed (no barrel exports).

**Minor concern**: `utils.ts` only has 3 functions — the file could be merged with `errors.ts` into a single `shared.ts` or `lib/utils.ts` for better organization.

### [x] What's in the `lib/` directory?
Two files:

1. **`convex/lib/crypto.ts`** — AES-GCM encryption/decryption:
   - `encryptSecret(plaintext: string, keyHex: string): Promise<string>` — encrypts a secret with AES-GCM. Generates a 12-byte random IV via `crypto.getRandomValues()`. Output format: `{iv_base64}:{ciphertext_base64}` (colon-separated, base64-encoded).
   - `decryptSecret(encrypted: string, keyHex: string): Promise<string>` — parses `{iv}:{ciphertext}` format, decrypts with AES-GCM.
   - Key is parsed from hex string via `hexToBytes()` — no validation on hex input (silent failure on malformed input).
   - Used for: OpenRouter API keys, Meta app secrets, Telegram webhook secrets, WhatsApp access tokens.

2. **`convex/lib/env.ts`** — Production-safe environment variable validation:
   - `requireEnv(name: string, value: string | undefined): string`
   - **Production**: Throws descriptive error with setup instructions if value is undefined.
   - **Development**: `console.warn` and returns empty string `""` (allows graceful degradation).
   - Used in: `crypto.ts` to validate `ENCRYPTION_KEY`, `openrouter_api.ts` to validate `OPENROUTER_API_KEY`.

### [x] How are external API calls structured?
**Two patterns:**

1. **OpenAI SDK wrapper** (`openrouter.ts`):
   ```ts
   const openai = new OpenAI({ apiKey: customApiKey || process.env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1" });
   const response = await openai.chat.completions.create({ model, messages: [...], temperature });
   ```
   - `callAITask(systemPrompt, userMessage, model?, projectDefaultModel?, apiKey?)` — single-shot, temperature 0.3.
   - `callAIAssistant(systemPrompt, conversationHistory, model?, projectDefaultModel?, apiKey?)` — multi-turn with full history, temperature 0.7.
   - Model resolution: `model || projectDefaultModel || "openrouter/free"`.
   - Returns typed `LLMResult` with `{ text, tokensUsed, model }`.

2. **Raw `fetch`** (`openrouter_api.ts:testOpenRouterKey`, `aiFlowBuilder.ts`, `http.ts` Meta/Telegram handlers):
   - Used when actions need to make external HTTP calls (Convex `action` type, not mutation/query).
   - `openrouter_api.ts:testOpenRouterKey` — raw `fetch` to `https://openrouter.ai/api/v1/chat/completions` to test API key validity.
   - `aiFlowBuilder.ts` — raw `fetch` is NOT used; it calls `callAITask()` from `openrouter.ts`.
   - Meta/Telegram webhooks in `http.ts` — raw `fetch` for sending messages to WhatsApp/Messenger/Instagram/Telegram APIs.

### [x] Is there error handling for API failures?
**Mixed quality:**

1. **OpenRouter calls** (`openrouter.ts`): No explicit error handling — errors propagate from OpenAI SDK. Null-safe access patterns: `response.choices?.[0]?.message?.content?.trim() ?? ""`.

2. **AI key test** (`openrouter_api.ts:testOpenRouterKey`): Wraps in `try/catch`, returns `{ ok: false, error: message }` instead of throwing. HTTP error responses returned as `"{status}: {statusText}"`.

3. **AI flow builder** (`aiFlowBuilder.ts`): 30-second timeout via `Promise.race` with `setTimeout` rejection. JSON parsing has two-tier fallback (direct `JSON.parse`, then regex extraction `\{[\s\S]*\}` for markdown-fenced responses). Schema validation checks `Array.isArray(parsed.nodes)` and `Array.isArray(parsed.edges)`.

4. **Meta webhook** (`http.ts`): Outer `try/catch` (line ~370) logs via `console.error` and always returns 200 (per Meta requirements to stop retries).

5. **Telegram webhook** (`http.ts`): Similarly wrapped in `try/catch` (line ~430).

6. **No retry mechanism** anywhere for external API failures. Single attempt only.

### [x] Are there retry mechanisms?
**No retry for external API calls.** The only retry-like behavior is:

1. **`routing.ts:retryUnassignedConversations`** (cron job) — retries routing for unassigned conversations older than 5 minutes, up to 20 conversations per run.

2. **`webhooks.ts:deliverWebhook`** — Webhook delivery retries up to 3 attempts with exponential backoff (60s, 300s delays). This is the only retry mechanism for external HTTP calls.

3. **`aiFlowBuilder.ts`** — No retry, single attempt with 30s timeout.

4. **`openrouter.ts`** — No retry, single attempt.

### [x] What HTTP endpoints are exposed?
**`http.ts` — 10+ endpoints:**

| Method | Path | Purpose | Auth | Rate Limit |
|--------|------|---------|------|------------|
| POST | `/clerk-webhook` | Clerk user/org sync | None (should be verified!) | None |
| POST | `/widget/conversations` | Create widget conversation | Public | ✅ (5/min) |
| POST | `/widget/messages` | Send widget message | Public | ✅ (20/min, bucket cap 5) |
| GET | `/widget/project` | Fetch public project config | Public | None |
| GET | `/widget/conversations/get` | Find existing conversation | Public | None |
| POST | `/widget/conversations/rate` | Submit CSAT rating | Public | None |
| GET | `/widget/conversations` | Find conversation by visitorId | Public | None |
| GET | `/widget/messages` | Fetch widget messages | Public | None |
| POST | `/widget/upload-url` | Generate file upload URL | Public | None |
| OPTIONS | `/widget/*` | CORS preflight | None | None |
| GET | `/webhooks/meta` | Meta Hub verification | Integration secret check | None |
| POST | `/webhooks/meta` | Meta webhook (WhatsApp/Messenger/Instagram) | HMAC-SHA256 verification | None |
| GET | `/webhooks/telegram` | Telegram stub | None | None |
| POST | `/webhooks/telegram` | Telegram webhook | Secret token header verification | None |

All widget endpoints share CORS headers: `Access-Control-Allow-Origin: "*"`, `GET, POST, OPTIONS` methods.

### [x] How are webhooks handled?
**Three webhook types:**

1. **Clerk Webhook** (`/clerk-webhook`, POST):
   - Processes `user.created`, `user.updated`, `organization.deleted` events.
   - `user.created/updated` → calls `internal.profiles.upsertFromClerk`.
   - `organization.deleted` → calls `internal.projects.remove`.
   - **⚠️ NO signature verification** — trusts request body directly. Security concern.

2. **Meta Webhooks** (`/webhooks/meta`, GET + POST):
   - **GET**: Hub verification — checks `hub.mode=subscribe`, validates `verify_token` against all enabled Meta integrations in DB.
   - **POST**: Full HMAC-SHA256 signature verification using `constantTimeCompare()` (lines 24-32). Prevents timing attacks. Computes expected signature from raw body + decrypted `app_secret`, compares with `X-Hub-Signature-256` header.
   - Supports WhatsApp, Messenger, Instagram — detects provider via `body.object` value.
   - Integration secrets stored AES-GCM encrypted in DB, decrypted at processing time.

3. **Telegram Webhooks** (`/webhooks/telegram`, GET + POST):
   - **GET**: Stub returning "OK".
   - **POST**: Verifies via `X-Telegram-Bot-Api-Secret-Token` header. Looks up integration by `webhookSecret` index.
   - Uses `findTelegramByWebhookSecret` which matches the raw (unencrypted) secret via a denormalized index.

### [x] What cron jobs are defined?
**4 cron jobs** in `convex/crons.ts`:

| Job Name | Schedule | Target | Purpose |
|----------|----------|--------|---------|
| "auto-close inactive conversations" | Every 5 minutes | `internal.conversations.autoCloseInactive` | Closes conversations inactive for > `autoCloseMinutes` (default 30min) |
| "cleanup old notifications" | Every 24 hours | `internal.notifications.cleanupOldNotifications` | Deletes notifications older than 7 days (bounded to 500) |
| "cleanup stale presence" | Every 60 seconds | `internal.profiles.cleanupStalePresence` | Removes agents with `lastSeenAt` > 90 seconds ago (marks offline) |
| "retry unassigned conversations" | Every 5 minutes | `internal.routing.retryUnassignedConversations` | Retries routing for conversations unassigned for > 5 minutes |

All cron targets use `internal` API (correct Convex pattern). The 60-second presence cleanup is the most frequent job.

### [x] Are scheduled tasks idempotent?
**Mostly yes:**

1. **`autoCloseInactive`** — Closes conversations by status + timestamp. Re-running on the same data is safe (already-closed conversations won't match the query).

2. **`cleanupOldNotifications`** — Deletes by timestamp threshold. Re-running is safe (already-deleted records won't match).

3. **`cleanupStalePresence`** — Updates `lastSeenAt` threshold. Re-running is safe (already-offline agents won't match).

4. **`retryUnassignedConversations`** — Retries routing. Re-running could theoretically double-route, but the routing function (`routeConversation`) checks for existing assignments first.

**All cron jobs are idempotent by design** — they operate on state-based conditions, not event-based triggers.

### [x] How is rate limiting implemented?
**`@convex-dev/rate-limiter`** (v0.3.2) configured in `convex.config.ts`:

```ts
import { rateLimiter } from "@convex-dev/rate-limiter";
export default defineApp({
  plugins: [rateLimiter()],
});
```

**Usage in `http.ts`:**
- `createConversation`: Fixed window, 5 requests per 60 seconds, keyed by `visitorId ?? projectId`.
- `sendMessage`: Token bucket, 20 requests per 60 seconds, capacity of 5, keyed by `visitorId ?? conversationId`.
- Rate limiter uses `{ throws: false }` to return `{ ok: false }` for custom 429 JSON responses.

**Not rate-limited:**
- All authenticated mutations (rely on auth-based access control)
- AI/LLM calls (rely on OpenRouter's own rate limits)
- Clerk webhook endpoint
- Meta/Telegram webhook endpoints

### [x] What's the AI integration pattern?
**Three-layer AI architecture:**

1. **SDK wrapper** (`openrouter.ts`): Reusable OpenAI SDK client pointing at OpenRouter. Two functions:
   - `callAITask` — single-shot prompt, temperature 0.3 (for deterministic outputs)
   - `callAIAssistant` — multi-turn with conversation history, temperature 0.7 (for conversational outputs)
   - Model fallback: `model || projectDefaultModel || "openrouter/free"`
   - API key fallback: `customApiKey || process.env.OPENROUTER_API_KEY`
   - Throws if no API key available

2. **Key management** (`openrouter_api.ts`): Business logic for per-project API keys:
   - `saveOpenRouterKey` — encrypts key with AES-GCM, stores on project
   - `clearOpenRouterKey` — removes key and default model
   - `getOpenRouterKeyStatus` — returns masked key (`sk-or-****{last4}`)
   - `testOpenRouterKey` — makes live API call to verify key validity (returns structured result)

3. **Consumers**:
   - `aiFlowBuilder.ts` — uses `callAITask` to convert plain-language prompts into React Flow JSON. 30-second timeout, JSON parsing with regex fallback.
   - `bot.ts:executeNextBlock` — uses `callAITask`/`callAIAssistant` for AI-powered bot flow execution. Logs token usage via `logTokenUsage`.
   - `tags.ts:extractGenerativeTags` — uses LLM to extract tags from conversation content.
   - `knowledge.ts:indexSource` — uses embeddings for vector search on knowledge chunks.

### [x] Are there caching patterns for external API calls?
**No explicit caching** observed for external API calls. Each call is a fresh request:
- OpenRouter calls are made on every bot flow execution
- Meta/Telegram API calls are made on every message relay
- No in-memory caching, no Convex cache, no CDN caching

**Implicit caching:**
- Integration credentials are stored in the database (encrypted), not fetched externally each time
- Project config (including default model, API key status) is cached in Convex's reactive data layer

### [x] How are API keys and secrets managed?
**AES-GCM encryption at rest:**

1. **Single `ENCRYPTION_KEY`** environment variable protects all secrets. Validated via `requireEnv("ENCRYPTION_KEY", ...)` in production.

2. **Encrypted secrets**:
   - OpenRouter API keys (per-project, stored on `projects` table)
   - Meta `app_secret` (per-integration, stored on `integrations` table)
   - Telegram webhook secret (per-integration)
   - WhatsApp access tokens (per-integration)

3. **Encryption flow**: `encryptSecret(plaintext, ENCRYPTION_KEY)` → `{iv_base64}:{ciphertext_base64}` stored in DB.

4. **Decryption flow**: `decryptSecret(encrypted, ENCRYPTION_KEY)` → plaintext used at call time.

5. **Masked display**: `sk-or-****{last4}` format prevents full key exposure in UI.

6. **No key rotation** — the `ENCRYPTION_KEY` is a single static value. Rotating would require re-encrypting all stored secrets.

7. **No per-tenant encryption keys** — all secrets share the same encryption key.

### [x] Is there logging/monitoring infrastructure?
**Minimal:**

1. **`console.error`** in webhook catch blocks (`http.ts` lines ~370, ~430).
2. **`console.warn`** in env helper (`lib/env.ts`) for development mode.
3. **Activity logging** via `activityLogs.logActivityInternal` — logs admin actions (bot CRUD, settings CRUD, tags).
4. **Token usage logging** via `analytics.logTokenUsage` — tracks LLM token consumption per project.
5. **Unanswered query logging** via `analytics.logUnansweredQuery` — tracks queries the AI couldn't answer.

**Missing:**
- No structured logging (JSON format, log levels)
- No metrics collection (Prometheus, etc.)
- No distributed tracing
- No error tracking (Sentry, etc.)
- No performance monitoring
- No alerting infrastructure

## 📝 Agent Findings

### HTTP Router Security
The `http.ts` router has a mixed security posture:
- **Strong**: Meta webhooks use HMAC-SHA256 with constant-time comparison (`constantTimeCompare` prevents timing attacks)
- **Strong**: Telegram webhooks verify via secret token header
- **Weak**: Clerk webhook has NO signature verification — processes user creation/deletion events trusting the request body directly

### Constant-Time Comparison Implementation
`http.ts` lines 24-32 implements a custom constant-time string comparison:
```ts
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
```
This prevents timing attacks by XOR-ing all bytes and accumulating differences — execution time is constant regardless of where strings differ.

### Architecture Quality
Clear separation between:
- `openrouter.ts` — generic LLM SDK wrapper (reusable)
- `openrouter_api.ts` — business logic for key management (application-specific)
- `aiFlowBuilder.ts` — consumer of `openrouter.ts` (application feature)
- `lib/crypto.ts` — pure cryptographic utilities
- `lib/env.ts` — environment validation

### Cron Job Design
All 4 cron jobs are well-designed:
- Bounded reads (`.take(N)` limits)
- Idempotent operations
- Internal-only targets
- Appropriate frequencies (60s for presence, 5min for routing/auto-close, 24h for cleanup)

### Widget Endpoint Design
Widget endpoints are intentionally public with CORS `*` headers, designed for embedding in third-party sites. Rate limiting is the only protection. This is a valid design choice but means anyone with a projectId can interact with the system.

## 🔍 Key Patterns to Identify

### Utility Function Organization
- Flat file structure (`utils.ts`, `errors.ts`, `types.ts`) for shared helpers
- `lib/` subdirectory for multi-function modules (crypto, env)
- No barrel exports — direct imports only

### External API Integration Patterns
- OpenAI SDK wrapper for OpenRouter (type-safe, reusable)
- Raw `fetch` for non-OpenAI APIs (Meta, Telegram, key testing)
- Three-tier model fallback: explicit → project default → free
- Three-tier API key fallback: per-project → env var → throw

### Error Handling Strategies
- `try/catch` with structured `{ ok: false, error }` return for external calls
- `console.error` logging in webhook handlers
- Always-return-200 for Meta/Telegram webhooks (stop retries)
- Timeout rejection via `Promise.race` + `setTimeout`

### Retry and Resilience Patterns
- Only webhook delivery has retry (3 attempts, 60s/300s delays)
- No retry for LLM calls or external API calls
- Cron jobs provide implicit retry for failed operations (next run)

### Rate Limiting Approach
- `@convex-dev/rate-limiter` plugin for widget endpoints
- Fixed window + token bucket strategies
- Only public endpoints rate-limited — authenticated endpoints rely on auth

### Cron Job Patterns
- All target `internal` functions (correct Convex pattern)
- Bounded reads with `.take(N)`
- Idempotent by design (state-based conditions)

## ⚠️ Potential Concerns

| # | Concern | Severity | Details |
|---|---------|----------|---------|
| 1 | **Clerk webhook no signature verification** | HIGH | `http.ts:/clerk-webhook` (lines 35-57) processes `user.created`, `user.updated`, `organization.deleted` without verifying the request. An attacker could forge POST requests to create/delete users or projects. Should use Clerk's webhook verification SDK. |
| 2 | **No retry for LLM calls** | MEDIUM | `openrouter.ts` and `aiFlowBuilder.ts` make single-attempt LLM calls. Transient failures (network errors, OpenRouter downtime) cause user-facing errors with no automatic retry. |
| 3 | **No explicit caching for external APIs** | MEDIUM | Every bot flow execution makes a fresh LLM call. For high-traffic bots, this could be expensive and slow. Consider caching responses for identical inputs. |
| 4 | **Single encryption key for all secrets** | MEDIUM | All API keys and secrets share one `ENCRYPTION_KEY`. If compromised, all secrets are exposed. No key rotation mechanism. Consider per-tenant or per-secret key derivation. |
| 5 | **No structured logging or monitoring** | MEDIUM | Only `console.error` and `console.warn` used. No log levels, no structured format, no metrics collection, no tracing, no alerting. Production incidents would be hard to detect and debug. |
| 6 | **`hexToBytes` has no validation** | LOW | Malformed hex strings produce incorrect byte arrays silently. Should validate hex input length and character set. |
| 7 | **No timeout handling for API calls** | LOW | `openrouter.ts` has no timeout — relies on OpenAI SDK defaults. `aiFlowBuilder.ts` has 30s timeout but the underlying `callAITask` does not. |
| 8 | **Widget endpoints fully public** | MEDIUM | CORS `*` with no auth means any website can embed and use the widget. Rate limiting is the only protection. Consider domain allowlisting or CAPTCHA for high-risk actions. |
| 9 | **No rate limiting on AI calls** | LOW | `openrouter.ts` has no rate limiting — relies on OpenRouter's own limits. A rapid bot flow execution could exhaust OpenRouter rate limits. |
| 10 | **Cron jobs without idempotency guarantees** | LOW | While current cron jobs appear idempotent, there's no explicit idempotency key or dedup mechanism. If a cron run overlaps with the previous one, duplicate processing could occur. |
