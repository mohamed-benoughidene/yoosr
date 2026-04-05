# Part 03: Project Structure & Git Setup — Analysis Findings

## 📊 Visual Map

```
Root Directory (yoosr/)
│
├── Source Code
│   ├── src/                          → Application source code (Next.js App Router)
│   │   ├── app/                      → Next.js App Router routes
│   │   │   ├── [locale]/             → i18n locale routing (en/ar/fr)
│   │   │   │   ├── (marketing)/      → Marketing site routes
│   │   │   │   ├── dashboard/        → Agent dashboard routes
│   │   │   │   ├── design-studio/    → Bot flow builder routes
│   │   │   │   ├── login/            → Auth pages
│   │   │   │   ├── onboarding/       → Org/project bootstrap
│   │   │   │   ├── pricing/          → Pricing page
│   │   │   │   ├── products/         → Products page
│   │   │   │   ├── signup/           → Signup page
│   │   │   │   ├── solutions/        → Solutions page
│   │   │   │   ├── test-widget/      → Widget test page
│   │   │   │   ├── waitlist/         → Waitlist page
│   │   │   │   ├── layout.tsx        → Locale layout wrapper
│   │   │   │   └── not-found.tsx     → 404 page
│   │   │   ├── api/                  → API route handlers
│   │   │   ├── og/                   → Open Graph image generation
│   │   │   ├── widget/               → Embeddable widget
│   │   │   ├── globals.css           → Tailwind + design tokens
│   │   │   ├── layout.tsx            → Root layout (fonts, metadata)
│   │   │   ├── not-found.tsx         → Root 404
│   │   │   ├── robots.ts             → robots.txt generation
│   │   │   └── sitemap.ts            → sitemap.xml generation
│   │   ├── components/               → React components (~22 files + 14 subdirs)
│   │   │   ├── ui/                   → shadcn/ui base components (32 files)
│   │   │   ├── activities/           → Activity log components
│   │   │   ├── analytics/            → Analytics dashboard components
│   │   │   ├── auth/                 → Authentication components
│   │   │   ├── chat/                 → Chat interface components
│   │   │   ├── dashboard/            → Dashboard layout/components
│   │   │   ├── design-studio/        → Bot flow builder components
│   │   │   ├── feedback/             → Feedback components
│   │   │   ├── landing/              → Landing page components
│   │   │   ├── layout/               → Layout structural components
│   │   │   ├── pricing/              → Pricing components
│   │   │   ├── seo/                  → SEO meta components
│   │   │   ├── settings/             → Settings page components
│   │   │   └── [standalone files]    → Providers, language switchers, etc.
│   │   ├── config/                   → Configuration modules (1 file: apps.ts)
│   │   ├── context/                  → React context providers (1 file: ProjectContext.tsx)
│   │   ├── hooks/                    → Custom React hooks (1 file: use-mobile.tsx)
│   │   ├── i18n/                     → Internationalization (3 files: routing, navigation, request)
│   │   ├── lib/                      → Utility libraries (2 files: utils, plans)
│   │   ├── types/                    → TypeScript type definitions (1 file: flow.ts)
│   │   └── middleware.ts             → Next.js middleware (Clerk + i18n)
│   └── public/                       → Static assets (fonts, videos, JS, llms.txt)
│
├── Backend
│   └── convex/                       → Convex backend (see Parts 04-08)
│
├── Design System
│   └── design-system/yoosr/MASTER.md → Comprehensive design system (732+ lines)
│
├── Git & Tooling
│   ├── .gitignore                    → Git ignore patterns (comprehensive)
│   ├── .github/workflows/ci.yml      → CI/CD pipeline (lint, build, deploy)
│   ├── .qwen/                        → Qwen Code AI assistant configs
│   │   ├── skills/                   → Custom skills for Qwen
│   │   ├── settings.json             → Qwen permissions config
│   │   └── Prompt.md                 → Analysis prompt template
│   ├── .agent/                       → Agent instructions
│   │   ├── AGENT.md                  → Detailed agent rules, stack info, known issues
│   │   ├── DESIGN.md                 → Complete design system specification
│   │   ├── push.md                   → Push notification content
│   │   ├── yoosr-landing-page-content.md
│   │   └── rules/tech-stack-rules.md → Technology stack enforcement rules
│   └── .agents/skills/               → Additional agent skills
│
├── Documentation
│   ├── docs/                         → Analysis documentation
│   │   ├── analysis-map/             → Analysis templates (18 parts)
│   │   ├── analysis-findings/        → Completed analysis findings
│   │   └── README.md
│   ├── documentation/                → Project documentation (10 files)
│   │   ├── agent-and-bot-routing.md
│   │   ├── BLOCKS_GUIDE.md
│   │   ├── build-with-ai.md
│   │   ├── CODEBASE_AUDIT.md
│   │   ├── design-studio-execution.md
│   │   ├── monitoring-telemetry.md
│   │   ├── project_analysis.md
│   │   ├── SEO_IMPLEMENTATION.md
│   │   ├── testing_guide.md.resolved
│   │   └── VIDEO_OPTIMIZATION.md
│   └── SPECS/                        → Feature specifications (11 files)
│       ├── Agent Availability & No-Agents-Available Retry.md
│       ├── Conversation-Events-Logging.md
│       ├── Error-Boundaries.md
│       ├── Feedback.md
│       ├── landing-page.md
│       ├── localization.md
│       ├── phase-kb-upgrade.md
│       ├── phase-O2-usage-quotas.md
│       ├── phase-waitlist-clerk.md
│       ├── phase-whatsapp.md
│       └── push-notifications.md
│
└── Other
    ├── messages/                     → i18n message files (en.json, ar.json, fr.json, _i18n-audit.json)
    ├── .next/                        → Next.js build output (gitignored)
    ├── coverage/                     → Test coverage reports (gitignored)
    ├── bun.lock                      → Bun lockfile
    ├── components.json               → shadcn/ui configuration
    ├── eslint.config.mjs             → ESLint configuration
    ├── next.config.ts                → Next.js configuration
    ├── package.json                  → Dependencies and scripts
    ├── postcss.config.mjs            → PostCSS configuration
    ├── tsconfig.json                 → TypeScript configuration
    └── vercel.json                   → Vercel deployment config (security headers)
```

