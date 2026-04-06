# Pre-Launch Fix Report

> Generated from 18-part chunked codebase analysis
> Date: April 5, 2026
> Total Issues: 73 (21 HIGH, 24 MEDIUM, 28 LOW)

---

## Changelog

### April 5, 2026 — Phase 1 Complete (8 of 17 HIGH issues fixed)

| # | Issue | Status |
|---|---|---|
| 1 | Dual lockfiles | ✅ Fixed — deleted `package-lock.json`, added `packageManager` field |
| 2 | @faker-js/faker in runtime deps | ✅ Fixed — moved to devDependencies |
| 3 | postgres package unused | ✅ Fixed — removed from dependencies |
| 4 | No testing infrastructure | ✅ Fixed — Vitest + config + first test |
| 5 | No tests in CI pipeline | ✅ Fixed — added test step to ci.yml |
| 6 | Unprotected seed.ts / wipe.ts | ✅ Fixed — converted to internalMutation |
| 7 | No auth on messages.send / backfillWebhookSecrets | ✅ Fixed — added auth + ownership checks |
| 16 | Conflicting design system docs | ✅ Fixed — deleted MASTER.md, consolidated on .agent/DESIGN.md |
| 22 | No test script in package.json (MEDIUM) | ✅ Fixed — added as part of Issue 4 |

### April 5, 2026 — Phase 2 Complete (8 of 17 HIGH issues fixed → 2 remaining)

| # | Issue | Status |
|---|---|---|
| 11 | N+1 query in `dashboard.getHomeStats` | ✅ Fixed — serial loop → `Promise.all` parallel |
| 12 | `analytics.getProjectUsageSummary` uses `.collect()` | ✅ Fixed — `.take(N)` + sentinel values ("1000+", "100+", "50+") |
| 13 | Sidebar.tsx `Math.random()` SSR hydration | ✅ Fixed — moved to `useEffect` |
| 14 | No error boundaries in layout components | ✅ Fixed — `AppErrorBoundary` in all 5 shells |
| 17 | `conversations` table legacy bloat | ✅ Fixed — removed `leadId`, `firstText`, `typing`; documented active fields |
| 19 | `v.any()` used in ~12 fields | ✅ Fixed — reduced from 12→7 with explicit schemas for widgetConfig, attachments, schedule, configuration, nodes, edges, executionNodes |
| 20 | String-based references instead of `v.id()` | ✅ Fixed — `conversations.botId`, `departments.botId` → `v.id("bots")`; Clerk IDs documented |
| 21 | `bot_flows.nodes/edges/executionNodes` `v.any()` | ✅ Fixed — explicit `v.object()` schemas |

### April 5, 2026 — Phase 3 Complete (8 of 8 MEDIUM issues fixed)

| # | Issue | Status |
|---|---|---|
| 9 | Duplicated `ClerkIdentity` type in 4 files | ✅ Fixed — extracted to `convex/types.ts`, all 4 files import from shared |
| 10 | Inconsistent error throwing (Error vs ConvexError) | ✅ Fixed — `convex/errors.ts` helpers; 18 files standardized |
| 18 | No uniqueness constraints on email/phone | ✅ Fixed — composite indexes + dedup checks in create/update/batchImport |
| 22 | No test script in package.json | ✅ Fixed — done in Phase 1 (`test`, `test:watch`, `test:coverage`) |
| 23 | Missing `tailwind.config.ts` referenced in components.json | ✅ Fixed — set config to `""` (Tailwind v4 uses CSS-based config) |
| 24 | CSP allows `'unsafe-inline'` and `'unsafe-eval'` | ✅ Fixed — removed `unsafe-eval`, fixed legacy `api.openai.com` → `openrouter.ai` |
| 25 | No environment variable validation | ✅ Fixed — `src/lib/env.ts` with Zod schemas, validated at startup |
| 26 | No `.env.example` file | ✅ Fixed — created with all required vars documented |

### April 5, 2026 — Phase 4 Complete (7 of 7 MEDIUM issues fixed)

