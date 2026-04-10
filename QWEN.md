# Yoosr — Project Context

## Project Overview

**Yoosr** is a multi-tenant AI-powered customer support/chatbot SaaS platform built with **Next.js 16**, **React 19**, **Convex** (backend/database), and **Clerk** (authentication). It provides businesses with live chat widgets, AI chatbot automation, bot flow design tools, multi-channel support (Widget, Telegram, WhatsApp, Messenger, Instagram), and agent dashboards for managing conversations.

### Core Features
- **Live Chat Widget** — Embeddable customer-facing chat widget with multi-channel support
- **AI Chatbots** — LLM-powered bots via OpenRouter (various models), with knowledge base RAG (vector embeddings)
- **Bot Flow Designer** — Visual graph-based automation builder using React Flow (`@xyflow/react`)
- **Agent Dashboard** — Conversation management, assignment, departments, labels, canned responses
- **Multi-tenant Architecture** — Organization-scoped data via Clerk org IDs
- **Internationalization (i18n)** — English, Arabic, French (next-intl)
- **Analytics & Reporting** — CSAT ratings, token usage tracking, activity logs, conversation metrics
- **Web Push Notifications** — VAPID-based push for agent alerts
- **Webhook System** — RestHooks-style subscriptions for external integrations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI primitives, Lucide icons, Framer Motion |
| **Backend/DB** | Convex (serverless backend + database + vector search) |
| **Auth** | Clerk (Next.js SDK), JWT-based |
| **AI/LLM** | OpenRouter API, HuggingFace Inference |
| **Documentation** | Context7 MCP (real-time library docs lookup) |
| **i18n** | next-intl |
| **Forms** | React Hook Form + Zod v4 validation |
| **Charts** | Recharts |
| **Data Tables** | TanStack Table |
| **Testing** | Vitest + Testing Library (jsdom) |
| **Package Manager** | Bun (v1.3.6) |
| **Deployment** | Vercel (frontend), Convex Cloud (backend) |
| **CI/CD** | GitHub Actions |

---

## Project Structure

```
yoosr/
├── convex/                  # Convex backend (schema, queries, mutations, HTTP endpoints)
│   ├── schema.ts            # Full database schema (18+ tables)
│   ├── lib/                 # Backend utilities
│   ├── http.ts              # HTTP API endpoints (webhooks, widget API)
│   ├── bot.ts, botFlows.ts  # Bot execution engine
│   ├── conversations.ts     # Conversation CRUD
│   ├── projects.ts          # Project management
│   ├── knowledge*.ts        # Knowledge base + embeddings
│   ├── integrations.ts      # Channel integrations (Telegram, WhatsApp, etc.)
│   └── _generated/          # Auto-generated Convex types
├── src/
│   ├── app/
│   │   ├── [locale]/        # i18n route group (en, ar, fr)
│   │   │   ├── (marketing)/ # Landing pages, solutions, pricing
│   │   │   ├── dashboard/   # Agent/admin dashboard
│   │   │   ├── design-studio/ # Bot flow visual editor
│   │   │   ├── login|signup/
│   │   │   └── onboarding/
│   │   ├── api/             # API routes
│   │   ├── widget/          # Embedded widget endpoints
│   │   └── og/              # Open Graph image generation
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── design-studio/   # Bot flow editor components
│   │   ├── chat/            # Chat widget components
│   │   └── layout/          # Layout wrappers, nav, headers
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # i18n configuration
│   ├── lib/                 # Shared utilities
│   ├── types/               # TypeScript type definitions
│   ├── context/             # React context providers
│   ├── config/              # App configuration
│   └── middleware.ts        # Clerk auth + i18n middleware
├── messages/                # i18n translation files (en.json, ar.json, fr.json)
├── docs/                    # Documentation, analysis maps, specs
├── public/                  # Static assets
└── .github/workflows/ci.yml # CI/CD pipeline
```

---

## Building, Running & Testing

### Development
```bash
bun dev          # Start Next.js dev server (Turbopack)
bun build        # Production build
bun start        # Start production server
```

### Linting & Type Checking
```bash
bun run lint     # ESLint (Next.js core-web-vitals + TypeScript)
```

### Testing
```bash
bun run test           # Run all tests (Vitest)
bun run test:watch     # Watch mode
bun run test:coverage  # Coverage report (v8 provider)
```

Tests live alongside source files as `*.test.{ts,tsx}`. The Convex backend is excluded from frontend test runs.

### Convex Backend
```bash
npx convex dev    # Start Convex dev server
npx convex deploy # Deploy to production
```

---

## Architecture & Data Flow

### Authentication Flow
1. **Clerk** handles sign-in/sign-up, JWT issuance, and org membership
2. **Middleware** (`src/middleware.ts`) enforces protected routes (`/dashboard/*`, `/design-studio/*`)
3. **Clerk webhooks** sync user profiles to Convex `profiles` table
4. **Convex auth config** validates Clerk JWT tokens

