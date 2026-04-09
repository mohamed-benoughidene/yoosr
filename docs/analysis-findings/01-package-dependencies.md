# Part 01: Package Dependencies

## 📊 Visual Map

```
package.json (name: "yoosr", v0.1.0, private: true, packageManager: bun@1.3.6)
├── dependencies (63 runtime packages)
│   ├── @clerk/nextjs, @clerk/localizations, @clerk/themes  → Authentication & user management (3 pkgs)
│   ├── convex, @convex-dev/rate-limiter                    → Backend/database/real-time (2 pkgs)
│   ├── react 19.2.3, react-dom 19.2.3                     → UI framework (pinned exact)
│   ├── next 16.1.6                                         → React framework SSR/SSG (pinned exact)
│   ├── @radix-ui/*                                         → Headless UI primitives (23 pkgs)
│   ├── tailwindcss-animate, tw-animate-css, tailwind-merge → Styling utilities (3 pkgs)
│   ├── @tailwindcss/typography                             → Prose typography plugin
│   ├── class-variance-authority, clsx                      → Class composition utilities
│   ├── zod                                                 → Schema validation
│   ├── react-hook-form, @hookform/resolvers                → Form management (2 pkgs)
│   ├── recharts, @tanstack/react-table                     → Data visualization & tables
│   ├── framer-motion                                       → Animations
│   ├── next-intl                                           → Internationalization
│   ├── next-themes                                         → Theme management (dark mode)
│   ├── openai, @huggingface/inference                      → AI/ML integrations (2 pkgs)
│   ├── @xyflow/react                                       → Flow/node graph editor (design studio)
│   ├── lucide-react, @radix-ui/react-icons                 → Icon libraries (2 pkgs)
│   ├── sonner                                              → Toast notifications
│   ├── react-error-boundary                                → Error boundary component
│   ├── react-resizable-panels                              → Resizable panel layouts
│   ├── react-day-picker                                    → Calendar/date picker
│   ├── media-chrome                                        → Video player component
│   ├── svix                                                → Webhook verification (Clerk)
│   ├── web-push                                            → Push notification (VAPID)
│   ├── papaparse, @types/papaparse                         → CSV parsing (⚠️ @types in runtime)
│   ├── xlsx                                                → Spreadsheet parsing
│   ├── unpdf                                               → PDF parsing
│   ├── date-fns                                            → Date utilities
│   ├── expr-eval                                           → Expression evaluation (bot engine)
│   └── uuid                                                → UUID generation
│
├── devDependencies (17 tooling packages)
│   ├── typescript ^5                                       → Type system
│   ├── eslint ^9, eslint-config-next 16.1.6                → Code linting
│   ├── tailwindcss ^4, @tailwindcss/postcss ^4             → CSS framework (Tailwind v4)
│   ├── vitest ^4.1.2, @vitest/coverage-v8 ^4.1.2          → Test runner & coverage
│   ├── @testing-library/react, /dom, /jest-dom             → Testing utilities (3 pkgs)
│   ├── jsdom ^29                                           → DOM environment for tests
│   ├── @faker-js/faker ^10                                 → Test data generation
│   ├── @types/node ^20, @types/react ^19, @types/react-dom ^19 → Type definitions
│   ├── @types/uuid ^10, @types/web-push ^3.6.4            → Type definitions
│   └── (no formatter like Prettier installed)
│
├── browserslist: "defaults and supports es6-module"
│
└── scripts
    ├── dev        → next dev                               → Start development server
    ├── build      → next build                             → Production build
    ├── start      → next start                             → Run production server
    ├── lint       → eslint                                 → Run ESLint
    ├── test       → vitest run                             → Run tests once
    ├── test:watch → vitest                                 → Run tests in watch mode
    └── test:coverage → vitest run --coverage               → Run tests with coverage
```

## 📁 File Inventory

