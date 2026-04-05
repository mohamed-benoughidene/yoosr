# Project Codebase Analysis - Summary

## 1. Executive Summary

**Yoosr** is a customer communication SaaS platform targeting the MENA region, built as a full-stack Next.js application. It provides AI-powered chat bots, live agent support, multi-channel messaging (WhatsApp, Messenger, Instagram, Telegram), knowledge base RAG, analytics, and a visual bot flow builder — all delivered through a multi-tenant, organization-scoped architecture.

The architecture is **serverless + reactive**: Next.js 16 (App Router) frontend deployed on Vercel, Convex as the real-time reactive backend/database, and Clerk for multi-tenant authentication via organizations.

**Overall code quality: Good to Very Good.** The codebase follows modern conventions (strict TypeScript, shadcn/ui, Convex best practices), has strong security headers, comprehensive i18n (EN/AR/FR with RTL), and a well-structured feature domain layout. However, it lacks testing infrastructure entirely, has no root README, and contains several HIGH-severity architectural concerns.

**Maturity level: Late-stage production-ready.** Core features are implemented and production-grade, but the absence of tests, CI testing, env variable documentation, and formal API contracts place it just short of full production maturity.

---

## 2. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                            │
│                                                                          │
│  Next.js 16 App Router (React 19 + TypeScript 5)                        │
│  ├── Marketing Pages (SSR) → Landing, Pricing, Products, Solutions       │
│  ├── Dashboard (CSR) → Chat, Bots, Contacts, Orders, Analytics, Settings │
│  ├── Design Studio → Visual Bot Flow Builder (@xyflow/react)            │
│  ├── Widget → Embeddable chat widget (public, rate-limited)              │
│  └── i18n → next-intl (en/ar/fr, RTL support)                           │
│                                                                          │
│  Styling: Tailwind CSS v4 + shadcn/ui (32 components) + CVA             │
│  State: Convex reactive hooks + React Context (ProjectContext)           │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │ HTTPS / WSS
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION LAYER                             │
│                                                                          │
│  Clerk (@clerk/nextjs 6.37.5)                                           │
│  ├── JWT validation → Convex (convex/auth.config.ts)                    │
│  ├── Organization-based multi-tenancy (org_id, org_role)                │
│  ├── RBAC: org:admin vs org:member (binary split)                       │
│  ├── Webhook → Convex /clerk-webhook (user.created, org.deleted)        │
│  └── Middleware → clerkMiddleware + next-intl middleware                 │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │ JWT + Auth Token
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Convex)                                │
│                                                                          │
│  26 Convex modules | ~40 queries | ~64 mutations | ~20 actions          │
│  30+ tables in schema.ts                                                 │
│                                                                          │
│  Core Domains:                                                           │
│  ├── profiles.ts       → User profiles, presence, Clerk sync            │
│  ├── projects.ts       → Project CRUD, cascading delete (19 tables)     │
│  ├── conversations.ts  → 1401 lines, state machine, Meta/Telegram       │
│  ├── messages.ts       → Message CRUD, widget sending                   │
│  ├── contacts.ts       → Contact CRUD, batch import (500 max)           │
│  ├── bots.ts           → Bot CRUD                                       │
│  ├── botFlows.ts       → Flow editor → execution node compilation       │
│  ├── bot.ts            → 889 lines, 20+ action types, execution engine  │
│  ├── aiFlowBuilder.ts  → LLM-generated flow creation                    │
│  ├── knowledgeBases.ts → KB CRUD, source management                     │
│  ├── knowledge.ts      → Vector search, embeddings, RAG                 │
│  ├── analytics.ts      → 844 lines, 15+ aggregation functions           │
│  ├── integrations.ts   → WhatsApp, Messenger, Instagram, Telegram       │
│  ├── settings.ts       → Departments, canned responses, labels, hours   │
│  ├── notifications.ts  → In-app notifications (capped at 50/user)       │
│  ├── pushActions.ts    → Web push via VAPID                             │
│  ├── pushMutations.ts  → Push subscription management                   │
│  ├── orders.ts         → Order CRUD, batch import                       │
│  ├── tags.ts           → AI tag extraction, manual assignment           │
│  ├── webhooks.ts       → Outbound webhooks, HMAC signing, retry (3x)    │
│  ├── routing.ts        → Smart conversation routing                     │
│  ├── activityLogs.ts   → Append-only audit log                          │
│  ├── feedback.ts       → User feedback collection                       │
│  └── crons.ts          → 4 cron jobs (auto-close, cleanup, presence)    │
│                                                                          │
│  Utilities:                                                              │
│  ├── utils.ts          → requireAdmin(), assertProjectOwnership()       │
│  ├── openrouter.ts     → OpenRouter LLM client (OpenAI SDK wrapper)     │
│  ├── openrouter_api.ts → Per-org API key management (AES-GCM encrypted) │
│  ├── lib/crypto.ts     → AES-GCM encrypt/decrypt                        │
│  ├── lib/env.ts        → Environment variable validation                │
│  └── http.ts           → 15 HTTP routes (widget, webhooks, CORS)       │
│                                                                          │
│  Rate Limiting: @convex-dev/rate-limiter (widget: 5/60s, msgs: 20/60s)  │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  OpenRouter      │ │  Web Push    │ │  External Channels│
│  (AI Gateway)    │ │  (FCM/Moz/   │ │  Meta WhatsApp    │
│  Multi-model LLM │ │   Apple/Win) │ │  Telegram Bot     │
│  Token tracking  │ │  VAPID       │ │  Messenger API    │
└──────────────────┘ └──────────────┘ │  Instagram API    │
                                      └──────────────────┘