### Database Schema (Convex)
The schema (`convex/schema.ts`) defines 18+ tables with multi-tenant isolation via `orgId` and `projectId` foreign keys:

- **Core**: `profiles`, `projects`, `conversations`, `messages`
- **Bot Engine**: `bots`, `bot_flows`, `conversation_bot_state` (separated to avoid OCC conflicts)
- **Knowledge Base**: `knowledge_bases`, `knowledge_base_sources`, `knowledge_base_chunks` (vector index, 2048-dim embeddings)
- **Channels**: `integrations` (Telegram, WhatsApp, Messenger, Instagram)
- **Agent Tools**: `departments`, `canned_responses`, `labels`, `contacts`, `orders`
- **Analytics**: `activity_logs`, `csat_ratings`, `token_usage`, `conversation_events`
- **Notifications**: `notifications`, `push_subscriptions`, `webhook_subscriptions`, `webhook_deliveries`
- **Feedback**: `feedback` (early access bugs/features)

### Bot Execution
Bots use a graph-based flow engine (React Flow nodes/edges). The `conversation_bot_state` table is separated from `conversations` to prevent Optimistic Concurrency Control (OCC) write conflicts during bot execution.

### Vector Search
Knowledge base embeddings use Convex vector indexes with the `nvidia/llama-nemotron-embed-vl-1b-v2` model (2048 dimensions). Configured via `EMBEDDING_MODEL` and `EMBEDDING_DIMENSIONS` env vars.

---

## Key Conventions

### Path Aliases
- `@/*` → `./src/*` (configured in `tsconfig.json` and Vitest)

### Component Patterns
- Uses **shadcn/ui** for UI primitives (customizable, copy-paste components)
- Components organized by feature domain (`dashboard/`, `chat/`, `design-studio/`, etc.)
- Server components by default; client components marked with `"use client"`

### i18n
- Locale route group: `/[locale]/` with `en`, `ar`, `fr`
- Middleware handles locale detection, cookie persistence, and Clerk metadata sync
- RTL support for Arabic (locale-aware layout)

### Multi-tenancy
- All data scoped to `orgId` (Clerk organization) and `projectId`
- Profiles indexed by both `userId` and `orgId`
- Feature flags configured via environment variable (`FEATURE_FLAGS`)

### Security
- CSP headers configured in `vercel.json` (self-only, explicit trusted domains)
- Security headers: X-Frame-Options, X-Content-Type-Options, HSTS, Permissions-Policy
- Webhook secrets verified via `CLERK_WEBHOOK_SECRET`
- Integration credentials encrypted with `ENCRYPTION_KEY`
- AI rate limiting via `AI_RATE_LIMIT_PER_HOUR`

### CI/CD Pipeline
- **PRs**: Lint → Test → Build (quality gates only)
- **develop branch**: Staging deployment (Vercel preview + Convex staging)
- **main branch**: Production deployment (Convex prod + Vercel prod)
- Uses Bun for all steps, Vercel CLI for frontend deployment

---

## Environment Variables

Key environment variables (see `.env.example`):
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET`
- **Convex**: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`
- **AI**: `OPENROUTER_API_KEY`, `AI_RATE_LIMIT_PER_HOUR`, `LLM_RETRY_MAX_ATTEMPTS`
- **Push**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- **Encryption**: `ENCRYPTION_KEY` (for webhook/integration secrets)

---

## Agent Guidelines

When working on this codebase:
1. **Always** maintain multi-tenant isolation (`orgId`, `projectId`) in Convex queries/mutations
2. **Use** Convex's type-safe API — never bypass schema validation
3. **Follow** shadcn/ui patterns for UI components (radix primitives, cva variants, tailwind-merge)
4. **Respect** the bot state separation — use `conversation_bot_state` not `conversations` fields for execution
5. **Write tests** for new features using Vitest + Testing Library
6. **Run** `bun run lint` and `bun run test` before committing
7. **Use** `@/*` path aliases for imports from `src/`
8. **Handle** i18n properly — add translations to all locale files (en, ar, fr)
9. **Security**: Never commit `.env.local`; use environment variables for secrets

---

## Context7 MCP Integration

**Context7** is configured for real-time library documentation lookup.

### Configuration
- MCP server configured in `.qwen/settings.json`
- Uses hosted endpoint: `https://mcp.context7.com/mcp`
- API key stored in `CONTEXT7_API_KEY` environment variable

### Setup
1. Get free API key from https://context7.com/dashboard
2. Add to `.env.local`: `CONTEXT7_API_KEY=your_key_here`
3. Restart Qwen Code

### Usage
When you say "use Context7", I will:
- Fetch real-time documentation for any library/framework
- Get version-specific guides and best practices
- Look up API references and configuration guides

### Available Tools
- `resolve-library-id` - Find correct library ID for documentation
- `query-docs` - Get up-to-date documentation with specific queries

### Documentation
See `docs/CONTEXT7_SETUP.md` for detailed setup instructions.
