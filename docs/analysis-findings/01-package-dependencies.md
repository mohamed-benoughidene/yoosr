# Part 01: Package Dependencies

## 📊 Visual Map

```
package.json (name: "yoosr", v0.1.0, private: true, packageManager: bun@1.3.6)
├── dependencies (63+ runtime packages)
│   ├── @clerk/nextjs, @clerk/localizations, @clerk/themes  → Authentication & user management (3 pkgs)
│   ├── convex, @convex-dev/rate-limiter                    → Backend/database/real-time (2 pkgs)
│   ├── react 19.2.3, react-dom 19.2.3                     → UI framework (pinned exact)
│   ├── next 16.1.7                                         → React framework SSR/SSG (pinned exact)
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
│   ├── papaparse                                           → CSV parsing
│   ├── @types/papaparse                                    → CSV type defs (✅ moved to devDependencies)
│   ├── exceljs                                             → Spreadsheet read/write
│   ├── unpdf                                               → PDF parsing
│   ├── date-fns                                            → Date utilities
│   ├── expr-eval                                           → Expression evaluation (bot engine)
│   ├── uuid                                                → UUID generation
│   ├── @vercel/analytics, @vercel/speed-insights           → Vercel observability (2 pkgs)
│   └── @upstash/context7-mcp                               → Context7 MCP integration
│
├── devDependencies (17+ tooling packages)
│   ├── typescript ^5                                       → Type system
│   ├── eslint ^9, eslint-config-next 16.1.6                → Code linting
│   ├── tailwindcss ^4, @tailwindcss/postcss ^4             → CSS framework (Tailwind v4)
│   ├── vitest ^4.1.2, @vitest/coverage-v8 ^4.1.2          → Test runner & coverage
│   ├── @testing-library/react, /dom, /jest-dom             → Testing utilities (3 pkgs)
│   ├── jsdom ^29                                           → DOM environment for tests
│   ├── @faker-js/faker ^10.3.0                             → Test data generation
│   ├── @types/node ^20, @types/react ^19, @types/react-dom ^19 → Type definitions
│   ├── @types/uuid ^10, @types/web-push ^3.6.4            → Type definitions
│   ├── @types/papaparse                                    → CSV type defs (moved from dependencies ✅)
│   └── @lhci/cli ^0.15.1                                   → Lighthouse CI
│
└── scripts
    ├── dev        → next dev                               → Start development server
    ├── build      → next build                             → Production build
    ├── start      → next start                             → Run production server
    ├── lint       → eslint                                 → Run ESLint
    ├── test       → vitest run                             → Run tests once
    ├── test:watch → vitest                                 → Run tests in watch mode
    ├── test:coverage → vitest run --coverage               → Run tests with coverage
    ├── test:convex → vitest run --config vitest.convex.config.ts → Convex backend tests ✅ NEW
    └── lighthouse → lhci autorun                           → Lighthouse audit ✅ NEW
```

## 📝 Updated Findings

### ✅ Resolved: @types/papaparse Moved to devDependencies

`@types/papaparse` was previously in `dependencies` (HIGH severity finding). It has been moved to `devDependencies` where type-only packages belong.

### ✅ Resolved: New Test Infrastructure

A dedicated Convex backend test configuration (`vitest.convex.config.ts`) has been created with a `test:convex` script. The project now has:
- **5 test files**: `src/lib/env.test.ts`, `src/lib/utils.test.ts`, `convex/lib/auth.test.ts`, `convex/lib/softDelete.test.ts`, `convex/lib/jsonExtract.test.ts`
- **42 total test cases**: 12 frontend + 30 Convex backend
- Separate test configs: `vitest.config.ts` (jsdom) for frontend, `vitest.convex.config.ts` (node) for backend

### ✅ Resolved: Environment Validation

`src/lib/env.ts` (Zod schemas) + `src/instrumentation.ts` (startup hook) now validate all required environment variables at startup. Missing vars prevent the server from starting with clear error messages.

### ✅ Resolved: AI JSON Parsing

`convex/lib/jsonExtract.ts` provides a robust bracket-counting JSON extractor, replacing the fragile regex-based markdown fence stripping in `aiFlowBuilder.ts`. 14 test cases cover all edge cases.

### ✅ Resolved: Soft-Delete Pattern

All 22 tables now have `deletedAt: v.optional(v.number())` fields. `convex/lib/softDelete.ts` provides `softDelete()`, `restoreSoftDelete()`, `filterActive()`, and `isSoftDeleted()` utilities. A weekly cron permanently deletes soft-deleted records older than 30 days.

### ✅ Resolved: TTL on Conversations/Messages

Both `conversations` and `messages` tables now have `expiresAt: v.optional(v.number())` fields with a 90-day default. A daily cron soft-deletes expired conversations and their messages.

### ✅ Resolved: v.any() Reduction

`v.any()` in the schema reduced from 11 to 3 instances. The remaining 3 (`nodes`, `actions`, `metadata`) are legitimately dynamic data structures.

### ✅ Resolved: X-XSS-Protection Header

The deprecated `X-XSS-Protection: 1; mode=block` header has been removed from `vercel.json`. Modern browsers ignore it; the `Content-Security-Policy` header provides all XSS protection.

### ✅ Resolved: Documentation Gaps

- `docs/AGENT-SETUP.md` — Comprehensive agent configuration guide
- `docs/API.md` — Public API reference (widget endpoints, webhooks, RestHooks)
- `README.md` — Root project README exists
- `CONTRIBUTING.md` — Contribution guidelines exist

### New Dependencies Added Since Analysis

| Package | Purpose |
|---------|---------|
| `@vercel/analytics` ^2.0.1 | Vercel analytics integration |
| `@vercel/speed-insights` ^2.0.0 | Vercel speed insights |
| `@upstash/context7-mcp` ^2.1.7 | Context7 MCP for real-time docs |
| `@lhci/cli` ^0.15.1 | Lighthouse CI audits |

### Still Outstanding (Unchanged from Original Analysis)

- **`tailwindcss-animate`** — Still installed but NOT imported anywhere. Dead dependency.
- **`@huggingface/inference`** — Still NOT imported anywhere. Dead dependency.
- **`@radix-ui/react-icons`** — Still used in only one file (`dialog.tsx`).
- **No code formatter** — Still no Prettier/Biome configured.
- **No Dependabot/Renovate** — Dependency updates remain manual.
- **Missing DX scripts** — Still no `lint:fix`, `typecheck`, `format`, `clean`.
