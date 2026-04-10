# Part 03: Project Structure & Git — Updated Findings

## ✅ Resolved: Documentation Gaps Filled

The following documentation files now exist:

| File | Purpose |
|------|---------|
| `README.md` | Root project overview, quick start, tech stack |
| `CONTRIBUTING.md` | Contribution guidelines for human developers |
| `docs/AGENT-SETUP.md` | AI coding agent configuration (Qwen, Claude, Cursor, Copilot) |
| `docs/API.md` | Public API reference (widget endpoints, webhooks, RestHooks) |

Previously flagged as HIGH severity — no longer an issue.

## ✅ Resolved: Test Infrastructure

New test files and configuration:

| File | Purpose |
|------|---------|
| `vitest.convex.config.ts` | Convex backend test config (node environment) |
| `convex/lib/auth.test.ts` | 9 test cases — conversation ownership |
| `convex/lib/softDelete.test.ts` | 7 test cases — soft-delete utilities |
| `convex/lib/jsonExtract.test.ts` | 14 test cases — JSON extraction |
| `src/lib/env.test.ts` | 8 test cases — env validation |
| `src/lib/utils.test.ts` | 4 test cases — utility functions |

**Total: 42 test cases** across 5 files (12 frontend + 30 Convex backend).

New scripts in `package.json`:
- `test:convex` — Run Convex backend tests
- `lighthouse` — Run Lighthouse CI audits

## ✅ Resolved: New Library Modules

| File | Purpose |
|------|---------|
| `convex/lib/auth.ts` | `assertConversationOwnership()` + `checkConversationOwnership()` |
| `convex/lib/softDelete.ts` | `softDelete()`, `restoreSoftDelete()`, `filterActive()`, `isSoftDeleted()` |
| `convex/lib/jsonExtract.ts` | `extractJsonObject()` — robust bracket-counting JSON extractor |
| `convex/lib/env.ts` | `requireEnv()` — Convex-side env validation |
| `src/lib/env.ts` | Zod schemas for client + server env vars |
| `src/instrumentation.ts` | Next.js startup hook for env validation |

## Still Accurate (Unchanged from Original Analysis)

- Hybrid monorepo-style structure: `src/` (frontend), `convex/` (backend), `messages/` (i18n)
- Components organized by feature domain within `src/components/`
- Backend flat file structure per domain entity (`convex/conversations.ts`, etc.)
- Three AI tool configs: `.agent/`, `.qwen/`, `.agents/skills/` (all gitignored)
- i18n: 3 locales (en, ar, fr) with `_i18n-audit.json` (ar: 0 missing, fr: 1 missing)
- CI/CD: single workflow, 4 jobs (quality-gates, deploy-staging, deploy-convex, deploy-frontend)
- `.env.example` comprehensive (106+ lines)

## Outstanding Concerns

- **Duplicate test-widget routes** — Still present in routing structure
- **Inconsistent i18n key naming** — Still present across locale files
- **Duplicate settings component dirs** — Still present in `src/components/`
- **`use-mobile.tsx` kebab-case naming** — Still inconsistent with camelCase convention
- **AI configs gitignored** — `.agent/` and `.qwen/` files not version-controlled (intentional but means institutional knowledge lives outside the repo)
- **No GitHub ISSUE/PR templates** — Still missing
