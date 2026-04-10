# Part 08: Backend Utilities & Helpers — Updated Findings

## ✅ New Modules Added

### `convex/lib/auth.ts`
- `assertConversationOwnership(ctx, id, identity)` — Throws on cross-tenant access
- `checkConversationOwnership(ctx, id, identity)` — Returns boolean (non-throwing)
- Tested: 9 test cases in `convex/lib/auth.test.ts`

### `convex/lib/softDelete.ts`
- `softDelete(ctx.db, id)` — Sets `deletedAt` timestamp
- `restoreSoftDelete(ctx.db, id)` — Clears `deletedAt`
- `filterActive(q)` — Query filter excluding soft-deleted records
- `isSoftDeleted(doc)` — Check if document is soft-deleted
- Tested: 7 test cases in `convex/lib/softDelete.test.ts`

### `convex/lib/jsonExtract.ts`
- `extractJsonObject(text)` — Robust bracket-counting JSON extractor
- Handles: markdown fences, preamble text, trailing commas, nested objects, escaped quotes, multiple JSON blocks
- Tested: 14 test cases in `convex/lib/jsonExtract.test.ts`
- Used by: `convex/aiFlowBuilder.ts` (replaced fragile regex)

### `convex/lib/env.ts`
- `requireEnv(name, value)` — Validates env var presence in production
- Used by: `bot.ts`, `integrations.ts`, `conversations.ts`, `openrouter_api.ts`

## ✅ Cron Job Count: 11 → 13

**New cron jobs:**
- `cleanupExpiredConversations` — Daily 3 AM, soft-deletes TTL-expired conversations + messages
- `cleanupOldSoftDeletes` — Sunday 6 AM, permanently deletes soft-deleted records >30 days old

## ✅ AI JSON Parsing Fixed

`convex/aiFlowBuilder.ts` now uses `extractJsonObject()` instead of regex-based markdown fence stripping. Handles all edge cases: preamble text, multiple JSON blocks, trailing commas, nested structures.

## Still Accurate (Unchanged from Original Analysis)

- `convex/utils.ts`: `requireAdmin`, `assertProjectOwnership`, `checkProjectOwnership`
- `convex/lib/crypto.ts`: AES-256-GCM encryption for secrets
- `convex/lib/logger.ts`: Structured logging
- `convex/openrouter.ts`: Retry/backoff with 4xx vs 5xx differentiation
- Rate limiting via `@convex-dev/rate-limiter` on widget HTTP endpoints
- Webhook verification: Svix, HMAC-SHA256, Telegram secret token
- Encrypted multi-tenant API keys

## Outstanding Concerns

- **LOW**: Cron jobs still use `.take(1000)` — could under-clean at massive scale
- **LOW**: No local LLM caching for AI responses
