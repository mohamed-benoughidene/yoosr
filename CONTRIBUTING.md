# Contributing to Yoosr

Thank you for your interest in contributing. Please read this guide before making changes.

## Code of Conduct

Be respectful. Treat others' work and time with care.

## How to Contribute

### 1. Set Up Your Environment

```bash
# Clone the repository
git clone https://github.com/mohamed-benoughiddene/yoosr.git
cd yoosr

# Install dependencies
bun install

# Copy environment file and fill in your keys
cp .env.example .env.local

# Start Convex dev server
npx convex dev

# Start the Next.js dev server (in another terminal)
bun dev
```

### 2. Pick an Issue

Look at the [Issues](../../issues) page for:
- Bugs labeled `good first issue` for newcomers
- Feature requests with clear specifications

If no issue exists for what you want to work on, open one first to discuss the approach before writing code.

### 3. Make Changes

- Work on a **branch** from `develop` (not `main`). Name it descriptively: `fix/widget-crash`, `feat/push-notifications`
- Follow the conventions below
- Keep commits focused and atomic

### 4. Run Checks

Before opening a pull request, ensure:

```bash
bun run lint          # ESLint must pass
bun run test          # Tests must pass
```

### 5. Open a Pull Request

- Target the **`develop`** branch (not `main`)
- Describe what changed and why
- Link any related issues
- CI must pass (lint, test, build)

## Project Conventions

### Code Style

- **Language:** TypeScript strict mode
- **Path aliases:** Use `@/*` for imports from `src/` (e.g., `@/components/ui/button`)
- **Component patterns:** Use shadcn/ui conventions — Radix UI primitives, `class-variance-authority` for variants, `tailwind-merge` for class composition
- **Server components by default;** mark client components with `"use client"`

### Multi-tenancy

All Convex queries and mutations **must** scope data to `orgId` and `projectId`. Never return data from a different organization or project. Use `assertProjectOwnership()` or `checkProjectOwnership()` from `convex/utils.ts`.

### Internationalization (i18n)

The project supports three locales: **English**, **Arabic**, and **French**.

- All user-facing strings must use the i18n translation system
- When adding new strings, update **all three** locale files:
  - `messages/en.json`
  - `messages/ar.json`
  - `messages/fr.json`
- Arabic requires RTL-aware layouts (handled by the locale group)

### Backend (Convex)

- Use Convex's type-safe API — never bypass schema validation
- Separate bot execution state from conversations (use `conversation_bot_state`, not fields on `conversations`)
- Log significant actions to `activity_logs`
- Handle errors with the standardized helpers from `convex/errors.ts` (`authError()`, `notFoundError()`, `forbiddenError()`, `userError()`)

### Testing

- Tests use **Vitest** + **Testing Library** (jsdom environment)
- Place tests alongside source files as `*.test.ts` or `*.test.tsx`
- The Convex backend files are excluded from frontend test runs

### Security

- **Never commit `.env.local`** or any secrets
- Use environment variables for all credentials
- Integration credentials are encrypted with the `ENCRYPTION_KEY`
- Webhook secrets are verified via Svix signature validation

## Branching Model

```
main          → Production (stable, deployed)
develop       → Staging (integration branch)
feature/*     → New features (branched from develop)
fix/*         → Bug fixes (branched from develop)
hotfix/*      → Urgent production fixes (branched from main)
```

- PRs to `develop` trigger staging deployment
- PRs to `main` trigger production deployment
- PRs from forks trigger quality gates only (lint, test, build)

## Architecture Decision Records

This project does not currently use ADRs. For significant architectural decisions, document the reasoning in the PR description and link to the relevant discussion.

## Need Help?

Open a [discussion](../../discussions) or ask in an existing issue.