## 📁 File Inventory

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `.gitignore` | Git ignore patterns for build artifacts, env files, etc. | ✅ Found |
| `.github/` | GitHub Actions workflows, issue templates, PR templates | ✅ Found (workflows only) |
| `.github/workflows/ci.yml` | CI/CD pipeline (lint, build, deploy) | ✅ Found |
| `.qwen/` | Qwen Code assistant configuration | ✅ Found (6 files) |
| `.agent/` | Agent-specific settings | ✅ Found (5 files) |
| `.agents/` | Additional agent configurations | ✅ Found (skills dir) |
| `src/` | Main application source code | ✅ Found |
| `src/app/` | Next.js App Router routes | ✅ Found (9 files + 4 subdirs) |
| `src/app/[locale]/` | i18n locale routing | ✅ Found (13 items) |
| `src/components/` | React components | ✅ Found (22 files + 14 subdirs) |
| `src/components/ui/` | shadcn/ui base components | ✅ Found (32 files) |
| `src/config/` | Configuration modules | ✅ Found (1 file) |
| `src/context/` | React context providers | ✅ Found (1 file) |
| `src/hooks/` | Custom React hooks | ✅ Found (1 file) |
| `src/i18n/` | Internationalization | ✅ Found (3 files) |
| `src/lib/` | Utility libraries | ✅ Found (2 files) |
| `src/types/` | TypeScript type definitions | ✅ Found (1 file) |
| `src/middleware.ts` | Next.js middleware | ✅ Found |
| `public/` | Static assets | ✅ Found (10 files) |
| `messages/` | Internationalization message files | ✅ Found (4 files) |
| `docs/` | Project documentation (analysis map) | ✅ Found (3 items) |
| `documentation/` | Additional documentation | ✅ Found (10 files) |
| `SPECS/` | Feature specifications | ✅ Found (11 files) |
| `convex/` | Convex backend | ✅ Found (see Parts 04-08) |
| `design-system/yoosr/MASTER.md` | Design system specification | ✅ Found (732+ lines) |
| `vercel.json` | Vercel deployment configuration | ✅ Found |
| `next.config.ts` | Next.js configuration | ✅ Found |
| `tsconfig.json` | TypeScript configuration | ✅ Found |
| `eslint.config.mjs` | ESLint configuration | ✅ Found |
| `postcss.config.mjs` | PostCSS configuration | ✅ Found |
| `components.json` | shadcn/ui configuration | ✅ Found |
| `package.json` | Dependencies and scripts | ✅ Found |

