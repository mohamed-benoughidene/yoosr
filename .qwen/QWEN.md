# Yoosr - Project Context

## Project Overview

**Yoosr** is an AI-powered customer support platform built with Next.js 15, Convex (reactive backend), and Clerk (authentication). It provides a comprehensive solution for businesses to manage customer conversations across multiple channels with intelligent bot automation.

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Visual Bot Builder** | ✅ Built | Drag-and-drop React Flow editor with 19 block types for creating AI-powered conversation flows |
| **Knowledge Base (RAG)** | ✅ Built | Vector embedding pipeline using OpenRouter API with NVIDIA embeddings, multi-turn Q&A support |
| **Omnichannel Support** | ✅ Built | Website widget, Telegram, Meta Messenger, Instagram, WhatsApp (all via Meta Cloud API) |
| **Real-Time Analytics** | ✅ Built | CSAT scores, SLA breach rates, AI token usage, conversation volume, unanswered queries |
| **Embeddable Widget** | ✅ Built | Pre-chat forms, CSAT ratings, interactive buttons, multilingual (EN/AR/FR with RTL) |
| **HITL Handoff** | ✅ Built | Bot-to-agent escalation with history preservation, notifications, department routing |
| **Multi-language** | ✅ Built | Full trilingual support (English, Arabic, French) with RTL layout |

### Technology Stack

- **Frontend:** Next.js 16.1.6, React 19, TypeScript, Tailwind CSS 4, Shadcn UI, Radix UI
- **Backend:** Convex (serverless reactive database with vector search)
- **Authentication:** Clerk (multi-tenancy via Organizations)
- **AI/LLM:** OpenRouter API (supports multiple model selection)
- **Internationalization:** next-intl with locale-based routing
- **Charts:** Recharts for analytics visualizations
- **Bot Flow Editor:** React Flow (XYFlow)

## Building and Running

### Prerequisites

- Node.js 20+
- Bun (package manager)
- Clerk account (for authentication)
- Convex account (for backend)
- OpenRouter API key (for AI features)

### Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run Convex backend (separate terminal)
bun run convex dev

# Build for production
bun run build

# Start production server
bun run start

# Run linter
bun run lint
```

### Environment Variables

Required `.env` file:
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=...

# OpenRouter (for AI features)
OPENROUTER_API_KEY=...

# Web Push (for notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

### Project Structure

```
yoosr/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Localized routes
│   │   │   ├── dashboard/      # Main dashboard views
│   │   │   ├── design-studio/  # Bot flow builder
│   │   │   ├── login/          # Auth pages
│   │   │   └── onboarding/     # Post-signup flow
│   │   ├── widget/             # Embeddable chat widget
│   │   └── api/                # API routes (webhooks)
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn primitives
│   │   ├── design-studio/      # Bot builder components
│   │   ├── chat/               # Chat interface components
│   │   └── dashboard/          # Dashboard widgets
│   ├── i18n/                   # Internationalization config
│   ├── lib/                    # Utility functions
│   └── hooks/                  # Custom React hooks
├── convex/                     # Convex backend functions
│   ├── schema.ts               # Database schema
│   ├── bots.ts                 # Bot management
│   ├── bot.ts                  # Bot execution engine
│   ├── conversations.ts        # Conversation handling
│   ├── knowledge.ts            # Knowledge base operations
│   └── webhooks.ts             # External channel webhooks
├── messages/                   # i18n translation files
├── design-system/              # Design tokens and themes
└── documentation/              # Project documentation
```

## Development Conventions

### Code Style

- **TypeScript:** Strict mode enabled, no implicit any
- **ESLint:** Next.js recommended config with TypeScript
- **Formatting:** Consistent with project Prettier/Tailwind conventions
- **Component Pattern:** Server Components by default, Client Components with `"use client"` directive
- **Imports:** Path aliases using `@/*` → `./src/*`

### Architecture Patterns

- **Multi-tenancy:** All queries filtered by `orgId` (Clerk Organization ID)
- **Real-time data:** Convex reactive queries with `useQuery` hooks
- **Server Actions:** Mutations via Convex actions with proper auth checks
- **Error Handling:** Error boundaries with fallback components
- **Activity Logging:** All user actions logged to `activity_logs` table

### Testing Practices

- Manual testing via widget test page (`/test-widget`)
- Bot flow testing via debugger panel in Design Studio
- Convex function testing via dashboard

### Git Workflow

- Feature branches from `main`
- Descriptive commit messages
- PR reviews for significant changes

## Key Database Tables (Convex Schema)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles synced from Clerk |
| `projects` | Project configurations |
| `conversations` | Chat threads with execution state |
| `conversation_bot_state` | Bot execution state (separated for OCC) |
| `messages` | Message history |
| `bots` / `bot_flows` | Bot definitions and flow graphs |
| `knowledge_bases` / `knowledge_base_chunks` | RAG pipeline data |
| `activity_logs` | Audit trail |
| `integrations` | Channel credentials (encrypted) |
| `departments` | Routing configuration |
| `csat_ratings` | Customer satisfaction scores |
| `token_usage` | AI token consumption tracking |
| `webhook_subscriptions` | RestHook webhook config |
| `notifications` | In-app agent notifications |

## Important Notes

### Features NOT to Mention (Not Fully Functional)

- Email channel (not implemented)
- File upload in widget (button sends filename only)
- Groups settings (stub/placeholder)
- AI Assistant block (intentionally removed)
- Operating hours schedule checking (placeholder logic)
- Emoji picker in widget (not implemented)

### Bot Flow Block Types (19 Total)

Start, Reply, Set Attribute, Condition, Web Request, AI Task, HITL Handoff, Close, If Operating Hours, If Online Agent, Capture User Reply, Wait, Ask Knowledge Base, Replace Bot, Change Department, Code Action, Clear Transcript, Apply Label, Set Priority

### Supported Channels

- ✅ Website Widget (fully featured)
- ✅ Telegram (inbound + outbound)
- ✅ Meta Messenger (inbound + outbound)
- ✅ Instagram (inbound + outbound)
- ✅ WhatsApp (inbound + outbound via Meta Cloud API)
- ❌ Email (not implemented)

### Supported Locales

- English (en) - LTR
- Arabic (ar) - RTL
- French (fr) - LTR