| # | Issue | Status |
|---|---|---|
| 27 | No optimistic UI updates in dashboard | ✅ Fixed — added `.withOptimisticUpdate()` to labels, canned responses, contacts, orders, bots, and knowledge bases mutations |
| 28 | ActiveProject always returns first project | ✅ Fixed — URL search param `?projectId=` + `ProjectSwitcher` dropdown in header |
| 29 | KbShell violates single responsibility | ✅ Fixed — extracted to `KbList`, `KbCreateDialog`, `KbDeleteDialog` (271→62 lines) |
| 30 | Admin redirect race condition | ✅ Fixed — loading skeleton shown during auth check; no flash of protected content |
| 31 | Duplicate chat/monitor layout patterns | ✅ Fixed — shared `ThreePanelLayout` component; `ChatShell` refactored |
| 32 | Hardcoded Toaster theme="light" | ✅ Fixed — installed `next-themes`; toasts now follow light/dark mode |
| 53 | No toast notifications for mutation errors | ✅ Fixed — added error toasts to `SiteHeader`, `NotificationBell`, `BotEditorClient` |

### April 5, 2026 — Phase 5 Discovered (4 new HIGH + 5 new MEDIUM from full analysis review)

> Discovered during comprehensive review of all 18 analysis findings documents. These issues were missed in the initial sweep.

### April 6, 2026 — Phase 5 Complete (8 of 9 issues fixed → 1 remaining)

| # | Issue | Status |
|---|---|---|
| 65 | Clerk webhook NO signature verification | ✅ Fixed — added Svix verification, `CLERK_WEBHOOK_SECRET` env var |
| 66 | No form validation (Zod unused) | ✅ Fixed — widget settings refactored to react-hook-form + Zod schema |
| 67 | i18n navigation inconsistency | ✅ Fixed — 28 files migrated to @/i18n/navigation |
| 68 | Dual design token system | ✅ Fixed — --lp-* tokens mapped to shadcn in @theme inline |
| 69 | No rate limiting on AI calls | ✅ Fixed — `checkAIRateLimit` utility + `AI_RATE_LIMIT_PER_HOUR` env |
| 70 | No feature flagging | ✅ Fixed — `useFeatureFlag` hook + `FEATURE_FLAGS` env var |
| 71 | Frontend deployment not in CI | ✅ Fixed — added deploy-frontend job to ci.yml |
| 72 | Mixed concerns in settings.ts | ⬜ Deferred — requires splitting 4 entities across files |
| 73 | Analytics `useAction` anti-pattern | ✅ Fixed — `useAnalyticsData` custom hook replaces 6 useEffect blocks |

**New HIGH Issues (6 remaining → 0 remaining):**
| # | Issue | Status |
|---|---|---|
| 65 | Clerk webhook NO signature verification | ✅ Fixed — Svix verification added |
| 66 | No form validation (Zod unused) | ✅ Fixed — widget settings uses react-hook-form |
| 67 | i18n navigation inconsistency | ✅ Fixed — 28 files updated |
| 68 | Dual design token system | ✅ Fixed — tokens mapped in @theme inline |

**New MEDIUM Issues (5 added → 4 fixed):**
| # | Issue | Status |
|---|---|---|
| 69 | No rate limiting on AI calls | ✅ Fixed — rate limiter utility created |
| 70 | No feature flagging | ✅ Fixed — hook + env var created |
| 71 | Frontend deployment not in CI | ✅ Fixed — deploy-frontend job added |
| 72 | Mixed concerns in settings.ts | ⬜ Deferred — document for later |
| 73 | Analytics `useAction` anti-pattern | ✅ Fixed — custom hook created |

---

## How to Use This Document

- Work through **HIGH** issues first — these block launch
- Then address **MEDIUM** issues — should be fixed before launch
- **LOW** issues are post-launch improvements
- Each issue includes: source part, risk description, and recommended fix
- Check off items as you complete them

---

## 🔴 HIGH — Must Fix Before Launch (21 issues) → 6 remaining

### Dependencies & Build

- [x] **1. Dual lockfiles (bun.lock + package-lock.json)**
  - **Part:** 01
  - **Risk:** Inconsistent installs between developers and CI
  - **Fix:** Delete `package-lock.json`, commit to using Bun only in CI and locally

- [x] **2. `@faker-js/faker` in runtime deps**
  - **Part:** 01
  - **Risk:** Bundled into production build unnecessarily
  - **Fix:** Move `@faker-js/faker` from `dependencies` to `devDependencies` in package.json

