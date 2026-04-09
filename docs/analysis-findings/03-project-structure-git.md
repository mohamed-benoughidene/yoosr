# Part 03: Project Structure & Git Setup

## 📊 Visual Map

```
Root Directory (29 top-level entries)
├── Source Code
│   ├── src/                      → 242 files across 8 subdirectories
│   │   ├── app/                  → Next.js App Router (locale-based routing)
│   │   │   ├── [locale]/         → Localized routes (en, ar, fr)
│   │   │   │   ├── dashboard/    → Protected: monitor, orders, activities, analytics, history, test-widget
│   │   │   │   ├── design-studio/[botId]/ → Protected: visual bot builder
│   │   │   │   ├── login/        → Auth: Clerk sign-in
│   │   │   │   ├── signup/       → Auth: Clerk sign-up
│   │   │   │   ├── onboarding/   → Post-signup onboarding
│   │   │   │   ├── waitlist/     → Early access waitlist
│   │   │   │   ├── pricing/      → Pricing page
│   │   │   │   ├── solutions/[slug]/ → Dynamic solution pages
│   │   │   │   ├── products/[slug]/  → Dynamic product pages
│   │   │   │   ├── (marketing)/legal/ → Terms & Privacy
│   │   │   │   └── test-widget/  → Widget sandbox
│   │   │   ├── api/widget/project/ → API route for widget config
│   │   │   ├── og/image/         → OG image generation
│   │   │   ├── widget/           → Embeddable chat widget (standalone)
│   │   │   ├── globals.css       → Global styles (19KB)
│   │   │   ├── layout.tsx        → Root layout
│   │   │   ├── not-found.tsx     → 404 page
│   │   │   ├── robots.ts         → Dynamic robots.txt
│   │   │   └── sitemap.ts        → Dynamic sitemap
│   │   ├── components/           → 23 items (13 feature dirs + 10 standalone files)
│   │   │   ├── ui/               → 32 Shadcn UI components
│   │   │   ├── dashboard/        → monitor/, shared/, bots/, kb/, contacts/, settings/
│   │   │   ├── design-studio/    → nodes/ + editor components
│   │   │   ├── chat/             → Chat interface components
│   │   │   ├── landing/          → Marketing page components
│   │   │   ├── analytics/        → Analytics views
│   │   │   ├── layout/           → Sidebar, header, etc.
│   │   │   ├── settings/         → Settings panels
│   │   │   ├── auth/             → Auth-related UI
│   │   │   ├── pricing/          → Pricing UI
│   │   │   ├── seo/              → SEO components
│   │   │   ├── feedback/         → Feedback forms
│   │   │   ├── activities/       → Activity log views
│   │   │   ├── AuthProviders.tsx  → Clerk + Convex provider wrapper
│   │   │   ├── ConvexClientProvider.tsx → Convex client setup
│   │   │   ├── LanguageSwitcher.tsx    → Locale switching
│   │   │   ├── error-boundary.tsx     → Error boundary
│   │   │   └── providers.tsx          → Combined providers
│   │   ├── config/               → 1 file: apps.ts (app store config)
│   │   ├── context/              → 1 file: ProjectContext.tsx
│   │   ├── hooks/                → 4 custom hooks
│   │   │   ├── use-mobile.tsx    → Responsive breakpoint
│   │   │   ├── useAnalyticsData.ts → Analytics data fetching
│   │   │   ├── useFeatureFlag.ts → Feature flag hook
│   │   │   └── useProjectId.ts   → Project context hook
│   │   ├── i18n/                 → 3 files: navigation.ts, request.ts, routing.ts
│   │   ├── lib/                  → 6 utilities: constants, env, featureFlags, plans, utils
│   │   ├── types/                → 1 file: flow.ts (bot flow types)
│   │   └── middleware.ts         → Clerk auth + next-intl locale middleware
│   └── public/                   → 10 static assets
│       ├── *.mp4                 → Demo videos (design-studio, walkthrough)
│       ├── *.svg, *.png          → Logo assets
│       ├── notification.mp3      → Notification sound
│       ├── widget.js             → Embeddable widget script
│       ├── sw.js                 → Service worker (push notifications)
│       └── llms.txt              → AI crawler metadata
│
├── Backend
│   └── convex/                   → 48 files (excl. _generated/)
│       ├── schema.ts             → Master database schema (25 tables)
│       ├── 35+ function files    → Queries, mutations, actions
│       ├── lib/                  → 5 utilities (crypto, embeddings, env, logger, rateLimiter)
│       ├── http.ts               → HTTP endpoints (webhooks)
│       ├── crons.ts              → 11 scheduled cron jobs
│       ├── migrations.ts         → 2 one-time data migrations
│       ├── types.ts              → Shared type definitions
│       └── _generated/           → Auto-generated Convex types
│
├── Internationalization
│   └── messages/                 → 4 files
│       ├── en.json               → English (82KB, 1933 lines, 25 top-level sections)
│       ├── ar.json               → Arabic  (105KB, 1917 lines)
│       ├── fr.json               → French  (92KB, 1917 lines)
│       └── _i18n-audit.json      → Translation coverage audit
│
├── Git & Tooling
│   ├── .gitignore                → 49 lines, comprehensive
│   ├── .github/workflows/ci.yml  → Single CI/CD pipeline (4 jobs)
│   ├── .qwen/                    → Qwen Code AI config (4 files + skills/)
│   ├── .agent/                   → Agent config (5 files + rules/)
│   │   ├── AGENT.md              → Agent behavior instructions
│   │   ├── DESIGN.md             → Design system documentation
│   │   ├── push.md               → Git push instructions
│   │   ├── draft.md              → Draft notes
│   │   ├── yoosr-landing-page-content.md → Landing page content
│   │   └── rules/tech-stack-rules.md → Technology stack rules
│   └── .agents/skills/           → 30+ installable AI skills
│
├── Configuration
│   ├── package.json              → Dependencies & scripts
│   ├── next.config.ts            → Next.js configuration
│   ├── tsconfig.json             → TypeScript config
│   ├── eslint.config.mjs         → ESLint configuration
│   ├── postcss.config.mjs        → PostCSS (Tailwind)
│   ├── vitest.config.ts          → Vitest test runner config
│   ├── vitest.setup.ts           → Test setup
│   ├── components.json           → Shadcn UI configuration
│   ├── vercel.json               → Vercel deployment config
│   ├── bun.lock                  → Bun lockfile
│   ├── skills-lock.json          → AI skills lock
│   ├── .env.example              → 106-line documented env template
│   └── .env.local                → Local environment (gitignored)
│
└── Documentation
    └── docs/                     → 3 subdirectories + 3 files
        ├── README.md             → Main project documentation
        ├── CHUNKED_ANALYSIS_WORKFLOW.md → Analysis methodology
        ├── Prompt.md             → Analysis prompt template
        ├── analysis-map/         → 18 analysis templates
        ├── analysis-findings/    → Completed analysis results
        └── specs/                → Feature specifications
            └── plans/            → Implementation plans
```

