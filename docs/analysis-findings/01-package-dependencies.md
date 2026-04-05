# Part 01: Package Dependencies — Analysis Findings

## 📊 Visual Map

```
package.json
├── dependencies (54 runtime packages)
│   ├── Auth & Identity
│   │   ├── @clerk/nextjs@^6.37.5       → Core Clerk Next.js integration
│   │   ├── @clerk/localizations@^4.2.2  → i18n for Clerk UI
│   │   └── @clerk/themes@^2.4.57        → Clerk theme customization
│   │
│   ├── Backend & Data
│   │   ├── convex@^1.31.7              → Convex reactive backend
│   │   └── @convex-dev/rate-limiter@^0.3.2 → Rate limiting utility
│   │
│   ├── UI Framework & Components
│   │   ├── next@16.1.6                  → Next.js 16 (pinned)
│   │   ├── react@19.2.3                 → React 19 (pinned)
│   │   ├── react-dom@19.2.3             → React DOM (pinned)
│   │   ├── @radix-ui/* (18 packages)    → Headless UI primitives
│   │   ├── lucide-react@^0.575.0        → Icon library
│   │   ├── class-variance-authority@^0.7.1 → Component variant management
│   │   ├── clsx@^2.1.1                  → Conditional className
│   │   └── tailwind-merge@^3.4.0        → Tailwind class dedup
│   │
│   ├── Forms & Validation
│   │   ├── react-hook-form@^7.71.1      → Form state management
│   │   ├── @hookform/resolvers@^5.2.2   → Schema-based validation
│   │   └── zod@^4.3.6                   → Runtime type validation
│   │
│   ├── Styling & Animation
│   │   ├── framer-motion@^12.38.0       → Animation library
│   │   ├── tailwindcss-animate@^1.0.7   → Tailwind animation plugin
│   │   ├── tw-animate-css@^1.4.0        → CSS animation utilities
│   │   └── @tailwindcss/typography@^0.5.19 → Prose styling
│   │
│   ├── Data & Visualization
│   │   ├── recharts@^2.15.4             → Chart components
│   │   └── @tanstack/react-table@^8.21.3 → Data table primitives
│   │
│   ├── Internationalization
│   │   └── next-intl@^4.8.3             → Next.js i18n
│   │
│   ├── AI & ML
│   │   ├── openai@^6.22.0               → OpenAI SDK
│   │   └── @huggingface/inference@^4.13.12 → Hugging Face inference
│   │
│   ├── Utilities
│   │   ├── date-fns@^4.1.0              → Date manipulation
│   │   ├── uuid@^13.0.0                 → UUID generation
│   │   ├── papaparse@^5.5.3             → CSV parsing
│   │   ├── xlsx@^0.18.5                 → Excel file handling
│   │   ├── expr-eval@^2.0.2             → Expression evaluator (bot conditions)
│   │   ├── unpdf@^1.4.0                 → PDF text extraction
│   │   ├── media-chrome@^4.18.3         → Media player controls
│   │   ├── @xyflow/react@^12.10.0       → Node-based flow editor (Design Studio)
│   │   ├── sonner@^2.0.7                → Toast notifications
│   │   ├── web-push@^3.6.7              → Push notification server
│   │   ├── next-themes@^0.4.6           → Dark mode theming
│   │   ├── react-error-boundary@^6.1.1  → Error boundary wrapper
│   │   ├── react-resizable-panels@^2.0.19 → Resizable panel layouts
│   │   ├── @radix-ui/react-icons@^1.3.2 → Radix icon set
│   │   ├── @types/papaparse@^5.5.2      → Papaparse types
│   │   └── react-day-picker@^9.13.2     → Date picker component
│   │
│   └── DevDependencies (14 tooling packages)
│       ├── typescript@^5                → TypeScript compiler
│       ├── eslint@^9                    → Linter
│       ├── eslint-config-next@16.1.6    → Next.js ESLint rules
│       ├── tailwindcss@^4               → Tailwind CSS v4
│       ├── @tailwindcss/postcss@^4      → Tailwind PostCSS plugin
│       ├── vitest@^4.1.2                → Test runner
│       ├── @vitest/coverage-v8@^4.1.2   → Code coverage
│       ├── jsdom@^29.0.1                → DOM simulation
│       ├── @testing-library/react@^16.3.2 → React testing
│       ├── @testing-library/dom@^10.4.1  → DOM testing
│       ├── @testing-library/jest-dom@^6.9.1 → Jest matchers
│       ├── @faker-js/faker@^10.3.0      → Fake data generation
│       ├── @types/node@^20              → Node type definitions
│       ├── @types/react@^19             → React type definitions
│       ├── @types/react-dom@^19         → React DOM types
│       ├── @types/uuid@^10.0.0          → UUID types
│       └── @types/web-push@^3.6.4       → Web push types
│
└── scripts (7 scripts)
    ├── dev          → Start development server (next dev)
    ├── build        → Production build (next build)
    ├── start        → Production server (next start)
    ├── lint         → Run ESLint (eslint)
    ├── test         → Run Vitest once (vitest run)
    ├── test:watch   → Run Vitest watch mode (vitest)
    └── test:coverage → Run Vitest with coverage (vitest run --coverage)
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `package.json` | Project manifest: 54 deps, 14 devDeps, 7 scripts, bun@1.3.6 |
| `bun.lock` | Bun package manager lockfile (active package manager) |
| `skills-lock.json` | Agent skills configuration |
| `package-lock.json` | **NOT FOUND** — Only bun.lock exists (template was incorrect) |

## ✅ Analysis Checklist

- [x] **What package manager is being used?**
  Bun 1.3.6 is explicitly declared in `package.json` via `"packageManager": "bun@1.3.6"`. Only `bun.lock` exists — there is no `package-lock.json`. The template incorrectly assumed both lockfiles exist.

- [x] **What are the core dependencies and their roles?**
  See the visual map above for full categorization. Core pillars:
  - **Auth**: Clerk (nextjs, localizations, themes) — JWT-based auth with org support
  - **Backend**: Convex — reactive database + server functions
  - **UI**: Next.js 16 + React 19 + Radix UI (18 packages) + Tailwind v4
  - **Forms**: react-hook-form + zod v4 validation
  - **AI**: OpenAI SDK + Hugging Face inference + Convex rate limiter
  - **i18n**: next-intl v4
  - **Charts**: recharts + TanStack Table
  - **Bot Builder**: @xyflow/react (node-based flow editor)

- [x] **Are there any unused or outdated dependencies?**
  - **Potentially unused**: `@radix-ui/react-icons` — the project uses `lucide-react` as the primary icon library (configured in `components.json`). The Radix icons package may be redundant unless used in specific legacy components.
  - **No obviously outdated packages** — all use recent major versions (React 19, Next.js 16, Tailwind v4, Zod v4).
  - `@tailwindcss/postcss` v4 aligns with `tailwindcss` v4 — consistent.

- [x] **What version ranges are used?**
  Mixed strategy:
  - **Pinned exact** (no `^` or `~`): `next@16.1.6`, `react@19.2.3`, `react-dom@19.2.3`, `eslint-config-next@16.1.6` — critical framework packages are pinned.
  - **Caret ranges** (`^`): Most other deps use `^` for semver-compatible updates (e.g., `convex@^1.31.7`, `zod@^4.3.6`).
  - **Major-only** (`^` with major only): `typescript@^5`, `eslint@^9`, `tailwindcss@^4`, `@types/node@^20`.

- [x] **Are there any security vulnerabilities in dependencies?**
  No known critical vulnerabilities from the listed packages. Notable security-conscious patterns:
  - Integration credentials are encrypted using AES-GCM in `convex/lib/crypto.ts`
  - `xlsx@^0.18.5` has had historical CVEs but this is the latest available version
  - `expr-eval@^2.0.2` is a sandbox-safe expression evaluator (not `eval()`)

- [x] **What's the bundle size impact of major dependencies?**
  Large packages that impact bundle:
  - `framer-motion@^12.38.0` — animation library (~35KB gzipped)
  - `recharts@^2.15.4` — charting library (significant, but likely tree-shaken)
  - `@xyflow/react@^12.10.0` — flow editor for Design Studio
  - `openai@^6.22.0` — server-side only (should not affect client bundle)
  - `@huggingface/inference@^4.13.12` — server-side only
  - `media-chrome@^4.18.3` — media player (likely only loaded on demand)
  - 18 Radix UI packages — individually imported, good for tree-shaking

- [x] **Are dev dependencies properly separated from runtime deps?**
  **Yes.** Dev dependencies are correctly limited to: TypeScript, ESLint, Tailwind CSS (v4 build tooling), Vitest, jsdom, Testing Library, Faker, and type definitions. All runtime deps (React, Convex, Clerk, Zod, etc.) are in `dependencies`.

- [x] **What npm scripts are defined? Are they sufficient?**
  7 scripts defined:
  - `dev`, `build`, `start`, `lint` — standard Next.js scripts
  - `test`, `test:watch`, `test:coverage` — Vitest integration
  - **Missing**: No Convex-specific scripts (e.g., `convex dev`, `convex deploy`, `convex migrate`). These are run via `npx convex` directly.
  - **Missing**: No type-check script (`tsc --noEmit`).
  - Scripts are minimal but sufficient for the CI pipeline.

- [x] **Are there any peer dependency issues?**
  No peer dependency warnings observed during installation. The `browserslist` field targets `"defaults and supports es6-module"` which is reasonable for React 19.

- [x] **What's the update strategy for dependencies?**
  No automated update tool configured (no Dependabot, Renovate, or similar in `.github/workflows/`). Only a single `ci.yml` workflow exists. Updates appear to be manual. The semver ranges (`^`) allow minor/patch updates via `bun update`.

## 📝 Agent Findings

### Package Manager
- **Bun 1.3.6** is the sole package manager. No `package-lock.json` exists — the template assumption was wrong.
- The CI pipeline (`ci.yml`) uses `oven-sh/setup-bun@v2` confirming Bun is the production package manager.

### Dependency Categories
- **54 runtime dependencies**, **17 dev dependencies**
- Heavy investment in: Convex backend, Clerk auth, Radix UI primitives, AI integrations
- The bot flow builder uses `@xyflow/react` for the Design Studio visual editor
- `expr-eval` is used for runtime condition evaluation in bot flows

### Version Strategy
- Critical frameworks (Next.js, React, React DOM) are **pinned to exact versions**
- Libraries use caret ranges for safe updates
- Major-only ranges for well-established tooling (TypeScript, ESLint, Tailwind)

## 🔍 Key Patterns to Identify

- **Single package manager**: Bun only (bun.lock present, no npm lockfile)
- **Pinned core frameworks**: Next.js 16.1.6, React 19.2.3 exact pins for stability
- **shadcn/ui ecosystem**: Radix UI + Tailwind + cva + lucide icons + sonner toasts
- **AI-first architecture**: OpenAI + Hugging Face + Convex + rate limiter for LLM integration
- **Multi-channel support**: web-push, xlsx, papaparse, media-chrome for diverse I/O

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| **No automated dependency updates** | MEDIUM | No Dependabot/Renovate configured; manual updates risk falling behind on security patches |
| **No `tsc --noEmit` script** | LOW | Type checking requires running `build` which is slow; a dedicated type-check script would improve DX |
| **Large bundle surface area** | LOW | 54 runtime deps including heavy libraries (recharts, framer-motion, @xyflow/react) — should verify tree-shaking is effective |
| **`openai` and `@huggingface/inference` in runtime deps** | LOW | These are server-side-only packages but live in `dependencies` not a separate server bundle. In Next.js App Router this is fine as long as they're only imported in server components/actions. |