- [x] **3. `postgres` package unclear usage**
  - **Part:** 01
  - **Risk:** Unused dependency adding bundle weight and confusion (Convex handles database)
  - **Fix:** Search codebase for `postgres` imports. If unused, remove from package.json

### Testing

- [x] **4. No testing infrastructure**
  - **Part:** 16
  - **Risk:** Zero safety net for code changes, regressions guaranteed
  - **Fix:** Install Vitest, add `"test": "vitest"` to package.json scripts, create `vitest.config.ts`, write tests for critical paths (auth, mutations, key components)

- [x] **5. No tests in CI pipeline**
  - **Part:** 17
  - **Risk:** Bad code can merge and deploy undetected
  - **Fix:** Add `bun run test` step to `.github/workflows/ci.yml` between lint and build steps

### Security & Auth

- [x] **6. Unprotected `seed.ts` and `wipe.ts`**
  - **Part:** 06
  - **Risk:** Anyone with projectId can wipe all data or seed fake data
  - **Fix:** Add `requireAdmin()` auth checks to both functions, or remove them from production builds entirely

- [x] **7. No auth check on `messages.send` and `webhooks.backfillWebhookSecrets`**
  - **Part:** 06
  - **Risk:** Unauthorized message injection, webhook secret exposure
  - **Fix:** Add `ctx.auth.getUserIdentity()` identity checks at the top of both functions

- [ ] **8. Widget endpoints completely public**
  - **Part:** 07
  - **Risk:** Data scraping if projectId is discovered; rate limiting alone is insufficient
  - **Fix:** Review rate limiting thresholds, consider adding HMAC signing for widget requests, restrict data returned to only what widget needs

- [x] **9. Duplicated `ClerkIdentity` type in 4 files**
  - **Part:** 07
  - **Risk:** Maintenance burden — if Clerk changes JWT claim structure, all 4 copies must be updated
  - **Fix:** Extract to shared types file (e.g., `src/types/auth.ts` or `convex/types.ts`), import everywhere

- [x] **10. Inconsistent error throwing (Error vs ConvexError)**
  - **Part:** 07
  - **Risk:** Clients receive different error shapes, making error handling unpredictable
  - **Fix:** Standardize on `ConvexError` for all auth/authorization failures across all Convex functions

### Performance

- [x] **11. N+1 query in `dashboard.getHomeStats`**
  - **Part:** 05
  - **Risk:** Up to 20 sequential DB reads on every dashboard load (message queries in serial loop)
  - **Fix:** Replace with batch query using `ctx.db.query().withIndex().filter().collect()` or pre-compute wait times

- [x] **12. `analytics.getProjectUsageSummary` uses `.collect()`**
  - **Part:** 05
  - **Risk:** Full table scans on conversations, bots, knowledgeBases, project_usage — will degrade as data grows
  - **Fix:** Replace with paginated aggregation using `ctx.runQuery()` in pagination loops

### UI & UX

- [x] **13. Sidebar.tsx `Math.random()` causes SSR hydration mismatch**
  - **Part:** 09
  - **Risk:** React hydration errors, flickering skeleton width on load
  - **Fix:** Use `useState` with `useEffect` to generate random width only on client side

- [x] **14. No error boundaries in layout components**
  - **Part:** 10
  - **Risk:** Single component crash takes down entire layout with no graceful degradation
  - **Fix:** Add error boundaries to shell components (`DashboardShell`, `ChatShell`, `KbShell`, etc.)

### Documentation

- [ ] **15. No root README.md**
  - **Part:** 18
  - **Risk:** New developers have no entry point; repo looks empty/unmaintained
  - **Fix:** Create `README.md` with project description, tech stack, setup instructions, scripts, and links to docs/

- [x] **16. Conflicting design system documents**
  - **Part:** 11, 18
  - **Risk:** `design-system/yoosr/MASTER.md` (Flat Design, no shadows, Fira Code) conflicts with `.agent/DESIGN.md` (shadows, Inter font). Developers implement wrong tokens.
  - **Fix:** Delete outdated `design-system/yoosr/MASTER.md` OR update it to match `.agent/DESIGN.md` exactly

### Schema & Data

