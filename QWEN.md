# Yoosr — Project Context

## Project Overview

**Yoosr** is a modern, AI-powered **customer support and live chat platform** (similar to Intercom, Crisp, or Tawk.to). It provides businesses with a multi-channel conversational support system featuring:

- **Live chat widget** embeddable on any website
- **AI-powered chatbots** with flow-based visual builder (Design Studio)
- **Multi-channel support**: Widget, Telegram, WhatsApp, Messenger, Instagram
- **Knowledge base** with vector embeddings for semantic search (RAG)
- **Team collaboration**: Agent assignment, departments, canned responses
- **Analytics & reporting**: Conversation metrics, CSAT ratings, token usage
- **Multi-tenant SaaS**: Organization-based access control via Clerk
- **Internationalization**: English, Arabic, French

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion |
| **Authentication** | Clerk (multi-org, JWT) |
| **Backend / Database** | Convex (reactive database, serverless functions) |
| **AI / LLM** | OpenRouter API (multi-model), HuggingFace Inference |
| **i18n** | next-intl (en, ar, fr) |
| **Testing** | Vitest, React Testing Library, jsdom |
| **Package Manager** | Bun |
| **Deployment** | Vercel (frontend) + Convex Cloud (backend) |
| **CI/CD** | GitHub Actions |

---

## Building and Running

### Prerequisites

- **Bun** (package manager)
- **Node.js 20+**
- **Clerk account** (authentication)
- **Convex account** (backend/database)
- **OpenRouter API key** (AI features)

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in Clerk, Convex, OpenRouter keys in .env.local

# 3. Start Convex dev server (backend)
npx convex dev

# 4. Start Next.js dev server (frontend)
bun run dev
```

### Key Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Next.js dev server |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run test` | Run Vitest tests (once) |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report |
| `npx convex dev` | Start Convex backend (separate terminal) |
| `npx convex deploy` | Deploy Convex functions |

---

## Architecture

### High-Level Structure

```
yoosr/
├── convex/            # Backend layer (Convex serverless functions)
│   ├── schema.ts      # Database schema (25+ tables)
│   ├── *.ts           # Queries, mutations, actions
│   └── lib/           # Backend utilities
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── [locale]/  # Internationalized routes
│   │   │   ├── dashboard/      # Agent dashboard
│   │   │   ├── design-studio/  # Bot flow builder
│   │   │   ├── (marketing)/    # Landing pages
│   │   │   └── login/signup/   # Auth pages
│   │   ├── api/       # API routes (Clerk webhooks, etc.)
│   │   └── widget/    # Embeddable chat widget
│   ├── components/    # React components
│   │   ├── ui/        # shadcn/ui primitives
│   │   ├── dashboard/ # Dashboard-specific UI
│   │   ├── design-studio/ # Bot flow builder UI
│   │   ├── chat/      # Chat components
│   │   └── layout/    # Layout wrappers
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Internationalization config
│   ├── lib/           # Shared utilities
│   ├── context/       # React context providers
│   └── types/         # TypeScript type definitions
├── messages/          # i18n translation files (en, ar, fr)
├── public/            # Static assets
└── docs/              # Project documentation & analysis
```

### Backend (Convex)

The Convex backend defines a comprehensive schema with **25+ tables** including:

- **Core**: `profiles`, `projects`, `conversations`, `messages`
- **AI/Bots**: `bots`, `bot_flows`, `knowledge_bases`, `knowledge_base_chunks` (vector embeddings)
- **Team**: `departments`, `canned_responses`, `labels`
- **Analytics**: `activity_logs`, `conversation_events`, `csat_ratings`, `token_usage`
- **Integrations**: `integrations` (Telegram, WhatsApp, etc.)
- **Features**: `orders`, `notifications`, `push_subscriptions`, `feedback`, `webhook_subscriptions`

Key backend patterns:
- **Clerk auth integration** via JWT verification
- **Rate limiting** via `@convex-dev/rate-limiter`
- **Vector search** for knowledge base (2048-dim embeddings)
- **Webhook handlers** for Clerk user sync and external channels
- **HTTP endpoints** for widget API and webhook callbacks

### Frontend (Next.js)

- **App Router** with locale-prefixed routes (`/[locale]/dashboard`, etc.)
- **Middleware** handles auth (Clerk), i18n routing, and protected routes
- **shadcn/ui** component library with Radix UI primitives
- **Convex React client** for real-time data subscriptions
- **Framer Motion** for animations
- **React Hook Form + Zod** for form validation
- **Recharts** for data visualization
- **ReactFlow (@xyflow/react)** for the Design Studio bot builder