## ✅ Analysis Checklist

### [x] What is the overall directory structure philosophy?

The project follows a **layer-based + feature-based hybrid structure** within Next.js App Router conventions:

- **Top-level organization**: By technical layer (`src/components/`, `src/hooks/`, `src/lib/`, `src/config/`, etc.)
- **Within components**: By feature/domain (`chat/`, `dashboard/`, `design-studio/`, `settings/`, `landing/`, etc.)
- **Routing**: Next.js App Router convention with `[locale]` dynamic segment for i18n, route groups `(marketing)` for layout separation
- **Backend separation**: Clear separation between frontend (`src/`) and backend (`convex/`) — Convex handles all database, real-time, and server logic
- **Configuration**: Flat config files at root level (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, etc.)
- **Documentation**: Three distinct documentation sources (`docs/`, `documentation/`, `SPECS/`) — see concerns below

The structure is **predictable and conventional** — a developer familiar with Next.js App Router and Convex will immediately understand where to find things.

### [x] How is code organized? (by feature, by type, layered?)

**Hybrid approach**:

1. **Type-based top-level**: `components/`, `hooks/`, `lib/`, `types/`, `config/`, `context/`, `i18n/`
2. **Feature-based within components**: `src/components/chat/`, `src/components/dashboard/`, `src/components/design-studio/`, `src/components/settings/`, etc.
3. **Route-based in app directory**: `src/app/[locale]/dashboard/`, `src/app/[locale]/design-studio/`, etc. — follows Next.js filesystem routing
4. **UI component library**: `src/components/ui/` contains 32 shadcn/ui base components — pure presentation, no business logic
5. **Shared utilities**: Minimal — `src/lib/utils.ts` (only the `cn()` helper), `src/lib/plans.ts` (plan limits constant)
6. **Type definitions**: Minimal — `src/types/flow.ts` contains Design Studio node/edge types (11 node types, 20 block types)
7. **Configuration**: Single file `src/config/apps.ts` defines available app integrations
8. **Context**: Single `ProjectContext.tsx` for active project state
9. **Hooks**: Single `use-mobile.tsx` hook for responsive breakpoint detection

The structure leans **type-based at the top, feature-based within**. This is consistent with Next.js community conventions and shadcn/ui recommendations.

### [x] What does `.gitignore` cover? Is it comprehensive?

**Yes, `.gitignore` is comprehensive** (28 rules covering 8 categories):

**Package managers**: `node_modules/`, `.pnp`, `.yarn/` (with exceptions for patches/plugins/releases/versions)

**Testing**: `/coverage`

**Next.js**: `/.next/`, `/out/`

**Production**: `/build`

**OS/misc**: `.DS_Store`, `*.pem`