- [x] **17. `conversations` table has 39 fields with legacy bloat**
  - **Part:** 04
  - **Risk:** Table contains legacy fields (`leadId`, `firstText`, `participants`, `tags`, `attributes`, `typing`, `currentNodeId`, `botStepCount`, `executionLog`) alongside current fields. Schema confusion, wasted storage.
  - **Fix:** Clean up legacy fields. The `conversation_bot_state` table was already created — migrate remaining legacy fields there or remove them.

- [x] **18. No uniqueness constraints on email/phone**
  - **Part:** 04
  - **Risk:** Duplicate contacts can be created for the same person within a project
  - **Fix:** Add mutation-level dedup checks (partially done in batchImport), or add unique indexes on `contacts` for email+projectId composite

- [x] **19. `v.any()` used in ~12 fields (no schema validation)**
  - **Part:** 04
  - **Risk:** `widgetConfig`, `configuration`, `credentials`, `attachments`, `metadata`, `attributes`, `typing`, `schedule`, `variables` accept any JSON shape. Invalid data can corrupt features.
  - **Fix:** Define explicit `v.object()` schemas for critical fields, especially `credentials` (integrations), `widgetConfig` (projects), `attributes` (conversation_bot_state)

- [x] **20. String-based references instead of `v.id()` in critical fields**
  - **Part:** 04
  - **Fields:** `conversations.visitorId` (string not `v.id("profiles")`), `conversations.assignedTo` (string), `conversations.botId` (string not `v.id("bots")`), `departments.botId` (string), `createdBy` fields (string)
  - **Risk:** No referential integrity — can reference non-existent users/bots. Silent failures.
  - **Fix:** Migrate to `v.optional(v.id("profiles"))` and `v.optional(v.id("bots"))` where applicable. Requires data migration.

- [x] **21. `bot_flows.nodes`, `edges`, `executionNodes` all `v.array(v.any())`**
  - **Part:** 04
  - **Risk:** No schema validation for bot flow structure. Invalid flow data saves without errors, causing runtime crashes in bot engine.
  - **Fix:** Define `v.object()` schemas for node and edge structures, or add strict validation in `botFlows.save` mutation

### Security (NEW — Phase 5 Discovery)

- [x] **65. Clerk webhook NO signature verification**
  - **Part:** 08
  - **File:** `convex/http.ts` — `/clerk-webhook` endpoint
  - **Risk:** Processes `user.created`, `user.updated`, `organization.deleted` events without verifying request origin. An attacker can forge POST requests to create/delete users or entire projects.
  - **Fix:** Installed Svix SDK. Replaced raw `request.json()` with signature verification flow: read raw body → verify with `webhook.verify()` → parse JSON. Returns 401 for invalid signatures. Added `CLERK_WEBHOOK_SECRET` env var.

### Quality & Functionality (NEW — Phase 5 Discovery)

- [x] **66. No form validation**
  - **Part:** 13, 14
  - **Risk:** `react-hook-form` + Zod installed but unused. Forms use manual `useState`/`useReducer` with no schema validation.
  - **Fix:** Widget settings refactored: created `schema.ts` with Zod validation, replaced `useReducer` (16 action types) with `useForm`. Added inline error display, submit button disabled while invalid. Integration schemas created for future migration.

- [x] **67. i18n navigation inconsistency**
  - **Part:** 12
  - **Risk:** 28 files imported from `next/navigation` instead of `@/i18n/navigation`, breaking locale prefixes.
  - **Fix:** Updated 28 files to import from `@/i18n/navigation`. Added `useSearchParams`/`useParams` re-exports. Landing pages preserved (documented).

### Maintainability (NEW — Phase 5 Discovery)

- [x] **68. Dual design token system**
  - **Part:** 11
  - **Risk:** Landing pages use `--lp-*` variables while app uses shadcn OKLCH tokens — no mapping between them.
  - **Fix:** Mapped `--lp-*` tokens to `@theme inline` with shadcn equivalents. Added documentation block explaining token usage. Landing pages now render correctly in both light and dark modes.

---

## 🟡 MEDIUM — Should Fix Before Launch (24 issues)

### Dependencies & Build

- [x] **22. No test script in package.json**
  - **Part:** 01
  - **Fix:** Add `"test": "vitest run"` and `"test:watch": "vitest"` to scripts (after installing Vitest)