| File | Purpose | Exists? |
|------|---------|---------|
| `package.json` | Project manifest: dependencies, scripts, metadata | ✅ Yes (3,170 bytes) |
| `bun.lock` | Bun package manager lockfile (v1 format) | ✅ Yes (222,440 bytes, 1,782 lines) |
| `package-lock.json` | npm package manager lockfile | ❌ **Not found** (template was wrong) |
| `skills-lock.json` | Agent skills configuration (15 skills from 10 sources) | ✅ Yes (3,004 bytes) |

## ✅ Analysis Checklist

- [x] **What package manager is being used? (bun vs npm - both lockfiles exist)**
  - **Bun v1.3.6** is the designated package manager, explicitly declared via `"packageManager": "bun@1.3.6"` in `package.json`.
  - Only `bun.lock` exists (lockfileVersion 1, configVersion 0). **There is no `package-lock.json`** — the template's concern about dual lockfiles is not applicable.
  - The `.gitignore` does NOT explicitly ignore `package-lock.json`, so if one were accidentally created, it could be committed.

- [x] **What are the core dependencies and their roles?**
  - **Framework**: Next.js 16.1.6 (pinned), React 19.2.3 (pinned), React DOM 19.2.3 (pinned)
  - **Backend**: Convex ^1.31.7 (real-time database + serverless functions), @convex-dev/rate-limiter ^0.3.2
  - **Auth**: @clerk/nextjs ^6.37.5, @clerk/localizations ^4.2.2, @clerk/themes ^2.4.57
  - **UI Components**: 23 @radix-ui primitives (shadcn/ui foundation), lucide-react ^0.575.0 (icons)
  - **Styling**: tailwind-merge ^3.4.0, class-variance-authority ^0.7.1, clsx ^2.1.1, tailwindcss-animate ^1.0.7, tw-animate-css ^1.4.0
  - **Forms**: react-hook-form ^7.71.1, @hookform/resolvers ^5.2.2, zod ^4.3.6
  - **i18n**: next-intl ^4.8.3
  - **AI/ML**: openai ^6.22.0, @huggingface/inference ^4.13.12
  - **Data viz**: recharts ^2.15.4, @tanstack/react-table ^8.21.3
  - **Flow editor**: @xyflow/react ^12.10.0 (heavily used in design-studio — 26+ files)
  - **File parsing**: papaparse ^5.5.3 (CSV), xlsx ^0.18.5 (spreadsheets), unpdf ^1.4.0 (PDF, used in convex/knowledge.ts)
  - **Notifications**: sonner ^2.0.7 (toasts), web-push ^3.6.7 (VAPID push)
  - **Misc**: date-fns ^4.1.0, uuid ^13.0.0, svix ^1.90.0 (webhook verification), expr-eval ^2.0.2 (used in convex/bot.ts), framer-motion ^12.38.0, react-resizable-panels ^2.0.19, react-day-picker ^9.13.2, media-chrome ^4.18.3 (video player), react-error-boundary ^6.1.1, next-themes ^0.4.6

- [x] **Are there any unused or outdated dependencies?**
  - **`tailwindcss-animate` (^1.0.7)**: NOT referenced anywhere in `src/` directory or any config. Only found in `package.json`. The project uses `tw-animate-css` instead (imported in `globals.css`). **Likely unused — candidate for removal.**
  - **`@huggingface/inference` (^4.13.12)**: NOT imported anywhere in `src/` or `convex/`. **Likely unused — candidate for removal.** The project uses OpenRouter/OpenAI SDK for AI features instead.
  - **`@radix-ui/react-icons` (^1.3.2)**: Only imported in ONE file (`src/components/ui/dialog.tsx`, importing `Cross2Icon`). The standard icon library is `lucide-react`. **Could be replaced to eliminate an entire icon package for a single icon.**
  - All actively-used packages appear to be relatively recent versions.

