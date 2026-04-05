# Pre-Launch Fix Report

> Generated from 18-part chunked codebase analysis
> Date: April 5, 2026
> Total Issues: 64 (17 HIGH, 25 MEDIUM, 22 LOW)

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

---

## How to Use This Document

- Work through **HIGH** issues first — these block launch
- Then address **MEDIUM** issues — should be fixed before launch
- **LOW** issues are post-launch improvements
- Each issue includes: source part, risk description, and recommended fix
- Check off items as you complete them

---

## 🔴 HIGH — Must Fix Before Launch (17 issues) → 2 remaining

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

- [ ] **9. Duplicated `ClerkIdentity` type in 4 files**
  - **Part:** 07
  - **Risk:** Maintenance burden — if Clerk changes JWT claim structure, all 4 copies must be updated
  - **Fix:** Extract to shared types file (e.g., `src/types/auth.ts` or `convex/types.ts`), import everywhere

- [ ] **10. Inconsistent error throwing (Error vs ConvexError)**
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

- [ ] **18. No uniqueness constraints on email/phone**
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

---

## 🟡 MEDIUM — Should Fix Before Launch (25 issues)

### Dependencies & Build

- [x] **22. No test script in package.json**
  - **Part:** 01
  - **Fix:** Add `"test": "vitest run"` and `"test:watch": "vitest"` to scripts (after installing Vitest)

- [ ] **23. Missing `tailwind.config.ts` referenced in components.json**
  - **Part:** 02
  - **Fix:** Create the file OR remove the reference from components.json (Tailwind v4 may not need it)

- [ ] **24. CSP allows `'unsafe-inline'` and `'unsafe-eval'`**
  - **Part:** 02
  - **Risk:** Reduced XSS protection despite having CSP headers
  - **Fix:** Consider nonce-based scripts post-launch, or at minimum remove `unsafe-eval` if possible

### Auth & Security

- [ ] **25. No environment variable validation**
  - **Part:** 02, 17
  - **Risk:** Runtime errors from missing env vars discovered late
  - **Fix:** Add `@t3-oss/env-nextjs` or create a validation module at startup

- [ ] **26. No `.env.example` file**
  - **Part:** 17, 18
  - **Risk:** New developers must guess required environment variables
  - **Fix:** Create `.env.example` with all required vars documented (Clerk keys, Convex URL, OpenRouter key, VAPID keys, encryption key)

### State Management

- [ ] **27. No optimistic UI updates in dashboard**
  - **Part:** 14
  - **Risk:** Laggy UX on mutations, especially on slower connections
  - **Fix:** Use Convex `optimisticUpdate` option in mutations for create/update/delete operations

- [ ] **28. ActiveProject always returns first project**
  - **Part:** 14
  - **Risk:** No project switching for multi-project orgs; hardcoded to `projects[0]`
  - **Fix:** Add project selection UI and context, or document single-project limitation clearly

### Layout & UX

- [ ] **29. KbShell violates single responsibility**
  - **Part:** 10
  - **Risk:** 230+ line component combining layout, data fetching, CRUD state, create dialogs, delete dialogs
  - **Fix:** Split into `KbShell` (layout) + `KbList` (data + list) + separate dialog components

- [ ] **30. Admin redirect race condition (flash before redirect)**
  - **Part:** 10
  - **Risk:** Non-admin users briefly see settings/design-studio layout before redirect
  - **Fix:** Handle authorization at route/loader level or show loading skeleton during check

- [ ] **31. Duplicate chat/monitor layout patterns**
  - **Part:** 10
  - **Risk:** Two nearly identical 3-panel responsive implementations with no shared abstraction
  - **Fix:** Extract shared `ThreePanelResponsiveLayout` component

- [ ] **32. Hardcoded Toaster theme="light"**
  - **Part:** 11
  - **Risk:** Toasts look wrong in dark mode
  - **Fix:** Make theme dynamic based on current color mode

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

- [ ] **53. No toast notifications for mutation errors**
  - **Part:** 14
  - **Fix:** Standardize on `sonner` toast.error() for all mutation failures

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
| Security & Auth | 0 | 2 | 1 | 8 |
| Performance | 0 | 4 | 2 | 8 |
| UI & UX | 0 | 4 | 2 | 8 |
| Documentation | 1 | 1 | 4 | 7 |
| Schema & Data | 1 | 5 | 5 | 15 |
| Backend & Ops | 0 | 4 | 2 | 6 |
| Developer Experience | 0 | 2 | 3 | 5 |
| **Total** | **2** | **24** | **22** | **64** |

---

## Source Parts Summary

| Part | Title | Issues Found |
|------|-------|-------------|
| 01 | Package Dependencies | 6 |
| 02 | Build Tooling Config | 4 |
| 03 | Project Structure | 0 (covered by other parts) |
| 04 | Database Schema | 14 |
| 05 | Queries | 3 |
| 06 | Mutations | 3 |
| 07 | Auth & Authorization | 6 |
| 08 | Backend Utilities | 5 |
| 09 | Core UI Components | 1 |
| 10 | Layout Components | 5 |
| 11 | Design Tokens & Styling | 4 |
| 12 | App Routing | 0 (covered by other parts) |
| 13 | Page Components | 0 (covered by other parts) |
| 14 | State Management | 3 |
| 15 | Feature Modules | 0 (covered by other parts) |
| 16 | Testing Infrastructure | 3 |
| 17 | CI/CD & Deployment | 5 |
| 18 | Documentation & DX | 6 |

---

## Recommended Fix Order

### Phase 1: Critical Security & Stability (Week 1)
Issues: 1, 4, 5, 6, 7, 8, 15 → **1, 2, 3, 4, 5, 6, 7, 16 ✅ DONE**

### Phase 2: Performance & Schema (Week 2)
Issues: 11 ✅, 12 ✅, 17 ✅, 19 ✅, 20 ✅, 21 ✅, 13 ✅, 14 ✅ → **8/8 DONE**

### Phase 3: Auth & Quality (Week 3)
Issues: 9, 10, 16, 18, 22, 23, 25, 26

### Phase 4: UX & Polish (Week 4)
Issues: 27, 28, 29, 30, 31, 32, 24

### Phase 5: Post-Launch LOW Priority
Issues: 44-64 (as time permits)
