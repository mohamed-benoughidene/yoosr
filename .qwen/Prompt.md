# Phase 1: Critical Security & Stability Fixes

## Context

You are working on a Next.js + Convex + Clerk multi-tenant chatbot platform at `/home/mohamed/lab/yoosr/`.

The project uses:
- **Bun** as package manager (lockfile: `bun.lock`)
- **Convex** as backend (database, functions, auth)
- **Clerk** for authentication (org-based multi-tenancy)
- **React 19** with Next.js App Router
- **Tailwind CSS** with shadcn/ui components

## Source Document

Read `docs/PRE_LAUNCH_FIX_REPORT.md` for the full issue list with descriptions.

## Your Task

Fix the **7 HIGH-priority issues** that block launch. Work through them **sequentially** in the order below. Do not skip. Do not batch.

---

## Issue 1: Dual lockfiles (bun.lock + package-lock.json)

**Fact:** The repo contains both `bun.lock` and `package-lock.json`. The project uses Bun.

**Steps:**
1. Check `package.json` for `"packageManager": "bun@..."`
2. Delete `package-lock.json`
3. Add `"packageManager": "bun@..."` if missing
4. Run `bun install` to confirm clean install

---

## Issue 2: @faker-js/faker in runtime dependencies

**Fact:** `@faker-js/faker` is used only for seeding/test data.

**Steps:**
1. Grep the codebase for `@faker-js/faker` imports — confirm it's ONLY used in seed/test files
2. If only in dev/test files: move from `dependencies` to `devDependencies` in `package.json`
3. If used in runtime code: identify where and refactor

---

## Issue 3: postgres package unclear usage

**Fact:** The `postgres` npm package is in `dependencies`. Convex handles its own database.

**Steps:**
1. Grep the codebase for `import.*from ['"]postgres['"]` or `require('postgres')`
2. If zero runtime imports exist: remove from `dependencies` in `package.json`
3. If imports exist: evaluate whether they're needed

---

## Issue 4: No testing infrastructure

**Fact:** Zero `.test.ts` and `.test.tsx` files exist. No test script in `package.json`.

**Steps:**
1. Install Vitest: `bun add -d vitest @vitest/coverage-v8`
2. Create `vitest.config.ts` at project root with Next.js/React support, coverage config, path aliases matching `tsconfig.json`
3. Add scripts to `package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```
4. Create a test setup file
5. Write a first test to verify setup works

---

## Issue 5: No tests in CI pipeline

**Fact:** `.github/workflows/ci.yml` exists but has no test step.

**Steps:**
1. Read `.github/workflows/ci.yml`
2. Add a test step between lint and build
3. Ensure the step fails the workflow if tests fail

---

## Issue 6: Unprotected seed.ts and wipe.ts

**Fact:** `convex/seed.ts` and `convex/wipe.ts` (or similar files) are exposed as public Convex functions. Anyone with a projectId can call them.

**Activate skill:** `convex-security-audit`

**Steps:**
1. Read the files to understand what they do
2. Convert them to `internal` functions using `internalMutation` instead of `mutation`
3. OR add `requireAdmin()` / `requireRole()` auth checks
4. Verify no other public functions expose similarly dangerous operations

---

## Issue 7: No auth check on messages.send and webhooks.backfillWebhookSecrets

**Fact:** These Convex functions lack `ctx.auth.getUserIdentity()` or equivalent auth verification.

**Activate skills:** `convex-security-audit`, `find-bugs`

**Steps:**
1. Find the files containing `messages.send` and `webhooks.backfillWebhookSecrets`
2. Read the function definitions
3. Add identity checks at the top of each function
4. For `webhooks.backfillWebhookSecrets`: verify caller is admin of the project
5. For `messages.send`: verify caller has access to the conversation's project

---

## Issue 8: Conflicting design system documents

**Fact:** `design-system/yoosr/MASTER.md` contradicts `.agent/DESIGN.md` on design tokens.

**Steps:**
1. Read both files
2. Identify which one is authoritative
3. Delete the outdated one OR update it to match the authoritative source
4. Document which file is the single source of truth

---

## Execution Rules

### For each issue:
1. **Read the relevant files first** — do not assume file contents
2. **Verify the problem exists** by checking actual code
3. **Make minimal, targeted changes** — no refactoring beyond what's needed
4. **Verify after each fix** — run `bun install`, `bun run test`, or `npx tsc --noEmit` as appropriate
5. **Report what you did** — list files changed and why

### Skills to activate:
- `convex-security-audit` — for Issues 6, 7 (auth patterns)
- `find-bugs` — for Issue 7 (security audit of changes)
- `react-best-practices` — for any React component changes
- `error-handling-patterns` — for consistent error throwing in Issues 6, 7
- `code-review` — review all changes before considering an issue complete

### Output format:
After completing each issue, report:
```
## Issue N: [Title] ✅ COMPLETE
- Files changed: [list]
- What was done: [2-3 sentences]
- Verification: [what you ran to confirm]
```

Start with Issue 1. Do not skip issues. Do not batch issues — complete one before starting the next.