## 📁 File Inventory

| File/Directory | Purpose | Actual Status |
|----------------|---------|---------------|
| `.gitignore` | Git ignore patterns (49 lines) | ✅ Comprehensive — covers deps, build, env, AI tools, TS cache |
| `.github/workflows/ci.yml` | Single CI/CD pipeline with 4 jobs | ✅ Active — lint, test, build, deploy (staging + prod) |
| `.qwen/` | Qwen Code AI assistant (QWEN.md, Prompt.md, settings.json, skills/) | ✅ Present |
| `.agent/` | Primary agent config (AGENT.md, DESIGN.md, push.md, rules/) | ✅ Present — contains design system and tech stack rules |
| `.agents/skills/` | 30+ installable AI agent skills | ✅ Present — extensive skill library |
| `src/` | Main application source (242 files, 8 subdirs) | ✅ Well-structured |
| `public/` | Static assets (10 files: videos, logos, widget, SW) | ✅ Present |
| `messages/` | i18n JSON files (en, ar, fr + audit) | ✅ 3 locales with audit tracking |
| `docs/` | Project documentation, analysis maps, specs | ✅ Organized |
| `convex/` | Backend functions, schema, crons, migrations (48 files) | ✅ Active |
| `.env.example` | 106-line documented environment template | ✅ Thorough documentation |
| `vercel.json` | Vercel deployment configuration | ✅ Present |

**Not found from template:**
| Expected | Status |
|----------|--------|
| `documentation/` | ❌ Does not exist — no separate documentation directory |
| `SPECS/` | ❌ Does not exist at root — specs live inside `docs/specs/` |
| `design-system/` | ❌ Does not exist as directory — design system is documented in `.agent/DESIGN.md` |