- [x] **23. Missing `tailwind.config.ts` referenced in components.json**
  - **Part:** 02
  - **Fix:** Create the file OR remove the reference from components.json (Tailwind v4 may not need it)

- [x] **24. CSP allows `'unsafe-inline'` and `'unsafe-eval'`**
  - **Part:** 02
  - **Risk:** Reduced XSS protection despite having CSP headers
  - **Fix:** Consider nonce-based scripts post-launch, or at minimum remove `unsafe-eval` if possible

### Auth & Security

- [x] **25. No environment variable validation**
  - **Part:** 02, 17
  - **Risk:** Runtime errors from missing env vars discovered late
  - **Fix:** Add `@t3-oss/env-nextjs` or create a validation module at startup

- [x] **26. No `.env.example` file**
  - **Part:** 17, 18
  - **Risk:** New developers must guess required environment variables
  - **Fix:** Create `.env.example` with all required vars documented (Clerk keys, Convex URL, OpenRouter key, VAPID keys, encryption key)

### State Management

- [x] **27. No optimistic UI updates in dashboard**
  - **Part:** 14
  - **Risk:** Laggy UX on mutations, especially on slower connections
  - **Fix:** Added `.withOptimisticUpdate()` to mutations for labels (create/delete), canned responses (create/update/delete), contacts (create/delete), orders (status/delete), bots (create/update/delete), knowledge bases (create/delete)

- [x] **28. ActiveProject always returns first project**
  - **Part:** 14
  - **Risk:** No project switching for multi-project orgs; hardcoded to `projects[0]`
  - **Fix:** URL search param `?projectId=` + `ProjectSwitcher` dropdown component in header; falls back to first project if not specified

### Layout & UX

- [x] **29. KbShell violates single responsibility**
  - **Part:** 10
  - **Risk:** 230+ line component combining layout, data fetching, CRUD state, create dialogs, delete dialogs
  - **Fix:** Split into `KbShell` (layout wrapper) + `KbList` (data + list) + `KbCreateDialog` + `KbDeleteDialog`

- [x] **30. Admin redirect race condition (flash before redirect)**
  - **Part:** 10
  - **Risk:** Non-admin users briefly see settings/design-studio layout before redirect
  - **Fix:** Show loading skeleton during auth check instead of rendering content then redirecting

- [x] **31. Duplicate chat/monitor layout patterns**
  - **Part:** 10
  - **Risk:** Two nearly identical 3-panel responsive implementations with no shared abstraction
  - **Fix:** Extracted shared `ThreePanelLayout` component; refactored `ChatShell` to use it

- [x] **32. Hardcoded Toaster theme="light"**
  - **Part:** 11
  - **Risk:** Toasts look wrong in dark mode
  - **Fix:** Installed `next-themes`; created `AppToaster` wrapper that reads theme from context

### Backend & Performance

- [ ] **33. No structured logging**
  - **Part:** 08
  - **Risk:** All error logging uses raw `console.error` — no correlation IDs, no log levels, no monitoring
  - **Fix:** Add structured logging library (e.g., pino) with correlation IDs and log levels

- [ ] **34. No retry logic for LLM calls**
  - **Part:** 08
  - **Risk:** AI features break completely on OpenRouter downtime
  - **Fix:** Add retry with exponential backoff in `openrouter.ts`

- [ ] **35. Telegram webhook GET returns 200 unconditionally**
  - **Part:** 08
  - **Risk:** Anyone can "verify" a webhook without a valid token
  - **Fix:** Add token verification or remove the GET handler entirely

- [ ] **36. No schema-level TTL or data expiration**
  - **Part:** 04
  - **Tables:** `activity_logs`, `webhook_deliveries`, `token_usage`, `csat_ratings`
  - **Risk:** Append-only tables grow unbounded with no automatic cleanup
  - **Fix:** Add cron jobs for data expiration (notifications already has cleanup at 50/user)

- [ ] **37. `contacts.tags` is unstructured `v.array(v.string())`**
  - **Part:** 04
  - **Risk:** No tag validation, no color coding, inconsistent free-text tags
  - **Fix:** Either document as-is, or migrate to the separate `labels` table with proper tag management

