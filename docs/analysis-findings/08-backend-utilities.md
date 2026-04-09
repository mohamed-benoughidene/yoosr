# Part 08: Backend Utilities & Helpers

## 📊 Visual Map

```
convex/
├── utils.ts               → Shared utility functions (role checking, ownership auth)
├── lib/                   → Library/helper modules
│   ├── crypto.ts          → Cryptographic functions (encrypt/decrypt secrets)
│   ├── env.ts             → Environment variable loading 
│   ├── logger.ts          → Logging utility
│   └── aiRateLimiter.ts   → Rate limiting for AI
├── convex.config.ts       → Convex configuration (applies rate limiter)
├── http.ts                → HTTP endpoint handlers (Widget, Meta webhooks, Telegram, Clerk)
├── crons.ts               → Scheduled/cron jobs declarations
├── cron.ts                → Scheduled job implementations (mutations)
├── openrouter.ts          → OpenRouter API integration (OpenAI SDK wrapper, retry logic)
├── openrouter_api.ts      → OpenRouter API key management (encrypt/decrypt keys)
├── aiFlowBuilder.ts       → AI flow building logic (bot conversation generation via AI)
├── getAny.ts              → Generic data fetchers (getFirstProject)
└── _generated/            → Auto-generated Convex code
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/utils.ts` | Shared utility functions for role and project ownership checks |
| `convex/lib/` | Library modules: crypto, env checking, logger, and AI rate limiting |
| `convex/convex.config.ts` | Convex instance configuration, explicitly sets up rate limiting middleware |
| `convex/http.ts` | Extensive HTTP API endpoints handling widget interactions, Clerk webhooks, Meta/WhatsApp webhooks, and Telegram integrations |
| `convex/crons.ts` | Cron job scheduling for data retention and cleanup processes |
| `convex/cron.ts` | Actual implementations (mutations) for the cron jobs |
| `convex/openrouter.ts` | Core OpenRouter/LLM logic using OpenAI SDK, heavily implements backoff & retry |
| `convex/openrouter_api.ts` | Key management module for storing encrypted API keys securely for user projects |
| `convex/aiFlowBuilder.ts` | Generates a React Flow JSON flow by mapping a text prompt through AI |
| `convex/getAny.ts` | Simple global helper queries |

## ✅ Analysis Checklist

- [x] What utility functions exist in `utils.ts`?
  - `requireAdmin`: Checks `org_role`.
  - `assertProjectOwnership` & `checkProjectOwnership`: Used across many mutations/queries to guarantee users only affect data within their assigned `org_id` context.
- [x] Are utilities reusable and well-organized?
  - Yes, they are highly reusable. Functions cleanly encapsulate Convex contexts (`QueryCtx`, `MutationCtx`) and external identity.
- [x] What's in the `lib/` directory?
  - Contains modular integrations including `crypto.ts` for encrypted keys, `logger.ts`, `env.ts` for strictly typed environment checks, and `aiRateLimiter.ts`.
- [x] How are external API calls structured? (OpenRouter, etc.)
  - `convex/openrouter.ts` uses the `openai` NodeJS SDK but configured with the OpenRouter API base URL (`https://openrouter.ai/api/v1`). Provides specialized wrappers like `callAITask` and `callAIAssistant`.
- [x] Is there error handling for API failures?
  - Yes, in `openrouter.ts`, it specifically differentiates between 4xx client errors (which are thrown immediately) and 5xx or timeouts which trigger the backoff/retry loop.
- [x] Are there retry mechanisms?
  - Implemented effectively in `openrouter.ts` using `retryWithBackoff(fn)`. Defaults to 3 retries (via env var `LLM_RETRY_MAX_ATTEMPTS`) with exponential backoff and jitter. 