## ✅ Analysis Checklist

- [x] **What is the overall directory structure philosophy?**

  The project follows a **hybrid organization** combining Next.js App Router conventions with feature-based component grouping. The root level cleanly separates concerns:
  - `src/` — all frontend code (App Router, components, hooks, lib, types)
  - `convex/` — all backend code (schema, functions, utilities)
  - `messages/` — all i18n content
  - `public/` — static assets
  - `docs/` — documentation

  This is a monorepo-like structure without a monorepo tool — frontend and backend live side-by-side with clear boundaries.

- [x] **How is code organized? (by feature, by type, layered?)**

  **Mixed approach — primarily by type at the top level, then by feature within components:**
  
  - **Top level:** By type (`components/`, `hooks/`, `lib/`, `types/`, `context/`, `config/`)
  - **Components:** By feature domain (`dashboard/`, `chat/`, `design-studio/`, `landing/`, `analytics/`, `settings/`)
  - **Dashboard components:** Further nested by sub-feature (`monitor/`, `bots/`, `kb/`, `contacts/`, `settings/`)
  - **App routes:** By feature with locale prefix (`[locale]/dashboard/`, `[locale]/design-studio/`)
  - **Backend (convex/):** Flat file structure — one file per domain entity (`conversations.ts`, `messages.ts`, `bots.ts`, etc.)

- [x] **What does `.gitignore` cover? Is it comprehensive?**

  **Yes, comprehensive (49 lines).** Covers:
  - ✅ `node_modules/` — dependencies
  - ✅ `.next/`, `/out/`, `/build` — build artifacts
  - ✅ `/coverage` — test coverage
  - ✅ `.env*` with `!.env.example` — env files (allows example)
  - ✅ `.DS_Store`, `*.pem` — OS/security files
  - ✅ `npm-debug.log*`, `yarn-*`, `.pnpm-debug.log*` — debug logs
  - ✅ `.vercel` — Vercel local config
  - ✅ `.agent/`, `.agents/`, `.qwen/` — AI tool configs
  - ✅ `*.tsbuildinfo`, `next-env.d.ts` — TypeScript artifacts

  **Minor gap:** `.agent/` and `.agents/` are gitignored, but the skills-lock.json is at root and tracked. The `.agents/skills/` directory with 30+ skill files is gitignored — only the lock file references them.

- [x] **What GitHub Actions workflows exist?**

  **One workflow: `.github/workflows/ci.yml`** ("CI/CD Pipeline") with **4 jobs:**

  1. **`quality-gates`** — Runs on all pushes to `main`/`develop` and PRs to `main`. Steps: checkout → setup Bun → install → lint → test → build. Timeout: 10 min.
  
  2. **`deploy-staging`** — Triggered on push to `develop` only. Deploys Convex to staging + Vercel preview. Uses `CONVEX_DEPLOY_KEY_STAGING` and `VERCEL_PROJECT_ID_STAGING`. Environment: "Preview – yoosr". Timeout: 15 min.
  
  3. **`deploy-convex`** — Triggered on push to `main`. Deploys Convex backend to production using `CONVEX_DEPLOY_KEY_PROD`. Timeout: 10 min.
  
  4. **`deploy-frontend`** — Triggered on push to `main`. Deploys to Vercel production with `--prod` flag. Timeout: 15 min.

  All deploy jobs depend on `quality-gates` passing first.

- [x] **Are there automated CI/CD pipelines?**

  **Yes, fully automated with a branch-based strategy:**
  - **PRs to `main`** → quality gates only (lint + test + build)
  - **Push to `develop`** → quality gates + staging deploy (Convex + Vercel preview)
  - **Push to `main`** → quality gates + production deploy (Convex + Vercel production)

  Uses **Bun** as the package manager/runner throughout. Convex deploy uses `npx convex deploy --cmd 'bun run build'`.

- [x] **What agent/AI tool configurations exist?**

  **Three AI tool configurations present:**

  1. **`.agent/`** — Primary agent config:
     - `AGENT.md` (9KB) — Agent behavior instructions
     - `DESIGN.md` (26KB) — Comprehensive design system documentation
     - `push.md` — Git commit/push workflow rules
     - `draft.md` — Working draft notes
     - `yoosr-landing-page-content.md` — Landing page copy
     - `rules/tech-stack-rules.md` — Enforced technology stack (Next.js, Shadcn, Convex, Clerk)

  2. **`.qwen/`** — Qwen Code assistant:
     - `QWEN.md` (9.8KB) — Qwen-specific instructions
     - `Prompt.md` (10.9KB) — Prompt templates
     - `settings.json` — Configuration
     - `skills/` — Qwen-specific skills

  3. **`.agents/skills/`** — 30+ installable AI skills library including: convex, shadcn, tailwind, react-best-practices, debugging, SEO, code-review, security-audit, etc.

  All three directories are gitignored (`.agent/`, `.agents/`, `.qwen/`).

