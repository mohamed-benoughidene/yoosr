# Part 17: CI/CD & Deployment - Findings

## 📊 Visual Map

```
Deployment Pipeline
├── Development
│   ├── Local Dev Server  → `bun run dev` (Next.js with Turbopack)
│   └── Hot Reload        → Fast refresh (React 19)
│
├── Build Process
│   ├── `bun run build`   → Next.js production build
│   ├── Type Checking     → TypeScript (strict mode, ES2017 target)
│   ├── Linting           → `bun run lint` (ESLint v9)
│   └── Bundle Analysis   → NOT configured
│
├── CI/CD Pipeline
│   └── .github/workflows/ci.yml → Single workflow file
│       ├── quality-gates        → Lint + Test + Build (on push/PR to main)
│       └── deploy-convex        → Convex deployment (main only, after quality-gates)
│
├── Deployment Platform
│   ├── Vercel            → NOT configured (no vercel.json deploy config)
│   │   └── vercel.json   → Security headers ONLY (no deployment config)
│   └── Convex            → Backend hosting (deployed via CI)
│
└── Environment Management
    ├── Development       → Local dev (.env.local)
    ├── Preview           → Vercel PR previews (if Vercel connected)
    └── Production        → Main branch deployments
```

## 📁 File Inventory

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `.github/workflows/ci.yml` | GitHub Actions CI/CD pipeline | ✅ Present (single workflow) |
| `vercel.json` | Vercel/security configuration | ✅ Present (headers only, no deploy config) |
| `package.json` | Build and deployment scripts | ✅ Present |
| `.env.example` | Environment variable template | ✅ Present |
| `.env.local` | Local environment variables | ⚠️ Gitignored (expected) |
| `next.config.ts` | Next.js build configuration | ✅ Present (Turbopack, i18n, images) |
| `.gitignore` | Git ignore rules | ✅ Present |

## ✅ Analysis Checklist

- [x] **What CI/CD pipelines exist?**
  - Single GitHub Actions workflow: `.github/workflows/ci.yml` with two jobs:
    1. **`quality-gates`**: Runs on every push to `main` and every PR to `main`
    2. **`deploy-convex`**: Runs only on `main` branch after `quality-gates` passes

- [x] **Are there GitHub Actions workflows?**
  - Yes, one workflow file (`ci.yml`) with 2 jobs. Uses:
    - `actions/checkout@v4` for code checkout
    - `oven-sh/setup-bun@v2` for Bun runtime setup
    - No dependency caching (missing `actions/cache` or Bun cache step)

- [x] **What triggers the CI pipeline? (push, PR, etc.)**
  - **Push to `main`**: Triggers `quality-gates` job
  - **PR to `main`**: Triggers `quality-gates` job
  - **Push to `main` (only)**: Triggers `deploy-convex` job (via `if: github.ref == 'refs/heads/main'`)

- [x] **What steps are in the CI pipeline?**
  - **quality-gates job** (runs on `ubuntu-latest`, 10 min timeout):
    1. Checkout code
    2. Setup Bun (latest)
    3. Install dependencies (`bun install`)
    4. Run linter (`bun run lint`)
    5. Run tests (`bun run test`)
    6. Build Next.js (`bun run build`)
  
  - **deploy-convex job** (runs on `ubuntu-latest`, 10 min timeout, main only):
    1. Checkout code
    2. Setup Bun (latest)
    3. Install dependencies (`bun install`)
    4. Deploy to Convex (`npx convex deploy --cmd 'bun run build'`)
       - Requires `CONVEX_DEPLOY_KEY` secret

- [x] **Is there automated testing in CI?**
  - Yes, `bun run test` runs in the `quality-gates` job. However, with only 1 test file (testing a utility function), this provides minimal value. Tests will pass even if all business logic is broken.

- [x] **Is there linting in CI?**
  - Yes, `bun run lint` runs before tests in `quality-gates`. Uses ESLint v9 with `eslint-config-next`.

- [x] **How is the app deployed? (Vercel, manual, etc.)**
  - **Frontend (Next.js)**: `vercel.json` exists but contains ONLY security headers, NO deployment configuration. This suggests the app may be deployed via:
    - Vercel dashboard (Git integration, not via CI)
    - OR manual deployment
    - The CI does NOT explicitly deploy to Vercel
  
  - **Backend (Convex)**: Deployed via CI (`npx convex deploy --cmd 'bun run build'`) on main branch. Uses `CONVEX_DEPLOY_KEY` from GitHub secrets.
  
  - **Gap**: The Next.js frontend deployment is NOT in the CI pipeline. Vercel likely handles this via its own Git integration separately from GitHub Actions.