- [ ] **38. `conversations.status` uses magic numbers (100/200/1000)**
  - **Part:** 04
  - **Risk:** Developers must memorize that 100=new, 200=active, 1000=resolved
  - **Fix:** Add JSDoc comments to schema or create `CONVERSATION_STATUS` constant enum in shared types

- [ ] **39. `knowledge_base_chunks.embedding` model undocumented in schema**
  - **Part:** 04
  - **Risk:** If embedding model changes, existing vectors become incompatible
  - **Fix:** Add a `modelVersion` field or document the model used in schema comments

### Development Experience

- [ ] **40. No staging environment**
  - **Part:** 17
  - **Risk:** Changes go straight from PR preview to production
  - **Fix:** Add staging branch/branch preview in Vercel, or use Vercel's preview deployment workflow

- [ ] **41. No deployment notifications in CI**
  - **Part:** 17
  - **Risk:** Team won't know about deployment failures unless they check GitHub Actions
  - **Fix:** Add Slack/Discord/email notification step to CI workflow on failure

- [ ] **42. No rollback strategy**
  - **Part:** 17
  - **Risk:** No automated or documented rollback process for failed deployments
  - **Fix:** Document Vercel dashboard rollback steps, add Convex deployment history tracking

- [ ] **43. No CONTRIBUTING.md**
  - **Part:** 18
  - **Risk:** No guidance on PR format, code review process, branch naming, commit conventions
  - **Fix:** Create CONTRIBUTING.md with PR template, conventions, testing requirements

### Cost & Operations (NEW — Phase 5 Discovery)

- [x] **69. No rate limiting on AI calls**
  - **Part:** 08
  - **File:** `convex/openrouter.ts`
  - **Risk:** `openrouter.ts` has no rate limiting — relies entirely on OpenRouter's own limits. A rapid bot flow execution or infinite loop in bot logic could exhaust OpenRouter rate limits or generate unexpected costs. No per-project quota enforcement.
  - **Fix:** Created `checkAIRateLimit` utility in `convex/lib/aiRateLimiter.ts` using `project_usage` table. Added `AI_RATE_LIMIT_PER_HOUR` env var (default: 100). Throws clear `ConvexError` when limit exceeded.

- [x] **70. No feature flagging**
  - **Part:** 15
  - **Risk:** No system for gradual rollout, A/B testing, or emergency feature disable. All features are either fully deployed or hardcoded "Coming Soon". If a new integration causes issues, you must deploy a code fix — can't flip a switch.
  - **Fix:** Created `isFeatureEnabled()` for backend/SSR and `useFeatureFlag()` hook for frontend. `FEATURE_FLAGS` env var accepts comma-separated key:value pairs (e.g., `ai_bot:true,advanced_analytics:false`).

### Deployment (NEW — Phase 5 Discovery)

- [x] **71. Frontend deployment not in CI**
  - **Part:** 17
  - **Risk:** Next.js deployment appears to be via Vercel Git integration (separate from GitHub Actions). The CI quality gate (lint → test → build) runs but does NOT block frontend deployments — Vercel deploys on any push to connected branch regardless of CI status.
  - **Fix:** Added `deploy-frontend` job to `.github/workflows/ci.yml`. Runs on main pushes after quality-gates. Uses Vercel CLI with `--prod` flag. Documented required GitHub secrets.

### Code Quality (NEW — Phase 5 Discovery)

- [ ] **72. Mixed concerns in `convex/settings.ts`**
  - **Part:** 05, 06
  - **Risk:** `settings.ts` contains CRUD for 4 different entities: departments, canned responses, labels, AND operating hours. 18 functions in one file. A TODO comment in the file acknowledges: "TODO: move createLabel and removeLabel to convex/labels.ts for consistency."
  - **Fix:** Split into 4 files: `departments.ts`, `cannedResponses.ts`, `labels.ts`, `operatingHours.ts`. Each file gets its own queries + mutations. Update all import sites.

- [x] **73. Analytics `useAction` anti-pattern**
  - **Part:** 13, 14
  - **File:** `src/app/[locale]/dashboard/analytics/page.tsx`
  - **Risk:** 6 `useAction` calls each paired with manual `useEffect` + `isMounted` guard + `useState` for data storage. This is a verbose, error-prone pattern repeated 6 times. No cleanup if component unmounts during fetch, no shared loading state, no error handling consistency.
  - **Fix:** Created `useAnalyticsData(projectId, dateRange)` custom hook in `src/hooks/useAnalyticsData.ts`. Fetches all 6 data sources in parallel with `Promise.all`. Unified loading/error states. Proper cleanup on unmount. Reduced page from ~150 to ~90 lines.