---

## Development Conventions

### TypeScript

- **Strict mode** enabled (`strict: true`)
- **Path alias**: `@/*` maps to `./src/*`
- **No implicit any**, full type safety expected

### Styling

- **Tailwind CSS v4** with PostCSS
- **shadcn/ui** components (via `components.json` config)
- **CSS variables** for theming (`cssVariables: true`)
- **Lucide React** for icons

### Testing

- **Vitest** with jsdom environment
- **React Testing Library** for component tests
- **Test files**: `**/*.test.{ts,tsx}` (excludes `convex/`, `.next/`)
- **Coverage**: V8 provider with HTML/JSON/text reporters
- Tests are located alongside source files

### Internationalization

- **Locales**: `en` (default), `ar`, `fr`
- **next-intl** with locale prefix always present (`localePrefix: 'always'`)
- **Translation files**: `messages/{en,ar,fr}.json`
- **i18n request config**: `src/i18n/request.ts`

### Authentication & Authorization

- **Clerk** for user authentication and org management
- **Protected routes**: `/dashboard/*`, `/design-studio/*`
- **Webhook sync**: Clerk → Convex profiles via webhook handler
- **JWT claims** used for locale and org context

### CI/CD Pipeline

```
PR → Lint + Test + Build (quality gates)

develop branch → Staging deploy (Convex + Vercel preview)
main branch    → Production deploy (Convex + Vercel prod)
```

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Quality gates**: lint, test, build
2. **Staging**: deploys to preview environment on `develop`
3. **Production**: deploys Convex + Vercel on `main`

---

## Key Features

### Design Studio (Bot Flow Builder)
- Visual graph editor using ReactFlow
- Node-based flow definition (messages, conditions, AI tasks, etc.)
- Compiled execution nodes for the bot engine
- Variable support and slug-based targeting

### Knowledge Base (RAG)
- Document ingestion from URLs, text, or files
- Vector embeddings via OpenRouter (nvidia/llama-nemotron model, 2048 dims)
- Semantic search using Convex vector indexes
- Chunk-level storage with source tracking

### Multi-Channel Messaging
- Widget (embeddable JS snippet via `public/widget.js`)
- Telegram, WhatsApp, Messenger, Instagram integrations
- Unified conversation model with channel abstraction
- Webhook-based integration patterns

### Analytics
- Conversation metrics (bot vs agent handled, response times)
- CSAT ratings from chat widget
- AI token usage tracking per project
- Activity logs for audit trails

---

## Environment Variables

See `.env.example` for full list. Key groups:

| Group | Variables |
|-------|-----------|
| **Clerk** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET` |
| **Convex** | `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` |
| **AI** | `OPENROUTER_API_KEY`, `AI_RATE_LIMIT_PER_HOUR`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS` |
| **Push** | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| **Security** | `ENCRYPTION_KEY` (for webhook secrets) |
| **Feature Flags** | `FEATURE_FLAGS` (comma-separated key:value) |

---

## Important Patterns

1. **Real-time subscriptions**: Convex queries are reactive—components auto-update on data changes
2. **Optimistic concurrency**: Separated `conversation_bot_state` from `conversations` to avoid OCC write conflicts
3. **External references**: Clerk user IDs stored as strings (not Convex doc IDs)
4. **Denormalized fields**: Some fields duplicated for index performance (e.g., `integrations.webhookSecret`)
5. **Backward compatibility**: Deprecated fields kept with comments rather than removed
6. **Rate limiting**: Applied to AI calls via `@convex-dev/rate-limiter`

---

## Project Documentation

The `docs/` directory contains a **chunked analysis map** for systematic codebase understanding:
- `docs/README.md` — Analysis overview and progress tracker
- `docs/analysis-map/` — 18 focused analysis templates
- `docs/analysis-findings/` — Completed analysis results

---

## Notes for Development

- **Run Convex separately**: `npx convex dev` must run in a separate terminal
- **Widget development**: Test at `/[locale]/test-widget`
- **Database migrations**: See `convex/migrations.ts`
- **Seeding**: `convex/seed.ts` for development data
- **Static widget**: `public/widget.js` is the embeddable script for customers
- **Service worker**: `public/sw.js` for push notifications
- **Security headers**: Configured in `vercel.json` (CSP, X-Frame-Options, etc.)