- [x] **How is documentation organized?**

  **Single documentation root at `docs/`:**
  - `docs/README.md` (9.6KB) — Main project documentation
  - `docs/CHUNKED_ANALYSIS_WORKFLOW.md` — Analysis methodology
  - `docs/Prompt.md` — Analysis prompt template
  - `docs/analysis-map/` — 18 analysis template files (numbered 01-18)
  - `docs/analysis-findings/` — Completed analysis results
  - `docs/specs/` — Feature specifications + implementation plans

  Additional documentation in `.agent/`:
  - `.agent/DESIGN.md` (26KB) — Detailed design system guide
  - `.agent/AGENT.md` (9KB) — Agent instructions

- [x] **Are there multiple documentation sources? (docs/, documentation/, SPECS/)**

  **Partially.** The template suggested `documentation/` and `SPECS/` directories at root level — **neither exists.** All documentation is consolidated under `docs/`. Specs live at `docs/specs/` (not root `SPECS/`). The design system documentation is in `.agent/DESIGN.md` rather than a separate `design-system/` directory.

  This is actually **cleaner** than the template assumed — there's one canonical documentation location.

- [x] **What's in the `messages/` directory? (i18n approach)**

  **Three locale files + an audit file using next-intl:**
  - `en.json` (82KB, 1933 lines) — English (source of truth)
  - `ar.json` (105KB, 1917 lines) — Arabic (RTL support)
  - `fr.json` (92KB, 1917 lines) — French
  - `_i18n-audit.json` — Translation coverage tracker (ar: 0 missing, fr: 1 missing key)

  **25 top-level sections:** landing, designStudio, common, nav, header, dashboard, monitor, chat, requests, bots, analytics, activities, activity_log, history, contacts, orders, knowledge_base, apps, settings, test_widget, visitor, widget, testWidget, auth, landingPage

  **i18n infrastructure:** Uses `next-intl` with:
  - `src/i18n/routing.ts` — Locale routing config
  - `src/i18n/navigation.ts` — Localized navigation
  - `src/i18n/request.ts` — Request-level locale detection
  - `src/middleware.ts` — Clerk auth + locale middleware with cookie-based persistence

  RTL support is handled via `HtmlDirSetter.tsx` component.

- [x] **Is the structure consistent and predictable?**

  **Mostly yes, with minor inconsistencies:**
  
  ✅ Consistent: App Router conventions followed correctly, components organized by feature, backend files flat by domain entity.
  
  ⚠️ Minor inconsistencies:
  - `src/components/settings/` AND `src/components/dashboard/settings/` — two settings component directories
  - `src/app/[locale]/test-widget/` AND `src/app/[locale]/dashboard/test-widget/` — duplicate test-widget routes
  - i18n keys mix `camelCase` (`designStudio`) and `snake_case` (`knowledge_base`, `activity_log`, `test_widget`)
  - Some duplicate i18n sections: `testWidget` AND `test_widget`, `landingPage` AND `landing`

- [x] **Any conventions for file naming?**

  - **Components:** PascalCase filenames (`AuthProviders.tsx`, `ProjectContext.tsx`, `LanguageSwitcher.tsx`)
  - **Hooks:** camelCase with `use` prefix (`useProjectId.ts`, `useFeatureFlag.ts`, `useAnalyticsData.ts`) — exception: `use-mobile.tsx` uses kebab-case
  - **Convex functions:** camelCase (`activityLogs.ts`, `botFlows.ts`, `cannedResponses.ts`)
  - **UI components (Shadcn):** kebab-case (`alert-dialog.tsx`, `dropdown-menu.tsx`, `scroll-area.tsx`)
  - **Config files:** kebab/dot case (`next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`)
  - **Routes:** kebab-case directory names (`design-studio/`, `test-widget/`)

  Overall: **Shadcn conventions for UI, PascalCase for custom components, camelCase for backend** — reasonable and mostly consistent.