---

## 🟢 LOW — Fix Post-Launch (22 issues)

- [ ] **44. Missing npm scripts (format, type-check)**
  - **Part:** 01
  - **Fix:** Add `"format": "prettier --write"` and `"type-check": "tsc --noEmit"`

- [ ] **45. Large bundle size potential (xlsx, openai, recharts)**
  - **Part:** 01
  - **Fix:** Run bundle analyzer, check actual sizes, consider dynamic imports for heavy libs

- [ ] **46. No bundle analysis configured**
  - **Part:** 17
  - **Fix:** Add `@next/bundle-analyzer` to track bundle size over time

- [ ] **47. No CHANGELOG.md**
  - **Part:** 18
  - **Fix:** Add with Keep a Changelog format

- [ ] **48. No LICENSE file**
  - **Part:** 18
  - **Fix:** Add appropriate license

- [ ] **49. 6 redundant CORS OPTIONS routes**
  - **Part:** 08
  - **Fix:** Consolidate into single CORS handler or use middleware

- [ ] **50. Potential animation bloat (25+ keyframes, many unused)**
  - **Part:** 11
  - **Fix:** Audit and remove unused keyframe animations from globals.css

- [ ] **51. Marketing tokens not mapped to @theme inline**
  - **Part:** 11
  - **Risk:** `--lp-*` tokens can't be used as Tailwind utilities
  - **Fix:** Map to `@theme inline` so `bg-lp-gold` etc. work

- [ ] **52. No infinite scroll (load-more only)**
  - **Part:** 14
  - **Fix:** Add intersection observer for infinite scroll on paginated lists

- [x] **53. No toast notifications for mutation errors**
  - **Part:** 14
  - **Fix:** Added error toasts to `SiteHeader`, `NotificationBell`, `BotEditorClient`; most other mutations already had toast handling

- [ ] **54. No breadcrumb component**
  - **Part:** 10
  - **Fix:** Add breadcrumb navigation to dashboard header

- [ ] **55. Hardcoded nav items**
  - **Part:** 10
  - **Fix:** Consider making nav items configurable via settings or CMS

- [ ] **56. Inconsistent page wrapper pattern**
  - **Part:** 10
  - **Fix:** Create unified `PageWrapper` component for consistent spacing

- [ ] **57. testing_guide.md.resolved artifact**
  - **Part:** 18
  - **Fix:** Clean up or remove the `.resolved` suffix file

- [ ] **58. No versioning on SPEC files**
  - **Part:** 18
  - **Fix:** Add status markers (Implemented / In Progress / Planned) and dates

- [ ] **59. No audit logging for auth events**
  - **Part:** 07
  - **Fix:** Log auth denials and admin actions to activity_logs

- [ ] **60. `projects.status` field not enforced with union literals**
  - **Part:** 04
  - **Fix:** Either enforce with `v.union(v.literal("active"), v.literal("inactive"), v.literal("archived"))` or remove if unused

- [ ] **61. `activity_logs` has duplicate field naming**
  - **Part:** 04
  - **Fields:** `actionType` vs `action`, `userId` vs `actorId`
  - **Fix:** Consolidate to one naming convention

- [ ] **62. `messages` table has legacy channel fields**
  - **Part:** 04
  - **Fields:** `channel`, `senderFullname`, `status`, `type` — all legacy
  - **Fix:** Migrate or remove

- [ ] **63. No `updatedAt` timestamps on most tables**
  - **Part:** 04
  - **Tables missing updatedAt:** `bots`, `bot_flows`, `knowledge_bases`, `contacts`, `orders`, `labels`, `departments`
  - **Fix:** Add `updatedAt: v.number()` to critical tables

- [ ] **64. `feedback` table uses `orgId` string, not `v.id("projects")`**
  - **Part:** 04
  - **Fix:** Change to `v.optional(v.id("projects"))` if project-scoped, or document the orgId string pattern

---

## Quick Stats