```

---

## 3. Tech Stack Overview

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | Next.js | 16.1.6 | App Router, SSR, ISR |
| **UI Library** | React | 19.2.3 | Component rendering |
| **Language** | TypeScript | 5.x | Type safety (strict mode) |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS (CSS-based config) |
| **UI Components** | shadcn/ui + Radix UI | 32 components | Headless UI primitives |
| **Component Variants** | CVA | 0.7.1 | Class variance authority |
| **Icons** | Lucide React | 0.575.0 | Icon library |
| **Animations** | Framer Motion | 12.x | Complex UI animations |
| **Charts** | Recharts | — | Analytics visualizations |
| **Flow Builder** | @xyflow/react | — | Visual bot editor |
| **Tables** | @tanstack/react-table | — | Data tables (activities, contacts) |
| **Forms** | React Hook Form + Zod v4 | — | Form validation |
| **i18n** | next-intl | v4.8.3 | English/Arabic/French + RTL |
| **Auth** | Clerk | @clerk/nextjs 6.37.5 | Multi-tenant auth, orgs, RBAC |
| **Backend** | Convex | — | Real-time reactive backend |
| **Rate Limiting** | @convex-dev/rate-limiter | — | Widget rate limiting |
| **AI/ML** | OpenRouter (via OpenAI SDK) | openai v6 | Multi-model LLM gateway |
| **AI Alt** | @huggingface/inference | — | Secondary AI provider |
| **Notifications** | web-push + sonner | — | Push notifications + toasts |
| **Data** | PapaParse, xlsx, unpdf | — | CSV/Excel/PDF processing |
| **Deployment** | Vercel + Convex | — | Frontend + backend hosting |
| **Package Manager** | Bun | — | Primary (bun.lock present) |
| **Linting** | ESLint 9 (flat config) | 9.x | Code quality |
| **CI/CD** | GitHub Actions | — | Lint, build, Convex deploy |
| **Testing** | @testing-library/jest-dom | 6.9.1 | Installed but NOT USED |

---

## 4. Key Findings by Tier

### Tier 1: Foundation (Parts 01-03)
Modern stack with Next.js 16, React 19, TS strict mode, Tailwind v4, and shadcn/ui, but dual lockfile (bun + npm) creates install inconsistency risk and no root README exists.

### Tier 2: Backend (Parts 04-08)
30-table Convex schema with 56 indexes (including 1 vector index for RAG), strategic denormalization for read performance, and OCC-aware bot state separation, but `conversations` table bloat (39 fields), 60% of tables lack timestamps, and `v.any()` bypasses type validation in 12+ fields. Critical auth gaps in `seed.ts`/`wipe.ts` and no application-level rate limiting on mutations.

### Tier 3: Frontend (Parts 09-11)
Well-organized component architecture with 32 shadcn components + 81 custom components, full RTL support, and comprehensive design tokens, but design system docs are significantly out of sync with implementation and sidebar has an SSR hydration bug.

### Tier 4: Application (Parts 12-15)
Full-featured SaaS with bot flow builder, RAG knowledge base, multi-channel integrations, and analytics, but N+1 query patterns in dashboard, no optimistic UI updates, and activeProject hardcoded to first project only.

### Tier 5: Quality & Ops (Parts 16-18)
CI/CD pipeline with quality gates and Convex deployment, comprehensive agent-facing docs (709+ lines), but ZERO test files exist, no test script in package.json, no CI testing, and no staging environment.

---

## 5. Strengths

1. **Modern, current tech stack** — Next.js 16, React 19, TypeScript 5 strict mode, Tailwind v4. No legacy dependencies. (Part 01)
2. **Comprehensive Convex backend** — 26 modules with ~40 queries, ~64 mutations, ~20 actions covering full CRUD, real-time subscriptions, vector search, and AI integration. (Parts 05, 15)
3. **Well-designed database schema** — 30 tables with 56 indexes (including 1 vector index for RAG), strategic denormalization for read performance, OCC-aware bot state separation, and strong `v.id()` type safety with 35+ document references. (Part 04)
4. **Strong security headers** — Extensive CSP, X-Frame-Options, XSS protection, COEP/COOP in `vercel.json`. Constant-time string comparison for webhook signatures. (Part 02, 08)
5. **Full i18n with RTL** — Three locales (EN/AR/FR) with proper RTL support via DirectionProvider, HtmlDirSetter, and locale-aware Clerk config. (Parts 03, 12)
6. **Multi-tenant architecture** — Organization-scoped data isolation via Clerk orgs + Convex `orgId` filtering, with `assertProjectOwnership()` and `checkProjectOwnership()` enforcement. (Part 07)
7. **AES-GCM encryption for secrets** — All API keys and credentials encrypted at rest using Web Crypto API, with per-integration decryption in webhooks. (Part 08)
8. **Comprehensive error boundaries** — 12 `error.tsx` files + shared `ErrorFallback` component covering all major dashboard sections. (Parts 12, 13)
9. **Design token system** — 500+ lines of CSS variables in `globals.css` with oklch colors, 8-level shadow scale, calculated radius variants, and 25+ keyframe animations. (Part 11)
10. **Agent-ready documentation** — `.agent/AGENT.md` (709+ lines) with 12 core rules, 11 known architecture issues, and Convex best practices enables autonomous AI agent work. (Part 18)
11. **Well-structured feature specs** — 11 SPECS files with consistent format (Goal, Scope, Acceptance Criteria, Implementation Phases). `landing-page.md` and `localization.md` are exemplary. (Part 18)

---

## 6. Risks & Concerns

### HIGH Severity

1. **ZERO test files exist** — No `.test.ts`, `.test.tsx`, `.spec.ts`, or `__tests__/` anywhere. No unit, integration, or E2E tests. (Part 16)
2. **No test script in package.json** — No `"test"` command. Developers cannot run tests. (Parts 01, 16)
3. **No CI testing** — `.github/workflows/ci.yml` has no test step. PRs merge without automated test validation. (Parts 03, 16, 17)
4. **Unprotected `seed.ts` and `wipe.ts`** — Both have no auth checks. Anyone with a projectId can seed demo data or wipe all data. (Part 06)
5. **`webhooks.backfillWebhookSecrets` has no auth check** — Public mutation with no authentication. (Part 06)
6. **`messages.send` has no auth check** — Widget-facing endpoint validates conversation exists but has no identity check. (Part 06)
7. **N+1 query in `dashboard.getHomeStats`** — Serial loop of up to 20 sequential message queries on every dashboard load. (Part 05)
8. **`.collect()` in `analytics.getProjectUsageSummary`** — Four separate `.collect()` calls load entire tables into memory. (Part 05)
9. **Dual lockfile (bun.lock + package-lock.json)** — Risk of inconsistent dependency installs between developers and CI. (Part 01)
10. **Design system out of sync** — `design-system/yoosr/MASTER.md` documents Fira Code + Fira Sans with flat design (no shadows); actual implementation uses Inter + IBM Plex Mono + Playfair with shadow scale. Will mislead developers. (Parts 11, 18)
11. **No root README.md** — Most discoverable file in any repo is missing. All project info hidden in `.agent/` and `.qwen/` dot-directories. (Part 18)
12. **No staging environment** — Changes go directly from PR preview to production with no intermediate validation environment. (Part 17)
13. **`sidebar.tsx` Math.random() causes SSR hydration mismatch** — `const SKELETON_WIDTH = \`${Math.floor(Math.random() * 40) + 50}%\`` evaluated at module load produces different server vs client values. (Parts 09, 10)
14. **ActiveProject hardcoded to first project** — `ProjectContext.tsx` line 40: `projects[0]`. No way to switch between projects. (Parts 14, 15)
15. **`conversations` table bloat (39 fields)** — Mixes 4+ concerns: core data, legacy fields, bot state, HITL, channels. Legacy fields (`leadId`, `firstText`, `participants`, `tags`, `attributes`, `typing`) waste storage and confuse developers. (Part 04)
16. **No timestamps on 60% of tables** — 18 of 30 tables lack `createdAt`/`updatedAt` fields. Affects: projects, bots, bot_flows, departments, canned_responses, labels, operating_hours, knowledge_bases, knowledge_base_sources, knowledge_base_chunks, contacts, integrations, messages. (Part 04)
17. **`v.any()` bypasses type validation in 12+ fields** — Critical data like `credentials`, `widgetConfig`, `configuration`, `attachments`, `metadata`, `attributes`, `schedule` have no schema-level validation. Errors caught only at runtime. (Part 04)

