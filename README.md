# Yoosr

**AI-powered customer support SaaS platform** — multi-tenant live chat, AI chatbots, bot flow designer, and agent dashboard.

## About

Yoosr is a full-stack SaaS platform that helps businesses automate and manage customer support. It combines embeddable live chat widgets, LLM-powered AI chatbots with knowledge base RAG, a visual bot flow designer, and an agent dashboard for managing conversations, contacts, and analytics. Built on Next.js 16, Convex, and Clerk.

## Features

- **Live Chat Widget** — Embeddable multi-channel chat widget (Widget, Telegram, WhatsApp, Messenger, Instagram)
- **AI Chatbots** — LLM-powered automation via OpenRouter with knowledge base retrieval-augmented generation (RAG)
- **Bot Flow Designer** — Visual graph-based automation builder using React Flow (`@xyflow/react`)
- **Agent Dashboard** — Conversation management, assignment, departments, labels, and canned responses
- **Multi-tenant Architecture** — Organization-scoped data via Clerk org IDs with Convex vector search
- **Internationalization (i18n)** — English, Arabic (RTL), French via next-intl
- **Analytics & Reporting** — CSAT ratings, token usage tracking, activity logs, conversation metrics
- **Web Push Notifications** — VAPID-based push notifications for agent alerts
- **Webhook System** — RestHooks-style subscriptions for external integrations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion |
| **Backend/DB** | Convex (serverless backend + database + vector search, 28 tables) |
| **Auth** | Clerk (JWT-based, org management) |
| **AI/LLM** | OpenRouter API (various models, 2048-dim embeddings) |
| **i18n** | next-intl (en, ar, fr) |
| **Testing** | Vitest + Testing Library (jsdom) |
| **Package Manager** | Bun v1.3.6 |
| **Deployment** | Vercel (frontend), Convex Cloud (backend) |
| **CI/CD** | GitHub Actions (lint → test → build → deploy staging/prod) |

## Requirements

- **Bun** >= 1.3.6
- **Node.js** >= 20
- **Convex account** (for backend deployment)
- **Clerk account** (for authentication)
- **OpenRouter API key** (for AI features)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/yoosr.git
cd yoosr

# Install dependencies
bun install
```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values (see [Environment Variables](#environment-variables) below).

### Convex Backend

```bash
# Start Convex dev server (creates/links your Convex project)
npx convex dev

# Or deploy to an existing Convex project
npx convex deploy
```

### Frontend

```bash
# Start development server (Turbopack)
bun dev

# Production build
bun build && bun start
```

The app will be available at `http://localhost:3000`.

## Usage

### Development Workflow

```bash
bun dev           # Start Next.js dev server
bun run lint      # Run ESLint
bun run test      # Run tests once
bun run test:watch # Tests in watch mode
```

### Testing

```bash
bun run test            # Run all tests (Vitest)
bun run test:coverage   # Coverage report (v8 provider)
```

### Convex Backend

```bash
npx convex dev    # Start Convex dev server
npx convex deploy # Deploy to production
```

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js 16 Frontend                    │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────────┐   │
│  │ Marketing │  │ Dashboard │  │ Design Studio       │   │
│  │ (Server)  │  │ (Client)  │  │ (React Flow)        │   │
│  └──────────┘  └───────────┘  └─────────────────────┘   │
│              ┌────────────────────────┐                  │
│              │ Clerk Auth + i18n MW    │                  │
│              └────────────────────────┘                  │
└──────────────────────────┬───────────────────────────────┘
                           │ Convex React Client
┌──────────────────────────▼───────────────────────────────┐
│                    Convex Backend                         │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────────┐   │
│  │ Queries   │  │ Mutations │  │ HTTP Endpoints      │   │
│  │ (read)    │  │ (write)   │  │ (webhooks, widget)  │   │
│  └──────────┘  └───────────┘  └─────────────────────┘   │
│              ┌────────────────────────┐                  │
│              │ Convex DB (28 tables)   │                  │
│              │ + Vector Search         │                  │
│              └────────────────────────┘                  │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│                  External Services                        │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────────┐   │
│  │ Clerk    │  │ OpenRouter│  │ Telegram / WhatsApp │   │
│  │ (Auth)   │  │ (AI/LLM)  │  │ / Messenger / IG    │   │
│  └──────────┘  └───────────┘  └─────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Database Schema

The Convex backend defines 28 tables covering:

