# Agent Instructions

## Stack
- **Frontend**: Next.js (App Router)
- **Database + Backend + Real-time**: Convex
- **Auth**: Clerk (organizations for multi-tenancy)
- **AI**: Anthropic API (Claude)

---

## Reference File
The file `TILEDESK_REFERENCE.md` is the single source of truth for this project.
It contains the full architecture, data models, API contracts, routing logic, auth flows, and design patterns from the Tiledesk codebase that this project is rebuilding.

**Before working on any feature, find the relevant section in `TILEDESK_REFERENCE.md` and treat it as the spec.** Do not invent data models, status codes, or logic flows from scratch — the reference defines them.

---

## Core Rules

### 1. Multi-tenancy is mandatory
Every Convex query and mutation must filter by `orgId` from Clerk. No exceptions.
```typescript
.withIndex("by_org", (q) => q.eq("orgId", orgId))
```

### 2. Use the exact status enums from the reference
Conversations: `100` (unassigned) → `200` (assigned) → `1000` (closed)
Messages: `0` (sent) → `100` (delivered) → `200` (seen)
Do not use strings like `"open"` or `"closed"`. Use the numeric enums.

### 3. Leads are NOT Clerk users
Clerk manages internal agents and admins only. End-users (leads) in the chat widget are authenticated via short-lived JWTs generated in a Convex action. Never create Clerk accounts for leads.

### 4. Never lose message history on HITL handoff
When transitioning from bot to human agent, the `conversationId` stays the same. Only `participants` and `status` change. History is always preserved.

### 5. The `attributes` field is the extensibility layer
Both `messages` and `conversations` tables have an `attributes: Record<string, any>` field. Use it for anything not in the fixed schema — UI elements, lead qualification data, bot state, external IDs, file references.

### 6. Convex replaces Tiledesk's infrastructure stack
| Tiledesk | This Project |
|---|---|
| MongoDB | Convex database |
| Redis | Convex reactive queries |
| MQTT/WebSockets | `useQuery` real-time subscriptions |
| RabbitMQ | Convex mutations + actions |

Do not introduce Redis, WebSocket servers, or external message brokers. Convex handles all of it natively.

---

## Folder Structure Convention
```
/convex
  /schema.ts         ← All table definitions
  /conversations.ts  ← Conversation mutations + queries
  /messages.ts       ← Message mutations + queries
  /routing.ts        ← Agent assignment logic (action)
  /leads.ts          ← Lead identity management
  /webhooks.ts       ← Outbound RestHook firing
  /bot.ts            ← Design Studio state machine executor

/app
  /dashboard         ← Agent dashboard (real-time)
  /widget            ← Embeddable chat widget
  /api               ← HTTP endpoints for inbound webhooks
```

---

## When You Are Unsure
Check `TILEDESK_REFERENCE.md` first. If the answer is not there, ask before inventing a solution that may conflict with the architecture.
