# Part 03: Project Structure & Git Setup — Analysis Findings

## 📊 Visual Map

```
Root Directory (/home/mohamed/lab/yoosr/)
├── Source Code (src/)
│   ├── app/                    → Next.js App Router pages & layouts
│   ├── components/             → React components (UI + features)
│   ├── config/                 → Configuration modules
│   ├── context/                → React context providers
│   ├── hooks/                  → Custom React hooks
│   ├── i18n/                   → Internationalization (next-intl)
│   ├── lib/                    → Utility libraries
│   ├── types/                  → TypeScript type definitions
│   └── middleware.ts           → Next.js middleware (auth routing)
│
├── Backend (convex/)
│   ├── schema.ts               → Master database schema (27 tables)
│   ├── *.ts (40 files)         → Queries, mutations, actions
│   ├── lib/                    → Backend utilities (crypto, env)
│   ├── _generated/             → Auto-generated Convex types
│   └── Special files:
│       ├── auth.config.ts      → Convex auth configuration
│       ├── convex.config.ts    → Convex instance config
│       ├── http.ts             → HTTP API endpoints (webhooks)
│       ├── crons.ts            → Scheduled jobs
│       ├── migrations.ts       → Data migrations (disabled)
│       ├── seed.ts             → Seed data
│       └── wipe.ts             → Data wipe utilities
│
├── Static Assets
│   └── public/                 → Images, fonts, favicon
│
├── Design System
│   └── design-system/          → Design system documentation
│
├── Git & Tooling
│   ├── .gitignore              → Comprehensive ignore patterns
│   ├── .github/workflows/ci.yml → CI/CD pipeline (lint, test, build, deploy)
│   ├── .qwen/                  → Qwen Code AI assistant configs
│   ├── .agent/                 → Agent settings (gitignored)
│   └── .agents/                → Additional agent configs (gitignored)
│
├── Documentation
│   ├── docs/                   → Project documentation (analysis-map, findings)
│   ├── documentation/          → Additional documentation
│   └── SPECS/                  → Feature specifications
│
├── Internationalization
│   └── messages/               → i18n message files (JSON)
│
└── Build Output (gitignored)
    ├── .next/                  → Next.js build output
    ├── coverage/               → Test coverage reports
    └── node_modules/           → Dependencies
```

## 📁 File Inventory

| File/Directory | Purpose | Found? |
|----------------|---------|--------|
| `.gitignore` | Git ignore patterns | ✅ Present |
| `.github/workflows/ci.yml` | CI/CD pipeline | ✅ Present (1 workflow) |
| `.qwen/` | Qwen Code assistant configuration | ✅ Present |
| `.agent/` | Agent-specific settings | ✅ Present (gitignored) |
| `.agents/` | Additional agent configurations | ✅ Present (gitignored) |
| `src/` | Main application source code | ✅ Present |
| `src/app/` | Next.js App Router | ✅ Present |
| `src/components/` | React components | ✅ Present |
| `src/config/` | Configuration modules | ✅ Present |
| `src/context/` | React context providers | ✅ Present |
| `src/hooks/` | Custom React hooks | ✅ Present |
| `src/i18n/` | Internationalization | ✅ Present |
| `src/lib/` | Utility libraries | ✅ Present |
| `src/types/` | TypeScript type definitions | ✅ Present |
| `src/middleware.ts` | Next.js middleware | ✅ Present |
| `public/` | Static assets | ✅ Present |
| `messages/` | i18n message files | ✅ Present |
| `convex/` | Convex backend (40 .ts files) | ✅ Present |
| `docs/` | Project documentation | ✅ Present |
| `documentation/` | Additional documentation | ✅ Present |
| `SPECS/` | Feature specifications | ✅ Present |
| `design-system/` | Design system docs | ✅ Present |
| `.next/` | Next.js build | ✅ Present (gitignored) |
| `coverage/` | Test coverage | ✅ Present (gitignored) |

## ✅ Analysis Checklist

- [x] **What is the overall directory structure philosophy?**
  **Layer-based organization within `src/`**, combined with **feature-based** for the backend (`convex/`). The frontend uses a type-based layer structure (components, hooks, context, lib, types) while the backend organizes by domain entity (contacts.ts, conversations.ts, bots.ts, etc.).