- [x] What HTTP endpoints are exposed?
  - Webhooks: `/clerk-webhook` (Clerk auth), `/webhooks/meta` (WhatsApp/Messenger/IG), `/webhooks/telegram`.
  - Widget Endpoints: `/widget/conversations`, `/widget/messages`, `/widget/project`, `/widget/upload-url`, `/widget/conversations/rate`, `/widget/conversations/get`.
- [x] How are webhooks handled?
  - Validated using secure methods: Clerk uses `svix`, Meta explicitly verifies `X-Hub-Signature-256`, and Telegram uses `X-Telegram-Bot-Api-Secret-Token`.
- [x] What cron jobs are defined?
  - High-frequency: auto-close inactive conversations (5m), retry routing (5m), cleanup stale presence (60s).
  - Daily/Weekly (staggered execution times): Data retention cleanup jobs spanning `activityLogs`, `webhookDeliveries`, `tokenUsage`, `csatRatings`, `conversationEvents`. Records are evaluated locally, e.g. keeping logs for 90-180 days.
- [x] Are scheduled tasks idempotent?
  - Yes, they target specifically timed metadata filtering with `.take(1000)` batches to clean up safely without relying on state between iterations.
- [x] How is rate limiting implemented? (`@convex-dev/rate-limiter`)
  - Enforced middleware via `convex.config.ts`.
  - Explicit rate limits in `http.ts` for widget behaviors: 60s windows for `/widget/conversations` (fixed, limit 5) and `/widget/messages` (token bucket, rate 20).
- [x] What's the AI integration pattern?
  - The AI endpoints leverage `openrouter_api.ts` to decode User/Project-specific API Keys. Core AI wrappers separate zero-shot (`callAITask`) vs conversational memory (`callAIAssistant`). `aiFlowBuilder.ts` pushes highly specific JSON schemas into the prompt context to synthesize React Flow layouts directly.
- [x] Are there caching patterns for external API calls?
  - No explicit caching layer for external API calls inside Convex functions.
- [x] How are API keys and secrets managed?
  - Securely encrypted via `crypto.subtle`. Handled extensively by `openrouter_api.ts` which requires a primary `ENCRYPTION_KEY` environment variable.
- [x] Is there logging/monitoring infrastructure?
  - There is a `convex/lib/logger.ts`. Errors in HTTP endpoints (e.g., Clerk webhook logic) frequently use `logger.error()`. Activities use `activityLog` entries but that correlates to user-audit data.

## 📝 Agent Findings

### Well-Strutured Webhooks
The webhook integration handling for third-party bots (Meta, Telegram, Clerk) built directly into `http.ts` applies exact signature parsing logic. Specifically utilizing raw-body parsers before parsing object data for `svix` correctly preserves payload hashes.

### Rate Limiter Maturity
Rate-limiting using `@convex-dev/rate-limiter` directly inside the critical widget HTTP functions mitigates aggressive Denial of Wallet (DoW) attacks on database resources.

### API Backoff Capabilities
`convex/openrouter.ts`'s retry logic demonstrates mature error handling, preventing unnecessary loops for authentication errors (4xx) while safely retrying unpredictable LLM load errors (5xx) with jitter.

## 🔍 Key Patterns to Identify
- **Encrypted Multi-Tenant Keys**: Project-based API keys are individually encrypted using the main application secret securely avoiding plaintext leaks in the database.
- **Batched CRON Operations**: Database cleanup uses `.take(1000)` limit thresholds iteratively dropping data instead of risking lambda timeout on massive table wipes.
- **Constant Time Compare**: `convex/http.ts` uniquely relies on standard implementation of `constantTimeCompare` utilizing node-equivalent byte checking for timing-attack prevention on Meta signatures.

## ⚠️ Potential Concerns to Watch For
- **LOW:** The cron jobs rely on `take(1000)` iteration logic every 24hrs for most jobs. If an organization generates > 1000 events daily, it will technically infinitely queue. Increasing cron frequency or increasing `.take()` scale may be needed later.
- **LOW:** No explicit local caching behavior for LLM generations.
