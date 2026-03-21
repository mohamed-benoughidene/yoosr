# Agent Instructions

## What is Yoosr
Yoosr is a customer communication SaaS platform for the MENA market. It provides live chat, bot automation, channel integrations, and agent management. It is a standalone product — do not reference any external codebase as a spec. The source code itself is the single source of truth.

---

## Stack
- **Frontend**: Next.js (App Router) — hosted on Vercel
- **Backend + Database + Real-time**: Convex
- **Auth + Multi-tenancy**: Clerk (Organizations)
- **UI**: shadcn/ui + Tailwind CSS + lucide-react
- **AI / LLM**: OpenRouter (user-selectable model per project, stored as `defaultModel` on the project)
- **Embeddings**: OpenRouter `nvidia/llama-nemotron-embed-vl-1b-v2:free` (2048 dimensions)
- **Coding Agent**: Antigravity (Google AI IDE) with context7 MCP

---

## Folder Structure

```
/convex
  schema.ts                ← All 26 table definitions — read this first
  conversations.ts         ← Conversation queries, mutations, cron jobs
  messages.ts              ← Message queries and mutations
  bot.ts                   ← Design Studio execution engine (state machine)
  routing.ts               ← Agent assignment and department routing
  knowledgeBases.ts        ← KB and source CRUD, embedding pipeline
  analytics.ts             ← All analytics queries
  profiles.ts              ← Agent profile sync and availability
  departments.ts           ← Department CRUD and member management
  labels.ts                ← Label CRUD and tag assignment
  contacts.ts              ← Contact CRUD and batch import
  orders.ts                ← Order CRUD and batch import
  cannedResponses.ts       ← Canned response CRUD
  operatingHours.ts        ← Operating hours config and evaluation
  notifications.ts         ← In-app notification system
  webhooks.ts              ← Outbound webhook subscriptions and delivery
  integrations.ts          ← Channel integration credential storage
  bots.ts                  ← Bot record CRUD
  botFlows.ts              ← Bot flow save/load
  settings.ts              ← Project settings helpers
  projects.ts              ← Project CRUD and cascade delete
  activity.ts              ← Activity log mutations and queries
  tags.ts                  ← Tag assignment on conversations
  http.ts                  ← HTTP endpoints (widget API, Telegram, WhatsApp)
  crons.ts                 ← Scheduled jobs (auto-close, cleanup, retry)
  diagnostic.ts            ← Diagnostic-only helpers (not for production use)
  migrations.ts            ← One-time migration scripts (do not re-run)

/app
  /(auth)                  ← Clerk sign-in / sign-up pages
  /onboarding              ← Org creation + Convex project bootstrap
  /dashboard               ← Agent dashboard (all protected routes)
    /monitor               ← Live conversation queue (3-panel layout)
    /chat                  ← Agent chat view
    /bots                  ← Bot management
    /design-studio         ← Visual bot flow builder (React Flow)
    /kb                    ← Knowledge base management
    /contacts              ← Contacts CRM
    /orders                ← Orders management
    /analytics             ← Analytics dashboard
    /settings              ← All settings pages (project, widget, departments,
                             teammates, canned responses, labels, operating hours,
                             integrations, webhooks, SLA, app store)
  /widget                  ← Embeddable chat widget (standalone page)
  /api                     ← HTTP route handlers (Convex HTTP passthrough)
  /[locale]                ← i18n locale routing (en / ar / fr)
```

---

## Core Rules

### 1. Multi-tenancy via Clerk Organizations
- A **Clerk Organization** = a customer workspace.
- A **Convex `projects` record** = the configuration for that workspace.
- Every `projects` record has an `orgId` field matching the Clerk Organization ID.
- `orgId` is **always** read from `identity.org_id` (injected via JWT) — never passed from the frontend.
- Membership and invitations are handled entirely by Clerk. The `project_members` table has been removed — do not recreate it.
- All other tables use `projectId` as a foreign key to `projects`. This is correct and must not change.
- The Clerk JWT template named `"convex"` includes `org_id` and `org_role` claims.

```typescript
// Always read orgId from identity — never from function args
const identity = await ctx.auth.getUserIdentity();
const orgId = (identity as any).org_id;
```

