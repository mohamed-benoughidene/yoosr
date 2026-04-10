# Agent Setup Guide

> Configuration for AI coding agents (Qwen Code, Claude Code, Cursor, GitHub Copilot) working on the Yoosr codebase.

**Last reviewed:** 2026-04-10

---

## What This Is

This document configures AI coding agents to work effectively with the Yoosr platform — a multi-tenant AI-powered customer support/chatbot SaaS built with Next.js 16, React 19, Convex, and Clerk.

If you're an AI agent reading this for the first time, start with **[Prerequisites](#prerequisites)**, then **[Development Setup](#development-setup)**, then read **[Key Files](#key-files)** to understand the codebase layout.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Bun** | 1.3+ | Package manager (preferred over npm) |
| **Node.js** | 20+ | Bun fallback runtime |
| **Convex CLI** | latest | `npm i -g convex` |
| **Clerk account** | — | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **OpenRouter API key** | — | [openrouter.ai](https://openrouter.ai) |

---

## Development Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in values: Clerk keys, Convex URL, OpenRouter key, etc.
```

### 3. Start Dev Servers

Two processes are needed — run in separate terminals:

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend (Turbopack)
bun dev
```

### 4. Verify

```bash
bun run lint         # ESLint — 0 errors
npx tsc --noEmit     # Type check — 0 errors
bun run test         # Frontend tests — all pass
bun run test:convex  # Convex backend tests — all pass
```

---

## Key Files

| Path | Purpose |
|------|---------|
| `QWEN.md` | Primary project context — read first |
| `convex/schema.ts` | Database schema (18+ tables, multi-tenant) |
| `convex/http.ts` | HTTP endpoints (webhooks, widget API) |
| `convex/conversations.ts` | Conversation CRUD + ownership checks |
| `convex/bot.ts` | Bot flow execution engine |
| `convex/routing.ts` | Smart agent assignment (bot → available agents → unassigned queue) |
| `convex/lib/auth.ts` | `assertConversationOwnership()` helper |
| `convex/lib/softDelete.ts` | Soft-delete utilities (22 tables) |
| `convex/lib/jsonExtract.ts` | Robust JSON extractor for LLM responses |
| `convex/lib/env.ts` | Convex env validation helper |
| `src/middleware.ts` | Clerk auth + i18n routing middleware |
| `src/instrumentation.ts` | Startup env validation (Zod) |
| `src/lib/env.ts` | Zod schemas for all env vars |
| `src/lib/featureFlags.ts` | Feature flag parser |
| `docs/` | Project documentation (this file, API reference, security plan) |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 16 Frontend                   │
│  ┌───────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │ Dashboard  │  │ Widget Page │  │ Marketing / Solutions  │ │
│  │ (agents)   │  │ (visitors)  │  │ (public)               │ │
│  └─────┬─────┘  └──────┬──────┘  └────────────┬───────────┘ │
│        │               │                       │             │
│  ┌─────┴───────────────┴───────────────────────┴───────────┐ │
│  │              Clerk Auth + i18n Middleware                 │ │
│  └──────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────┘
                              │
                    Convex Cloud (Backend)
┌─────────────────────────────┼───────────────────────────────┐
│  ┌──────────────────────────┴────────────────────────────┐   │
│  │              HTTP Route Handlers                       │   │
│  │  /widget/*  /webhooks/meta  /webhooks/telegram         │   │
│  └──────────────────────────┬────────────────────────────┘   │
│                             │                                 │
│  ┌──────────────────────────┴────────────────────────────┐   │
│  │              Convex Queries & Mutations                 │   │
│  │  conversations  messages  bots  botFlows  routing       │   │
│  │  departments  labels  cannedResponses  integrations     │   │
│  │  knowledgeBases  analytics  webhooks  notifications     │   │
│  └──────────────────────────┬────────────────────────────┘   │
│                             │                                 │
│  ┌──────────────────────────┴────────────────────────────┐   │
│  │              Convex Database + Vector Index             │   │
│  │  18+ tables, org-scoped, 2048-dim embeddings            │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Cron Jobs    │  │ Bot Engine   │  │ Webhook Fan-out  │   │
│  │ (13 jobs)    │  │ (graph eval) │  │ (RestHooks)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow: Incoming Message

```
Visitor → Widget/Telegram/WhatsApp → Convex HTTP endpoint
  → createOrUpdateConversation → routeConversation
    → Bot execution (if enabled) OR Agent notification
      → createMessage → fireWebhookEvent → deliverWebhook (fan-out)
```

### Data Flow: Agent Reply

```
Agent Dashboard → sendMessage mutation
  → createMessage → pauseBot → fireWebhookEvent("message.create")
    → notify visitor via channel (Telegram/WhatsApp/etc.)
```

---

## AI Coding Agent Configuration

### Qwen Code (Primary)

Qwen Code is the primary AI coding agent. It reads `QWEN.md` for conventions and uses skills from `skills-lock.json` for framework-specific patterns.

**Workflow:**
1. Read `QWEN.md` for project conventions
2. Use `@/*` path aliases for `src/` imports
3. Server components by default; `"use client"` for client components
4. Run `bun run lint` + `bun run test` before committing
5. Use `tsc --noEmit` for type checking
6. Use Context7 MCP for real-time library documentation

### Claude Code

Create `.claude/settings.json`:
```jsonc
{
  "project": { "name": "yoosr", "type": "typescript" },
  "commands": {
    "test": "bun run test",
    "lint": "bun run lint",
    "typecheck": "npx tsc --noEmit",
    "dev": "bun dev"
  }
}
```

### Cursor

Create `.cursorrules` with the project conventions from the existing QWEN.md (see the "Agent Setup Guide" template in the existing file for the full content).

### GitHub Copilot

Create `.github/copilot-instructions.md` referencing `QWEN.md` as the source of truth.

---

## Key Architectural Patterns

### Multi-Tenancy

All data is scoped to `orgId` (Clerk organization) and `projectId`. **Every Convex query/mutation must enforce org-scoped ownership.**

```ts
const project = await ctx.db.get(projectId);
if (project?.orgId !== identity.org_id) {
  throw new Error("Unauthorized");
}
```

### Soft-Delete Pattern

All 22 tables have a `deletedAt` field. Never use `db.delete()` directly.

```ts
import { softDelete, restoreSoftDelete, filterActive } from "./lib/softDelete";

await softDelete(ctx.db, messageId);              // Soft-delete
await restoreSoftDelete(ctx.db, messageId);       // Restore
// Query only active: .filter((q) => q.eq(q.field("deletedAt"), undefined))
```

A weekly cron permanently deletes soft-deleted records older than 30 days.

### Ownership Enforcement

Use `assertConversationOwnership()` from `convex/lib/auth.ts` for conversation-scoped operations. For project-scoped operations, use `assertProjectOwnership(ctx, projectId, identity)`.

### AI Flow Builder

LLM responses are parsed with a robust bracket-counting JSON extractor that handles markdown fences, preamble text, trailing commas, and nested structures:

```ts
import { extractJsonObject } from "./lib/jsonExtract";
const parsed = extractJsonObject(response) as { nodes: unknown[]; edges: unknown[] };
```

### Environment Validation

Required env vars are validated at startup via `src/instrumentation.ts` → `src/lib/env.ts` (Zod schemas). Missing required vars prevent the server from starting.

---

## Runbooks

### Adding a New Convex Table

1. Add schema to `convex/schema.ts` with `deletedAt: v.optional(v.number())`
2. Add indexes — always include `by_orgId` for ownership queries
3. Create mutation file: `convex/yourTable.ts`
4. Add ownership checks to all user-facing functions
5. Write backend tests: `convex/yourTable.test.ts`
6. Run `bun run test:convex` to verify

### Adding a New Dashboard Page

1. Create page: `src/app/[locale]/dashboard/your-feature/page.tsx`
2. Add i18n keys to all three locale files: `messages/en.json`, `messages/ar.json`, `messages/fr.json`
3. Protected routes are auto-enforced by middleware (`/dashboard/*` requires auth)

### Adding Tests

**Frontend tests** (jsdom environment):
```bash
# Test file alongside source:  src/lib/foo.ts  →  src/lib/foo.test.ts
bun run test              # Run all frontend tests
bun run test:watch        # Watch mode
```

**Convex backend tests** (node environment):
```bash
# Test file alongside Convex source:  convex/foo.ts  →  convex/foo.test.ts
bun run test:convex       # Run all Convex backend tests
```

### Deploying

```bash
# Deploy Convex backend to production
npx convex deploy

# Deploy Next.js frontend to Vercel (via GitHub Actions on main branch push)
# CI/CD: develop → staging, main → production
```

---

## Troubleshooting

### Convex OCC Errors

**Symptom:** `Optimistic concurrency control conflict` error during bot execution.

**Cause:** Multiple concurrent operations mutating the same document.

**Fix:** The `conversation_bot_state` table is already separated from `conversations` to avoid this. If you encounter OCC elsewhere, ensure you're not mutating the same document from concurrent handlers.

### Missing Env Vars in Production

**Convex env vars:**
```bash
npx convex env set KEY value
npx convex env list  # View all configured vars
```

**Next.js env vars:** Set via Vercel dashboard → Project Settings → Environment Variables.

### Test Failures After Schema Changes

```bash
npx convex dev      # Regenerate _generated types
bun run test        # Re-run tests with updated types
```

### Zod Env Validation Errors

The server won't start if required env vars are missing. Check the error message — it will name the specific missing variable. Add it to `.env.local` (dev) or Vercel/Convex (prod).

---

## Security Rules

1. **Never commit `.env.local`** — use environment variables for secrets
2. **Multi-tenant isolation** — always check `orgId` in Convex queries
3. **Soft-delete** — use `softDelete()` instead of `db.delete()`
4. **Ownership checks** — verify project/conversation ownership before returning data
5. **CSP headers** — configured in `vercel.json`; do not add new external domains without review
6. **Encryption** — integration credentials are encrypted via `ENCRYPTION_KEY`
7. **Rate limiting** — AI calls are rate-limited via `AI_RATE_LIMIT_PER_HOUR`
8. **Input validation** — use Convex `v.*` validators for all mutation args

---

## Related Docs

- [`docs/API.md`](./API.md) — Public API reference (widget endpoints, webhooks, RestHooks)
- [`QWEN.md`](../QWEN.md) — Full project context and conventions
- [Convex Docs](https://docs.convex.dev) — Convex backend framework documentation
- [Clerk Docs](https://clerk.com/docs) — Authentication and user management
- [Next.js Docs](https://nextjs.org/docs) — Framework documentation