- [x] **What's in `vercel.json`?**
  - Security headers ONLY, no deployment config:
    - `X-Frame-Options: SAMEORIGIN`
    - `X-Content-Type-Options: nosniff`
    - `X-XSS-Protection: 1; mode=block`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Cross-Origin-Opener-Policy: same-origin`
    - `Cross-Origin-Embedder-Policy: require-corp`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
    - `Content-Security-Policy`: Comprehensive CSP allowing self, Clerk, Convex, OpenRouter, Google Fonts
    - Cache-Control for `/fonts/:path*`: `public, max-age=31536000, immutable`

- [x] **Are there environment-specific configs?**
  - No explicit environment-specific configs. Environment variables are managed via:
    - `.env.example` (template with documentation)
    - `.env.local` (local dev, gitignored)
    - GitHub Secrets (for CI/CD)
    - Vercel dashboard (for production env vars, if connected)
    - Convex dashboard (for Convex env vars)

- [x] **How are environment variables managed?**
  - **Template**: `.env.example` provides well-documented template with comments explaining where to get each value
  - **Sections**: Clerk Auth, Convex Backend, OpenRouter (AI), Web Push (VAPID), Encryption, Site URLs
  - **Secrets**: `CONVEX_DEPLOY_KEY` stored in GitHub secrets
  - **Gap**: No validation script to ensure `.env.local` matches `.env.example`

- [x] **Are there deployment previews?**
  - **Vercel**: If Vercel is connected to the repo, PR previews would be automatic (Vercel feature), but this is NOT configured in `vercel.json` or CI
  - **Convex**: No preview deployments configured (Convex supports dev/prod environments but CI only deploys to production)

- [x] **Is there a staging environment?**
  - **NO**. Only two environments evident:
    - Local development
    - Production (main branch)
  - No staging branch, no staging Convex deployment, no preview environment configuration.

- [x] **How are database migrations handled? (Convex)**
  - Convex handles migrations automatically via `npx convex deploy`. The codebase has a `convex/migrations.ts` file but migrations are handled by Convex's deployment process, not separate migration scripts in CI.
  - Note: The `migrateStatuses` migration in `migrations.ts` has been disabled ("Migration was completed in March 2026").

- [x] **Is there rollback capability?**
  - **Vercel**: Vercel provides automatic rollback via dashboard (redeploy previous version), but this is NOT part of the CI pipeline
  - **Convex**: Convex supports rollbacks via dashboard, but no automated rollback in CI
  - **No automated rollback**: If deployment fails, manual intervention required

- [x] **Are there deployment notifications?**
  - **NO**. No Slack, Discord, email, or other notification configured in the CI workflow. No GitHub environment protections with required reviewers.

- [x] **What's the build optimization?**
  - **Turbopack**: Configured in `next.config.ts` with `turbopack: { root: __dirname }` for faster builds
  - **Next.js 16.1.6**: Latest version with built-in optimizations
  - **No bundle analysis**: No `@next/bundle-analyzer` or similar tooling
  - **No custom webpack config**: Default Next.js optimization
  - **Browserslist**: `defaults and supports es6-module` in package.json

## 🔍 Key Patterns to Identify

- **Single CI/CD workflow**: All CI/CD in one file, simple but limited
- **Bun package manager**: Uses Bun throughout CI (fast installs, but less common than npm/pnpm)
- **Quality gate pattern**: Lint → Test → Build sequence before deployment
- **Convex auto-deploy**: Backend deploys automatically on main push
- **Frontend deployment gap**: Next.js deployment not in CI (likely Vercel Git integration)
- **Security-first vercel.json**: Focus on security headers over deployment config
- **No caching in CI**: Dependencies reinstalled fresh every run

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| **No staging environment** | HIGH | Direct deployment to production from main. No preview or staging environment to catch issues before they hit users. |
| **Frontend deployment not in CI** | MEDIUM | Next.js deployment appears to be via Vercel Git integration (separate from CI), meaning the CI quality gate doesn't actually block frontend deployments. |
| **No dependency caching in CI** | MEDIUM | `bun install` runs fresh every CI run. Adding Bun cache step would speed up CI significantly. |
| **No deployment notifications** | MEDIUM | Team won't be notified of deployment success/failure without checking GitHub Actions manually. |
| **No automated rollback** | MEDIUM | Failed deployments require manual rollback via dashboards. |
| **Tests provide false confidence** | MEDIUM | Tests run in CI but only cover 1 utility function. Passing tests don't indicate actual code quality. |
| **No bundle analysis** | LOW | No visibility into bundle size growth over time. |
| **No environment variable validation** | LOW | No script to validate `.env.local` matches `.env.example` template. |
| **Dual deployment systems** | LOW | Convex via CI, Next.js likely via Vercel Git integration. Two different deployment mechanisms can cause sync issues. |
| **10-minute timeout may be tight** | LOW | For large builds with dependencies, 10 minutes could be cutting it close. |