### 2. Status enums — use numeric codes only
```
Conversations: 100 (unassigned/open) → 200 (assigned) → 1000 (resolved/closed)
Messages:      senderType = "visitor" | "agent" | "bot"
               type       = "text" | "internal"
```
Never use string status values like `"open"` or `"closed"`.

### 3. Leads are NOT Clerk users
Clerk manages agents and admins only. Widget users (leads/visitors) are identified via `visitorId` stored on the conversation. Never create Clerk accounts for leads.

### 4. HITL handoff preserves conversation history
When handing off from bot to human agent, the `conversationId` stays the same. Only `participants`, `assignedTo`, `botPaused`, and `status` change. Never create a new conversation for a handoff.

### 5. The `attributes` field is the extensibility layer
Both `messages` and `conversations` have an `attributes: Record<string, any>` field. Use it for anything not in the fixed schema — UI buttons, lead data, bot state, external IDs, file references.

### 6. Do not introduce external infrastructure
Convex handles database, real-time subscriptions, scheduled jobs, and server actions natively.

| Do NOT use | Use instead |
|---|---|
| Redis | Convex reactive queries |
| WebSocket servers | `useQuery` subscriptions |
| External message brokers | Convex mutations + actions |
| External cron services | `crons.ts` in Convex |

### 7. Bot engine is a state machine in `bot.ts`
The bot execution engine lives entirely in `convex/bot.ts`. It supports 20 node types. Bot state per conversation is stored in `conversation_bot_state`. When pausing for user input, `awaitingUserReply` is set to `true` and execution resumes via `resumeAfterUserReply`. Do not rewrite the engine — extend it by adding new node type handlers.

### 8. AI model is user-selectable per project
The active LLM model is stored as `defaultModel` on the `projects` record. Always read it from there — never hardcode a model string. Available models are defined in the project constants file.

### 9. OpenRouter is the AI gateway
All LLM calls (bot AI Task, AI Assistant, AI flow generation) go through OpenRouter. Embeddings use `nvidia/llama-nemotron-embed-vl-1b-v2:free` at 2048 dimensions. The per-project API key is stored encrypted in `projects.openRouterApiKey`.

### 10. Code Action block must not use `eval()`
The Design Studio Code Action node uses `expr-eval` for expression evaluation. Never replace this with `eval()` or `new Function()`.

### 11. Internal notes are filtered from the widget
Messages with `type: "internal"` are visible to agents only. The widget uses `listPublic` which filters them out. Never expose internal notes to the widget.

### 12. Widget rate limiting — known gap
`createFromWidget` and `sendFromWidget` mutations currently have no rate limiting. Do not add client-side workarounds — this must be addressed at the Convex HTTP layer.

---

## Known Architecture Issues (do not silently ignore)

These are confirmed issues from the last codebase audit. Flag them if you touch the affected files.

| Issue | Location | Severity |
|---|---|---|
| Auth check commented out | `botFlows.ts` → `save` | Critical — no auth at all |
| Missing org check | `knowledgeBases.ts` → `get`, `addSource`, `create` | High |
| Missing org check | `bots.ts` → `get` | High |
| Missing org check | `contacts.ts` → `update`, `findByConversation` | High |
| Missing org check | `tags.ts` → `assignTagToConversation`, `removeTagFromConversation` | High |
| Missing org check | `analytics.ts` → all stat queries | High |
| Missing org check | `profiles.ts` → `getByUserId` | Medium |
| Unbounded `.collect()` | `projects.ts` → `remove` (15+ tables) | High — will timeout |
| `.take(500)` cap | `analytics.ts` → all queries | Medium — undercounts at scale |
| Duplicate function | `labels.ts` vs `settings.ts` → `listLabels` | Low |
| No rate limiting | Widget HTTP endpoints | Medium |

---

## Convex Query Best Practices
- Never use unbounded `.collect()` on large tables — use `.take(N)` or paginate.
- Avoid reading from contested tables inside mutations — pass data as arguments instead.
- Defer metadata patches via `ctx.scheduler.runAfter(0, ...)` to avoid OCC conflicts.
- Keep reactive queries narrow — filter resolved/historical data out of live queries.

---

## When You Are Unsure
Read the relevant Convex file directly — the source code is the spec. If the behavior is ambiguous, ask before inventing a solution. Do not guess at data models, status codes, or routing logic.