| Category | HIGH | MEDIUM | LOW | Total |
|----------|------|--------|-----|-------|
| Dependencies & Build | 0 | 2 | 2 | 7 |
| Testing | 0 | 0 | 1 | 3 |
| Security & Auth | 1 | 1 | 1 | 9 |
| Performance | 0 | 4 | 2 | 8 |
| UI & UX | 0 | 0 | 2 | 8 |
| Documentation | 1 | 1 | 4 | 7 |
| Schema & Data | 1 | 5 | 5 | 15 |
| Backend & Ops | 0 | 7 | 2 | 12 |
| Developer Experience | 0 | 4 | 3 | 7 |
| Quality | 1 | 0 | 0 | 1 |
| Maintainability | 1 | 0 | 0 | 1 |
| **Total** | **6** | **24** | **22** | **73** |

---

## Source Parts Summary

| Part | Title | Issues Found |
|------|-------|-------------|
| 01 | Package Dependencies | 6 |
| 02 | Build Tooling Config | 4 |
| 03 | Project Structure | 0 (covered by other parts) |
| 04 | Database Schema | 14 |
| 05 | Queries | 4 (+1: #72 settings.ts) |
| 06 | Mutations | 3 |
| 07 | Auth & Authorization | 6 |
| 08 | Backend Utilities | 7 (+2: #65 Clerk webhook, #69 AI rate limiting) |
| 09 | Core UI Components | 1 |
| 10 | Layout Components | 5 |
| 11 | Design Tokens & Styling | 5 (+1: #68 dual token system) |
| 12 | App Routing | 1 (+1: #67 i18n navigation) |
| 13 | Page Components | 1 (+1: #73 analytics anti-pattern) |
| 14 | State Management | 4 (+1: #66 form validation) |
| 15 | Feature Modules | 2 (+2: #70 feature flagging, #71 frontend deploy) |
| 16 | Testing Infrastructure | 3 |
| 17 | CI/CD & Deployment | 6 (+1: #71 frontend deploy) |
| 18 | Documentation & DX | 6 |

---

## Recommended Fix Order

### Phase 1: Critical Security & Stability (Week 1)
Issues: 1, 4, 5, 6, 7, 8, 15 → **1, 2, 3, 4, 5, 6, 7, 16 ✅ DONE**

### Phase 2: Performance & Schema (Week 2)
Issues: 11 ✅, 12 ✅, 17 ✅, 19 ✅, 20 ✅, 21 ✅, 13 ✅, 14 ✅ → **8/8 DONE**

### Phase 3: Auth & Quality (Week 3)
Issues: 9 ✅, 10 ✅, 18 ✅, 22 ✅, 23 ✅, 24 ✅, 25 ✅, 26 ✅ → **8/8 DONE**

### Phase 4: UX & Polish (Week 4)
Issues: 27 ✅, 28 ✅, 29 ✅, 30 ✅, 31 ✅, 32 ✅, 53 ✅ → **7/7 DONE**

### Phase 5: New HIGH Priority — Security & Quality Blockers
Issues: 65, 66, 67, 68 → **4/4 DONE** (all newly discovered)

> **Priority order:**
> 1. **#65 Clerk webhook signature** — Critical security hole, 1-2 hour fix
> 2. **#66 Form validation** — All forms unvalidated, Zod infrastructure already exists
> 3. **#67 i18n navigation** — 25+ files breaking locale prefixes
> 4. **#68 Dual design tokens** — Landing/app token inconsistency

### Phase 6: New MEDIUM — Code Quality & Ops
Issues: 69, 70, 71, 72, 73 → **3/5 DONE** (#72 settings.ts split, #34 LLM retry, #36 data TTL)

| # | Issue | Status |
|---|---|---|
| 72 | Mixed concerns in `convex/settings.ts` | ✅ Fixed — split into `departments.ts`, `cannedResponses.ts`, `labels.ts`, `operatingHours.ts` |
| 34 | No retry logic for LLM calls | ✅ Fixed — exponential backoff + jitter, skips 4xx errors, configurable via env |
| 36 | No schema-level TTL or data expiration | ✅ Fixed — 7 cleanup cron jobs for append-only tables, staggered schedules, .take(1000) batching |

### Phase 7: Post-Launch LOW Priority
Issues: 44-64 (as time permits)