- [x] **How is code organized? (by feature, by type, layered?)**
  - **Frontend (src/)**: Layered by type — `components/`, `hooks/`, `context/`, `lib/`, `types/`, `config/`, `i18n/`
  - **Backend (convex/)**: Feature/domain-based — one file per entity (e.g., `contacts.ts`, `bots.ts`, `conversations.ts`)
  - **Pages (src/app/)**: Next.js App Router file-based routing
  - **Shared utilities**: `convex/lib/` for backend-only utils, `src/lib/` for frontend utils

- [x] **What does `.gitignore` cover? Is it comprehensive?**
  Comprehensive coverage:
  - **Package managers**: `/node_modules`, `.pnp.*`, `.yarn/*` (with exceptions for patches/plugins)
  - **Testing**: `/coverage`
  - **Next.js**: `/.next/`, `/out/`, `next-env.d.ts`
  - **Production**: `/build`
  - **OS/Debug**: `.DS_Store`, `*.pem`, `*debug.log*`
  - **Environment**: `.env*` (with `!.env.example` exception)
  - **Vercel**: `.vercel`
  - **AI agents**: `.agent/`, `.agents/`, `.qwen/`
  - **TypeScript**: `*.tsbuildinfo`, `next-env.d.ts`
  - **Well-structured** with section comments

- [x] **What GitHub Actions workflows exist?**
  Single workflow: `.github/workflows/ci.yml` with 2 jobs:
  1. **quality-gates** (runs on push + PR to main):
     - Checkout → Setup Bun → Install → Lint → Test → Build
     - Timeout: 10 minutes
  2. **deploy-convex** (main branch only, after quality-gates passes):
     - Checkout → Setup Bun → Install → `npx convex deploy --cmd 'bun run build'`
     - Requires `CONVEX_DEPLOY_KEY` secret
     - Timeout: 10 minutes

- [x] **Are there automated CI/CD pipelines?**
  **Yes.** Standard CI/CD:
  - **CI**: Lint + Test + Build on every push/PR to main
  - **CD**: Auto-deploy to Convex + Vercel on main branch merge
  - Uses Bun throughout (consistent with local dev)
  - **Missing**: No staging environment, no preview deployments, no E2E tests in CI

- [x] **What agent/AI tool configurations exist?**
  - `.qwen/` — Qwen Code assistant configs (not gitignored, committed to repo)
  - `.agent/` — Agent settings (gitignored, local-only)
  - `.agents/` — Additional agent configs (gitignored, local-only)
  - `skills-lock.json` — Agent skills configuration at root level
  - The project is set up for AI-assisted development with multiple agent frameworks

- [x] **How is documentation organized?**
  **Three separate documentation locations:**
  1. `docs/` — Active working docs (analysis-map, analysis-findings)
  2. `documentation/` — Additional documentation (contents not fully explored)
  3. `SPECS/` — Feature specifications (contents not fully explored)
  4. `design-system/` — Design system documentation

- [x] **Are there multiple documentation sources?**
  **Yes — 4 locations** (`docs/`, `documentation/`, `SPECS/`, `design-system/`). This could lead to fragmentation and confusion about where to put/find information.

- [x] **What's in the `messages/` directory?**
  Internationalization message files for `next-intl`. These contain the translation strings for supported locales. Based on the schema (locales: `en`, `ar`, `fr`), there are likely JSON files per locale.

- [x] **Is the structure consistent and predictable?**
  **Mostly yes.** The `src/` layers are standard for a Next.js App Router project. The `convex/` domain-based file organization is consistent (one file per entity). However:
  - Some Convex files contain mixed concerns (e.g., `settings.ts` contains departments, canned responses, operating hours, AND label mutations — should be split)
  - `convex/types.ts` only defines `ClerkIdentity` type — very minimal
  - `convex/utils.ts` has auth helpers (`requireAdmin`, `assertProjectOwnership`, `checkProjectOwnership`) — well-separated