- **Auth & Profiles**: `profiles` (Clerk sync), org/project scoping
- **Core**: `projects`, `conversations`, `messages`
- **Bot Engine**: `bots`, `bot_flows`, `conversation_bot_state` (separated to avoid OCC conflicts)
- **Knowledge Base**: `knowledge_bases`, `knowledge_base_sources`, `knowledge_base_chunks` (vector index, 2048-dim embeddings)
- **Channels**: `integrations` (Telegram, WhatsApp, Messenger, Instagram)
- **Agent Tools**: `departments`, `canned_responses`, `labels`, `contacts`, `orders`
- **Analytics**: `activity_logs`, `csat_ratings`, `token_usage`, `conversation_events`
- **Notifications**: `notifications`, `push_subscriptions`, `webhook_subscriptions`, `webhook_deliveries`
- **Feedback**: `feedback`

### Project Structure

```
yoosr/
├── convex/                  # Convex backend (schema, queries, mutations, HTTP)
│   ├── schema.ts            # Database schema (28 tables, 10,600+ lines total)
│   ├── lib/                 # Backend utilities
│   ├── http.ts              # HTTP API endpoints (webhooks, widget API)
│   ├── bot.ts, botFlows.ts  # Bot execution engine
│   ├── conversations.ts     # Conversation CRUD
│   ├── projects.ts          # Project management
│   ├── knowledge*.ts        # Knowledge base + embeddings
│   └── integrations.ts      # Channel integrations
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
│   │   ├── dashboard/       # Dashboard components
│   │   ├── design-studio/   # Bot flow editor components
│   │   ├── chat/            # Chat widget components
│   │   └── layout/          # Layout wrappers, nav, headers
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # i18n configuration
│   ├── lib/                 # Shared utilities
│   └── middleware.ts        # Clerk auth + i18n middleware
├── messages/                # i18n translations (en.json, ar.json, fr.json)
├── docs/                    # Documentation, analysis maps, specs
└── .github/workflows/ci.yml # CI/CD pipeline
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable | Purpose | Source |
|----------|---------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer for Convex auth | Clerk Dashboard → JWT Templates |
| `CLERK_WEBHOOK_SECRET` | Webhook signature verification | Clerk Dashboard → Webhooks |
| `NEXT_PUBLIC_CONVEX_URL` | Convex backend URL | `npx convex dev` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Convex site URL (widget proxy) | Same as CONVEX_URL domain |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | [OpenRouter](https://openrouter.ai/keys) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web push notifications | `npx web-push generate-vapid-keys` |
| `ENCRYPTION_KEY` | Encrypt integration credentials | `openssl rand -hex 32` |

**Never commit `.env.local` to version control.**

## CI/CD

The GitHub Actions pipeline (`./.github/workflows/ci.yml`) handles:

| Branch | Pipeline |
|--------|----------|
| **PRs** | Lint → Test → Build (quality gates) |
| **`develop`** | Deploy to staging (Vercel preview + Convex staging) |
| **`main`** | Deploy to production (Convex prod + Vercel prod) |

Required GitHub secrets: `CONVEX_DEPLOY_KEY_PROD`, `CONVEX_DEPLOY_KEY_STAGING`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_PROJECT_ID_STAGING`.

## Documentation

- **Codebase Analysis**: See [`docs/analysis-findings/`](docs/analysis-findings/) for detailed architectural analysis (18 parts)
- **Feature Specs**: See [`docs/specs/`](docs/specs/) for feature specifications
- **Project Context**: See [`QWEN.md`](QWEN.md) for development conventions and architecture notes

## Contributing

Contributions are welcome. Please follow these guidelines:

1. **Maintain multi-tenant isolation** — always scope Convex queries/mutations to `orgId` and `projectId`
2. **Use Convex's type-safe API** — never bypass schema validation
3. **Follow shadcn/ui patterns** — use Radix primitives, CVA variants, `tailwind-merge`
4. **Handle i18n properly** — add translations to all locale files (`messages/en.json`, `messages/ar.json`, `messages/fr.json`)
5. **Run lint and tests** before committing:
   ```bash
   bun run lint && bun run test
   ```
6. **Use `@/*` path aliases** for imports from `src/`
7. **Never commit secrets** — use environment variables

## License

Yoosr is licensed under the **Business Source License 1.1 (BSL 1.1)**.

- **You can** view, learn from, and experiment with the code for non-commercial purposes.
- **You cannot** use Yoosr (in whole or in part) for any commercial purpose — including offering a hosted or managed support service based on it — without a separate commercial license from the author.
- **On 2030-04-09**, this license automatically converts to **GPL-3.0**, at which point the code becomes fully open source.

See the [`LICENSE`](LICENSE) file for full terms. For commercial licensing inquiries, contact the author.