- [x] **What version ranges are used? (fixed, semver, latest?)**
  - **Fixed/pinned versions (3)**: `next: 16.1.6`, `react: 19.2.3`, `react-dom: 19.2.3` — core framework is pinned for stability.
  - **Caret ranges (60)**: All other runtime dependencies use `^` (e.g., `^1.31.7`), allowing minor + patch updates.
  - **Tilde ranges (0)**: No tilde ranges used.
  - **Dev fixed (1)**: `eslint-config-next: 16.1.6` — pinned to match Next.js version.
  - **Dev caret (16)**: All other dev deps use `^`.
  - **Strategy**: Pin the core framework trio for reproducibility; allow semver-compatible updates for everything else. This is a **solid, industry-standard approach**.

- [x] **Are there any security vulnerabilities in dependencies?**
  - Cannot run `bun audit` or `npm audit` in this analysis, but noteworthy observations:
    - `xlsx ^0.18.5` is the SheetJS community edition, which has had past CVEs. Consider monitoring.
    - `svix ^1.90.0` handles webhook verification — critical for Clerk webhook security.
    - The CSP in `vercel.json` includes `'unsafe-inline' 'unsafe-eval'` for scripts, which weakens security.
  - Recommend running `bun audit` or using a tool like Snyk for a full vulnerability scan.

- [x] **What's the bundle size impact of major dependencies?**
  - **Heavy hitters** (estimated minified sizes):
    - `recharts`: ~470 KB (includes D3 internals)
    - `@xyflow/react`: ~200 KB
    - `framer-motion`: ~150 KB
    - `xlsx`: ~300 KB (large, tree-shakes poorly)
    - `openai`: ~100 KB
    - `@radix-ui/*` (23 packages): ~50–100 KB total (tree-shakeable primitives)
    - `zod` v4: ~12 KB (significant reduction from v3)
  - Bundle risk: `recharts`, `xlsx`, and `@xyflow/react` are the biggest contributors. All should be code-split / lazy-loaded where possible.