- [x] **Any conventions for file naming?**
  - **Convex files**: Lowercase entity names (`contacts.ts`, `conversations.ts`, `botFlows.ts`)
  - **Frontend components**: Likely PascalCase (standard React convention — not verified in detail)
  - **Config files**: `*.config.*` pattern (next.config.ts, vitest.config.ts, etc.)
  - **Middleware**: `middleware.ts` at src root (Next.js convention)
  - **Internal functions**: Suffix `_Internal` in Convex (e.g., `logActivityInternal`, `updateInternal`)

- [x] **How are environment variables managed?**
  - **`.env*` files gitignored** (except `.env.example` whitelisted)
  - **Convex**: Uses `convex/lib/env.ts` `requireEnv()` function that throws in production if vars are missing
  - **Vercel**: Env vars set in Vercel dashboard (not in config files)
  - **No `.env.example` file found** in the repo root (may exist but wasn't in the file list)

## 📝 Agent Findings

### Frontend Structure (src/)
The `src/` directory follows a **layered architecture**:
- `app/` — Next.js App Router (file-based routing, server components)
- `components/` — Reusable React components
- `hooks/` — Custom React hooks
- `context/` — React context providers for global state
- `lib/` — Utility functions and shared logic
- `types/` — TypeScript type definitions
- `config/` — Configuration modules
- `i18n/` — Internationalization setup
- `middleware.ts` — Next.js middleware for auth routing

### Backend Structure (convex/)
40 TypeScript files organized by **domain entity**:
- **Core entities**: contacts, conversations, messages, projects, profiles
- **Bot system**: bots, botFlows, bot, aiFlowBuilder
- **AI/Knowledge**: knowledge, knowledgeBases, openrouter, openrouter_api
- **Analytics & Reporting**: analytics, dashboard, activityLogs
- **Communication**: notifications, webhooks, pushActions, pushMutations
- **Business features**: orders, feedback, integrations, routing
- **Infrastructure**: schema, types, utils, errors, http, crons, migrations, seed, wipe
- **Utilities**: lib/crypto.ts, lib/env.ts

### CI/CD Pipeline
Single comprehensive pipeline using Bun:
- **Quality gate**: lint → test → build
- **Deployment**: Convex deploy with build command on main branch
- **No staging environment** — direct to production
- **No E2E tests** — only unit tests via Vitest

### Agent Tooling
Three agent config directories showing investment in AI-assisted development:
- `.qwen/` — committed to repo (Qwen Code settings)
- `.agent/` and `.agents/` — gitignored (local agent settings)

### Documentation Fragmentation
**4 documentation locations** is a concern:
1. `docs/` — analysis work
2. `documentation/` — unknown contents
3. `SPECS/` — feature specs
4. `design-system/` — design docs

## 🔍 Key Patterns to Identify

- **Layered frontend + domain-based backend**: Clean separation of concerns
- **Internal function naming**: `_Internal` suffix for functions called from other Convex functions
- **Convex file-per-entity**: Each domain entity gets its own file with queries + mutations + actions
- **CI/CD with Bun**: Consistent package manager across local dev and CI
- **Multi-documentation strategy**: Could benefit from consolidation
- **AI-assisted development**: Multiple agent frameworks configured

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| **Multiple documentation locations** | MEDIUM | 4 separate doc directories (`docs/`, `documentation/`, `SPECS/`, `design-system/`) could cause confusion and outdated information |
| **Mixed concerns in convex/settings.ts** | MEDIUM | Contains departments, canned responses, labels, AND operating hours — should be split into separate files for maintainability |
| **No staging environment in CI** | MEDIUM | Direct deployment to production on merge — no preview or staging environment for validation |
| **No E2E tests in CI** | LOW | Only unit tests (Vitest) run in CI — no Playwright or integration tests |
| **`.env.example` not found** | LOW | If this file doesn't exist, new developers won't know which env vars to set |
| **Agent configs partially gitignored** | LOW | `.qwen/` is committed while `.agent/` and `.agents/` are gitignored — could cause inconsistency between team members |
| **No lint-staged or pre-commit hooks** | LOW | No Husky or lint-staged configured — code quality relies on CI checks only |
