# Part 02: Build Tooling Configuration

## 📝 Updated Findings

### ✅ Resolved: X-XSS-Protection Header Removed

The deprecated `X-XSS-Protection: 1; mode=block` header has been removed from `vercel.json`. This header is ignored by all modern browsers and adds no security value. The `Content-Security-Policy` header provides all XSS protection.

### ✅ Resolved: Environment Variable Validation

Build-time env validation is now implemented:
- **`src/lib/env.ts`** — Zod schemas for both client (`NEXT_PUBLIC_*`) and server env vars
- **`src/instrumentation.ts`** — Next.js startup hook that imports `./lib/env` to trigger validation
- Required vars: `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Numeric vars coerced with defaults: `AI_RATE_LIMIT_PER_HOUR=100`, `LLM_RETRY_MAX_ATTEMPTS=3`, `EMBEDDING_DIMENSIONS=2048`
- Skipped during CI builds (`CI=true`) to allow build-time inlining

### ✅ Resolved: Convex Backend Test Config

**`vitest.convex.config.ts`** created for Convex backend tests:
- Environment: `node` (not jsdom)
- Includes: `convex/**/*.test.{ts,tsx}`
- Script: `test:convex` in package.json
- Run with: `bun run test:convex`

### Still Outstanding (Unchanged from Original Analysis)

- **`'unsafe-eval'` in CSP** — Still present; required by Clerk/Convex SDKs
- **No bundle analyzer** — No `@next/bundle-analyzer` configured
- **COEP: require-corp** — Still strict; may block third-party resources
- **Tiledesk references in tsconfig** — Still present in `exclude` array (stale)
- **No code formatter** — Still no Prettier/Biome
- **No `.nvmrc`** — Node.js version not pinned

### New Config Files Since Analysis

| File | Purpose |
|------|---------|
| `vitest.convex.config.ts` | Convex backend test config (node environment) |
| `lighthouserc.json` | Lighthouse CI configuration |

### vercel.json Cache Headers Added

Additional cache headers added beyond the original `/fonts/` only:
- `/_next/static/*` — 1 year, immutable
- `/static/*` — 1 year, immutable
- `/images/*` — 1 year, immutable
- `/favicon.ico` — 1 day, s-maxage=1 day