### MEDIUM Severity

1. **No optimistic UI updates in dashboard** — All mutations wait for server response. Only `WidgetChat.tsx` implements optimistic updates (manual pattern). Convex's `optimisticUpdate` feature unused. (Part 14)
2. **No custom data fetching hooks** — Every component re-implements `useQuery(api.x.y, activeProject ? { projectId } : "skip")`. No `useBots()`, `useContacts()`, etc. (Part 14)
3. **`KbShell.tsx` violates single responsibility** — 230+ lines combining layout, data fetching, CRUD state, create dialogs, delete dialogs, and routing logic. (Part 10)
4. **Inconsistent auth error throwing** — Some files throw `Error`, others throw `ConvexError` for auth failures. Creates inconsistent client error handling. (Part 07)
5. **Extensive `as unknown as` type casting** — 20+ locations bypass TypeScript safety with `identity as unknown as { org_id: string }`. (Parts 07, 08)
6. **Telegram webhook GET returns 200 unconditionally** — Anyone can verify a webhook without a valid token. (Part 08)
7. **No retry logic for LLM calls** — `openrouter.ts` throws immediately on failure. If OpenRouter is down, AI features break completely. (Part 08)
8. **No application-level rate limiting on mutations** — Only widget HTTP endpoints are rate limited. Authenticated mutations (creating bots, settings changes) have no rate limiting. (Parts 06, 07)
9. **Duplicate chat/monitor layout patterns** — `ChatShell.tsx` and `monitor-layout.tsx` implement nearly identical 3-panel responsive patterns with no shared abstraction. (Part 10)
10. **Admin redirect race condition** — `SettingsShell` and `DesignStudioShell` use `useEffect` for admin redirects, causing flash of layout before redirect. (Part 10)
11. **No `.env.example` file** — New developers must guess required environment variables. Only documented in hidden `.qwen/QWEN.md`. (Parts 03, 17, 18)
12. **`--lp-gold` is actually blue (#3B82F6)** — Misnamed CSS variable will cause confusion. (Part 11)
13. **No structured logging or monitoring** — All error logging uses raw `console.error`. No correlation IDs, no log levels, no monitoring integration. (Parts 08, 17)
14. **Client-side filtering on growing datasets** — History page filters conversations in-memory. Doesn't scale as dataset grows. (Part 14)
15. **`@faker-js/faker` in runtime dependencies** — Should be in devDependencies (testing/mocking only). (Part 01)
16. **No CONTRIBUTING.md** — No guidance on PR format, branch naming, commit conventions, or testing requirements. (Part 18)
17. **`testing_guide.md.resolved` artifact** — `.resolved` suffix indicates unresolved merge conflict or incomplete editing. (Parts 03, 18)
18. **Hardcoded light Toaster** — Both `providers.tsx` and `MarketingProviders.tsx` hardcode `theme="light"`, wrong in dark mode. (Part 11)
19. **No unique constraints at schema level** — Convex doesn't support them; deduplication relies on application-level checks. Race conditions possible during concurrent writes. (Part 04)
20. **`conversations.botId` is `v.string()` not `v.id("bots")`** — Weakly typed reference bypasses Convex's type safety. Same issue with `departments.botId`. (Part 04)
21. **Legacy fields accumulate** — `conversations` has 6 legacy fields + `messages` has 5 legacy fields no longer used but stored in every document. No cleanup migration exists. (Part 04)

---

## 7. Technical Debt

1. **`conversations` table bloat (39 fields)** — Mixes core data, legacy fields, bot state, HITL, channels. Legacy fields (`leadId`, `firstText`, `participants`, `tags`, `attributes`, `typing`) stored in every document despite being unused. (Part 04)
2. **`conversations.ts` at 1401 lines** — Monolithic file mixing queries, mutations, Meta/Telegram integration, webhook firing, and conversation state machine. Should be split. (Part 05)
3. **`analytics.ts` at 844 lines** — 15+ functions mixing pagination helpers, internal queries, actions, and mutations. (Part 05)
4. **TODO: replace with paginated aggregation** — Found in 3 files: `conversations.ts:435`, `contacts.ts:16`, `labels.ts:13`. Using `.take(N)` instead of proper pagination. (Part 18)
5. **TODO: move createLabel and removeLabel** — `settings.ts:307` notes label mutations should move to `convex/labels.ts` for consistency. (Part 18)
6. **`labels.ts` is minimal (18 lines)** — Only `listLabels` query; no mutations (settings.ts handles label CRUD). Inconsistent with other domain modules. (Part 05)
7. **`getAny.ts` provides minimal utility** — Only exports `getFirstProject` (6 lines). File name doesn't match purpose. (Part 08)
8. **No shared abstraction for 3-panel responsive layouts** — `ChatShell.tsx` and `monitor-layout.tsx` duplicate the same mobile view switching + desktop resizable panel pattern. (Part 10)
9. **`src/lib/` has only 2 files** — `utils.ts` (cn helper) and `plans.ts` (plan limits constant). Underdeveloped utility layer for a project this size. (Part 03)
10. **`src/hooks/` has only 1 file** — `use-mobile.tsx` is the only custom hook. No data-fetching hooks despite extensive repeated Convex query patterns. (Part 14)
11. **`src/types/` has only 1 file** — `flow.ts` is the only type definition file. Most types are co-located with components; no shared type definitions for API responses, Convex docs, or Clerk identity. (Part 03)
12. **Duplicated `ClerkIdentity` type** — Defined inline in 4 separate files (`projects.ts`, `botFlows.ts`, `orders.ts`, `feedback.ts`). (Part 07)
13. **Legacy bot state in `conversations` table** — `currentNodeId`, `botStepCount`, `executionLog`, `botId` remain alongside the separate `conversation_bot_state` table for backward compatibility. (Parts 04, 15)
14. **6 redundant CORS OPTIONS handlers** — 6 separate OPTIONS routes in `http.ts` doing identical work. Could be consolidated. (Part 08)
15. **No bundle analysis configured** — Large deps (xlsx ~200KB, openai ~1MB, recharts ~150KB) with no monitoring. (Parts 01, 17)
16. **`migrations.migrateStatuss` permanently disabled** — Throws error if called. Migration completed March 2026 but file remains as dead code. (Part 17)

---

## 8. Security Audit

### Vulnerabilities Found

1. **`seed.ts` — No authentication** — `seed.seedDemoData` is a public mutation. Anyone with a projectId can seed demo data into any project. (Part 06)
2. **`wipe.ts` — No authentication** — `wipe.wipeAll` is a public mutation. Anyone with a projectId can wipe ALL data from any project. (Part 06)
3. **`webhooks.backfillWebhookSecrets` — No auth check** — Public mutation that modifies webhook secrets across all subscriptions. (Part 06)
4. **`messages.send` — No auth check** — Only validates conversation exists, no identity verification. (Part 06)
5. **CSP allows `'unsafe-inline'` and `'unsafe-eval'`** — Reduces CSP effectiveness against XSS attacks. (Part 02)
6. **`unsafeMetadata` used for locale** — Middleware reads `authData.sessionClaims?.unsafeMetadata?.locale`. Data not validated by Clerk. (Part 07)
7. **Widget endpoints completely public** — `/widget/conversations`, `/widget/messages`, `/widget/project` have no authentication, only rate limiting. Data scraping possible if projectId is discovered. (Part 07)
8. **Telegram webhook verification stub** — GET `/webhooks/telegram` always returns 200 without verification. (Part 08)
9. **No audit logging for auth events** — No logging of authentication failures, authorization denials, or admin actions. (Part 07)

### Missing Auth Checks

- `profiles.updateAvailability` and `profiles.bulkUpdateAvailability` modify org-wide state but have no admin check — any org member can change all profiles' availability. (Part 07)
- `activityLogs.log` checks identity but does NOT throw if null; stores `undefined` as the actor. (Part 06)

### Exposed Secrets / Misconfigurations

- CSP in `vercel.json` references `safe-pheasant-87.clerk.accounts.dev` (development Clerk domain) — should use production domain. (Part 03)
- CSP references `api.openai.com` — likely legacy, should be `api.openrouter.ai`. (Part 03)
- No `.env.example` or `.env.template` — environment variable requirements undocumented in visible location. (Parts 03, 18)

### Dependency Risks

- `xlsx` package has known historical vulnerabilities. (Part 01)
- Large dependency tree (68 runtime + 9 dev deps) increases supply chain attack surface. (Part 01)
- `@faker-js/faker` in runtime deps — not needed in production. (Part 01)

---

## 9. Dependency Health

### Outdated Packages
Cannot determine exact outdated status without running `npm outdated`, but key observations:
- Next.js 16.1.6, React 19.2.3, TypeScript 5.x, Tailwind v4 — all on latest major versions. (Part 01)
- `openai` package at v6 (latest major). (Part 01)

### Bundle Size Concerns
- **xlsx** — ~200KB (heavy, used only for import/export)
- **openai** — ~1MB (server-side only, should not reach client bundle)
- **recharts** — ~150KB (analytics page only, dynamically imported with `ssr: false`)
- **framer-motion** — ~36KB (used only in `VideoPlayer.tsx`)
- **@xyflow/react** — Flow builder library (design-studio only)
- No bundle analysis configured to verify actual impact. (Parts 01, 17)

### Unused Dependencies
- **@testing-library/jest-dom** — Installed as devDependency but NEVER imported in any file. No test runner configured. (Part 16)
- **@faker-js/faker** — In runtime deps, unclear if used in application code or just for seeding. (Part 01)
- **postgres** — Package present but unclear if used (Convex handles database). (Part 01)
- 25+ CSS animations defined in `globals.css`, likely many unused (MagicUI/shadcnblocks imports). (Part 11)

### Dual Lockfile Issues
- **Both `bun.lock` and `package-lock.json` exist** — CI uses Bun (`oven-sh/setup-bun@v2`), but npm lockfile is also present. Risk of developers using different package managers and getting different dependency trees. (Part 01)

---

## 10. Recommendations

### Immediate (1-2 weeks)

1. **Add test infrastructure** — Install Vitest + @testing-library/react, create `vitest.config.ts`, add `"test"` script to package.json. Start with 3-5 critical path tests (Convex queries, key components). Found in: Parts 01, 16.
2. **Protect `seed.ts` and `wipe.ts`** — Add `requireAdmin()` or environment-gated checks immediately. These are critical data safety issues. Found in: Part 06.
3. **Remove or reconcile dual lockfile** — Choose one package manager (Bun), delete the other lockfile, add to `.gitignore` if needed. Found in: Part 01.
4. **Add `.env.example`** — Document all required environment variables at repo root. Found in: Parts 03, 17, 18.
5. **Create root README.md** — Move critical info from `.qwen/QWEN.md` and `.agent/AGENT.md` into a visible root README. Found in: Part 18.
6. **Fix SSR hydration bug** — Remove `Math.random()` from `sidebar.tsx` skeleton width, use deterministic value. Found in: Parts 09, 10.

### Short-term (1 month)

7. **Add test step to CI** — Add `bun run test` to `.github/workflows/ci.yml` quality-gates job. Found in: Parts 16, 17.
8. **Fix N+1 in `dashboard.getHomeStats`** — Replace serial loop with batched query or pre-computed wait times. Found in: Part 05.
9. **Replace `.collect()` in analytics** — Use paginated queries instead of loading entire tables. Found in: Part 05.
10. **Standardize auth error throwing** — Use `ConvexError` consistently across all files. Found in: Part 07.
11. **Update design system docs** — Sync `design-system/yoosr/MASTER.md` with actual implementation (Inter + IBM Plex Mono, oklch colors, shadow scale). Found in: Parts 11, 18.
12. **Add optimistic UI updates** — Implement Convex `optimisticUpdate` for create/update/delete mutations in dashboard. Found in: Part 14.
13. **Extract shared `ClerkIdentity` type** — Create single type definition, remove 4 inline copies. Found in: Part 07.
14. **Move `@faker-js/faker` to devDependencies** — Only needed for seeding/testing. Found in: Part 01.

### Long-term (3+ months)

15. **Split `conversations.ts`** — At 1401 lines, break into separate modules (queries, mutations, Meta integration, Telegram integration, webhook firing). Found in: Part 05.
16. **Add E2E testing** — Install Playwright, write tests for critical user flows (login → create bot → send message → view analytics). Found in: Part 16.
17. **Add staging environment** — Configure separate Convex deployment for staging, add branch-based deployment logic. Found in: Part 17.
18. **Implement project switching** — Replace hardcoded `projects[0]` with selectable active project in UI. Found in: Parts 14, 15.
19. **Add bundle analysis** — Configure `@next/bundle-analyzer` to monitor dependency size over time. Found in: Parts 01, 17.
20. **Add structured logging** — Replace `console.error` with structured logging (correlation IDs, log levels, request context). Found in: Part 08.

---

## 11. Missing Pieces

### Tests Missing
- **All tests** — Zero `.test.ts`, `.test.tsx`, `.spec.ts` files exist. (Part 16)
- **Convex function tests** — No tests for queries, mutations, or actions. (Part 16)
- **React component tests** — No rendering, interaction, or snapshot tests. (Part 16)
- **Custom hook tests** — No tests for `useIsMobile` or any future hooks. (Part 16)
- **E2E tests** — No Playwright/Cypress tests for critical user flows. (Part 16)
- **Accessibility tests** — No automated a11y checks. (Part 16)

### Documentation Missing
- **Root README.md** — No entry point for new developers. (Part 18)
- **CONTRIBUTING.md** — No contribution guidelines, PR template, or code style guide. (Part 18)
- **CHANGELOG.md** — No release notes or version history. (Part 18)
- **LICENSE** — No license file. (Part 18)
- **`.env.example`** — No documented environment variable requirements. (Parts 03, 18)
- **Architecture Decision Records (ADRs)** — No formal ADRs for key decisions (Convex choice, Clerk choice, OpenRouter choice). (Part 18)
- **System architecture diagram** — No visual architecture diagram in human-facing docs. (Part 18)
- **API documentation** — No OpenAPI/Swagger spec for HTTP endpoints. (Part 18)
- **Runbooks/incident procedures** — No operational runbooks for debugging, deployment, or incident response. (Part 18)
- **Inline code comments** — Only 10 JSDoc blocks across entire codebase. Complex logic (bot state machine, RAG pipeline) has zero inline documentation. (Part 18)

### CI/CD Missing
- **Test execution** — No test step in CI pipeline. (Parts 16, 17)
- **Staging environment** — No intermediate deployment target. (Part 17)
- **Deployment notifications** — No Slack/Discord/email notifications on deploy success/failure. (Part 17)
- **Rollback strategy** — No automated or documented rollback process. (Part 17)
- **Bundle size checks** — No build size gates in CI. (Part 17)
- **Documentation validation** — No docs build step or link checking in CI. (Part 18)
- **Release tags/versioning** — No git tag strategy for tracking releases. (Part 17)

### Incomplete Features
- **Project switching** — ActiveProject hardcoded to first project, no UI for switching. (Parts 14, 15)
- **Dark mode toggle** — Full dark mode CSS tokens implemented but no UI toggle component. (Part 11)
- **Dedicated breadcrumb component** — Only `PAGE_LABELS` map in `SiteHeader.tsx`, no hierarchical navigation. (Part 10)
- **Global error boundary** — Per-route error boundaries exist but no global catch-all. (Part 09)
- **Feature flags** — No feature flagging system (A/B testing, gradual rollouts). (Part 15)
- **Audit logging coverage** — Many mutation categories (contacts, messages, projects, knowledgeBases, integrations, orders, webhooks, profiles, notifications) have zero audit trail. (Part 06)

---

## 12. Codebase Health Score

| Area | Score | Rationale |
|------|-------|-----------|
| **Architecture** | 7/10 | Clean separation (Next.js + Convex + Clerk), multi-tenant design, reactive real-time, well-designed schema with 56 indexes and strategic denormalization. Penalized for monolithic files (conversations.ts 1401 lines, conversations table 39 fields), tight coupling between modules, and no feature flags. |
| **Security** | 5/10 | Strong headers, AES-GCM encryption, constant-time comparison, and rate limiting on widgets. Severely penalized for unprotected seed/wipe endpoints, missing auth checks on mutations, public widget endpoints, CSP allowing unsafe-inline/eval, and `v.any()` bypassing validation in 12+ schema fields. |
| **Testing** | 0/10 | Zero test files, zero test scripts, zero CI testing. Testing infrastructure completely absent despite orphaned dependency. |
| **Documentation** | 5/10 | Excellent agent-facing docs (709+ lines, 11 specs, design system). Severely penalized for no root README, no CONTRIBUTING.md, out-of-sync design system, and no ADRs. |
| **Performance** | 6/10 | Good: bounded reads (.take(N)), 56 indexes including composites, Turbopack, dynamic imports, SSR for marketing, strategic denormalization for read performance. Penalized for N+1 queries, .collect() on full tables, no optimistic UI, and no bundle analysis. |
| **Developer Experience** | 5/10 | Good: strict TS, path aliases, shadcn CLI, agent ecosystem (27 skills), strong `v.id()` type safety. Penalized for no root README, no .env.example, no test runner, no linting/formatting scripts beyond ESLint, dual lockfile confusion, and 60% of tables lacking timestamps. |
| **Maintainability** | 6/10 | Good: type-safe Convex, feature-organized components, CVA pattern consistency, project-centric schema ownership. Penalized for monolithic files, conversations table bloat (39 fields), duplicated types (ClerkIdentity in 4 files), no custom hooks abstraction, legacy field accumulation, and technical debt TODOs. |
| **Overall** | **5/10** | Solid modern architecture with comprehensive feature set and well-designed schema, but held back by complete absence of testing, critical security gaps (unprotected endpoints, `v.any()` fields), and human-facing documentation gaps. |

---

## 13. Next Steps

### 1. Protect `seed.ts` and `wipe.ts` (Immediate — Days)
Add `requireAdmin()` or `process.env.NODE_ENV === "development"` guards to both files. These are the most critical security vulnerabilities — any user with a projectId can destroy or corrupt production data. (Found in Part 06)

### 2. Add test infrastructure and first tests (Immediate — 1-2 weeks)
Install Vitest + @testing-library/react, create `vitest.config.ts`, add `"test"` script, write 5-10 critical path tests covering: Convex project queries, contact CRUD, bot creation flow, and key dashboard components. Add test step to CI. (Found in Parts 01, 16, 17)

### 3. Fix N+1 and `.collect()` performance issues (Short-term — 2-3 weeks)
Replace serial loop in `dashboard.getHomeStats` with batched query. Replace `.collect()` calls in `analytics.getProjectUsageSummary` with paginated queries. These impact every dashboard load and analytics view. (Found in Part 05)

### 4. Create root README.md and `.env.example` (Short-term — 1 week)
Move essential project info (what is Yoosr, tech stack, setup instructions, required env vars) from hidden dot-directories to visible root files. This is critical for any new developer joining the project. (Found in Parts 03, 18)

### 5. Resolve dual lockfile and clean up orphaned dependencies (Short-term — 1 week)
Choose Bun as primary package manager, delete `package-lock.json`, move `@faker-js/faker` to devDependencies, and either remove or properly integrate `@testing-library/jest-dom` with a test runner. (Found in Parts 01, 16)

---

*Analysis completed: April 5, 2026*
*Based on 19 analysis finding files (including Part 04: Database Schema) covering 104+ source files, 30-table schema with 56 indexes, 26 Convex modules, 37 page components, 113 UI components, and 10+ configuration files.*