**Debug logs**: `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `.pnpm-debug.log*`

**Environment files**: `.env*` (with comment noting can opt-in for committing if needed)

**Vercel**: `.vercel`

**TypeScript**: `*.tsbuildinfo`, `next-env.d.ts`

**Notable omissions**:
- No `.env.local`, `.env.*.local` explicitly listed (covered by `.env*` glob)
- No `*.log` general pattern (only specific debug logs)
- No IDE-specific ignores (`.vscode/`, `.idea/`)
- No OS temp files beyond `.DS_Store` (no `Thumbs.db`, `.AppleDouble`)
- No editor backup files (`*~`, `*.swp`)

**Quality**: Good for a Next.js + Vercel + Bun project. Could benefit from adding IDE ignores and editor temp files.

### [x] What GitHub Actions workflows exist?

**Single workflow**: `.github/workflows/ci.yml` — "CI/CD Pipeline"

**Triggers**:
- `push` to `main` branch
- `pull_request` to `main` branch

**Jobs** (2):

1. **`quality-gates`** (runs on all pushes/PRs):
   - Checkout code
   - Setup Bun (latest version)
   - Install dependencies (`bun install`)
   - Run linter (`bun run lint`)
   - Build Next.js (`bun run build`)
   - Timeout: 10 minutes
   - Runner: `ubuntu-latest`

2. **`deploy-convex`** (runs on `main` branch only, after `quality-gates` passes):
   - Checkout code
   - Setup Bun (latest version)
   - Install dependencies
   - Deploy to Convex (`npx convex deploy --cmd 'bun run build'`)
   - Uses `CONVEX_DEPLOY_KEY` from GitHub secrets
   - Conditional: `if: github.ref == 'refs/heads/main'`
   - Timeout: 10 minutes

**Observations**:
- No test execution step (no `bun test` or similar) — **concern noted below**
- Uses Bun consistently (not npm/yarn)
- Deploy step runs `bun run build` as part of `convex deploy --cmd`
- No staging environment — direct to production on main
- No notification on failure/success
- No PR status checks beyond build success

### [x] Are there automated CI/CD pipelines?

**Yes** — defined in `.github/workflows/ci.yml`:

- **CI Pipeline**: Runs on every PR to main — lint + build quality gates
- **CD Pipeline**: Runs on merge to main — deploys Convex backend
- **Frontend deployment**: Handled by Vercel (separate from GitHub Actions — Vercel auto-deploys on push to main)

**Pipeline stages**:
```
Push/PR → Quality Gates (lint + build) → (if main) → Deploy Convex
                                                          ↓
                                                  Vercel auto-deploys frontend