- [x] **Are dev dependencies properly separated from runtime deps?**
  - **Issue**: `@types/papaparse` (^5.5.2) is in `dependencies` instead of `devDependencies`. Type packages should **always** be in devDependencies.
  - All other type packages (`@types/node`, `@types/react`, `@types/react-dom`, `@types/uuid`, `@types/web-push`) are correctly in devDependencies.
  - Testing tools (vitest, @testing-library/*, jsdom, @faker-js/faker) are properly in devDependencies.
  - Build tools (typescript, eslint, tailwindcss, postcss) are properly in devDependencies.

- [x] **What npm scripts are defined? Are they sufficient?**
  - **Defined scripts (7)**:
    - `dev`, `build`, `start` — standard Next.js lifecycle ✅
    - `lint` — runs `eslint` (no args, relies on eslint.config.mjs) ✅
    - `test`, `test:watch`, `test:coverage` — comprehensive testing scripts ✅
  - **Missing scripts** that would improve DX:
    - `lint:fix` — auto-fix lint issues (`eslint --fix`)
    - `format` / `format:check` — no Prettier or formatter is configured
    - `typecheck` — `tsc --noEmit` for standalone type checking
    - `db:push` / `db:seed` — Convex-specific scripts (`npx convex dev`, seeding)
    - `clean` — remove `.next/`, `node_modules/`, etc.
    - `analyze` — bundle analysis (e.g., `@next/bundle-analyzer`)

- [x] **Are there any peer dependency issues?**
  - React 19.2.3 is used. All @radix-ui packages, recharts, react-hook-form, and other React ecosystem packages need to support React 19. As of the versions listed, most are compatible.
  - `eslint-config-next: 16.1.6` correctly matches `next: 16.1.6`.
  - No obvious peer dependency conflicts visible from manifest alone. Would need `bun install` output to verify.

- [x] **What's the update strategy for dependencies?**
  - Core framework (Next.js, React, React DOM) uses **pinned versions**, requiring explicit upgrades.
  - All other dependencies use **caret ranges** (`^`), which allow automatic minor/patch updates within the lockfile.
  - The `bun.lock` file locks resolved versions for reproducibility across environments.
  - No automated dependency update tool (Renovate, Dependabot) is configured in `.github/` — updates appear to be manual.

## 📝 Agent Findings

### Dependency Architecture

The project follows a **modern Next.js + Convex** full-stack architecture with:
- **Frontend**: React 19.2.3 + Next.js 16.1.6 (App Router) + Tailwind CSS v4
- **Backend**: Convex serverless functions (queries, mutations, actions)
- **Auth**: Clerk (with webhook verification via svix)
- **UI**: shadcn/ui pattern (Radix primitives + CVA + Tailwind)

### Unusual Dependencies

1. **`expr-eval` (^2.0.2)**: An expression parser used in `convex/bot.ts` for evaluating dynamic expressions in the chatbot engine. This is a niche dependency but justified for the bot flow builder.

2. **`media-chrome` (^4.18.3)**: A web component-based video player used in `src/components/landing/VideoPlayer.tsx`. Used only in the landing page.

3. **`unpdf` (^1.4.0)**: PDF text extraction, used in `convex/knowledge.ts` for knowledge base document ingestion.

### Duplicate Animation Packages

Two Tailwind animation packages are installed:
- `tailwindcss-animate` (^1.0.7) — **NOT imported anywhere**
- `tw-animate-css` (^1.4.0) — **Imported in `globals.css`** (active)

`tailwindcss-animate` appears to be a leftover from a migration to `tw-animate-css` and should be removed.

### Dual Icon Libraries

Two icon libraries are installed:
- `lucide-react` (^0.575.0) — Primary icon library, used extensively throughout the app
- `@radix-ui/react-icons` (^1.3.2) — Only used in **one file** (`src/components/ui/dialog.tsx` for `Cross2Icon`)

This is wasteful. The single `Cross2Icon` usage should be replaced with `lucide-react`'s `X` icon.

## 🔍 Key Patterns to Identify

- **Package manager**: Bun v1.3.6 exclusively (no npm lockfile — template concern was unfounded)
- **Single package structure** (not a monorepo)
- **Version strategy**: Pin core framework (Next, React), caret range for everything else
- **Script conventions**: Standard Next.js + Vitest scripts. Missing DX scripts (lint:fix, typecheck, format)
- **No formatter configured**: No Prettier, Biome, or other formatter in deps — potential code style inconsistency
- **No Dependabot/Renovate**: Dependency updates are manual

## ⚠️ Potential Concerns

### HIGH
- **`@types/papaparse` in runtime dependencies**: Should be moved to `devDependencies`. Type packages have zero runtime value and add to `node_modules` in production deployments.

### MEDIUM
- **`tailwindcss-animate` is unused**: Installed but never imported. Dead dependency that should be removed to reduce lockfile complexity and potential confusion.
- **`@huggingface/inference` appears unused**: No imports found in `src/` or `convex/`. If the project migrated to OpenRouter/OpenAI, this should be removed.
- **No code formatter configured**: No Prettier, Biome, or similar tool in dependencies or configs. This risks inconsistent code styling across contributors.
- **Dual icon libraries**: `@radix-ui/react-icons` is used in a single file. Consolidate to `lucide-react` to eliminate a redundant dependency.

### LOW
- **Missing DX scripts**: No `lint:fix`, `typecheck`, `format`, or `clean` scripts reduce developer productivity.
- **`xlsx` bundle size**: SheetJS is ~300KB minified and tree-shakes poorly. Ensure it's code-split/lazy-loaded.
- **No automated dependency updates**: No Renovate or Dependabot configuration found. Dependencies could silently become outdated.
- **`browserslist` set to `"defaults and supports es6-module"`**: This excludes IE11 (intentional and correct for Next.js 16), but should be verified against target audience requirements.