- [x] **How are environment variables managed? (.env files?)**

  **Well-documented with a layered approach:**
  
  - `.env.example` (106 lines) — Comprehensive template with:
    - Clerk authentication (publishable key, secret, webhook secret, JWT issuer)
    - Convex backend URLs
    - OpenRouter AI keys + rate limiting + embedding config
    - Feature flags (comma-separated key:value)
    - VAPID keys for push notifications
    - Encryption key for webhook secrets
    - Site URLs

  - `.env.local` — Actual secrets (gitignored, 1KB)
  
  - **CI/CD secrets** documented in `.env.example` comments: `CONVEX_DEPLOY_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_PROJECT_ID_STAGING`, `SLACK_WEBHOOK_URL`
  
  - **Runtime validation** exists via `src/lib/env.ts` (1.6KB) and `convex/lib/env.ts` (907B) — both frontend and backend have env validation modules.

## 📝 Agent Findings

### Strong Points

1. **Clean separation of concerns** — Frontend (`src/`), backend (`convex/`), i18n (`messages/`), and docs (`docs/`) are clearly separated at root level with no cross-contamination.

2. **Mature CI/CD pipeline** — Single workflow file implements a proper branch strategy (develop → staging, main → production) with quality gates gating all deploys. Uses Bun consistently.

3. **Exceptional .env.example** — At 106 lines with section headers, inline docs, and generation instructions for each secret, this is one of the best-documented env templates. It even documents CI/CD secrets that aren't in .env files.

4. **Comprehensive i18n** — Full 3-locale support (en, ar, fr) with RTL handling, cookie-based locale persistence, Clerk metadata locale sync, and an automated audit file tracking translation coverage.

5. **AI tooling investment** — Three AI assistant configurations (`.agent/`, `.qwen/`, `.agents/skills/`) show significant investment in AI-assisted development workflows, including 30+ specialized skills.

### Areas for Improvement

1. **Duplicate route paths** — `test-widget` exists at both `[locale]/test-widget/` and `[locale]/dashboard/test-widget/`, and settings components exist in two locations.

2. **Single CI/CD file** — At 122 lines, the workflow is manageable but could benefit from reusable workflows if it grows.

3. **No CODEOWNERS file** — `.github/CODEOWNERS` doesn't exist for PR review assignment.

4. **No PR/Issue templates** — `.github/` only contains `workflows/` — no issue templates or PR templates.

## 🔍 Key Patterns to Identify

| Pattern | Actual Finding |
|---------|----------------|
| Convention over configuration | **Leans toward convention** — follows Next.js App Router, Shadcn CLI, and Convex conventions closely. Minimal custom configuration. |
| Feature-based vs layer-based | **Hybrid** — layer-based at top level (components, hooks, lib), feature-based within components (dashboard, chat, design-studio). |
| Documentation strategy | **Consolidated** under `docs/` with analysis maps + specs. Design system lives in `.agent/DESIGN.md`. No scattered docs. |
| Git workflow patterns | **Branch-based**: `develop` → staging, `main` → production. PRs gate on quality checks. |
| Agent/AI tooling integration | **Deep integration** — 3 AI tool configs, 30+ skills, design system documentation aimed at AI consumption, tech stack rules enforced via agent rules. |

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| Duplicate test-widget routes | **LOW** | `[locale]/test-widget/` and `[locale]/dashboard/test-widget/` — could confuse routing. Likely one is deprecated. |
| Inconsistent i18n key naming | **LOW** | Mix of camelCase and snake_case in top-level message keys. Also duplicate sections (`testWidget` + `test_widget`, `landing` + `landingPage`). |
| Duplicate settings component dirs | **LOW** | `components/settings/` and `components/dashboard/settings/` — unclear which is canonical. |
| Missing GitHub templates | **LOW** | No `.github/ISSUE_TEMPLATE/` or `.github/PULL_REQUEST_TEMPLATE.md` for standardized contributions. |
| AI configs gitignored | **MEDIUM** | `.agent/`, `.agents/`, `.qwen/` are all gitignored. The design system (`.agent/DESIGN.md`) and tech stack rules (`.agent/rules/tech-stack-rules.md`) are not version-controlled, meaning team members won't get them from git clone. |
| Hook naming inconsistency | **LOW** | `use-mobile.tsx` uses kebab-case while all other hooks use camelCase (`useProjectId.ts`, etc.). Minor but breaks convention. |