```

**Missing automation**:
- No automated testing in CI
- No preview deployments configured in workflow (Vercel handles this natively)
- No database migration step
- No smoke tests post-deploy
- No rollback mechanism defined

### [x] What agent/AI tool configurations exist?

**Three distinct AI agent configuration areas**:

1. **`.qwen/` (Qwen Code assistant)**:
   - `settings.json` — Permissions config: allows `npm run *`, `sed *`, `do *`, `done` commands
   - `skills/` directory — Custom skills directory
   - `Prompt.md` — Analysis prompt template
   - `QWEN.md` — Qwen memory/context
   - `remaining-work-plan.md` — Work planning document
   - `settings.json.orig` — Original settings backup

2. **`.agent/` (General agent instructions)**:
   - `AGENT.md` — **Comprehensive** agent instructions (detailed below)
   - `DESIGN.md` — Complete design system specification (732+ lines, exhaustive)
   - `push.md` — Push notification content
   - `yoosr-landing-page-content.md` — Landing page copy
   - `rules/tech-stack-rules.md` — Technology stack enforcement rules (`trigger: always_on`)

3. **`.agents/` (Additional agent skills)**:
   - `skills/` directory — Additional skill definitions

**`.agent/AGENT.md` content** (highly detailed — ~200 lines):
- Product description (Yoosr: customer communication SaaS for MENA)
- Complete tech stack listing (Next.js, Convex, Clerk, shadcn/ui, OpenRouter, etc.)
- Detailed folder structure with file-by-file descriptions for both `/convex` and `/app`
- **12 core rules**: multi-tenancy via Clerk orgs, status enums (numeric codes), leads vs Clerk users, HITL handoff, attributes field, no external infrastructure, bot engine state machine, user-selectable AI model, OpenRouter as AI gateway, no `eval()` in Code Action, internal notes filtered from widget, widget rate limiting gap
- **Known architecture issues table**: 11 issues rated Critical/High/Medium/Low with specific file locations
- Convex query best practices
- "When unsure" guidance: read source code as spec

**`.agent/rules/tech-stack-rules.md`**:
- Enforces Next.js App Router, shadcn/ui, Tailwind, Convex, Clerk
- TypeScript strict mode required
- Absolute imports (`@/`)
- shadcn/ui via CLI installation

### [x] How is documentation organized?

**Three separate documentation sources** — this is a concern (see below):

1. **`docs/`** — Analysis documentation:
   - `analysis-map/` — 18-part analysis template system (Parts 01-18)
   - `analysis-findings/` — Completed analysis findings
   - `README.md`

2. **`documentation/`** — Project documentation (10 files):
   - `agent-and-bot-routing.md` — Bot and agent routing logic
   - `BLOCKS_GUIDE.md` — Design Studio blocks guide
   - `build-with-ai.md` — AI integration guide
   - `CODEBASE_AUDIT.md` — Previous codebase audit
   - `design-studio-execution.md` — Design Studio execution details
   - `monitoring-telemetry.md` — Monitoring setup
   - `project_analysis.md` — Project analysis
   - `SEO_IMPLEMENTATION.md` — SEO implementation details
   - `testing_guide.md.resolved` — Testing guide (note: `.resolved` extension)
   - `VIDEO_OPTIMIZATION.md` — Video optimization guide

3. **`SPECS/`** — Feature specifications (11 files):
   - `Agent Availability & No-Agents-Available Retry.md`
   - `Conversation-Events-Logging.md`
   - `Error-Boundaries.md`
   - `Feedback.md`
   - `landing-page.md`
   - `localization.md`
   - `phase-kb-upgrade.md`
   - `phase-O2-usage-quotas.md`
   - `phase-waitlist-clerk.md`
   - `phase-whatsapp.md`
   - `push-notifications.md`

**Design system documentation**:
- `design-system/yoosr/MASTER.md` — 732+ line comprehensive design system
- `.agent/DESIGN.md` — Duplicate/related design system spec (709+ lines)

### [x] Are there multiple documentation sources? (docs/, documentation/, SPECS/)

**Yes — three distinct sources plus design system docs**:

| Source | Type | Files | Purpose |
|--------|------|-------|---------|
| `docs/` | Analysis | 18 templates + findings | Structured codebase analysis |
| `documentation/` | Technical | 10 files | Architecture guides, audits, implementation docs |
| `SPECS/` | Feature specs | 11 files | Feature-level specifications |
| `design-system/yoosr/` | Design | 1 file (MASTER.md) | Design system specification |
| `.agent/DESIGN.md` | Design | 1 file (732 lines) | Agent design system instructions |

**Potential duplication**:
- `design-system/yoosr/MASTER.md` and `.agent/DESIGN.md` both describe the design system
- `documentation/CODEBASE_AUDIT.md` may overlap with `docs/analysis-findings/`
- `documentation/project_analysis.md` may overlap with analysis map findings

### [x] What's in the `messages/` directory? (i18n approach)

**i18n approach**: Uses `next-intl` (v4.8.3) with locale-based routing.

**`messages/` directory contents** (4 files):
- `en.json` — English translations (1927 lines — extensive)
- `ar.json` — Arabic translations
- `fr.json` — French translations
- `_i18n-audit.json` — i18n audit metadata

**Routing configuration** (`src/i18n/routing.ts`):
```typescript
export const routing = defineRouting({
  locales: ['en', 'ar', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true,
});
```

**i18n files**:
- `src/i18n/routing.ts` — Routing configuration
- `src/i18n/navigation.ts` — Navigation utilities
- `src/i18n/request.ts` — Request handler for `next-intl` plugin

**Message structure** (from `en.json`):
```json
{
  "landing": { "header": {...}, "footer": {...}, "meta": {...}, "page": {...} },
  ...
}
```
Nested key-path structure organized by page/section.

**Middleware** (`src/middleware.ts`):
- Integrates Clerk auth + `next-intl` middleware
- Redirects bare `/` to `/en`
- Handles locale detection from Clerk session metadata
- Skips middleware for `/api`, `/widget`, `/_next`, and static assets

### [x] Is the structure consistent and predictable?

**Yes, with minor caveats**:

**Consistent patterns**:
- All UI components in `src/components/ui/` (shadcn convention)
- Feature components grouped by domain (`chat/`, `dashboard/`, `settings/`, etc.)
- All Convex backend in flat `convex/` directory with clear file naming
- Route structure follows Next.js App Router conventions
- `@/*` path alias maps to `./src/*` (configured in `tsconfig.json`)
- TypeScript strict mode enabled
- All files use `.ts`/`.tsx` extensions consistently

**Minor inconsistencies**:
- `documentation/testing_guide.md.resolved` — non-standard `.resolved` extension (likely a merge artifact)
- Three separate documentation sources (`docs/`, `documentation/`, `SPECS/`) with unclear boundaries
- `src/lib/` has only 2 files — could be consolidated or expanded
- `src/hooks/` has only 1 file — minimal for a project this size
- `src/types/` has only 1 file — most types are likely co-located with components (common pattern)
- `src/config/` has only 1 file
- Single React context in `src/context/`

**Predictability score**: **High**. A new developer can reasonably guess where to find things.

### [x] Any conventions for file naming?

**File naming conventions observed**:

1. **React components**: PascalCase (`.tsx`) — `ProjectContext.tsx`, `ConvexClientProvider.tsx`, `LanguageSwitcher.tsx`
2. **UI components**: kebab-case (`.tsx`) — `alert-dialog.tsx`, `scroll-area.tsx`, `toggle-group.tsx` (shadcn convention)
3. **Config files**: camelCase/kebab-case — `apps.ts`, `tech-stack-rules.md`
4. **Convex files**: camelCase — `knowledgeBases.ts`, `cannedResponses.ts`, `operatingHours.ts`
5. **Spec files**: Title Case with spaces — `Agent Availability & No-Agents-Available Retry.md`
6. **Message files**: locale codes — `en.json`, `ar.json`, `fr.json`
7. **Route directories**: kebab-case — `design-studio/`, `test-widget/`
8. **CSS**: kebab-case — `globals.css`
9. **Analysis map files**: zero-padded numbers — `03-project-structure-git.md`
10. **Utility files**: camelCase — `utils.ts`, `plans.ts`

**Consistency**: **Mostly consistent**. The mix of PascalCase and kebab-case for components is intentional — shadcn/ui components use kebab-case, custom components use PascalCase. This is a recognized convention.

### [x] How are environment variables managed? (.env files?)

**Environment variable management**:

1. **`.gitignore`**: `.env*` is gitignored — all env files are excluded from version control
2. **No `.env.example` or `.env.template`** found in the repository — **concern**
3. **`vercel.json`**: References `NEXT_PUBLIC_SITE_URL` with fallback (`process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.com"`)
4. **CI/CD**: Uses `CONVEX_DEPLOY_KEY` from GitHub secrets — no other env vars in workflow
5. **Clerk integration**: References `safe-pheasant-87.clerk.accounts.dev` in CSP headers — suggests environment-specific Clerk domain
6. **Content-Security-Policy** in `vercel.json` references multiple external domains:
   - `*.clerk.accounts.dev` (Clerk)
   - `*.convex.cloud` / `wss://*.convex.cloud` (Convex)
   - `api.openai.com` (OpenAI — likely legacy, should be OpenRouter)
   - `fonts.googleapis.com`, `fonts.gstatic.com` (Google Fonts)

**Expected env vars** (inferred from stack):
- `CONVEX_DEPLOY_KEY` — Convex deployment key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk public key
- `CLERK_SECRET_KEY` — Clerk secret key
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `NEXT_PUBLIC_SITE_URL` — Site URL
- `OPENROUTER_API_KEY` — OpenRouter API key (stored encrypted in DB per project)

**No `.env` file validation** (no `zod` env schema found) — **concern**

## 📝 Agent Findings

### Directory Structure Statistics

| Category | Count | Notes |
|----------|-------|-------|
| Top-level directories | 24 items | Including hidden dirs |
| Source directories (`src/`) | 9 subdirs + 1 file | Clean separation |
| Component directories | 14 feature dirs + ui/ | Well organized |
| shadcn/ui components | 32 files | Standard set |
| Custom component files | ~8 standalone files | Providers, switchers, etc. |
| Convex files | 26+ files | Per Parts 04-08 |
| Documentation files | 32 total | Across 3 sources |
| Spec files | 11 files | Feature specifications |
| i18n message files | 4 files | en, ar, fr + audit |
| Config files at root | 7 files | next, ts, eslint, postcss, vercel, components, package |

### Agent Configuration Depth

The `.agent/AGENT.md` file is remarkably comprehensive and serves as the **single source of truth** for AI assistants working on the codebase. It includes:

- Product context and positioning
- Complete tech stack with version context
- File-by-file folder structure documentation
- 12 explicit core rules with code examples
- 11 known architecture issues with severity ratings and file locations
- Convex query best practices
- Error handling guidance

This is an **excellent example** of agent-ready documentation — it enables autonomous work without constant human clarification.

### Design System Formalization

The design system exists in **two places**:
1. `design-system/yoosr/MASTER.md` — 732+ line formal specification
2. `.agent/DESIGN.md` — 709+ line agent-focused version

Both are exhaustive, covering: color tokens, typography, spacing, border radius, shadows, component anatomy (15 component types), layout rules, breakpoints, z-index, motion/animation specs, RTL/LTR rules, and icon rules.

The design system is **production-grade** with exact pixel values, RTL parity, and animation timing specifications.

### CI/CD Maturity

The CI/CD pipeline is **minimal but functional**:
- Quality gates: lint + build
- Auto-deploy on main merge
- Uses Bun consistently
- 10-minute timeouts per job

**Missing stages**: testing, security scanning, preview deployments, database migrations, smoke tests, rollback procedures.

### i18n Implementation Quality

The i18n setup is **well-architected**:
- `next-intl` v4.8.3 with plugin integration in `next.config.ts`
- 3 locales: en, ar, fr
- Locale prefix always present (`localePrefix: 'always'`)
- Automatic locale detection
- Middleware integration with Clerk
- RTL support documented in design system (Cairo font for Arabic, `dir="rtl"` on `<html>`)
- Message files are substantial (1927 lines for English)

### Public Assets

`public/` contains:
- `fonts/` directory — self-hosted fonts
- `design-studio.mp4` / `design-studio-original.mp4` — Demo videos
- `walkthrough.mp4` / `walkthrough-original.mp4` — Walkthrough videos
- `notification.mp3` — Notification sound
- `sw.js` — Service worker (for PWA/push notifications)
- `widget.js` — Embeddable widget script
- `llms.txt` — AI crawler documentation
- `yoosr-light.svg` — Logo

## 🔍 Key Patterns to Identify

1. **Convention over configuration**: Heavy reliance on Next.js, Convex, and shadcn/ui defaults. Minimal custom configuration — `next.config.ts` is only 17 lines, `postcss.config.mjs` is 5 lines.

2. **Feature-based component organization**: Within `src/components/`, directories are organized by feature domain (chat, dashboard, settings, design-studio, etc.) rather than by component type.

3. **Layer-based top-level structure**: Top-level directories in `src/` are organized by technical layer (components, hooks, lib, types, config, context, i18n).

4. **Dual documentation strategy**: Analysis docs (`docs/`) separate from technical documentation (`documentation/`) and feature specs (`SPECS/`). This appears intentional but creates potential for drift.

5. **Agent-first documentation**: `.agent/AGENT.md` and `.agent/DESIGN.md` are written specifically for AI assistants, not human developers. This suggests heavy reliance on AI-assisted development.

6. **Bun as package manager**: CI/CD, lockfile (`bun.lock`), and scripts all use Bun — not npm or yarn.

7. **TypeScript strict mode**: Enabled in `tsconfig.json` — `strict: true` with no exceptions.

8. **Path aliasing**: `@/*` maps to `./src/*` — used consistently for imports.

9. **Tailwind CSS v4**: Uses Tailwind v4 with `@import "tailwindcss"` and `@theme inline` directive (new v4 syntax).

10. **Design system as code**: The `design-system/yoosr/MASTER.md` file is a formal specification with exact token values, component dimensions, and animation specs — not just guidelines.

11. **Multi-tenancy via Clerk Organizations**: Every Convex query scopes data by `orgId` from JWT identity — never passed from frontend.

12. **Numeric status codes**: Conversations use 100/200/1000, not string values — enforced by agent rules.

## ⚠️ Potential Concerns

### HIGH Severity

| # | Concern | Location | Impact | Recommendation |
|---|---------|----------|--------|----------------|
| 1 | **No tests in CI pipeline** | `.github/workflows/ci.yml` | No automated test verification before deploy; regression risk | Add `bun test` step to quality-gates job |
| 2 | **Three separate documentation sources** | `docs/`, `documentation/`, `SPECS/` | Documentation drift, conflicting information, onboarding confusion | Consolidate into single source or establish clear ownership boundaries |
| 3 | **No `.env.example` file** | Root directory | New developers don't know what env vars are needed; onboarding friction | Add `.env.example` with all required variables documented |
| 4 | **Duplicate design system files** | `design-system/yoosr/MASTER.md` vs `.agent/DESIGN.md` | Potential for drift between copies; unclear source of truth | Single source with symlink or import reference |

### MEDIUM Severity

| # | Concern | Location | Impact | Recommendation |
|---|---------|----------|--------|----------------|
| 5 | **Minimal src/lib/, src/hooks/, src/types/, src/config/** | `src/` directories | May indicate underutilized shared layer, or types co-located with components (acceptable) | Monitor — current pattern is acceptable if intentional |
| 6 | **No env var validation schema** | No `env.ts` or similar | Runtime errors from missing env vars not caught at build time | Add Zod-validated env schema (e.g., `@t3-oss/env-nextjs`) |
| 7 | **No staging environment in CI** | `.github/workflows/ci.yml` | Direct to production deployment; no pre-production validation | Add staging deploy job with manual approval gate |
| 8 | **CSP references `api.openai.com`** | `vercel.json` | May be legacy reference; project uses OpenRouter, not direct OpenAI | Audit and remove if unused |
| 9 | **Non-standard file extension** | `documentation/testing_guide.md.resolved` | Likely merge artifact; confusing for navigation | Rename to `testing_guide.md` or remove |

### LOW Severity

| # | Concern | Location | Impact | Recommendation |
|---|---------|----------|--------|----------------|
| 10 | **No IDE-specific .gitignore entries** | `.gitignore` | Potential for IDE config files to be committed if developers don't have global ignores | Add `.vscode/`, `.idea/` to `.gitignore` |
| 11 | **No notification on CI failure** | `.github/workflows/ci.yml` | Team may not notice broken builds promptly | Add Slack/Discord notification step |
| 12 | **Single React context provider** | `src/context/ProjectContext.tsx` | May need additional contexts as app grows | Not an issue now; monitor |
| 13 | **No editor backup/temp file ignores** | `.gitignore` | Editor swap files could be committed | Add `*~`, `*.swp`, `*.swo` patterns |

---

**Analysis Date**: 2026-04-05
**Analyst**: Qwen Code
**Files Examined**: 50+ files across 24 top-level directories
**Confidence Level**: High — all files read and verified against checklist items
