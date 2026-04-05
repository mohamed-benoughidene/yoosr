# Part 15: Feature Modules — Analysis Findings

## 📊 Visual Map

```
Feature Domains (Actual Implementation)
├── User Management
│   ├── Profiles          → convex/profiles.ts (7 functions: getMe, getByUserId, list, updateMe, upsertFromClerk, ensureCurrent, setAvailability, updateHeartbeat, setOffline, cleanupStalePresence)
│   └── Settings          → src/app/[locale]/dashboard/settings/ (settings, canned-responses, departments, groups, integrations, labels, operating-hours, webhooks, widget)
│
├── Bot/AI Features
│   ├── Bot CRUD          → convex/bots.ts (list, get, create, update, remove, _deleteBotFlowsBatch)
│   ├── Bot Flows         → convex/botFlows.ts (get, save, compileToExecutionNodes — 20+ node types)
│   ├── Bot Engine        → convex/bot.ts (executeNextBlock, executeAction — 20+ action types)
│   ├── AI Flow Builder   → convex/aiFlowBuilder.ts (generateFlow action — LLM-powered flow generation)
│   ├── AI Integration    → convex/openrouter.ts (callAITask, callAIAssistant — shared LLM helper)
│   └── OpenRouter API    → convex/openrouter_api.ts (saveKey, clearKey, testKey, getStatus — per-org key management)
│
├── Contact Management
│   ├── Contacts CRUD     → convex/contacts.ts (list, findByConversation, create, update, remove, batchImport)
│   └── Tags/Labels       → convex/labels.ts (separate module)
│
├── Project Management
│   ├── Projects CRUD     → convex/projects.ts (list, get, getByOrgId, create, update, remove, ensureProject, updateWidgetLocale, clearWidgetLocale)
│   └── Project Deletion  → convex/projects.ts (deleteProjectData — cascading batch deletion across 19 tables)
│
├── Messaging
│   ├── Conversations     → convex/conversations.ts (list, get, create, update, resolve, join, leave, updateVisitorInfo, +6 internal functions)
│   ├── Messages          → convex/messages.ts (list, send, getMessages, sendMessage, sendFromWidget, listPublic, +3 internal)
│   └── Bot State         → convex/bot.ts (getConversationState, updateConversationState — separated to avoid OCC conflicts)
│
├── Notifications
│   ├── In-app            → convex/notifications.ts (createNotification, listForCurrentUser, unreadCount, markAsRead, markAllRead, clearAll, cleanupOldNotifications)
│   └── Push              → convex/pushActions.ts (sendPushToOrg, sendPushToAgent) + convex/pushMutations.ts (savePushSubscription, removePushSubscription, registerPushSubscription)
│
├── Orders/Commerce
│   └── Orders            → convex/orders.ts (createOrder, listOrders, listOrdersPaginated, updateOrderStatus, deleteOrder, batchImportOrders)
│
├── Integrations
│   ├── Channel Integrations → convex/integrations.ts (list, upsert, remove, saveChannelIntegration, registerTelegramWebhook, getDecryptedWhatsAppCredentials, +6 lookup queries)
│   └── AI Integration       → convex/openrouter_api.ts (per-org API key management with encryption)
│
├── Analytics
│   └── Analytics         → convex/analytics.ts (getConversationVolume, getTokenUsage, getUnansweredQueries, getCSATSummary, getCSATComments, getProjectUsage, getTagsSummary, getProjectUsageSummary)
│
├── Knowledge Bases
│   ├── KB Management     → convex/knowledgeBases.ts, convex/knowledge.ts
│   └── KB Chunks         → convex/schema.ts (knowledge_base_chunks with vector index)
│
├── Activity & Audit
│   └── Activity Logs     → convex/activityLogs.ts
│
├── Routing
│   └── Smart Routing     → convex/routing.ts
│
├── Webhooks
│   └── Webhook System    → convex/webhooks.ts
│
└── Feedback
    └── Feedback          → convex/feedback.ts
```

## 📁 File Inventory

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `convex/bots.ts` | Bot CRUD (list, get, create, update, remove) | ✅ Found |
| `convex/botFlows.ts` | Flow builder — save/get/compile flows | ✅ Found |
| `convex/bot.ts` | Bot execution engine — executeNextBlock + 20 action types | ✅ Found (not in original template) |
| `convex/aiFlowBuilder.ts` | AI-generated flow creation via LLM | ✅ Found |
| `convex/contacts.ts` | Contact management (CRUD + batch import) | ✅ Found |
| `convex/conversations.ts` | Conversation management (1401 lines, 15+ functions) | ✅ Found |
| `convex/messages.ts` | Message management (CRUD, widget, monitor) | ✅ Found |
| `convex/projects.ts` | Project CRUD + cascading deletion | ✅ Found |
| `convex/notifications.ts` | In-app notification system | ✅ Found |
| `convex/pushActions.ts` | Web push notification sending | ✅ Found |
| `convex/pushMutations.ts` | Push subscription management | ✅ Found |
| `convex/orders.ts` | Order management (CRUD + batch import) | ✅ Found |
| `convex/integrations.ts` | Third-party channel integrations | ✅ Found |
| `convex/openrouter.ts` | Shared AI task/assistant LLM caller | ✅ Found |
| `convex/openrouter_api.ts` | OpenRouter API key management | ✅ Found |
| `convex/profiles.ts` | User profile management + presence | ✅ Found (not in original template) |
| `convex/analytics.ts` | Analytics & reporting (844 lines) | ✅ Found (not in original template) |
| `convex/utils.ts` | Shared auth/ownership utilities | ✅ Found (not in original template) |
| `convex/schema.ts` | Full schema definition (30+ tables) | ✅ Found (not in original template) |
| `convex/activityLogs.ts` | Activity logging | ✅ Found (not in original template) |
| `convex/routing.ts` | Smart conversation routing | ✅ Found (not in original template) |
| `convex/webhooks.ts` | Outbound webhook system | ✅ Found (not in original template) |
| `convex/feedback.ts` | User feedback collection | ✅ Found (not in original template) |
| `convex/knowledgeBases.ts` | Knowledge base CRUD | ✅ Found (not in original template) |
| `convex/knowledge.ts` | KB search/embeddings | ✅ Found (not in original template) |
| `convex/tags.ts` | Tag/label management | ✅ Found (not in original template) |
| `convex/settings.ts` | App settings (departments, canned responses, etc.) | ✅ Found (not in original template) |
| `convex/labels.ts` | Label management | ✅ Found (not in original template) |
| `convex/crons.ts` | Scheduled jobs | ✅ Found (not in original template) |
| `src/app/[locale]/dashboard/bots/page.tsx` | Bot list UI with filter/search | ✅ Found |
| `src/app/[locale]/dashboard/contacts/page.tsx` | Contacts UI with import/export | ✅ Found |
| `src/app/[locale]/dashboard/orders/page.tsx` | Orders UI with import/export | ✅ Found |
| `src/app/[locale]/dashboard/settings/integrations/page.tsx` | Integrations settings (603 lines) | ✅ Found |
| `src/app/[locale]/design-studio/[botId]/page.tsx` | Bot flow editor page | ✅ Found |

## ✅ Analysis Checklist

### [x] What are the main feature domains?

The codebase has **12 main feature domains**, each backed by dedicated Convex modules:

1. **User/Profile Management** — `convex/profiles.ts` (10 functions for CRUD, presence, availability, Clerk sync)
2. **Project Management** — `convex/projects.ts` (9 functions + cascading deletion across 19 tables)
3. **Bot/AI Features** — `convex/bots.ts` + `convex/botFlows.ts` + `convex/bot.ts` + `convex/aiFlowBuilder.ts` (bot CRUD, flow design, AI-powered flow generation, execution engine with 20+ action types)
4. **AI Integration** — `convex/openrouter.ts` + `convex/openrouter_api.ts` (shared LLM caller + per-org key management with encryption/testing)
5. **Contact Management** — `convex/contacts.ts` (6 functions including batch import with deduplication)
6. **Conversation/Messaging** — `convex/conversations.ts` (1401 lines, 15+ functions) + `convex/messages.ts` (8 functions + 3 internal)
7. **Notifications** — `convex/notifications.ts` (7 functions for in-app) + `convex/pushActions.ts` + `convex/pushMutations.ts` (web push via VAPID)
8. **Orders** — `convex/orders.ts` (6 functions for order CRUD, status management, batch import)
9. **Integrations** — `convex/integrations.ts` (15+ functions for Telegram, WhatsApp, Messenger, Instagram channel integrations with encrypted credentials)
10. **Analytics** — `convex/analytics.ts` (844 lines, 15+ functions for volume, token usage, CSAT, tags, usage quotas)
11. **Knowledge Bases** — `convex/knowledgeBases.ts` + `convex/knowledge.ts` (KB CRUD + vector search with embeddings)
12. **Platform Features** — `convex/routing.ts` (smart routing), `convex/webhooks.ts` (outbound webhooks), `convex/activityLogs.ts` (audit trail), `convex/feedback.ts` (user feedback), `convex/tags.ts` (tagging), `convex/settings.ts` (departments, canned responses, operating hours)

### [x] How is each feature structured? (frontend + backend)

**Backend structure (Convex):**
- Every feature module follows a consistent pattern: `convex/<feature>.ts`
- Functions are typed as `query`, `mutation`, `action`, `internalQuery`, `internalMutation`, or `internalAction`
- Schema is centralized in `convex/schema.ts` with 30+ tables using Convex's `defineTable` API
- Cross-cutting concerns in shared modules: `convex/utils.ts` (auth helpers), `convex/lib/crypto.ts` (encryption), `convex/lib/env.ts` (env validation)

**Frontend structure (Next.js):**
- Pages at `src/app/[locale]/dashboard/<feature>/page.tsx` — one page per feature
- Uses React components from `src/components/dashboard/<feature>/`
- State management via Convex React hooks (`useQuery`, `useMutation`, `useAction`)
- Shared project context via `@/context/ProjectContext`
- UI components from shadcn/ui (`@/components/ui/*`)
- Internationalization via `next-intl` (`useTranslations`)

**Pattern example — Contacts:**
- Backend: `convex/contacts.ts` exports `list`, `findByConversation`, `create`, `update`, `remove`, `batchImport`
- Frontend: `src/app/[locale]/dashboard/contacts/page.tsx` uses `useQuery(api.contacts.list)` and `useMutation(api.contacts.create)`
- Components: `@/components/dashboard/contacts/contacts-list` (imported separately)

### [x] Are features isolated or coupled?

**Features are moderately coupled** with a shared-project ownership model:

- **Multi-tenancy via orgId**: All features scope data to `projects`, which belong to an `orgId` (Clerk organization). Ownership checks use `checkProjectOwnership` / `assertProjectOwnership` from `convex/utils.ts`.
- **Cross-feature coupling exists**:
  - `conversations` references `bots` (via `botId`), `departments` (via `departmentId`), `contacts` (bidirectional link via `conversationId`)
  - `contacts` links to `conversations` (conversationId field)
  - `orders` link to `conversations` (optional conversationId)
  - `notifications` reference `conversations`
  - `messages` require `conversations` and `projects`
  - `botFlows` require `bots`
  - `activity_logs` reference `projects` and actors
  - `token_usage`, `unanswered_queries`, `project_usage` reference `projects`
  - `knowledge_base_sources` reference `knowledge_bases`, which reference `projects`
  - `webhook_deliveries` reference `webhook_subscriptions`, which reference `projects`

- **Bot engine coupling**: `convex/bot.ts` internally calls `conversations`, `notifications`, `analytics`, `knowledge`, `routing`, `tags` modules via `internal.*` API
- **Webhook system coupling**: `contacts.create`, `conversations.create`, `messages.send` all trigger webhooks via `internal.webhooks.fireWebhookEvent`
- **Notification coupling**: Conversation assignment triggers push notifications and in-app notifications

**Isolation quality**: Modules are separated by file but share the same database schema (single Convex backend). No module-level boundaries enforced at runtime — any internal function can call any other internal function.

### [x] What's the AI/ML integration approach?

**OpenRouter as the AI abstraction layer** — the codebase uses OpenRouter API as a unified gateway to multiple LLM providers:

1. **Shared LLM client** (`convex/openrouter.ts`):
   - Uses OpenAI SDK with `baseURL: "https://openrouter.ai/api/v1"`
   - Two call patterns: `callAITask` (single-shot, temp=0.3) and `callAIAssistant` (multi-turn with history, temp=0.7)
   - Returns `{ text, tokensUsed, model }` for token tracking

2. **Per-org API key management** (`convex/openrouter_api.ts`):
   - Keys stored encrypted in `projects.openRouterApiKey` using `convex/lib/crypto.ts`
   - `saveOpenRouterKey`, `clearOpenRouterKey`, `getOpenRouterKeyStatus`, `testOpenRouterKey` mutations
   - Test endpoint makes a live API call to verify key validity
   - Default model configurable per project (`projects.defaultModel`)

3. **Token usage tracking** (`convex/analytics.ts`):
   - `logTokenUsage` internal mutation after every LLM call
   - Stored in `token_usage` table with model, operation type, timestamp
   - Aggregated into `project_usage.tokensConsumed` for quota tracking
   - `getTokenUsage` action with paginated aggregation by model

4. **AI Flow Builder** (`convex/aiFlowBuilder.ts`):
   - `generateFlow` action takes a plain-language prompt and returns `{ nodes, edges }` for React Flow
   - Uses a detailed system prompt defining all 14 node types with exact JSON schemas
   - 30-second timeout with `Promise.race`
   - Strips markdown code fences and parses JSON with fallback

5. **AI in bot flows**:
   - `aiTask` node: Single-shot LLM call with configurable prompt/system prompt
   - `ai_assistant` node: Multi-turn AI assistant with full conversation history
   - `ask_kb` node: RAG pattern — vector search + LLM synthesis with configurable max turns

6. **Bot engine LLM error handling**: AI failures return error in attributes (`ai_error`) and can route to failure paths; the engine does not crash on LLM failures

### [x] How does the bot flow builder work?

**Two-layer architecture: visual editor → compiled execution graph**

1. **Frontend (Design Studio)**: `src/app/[locale]/design-studio/[botId]/page.tsx` renders `BotEditorClient` — a React Flow-based visual editor where users create nodes and edges

2. **Flow compilation** (`convex/botFlows.ts`):
   - `save` mutation accepts `{ botId, nodes[], edges[], variables }` from React Flow
   - `compileToExecutionNodes()` transforms visual nodes into a semantic execution format
   - Supports **20+ node types**: start, reply, setAttribute, condition, webRequest, aiTask, ai_assistant, hitlHandoff, close, if_operating_hours, if_online_agent, ask_kb, capture_user_reply, wait, replace_bot, change_department, code_action, clear_transcript, applyLabel, setPriority

3. **Condition compilation**: Visual condition nodes with operators (equals, notEquals, contains, greaterThan, lessThan) are compiled into string expressions like `{{attributeKey}} == 'value'`

4. **Edge resolution**: True/false branches from condition nodes resolve to target node IDs by matching `sourceHandle` on edges

5. **AI-generated flows** (`convex/aiFlowBuilder.ts`): `generateFlow` action accepts a plain-language prompt and uses OpenRouter to generate `{ nodes, edges }` that can be loaded directly into React Flow

6. **Bot execution engine** (`convex/bot.ts`):
   - `executeNextBlock` internal action reads conversation state + flow, executes actions sequentially
   - Each action returns `ActionResult` with instructions: `newAttributes`, `nextNodeId`, `suspend`, `newBotId`, `resetNodeId`, `scheduleNextBlockAfter`
   - **Infinite loop guard**: 50-step limit per conversation
   - **HITL guard**: Stops bot if `botPaused === true`
   - **Suspension model**: Nodes like `capture_user_reply`, `wait`, `hitl_handoff` suspend execution and wait for triggers
   - **Scheduled execution**: `wait` actions schedule next block via `ctx.scheduler.runAfter(delay, executeNextBlock, ...)`
   - **Bot swapping**: `replace_bot` action can swap to a different bot mid-conversation

### [x] What external services are integrated?

**Channel integrations** (`convex/integrations.ts`):

1. **Telegram** — Bot token auth, webhook registration with secret token validation, encrypted credential storage
2. **WhatsApp (Cloud API)** — Phone number ID, access token, verify token, app secret. Encrypted token storage. Lookup by phoneNumberId index.
3. **Messenger** — Page ID, access token, app secret. Lookup by pageId index.
4. **Instagram** — Account ID, access token, app secret. Lookup by pageId index.

**AI integration**:
5. **OpenRouter** — Unified LLM gateway supporting multiple model providers. Per-org API key management with encryption. Model selection (default: `openrouter/free`). Token usage tracking.

**Push notifications**:
6. **Web Push (VAPID)** — FCM (Google), Mozilla Push, Windows Push, Apple Push. Endpoint validation against trusted origins. Automatic cleanup of expired (410/404) subscriptions.

**Webhooks**:
7. **Outbound Webhooks** — RestHooks-style webhook subscriptions with event filtering, payload signing (secret per subscription), retry logic (3 attempts), delivery tracking in `webhook_deliveries` table

**Crypto/security**:
- All sensitive credentials (tokens, API keys) encrypted via `convex/lib/crypto.ts` using an `ENCRYPTION_KEY` environment variable
- `encryptSecret` / `decryptSecret` functions used across integrations, OpenRouter, and webhook secrets

### [x] How are web push notifications implemented?

**Two-tier push system** (`convex/pushActions.ts` + `convex/pushMutations.ts`):

1. **Subscription management**:
   - `push_subscriptions` table: `{ userId, orgId, subscription, createdAt }`
   - Indexed by `userId` and `orgId`
   - `registerPushSubscription` public mutation saves/updates subscription for current user
   - One subscription per user (upserts on existing)

2. **Sending push notifications**:
   - `sendPushToOrg`: Sends to all users in an organization (used for "new conversation" events)
   - `sendPushToAgent`: Sends to a specific agent (used for assignment events)
   - Both use `web-push` library with VAPID details from env vars (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)
   - Endpoint validation against trusted origins: FCM, Mozilla, Windows, Apple

3. **Error handling**:
   - 410/404 errors → auto-remove stale subscription
   - All other errors silently ignored
   - Uses `Promise.allSettled` for parallel sends

4. **Trigger points**:
   - `conversations.createFromWidget` → `sendPushToOrg` (new conversation alert)
   - `conversations.update` (assignment) → `sendPushToAgent` (assigned to you)
   - VAPID setup is wrapped in try/catch — gracefully degrades if env vars are missing

### [x] Is there feature flagging?

**No dedicated feature flagging system found.** The codebase does not use LaunchDarkly, Flagsmith, or any feature flag service. Feature enablement is handled through:

1. **Integration `enabled` field**: Each integration has an `enabled: v.optional(v.boolean())` field that gates whether it's active
2. **Widget config flags**: `projects.widgetConfig` is a flexible JSON field that stores UI toggles (e.g., `enableWelcomeNotification`)
3. **Bot `status` field**: Bots have `status: "draft" | "active" | "archived"` controlling whether they're deployed
4. **Operating hours**: `operating_hours.enabled` boolean gates time-based routing

There is no A/B testing infrastructure or gradual rollout mechanism.

### [x] How are feature-specific errors handled?

**Multi-layered error handling:**

1. **Authentication errors**: Every public function checks `ctx.auth.getUserIdentity()` first. Returns `null`/`[]` for queries, throws `"Not authenticated"` for mutations

2. **Authorization errors**: `requireAdmin()` throws `ConvexError("Unauthorized: admin access required")`. `checkProjectOwnership()` returns null for queries, `assertProjectOwnership()` throws `ConvexError("Unauthorized")` for mutations

3. **External service errors**:
   - AI calls: `callAITask`/`callAIAssistant` throw on missing API keys; bot engine catches errors and stores in `ai_error` attribute, routes to failure paths
   - HTTP requests: `web_request` action catches fetch errors, routes to `failurePath`
   - Telegram webhook: `registerTelegramWebhook` catches Telegram API errors and returns descriptive error messages
   - Push notifications: Silently ignores errors except for 410/404 (subscription cleanup)
   - OpenRouter test: Returns `{ ok: false, error: "..." }` instead of throwing

4. **Validation errors**: `ConvexError` with descriptive messages (e.g., `"Contact not found"`, `"Array must contain between 1 and 500 contacts"`, `"Cannot delete a contact with active conversations"`)

5. **Frontend error handling**:
   - Toast notifications via `sonner` for user-facing errors
   - try/catch in mutation handlers with `toast.error()` calls
   - Loading states with spinner indicators

6. **Graceful degradation**: Push notifications silently fail if VAPID keys are missing; AI flows return empty responses on LLM errors; bot engine continues on unknown action types with a warning

### [x] Are features independently testable?

**Architecture supports testability but test coverage is limited:**

1. **Convex functions are independently testable** — each `query`, `mutation`, `action` is a pure function with typed inputs/outputs. The `internal.*` API enables isolated testing of individual functions
2. **No test files found in the `convex/` directory** — the `coverage/` directory exists but no `.test.ts` or `.spec.ts` files under `convex/`
3. **Frontend has some tests** — based on the `coverage/` directory, there appear to be tests for frontend components
4. **Shared utilities** (`convex/utils.ts`, `convex/lib/crypto.ts`, `convex/lib/env.ts`) are pure functions that could be unit tested
5. **Bot engine testability**: The `executeAction` function is exported and could be tested with mock contexts, but the tight coupling to `ctx.runQuery`, `ctx.runMutation`, and `ctx.scheduler` makes mocking complex
6. **No mocking infrastructure** found in the Convex codebase

### [x] What's the data flow for each feature?

**Unified Convex real-time data flow:**

```
Client (React) → useQuery (reactive) → Convex Query → Real-time updates
Client (React) → useMutation → Convex Mutation → DB Write → Push to all useQuery subscribers
Client (React) → useAction → Convex Action → External API calls → Return result
Internal triggers: ctx.scheduler.runAfter() → internalMutation/internalAction → DB/Webhook/Notifications
```

**Feature-specific flows:**

1. **Bot flow**: Widget message → `messages.sendFromWidget` → triggers `routing.routeConversation` → triggers `bot.executeNextBlock` → reads `bot_flows` → executes actions → writes messages/updates conversation state
2. **Contact flow**: Agent creates contact → `contacts.create` → fires `contact.created` webhook → contact linked to conversation
3. **Order flow**: Agent creates order → `orders.createOrder` → stored with project/conversation linkage → status updates via `updateOrderStatus`
4. **Notification flow**: Event occurs → `scheduler.runAfter(0, internal.notifications.createNotification, ...)` → in-app notification stored → `pushActions.sendPushToAgent` → web push sent
5. **Analytics flow**: LLM call → `analytics.logTokenUsage` → stored in `token_usage` + increments `project_usage.tokensConsumed` → `analytics.getTokenUsage` aggregates with pagination
6. **Integration flow**: Agent saves credentials → `integrations.saveChannelIntegration` → encrypts sensitive fields → stores with denormalized indexes → webhooks register external endpoints

### [x] Are there shared feature utilities?

**Yes — several shared utility modules:**

1. **`convex/utils.ts`** — Auth/ownership helpers:
   - `requireAdmin(identity)` — throws if not org:admin
   - `assertProjectOwnership(ctx, projectId, identity)` — throws if no access
   - `checkProjectOwnership(ctx, projectId, identity)` — returns null if no access

2. **`convex/lib/crypto.ts`** — Encryption utilities:
   - `encryptSecret(value, key)` — encrypts secrets with AES
   - `decryptSecret(encrypted, key)` — decrypts stored secrets

3. **`convex/lib/env.ts`** — Environment validation:
   - `requireEnv(name, value)` — validates required env vars

4. **`convex/_generated/api.ts`** — Auto-generated type-safe API for cross-module calls via `internal.*`

5. **Frontend utilities**:
   - `@/lib/utils.ts` — `cn()` className merging
   - `@/context/ProjectContext` — Shared project state across all dashboard pages
   - `@/components/ui/*` — Shared shadcn/ui components
   - `next-intl` — Internationalization (`useTranslations`, locale routing)

6. **`compileToExecutionNodes()`** in `convex/botFlows.ts` — shared compilation logic used by both manual saves and the AI flow builder

### [x] How are feature permissions handled?

**Three-tier permission model via Clerk organization roles:**

1. **Authentication** — All functions require `ctx.auth.getUserIdentity()`. Public/widget functions use `internal*` variants to bypass auth

2. **Organization scoping** — All data is scoped to `orgId` (Clerk organization):
   - Projects belong to an org (`projects.orgId`)
   - Profiles linked to org (`profiles.orgId`)
   - Push subscriptions linked to org (`push_subscriptions.orgId`)
   - Every query filters by orgId to prevent cross-org data leakage

3. **Role-based access** — Two roles via Clerk:
   - `org:admin` — Full CRUD access (create/delete bots, integrations, orders, projects)
   - `member` — Read access + limited mutations (view bots, conversations, contacts; cannot create/delete)

**Implementation pattern:**
```typescript
// Public functions
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

// Admin-gated functions
requireAdmin(identity as { org_role?: string });

// Ownership checks
const project = await checkProjectOwnership(ctx, projectId, { org_id: identity.org_id });
if (!project) throw new ConvexError("Unauthorized");
```

4. **Frontend permission gates**: `isAdmin = activeProject?.userRole === "org:admin"` — used to conditionally render admin-only UI elements (create buttons, delete options, settings access)

5. **No row-level permissions** — ownership is at the org level. All org members can see all org data. No per-resource ACLs.

### [x] Is there analytics/telemetry per feature?

**Yes — comprehensive analytics via `convex/analytics.ts` (844 lines):**

1. **Conversation volume** — `getConversationVolume`: Daily buckets split by bot vs agent handled
2. **Token usage** — `getTokenUsage`: Summed by model, with date range filtering
3. **CSAT** — `getCSATSummary`: Average rating + per-star distribution + `getCSATComments`
4. **Unanswered queries** — `getUnansweredQueries`: Top KB queries with no results, sorted by count
5. **Tags summary** — `getTagsSummary`: Top 10 LLM-generated tags from closed conversations
6. **Usage quotas** — `getProjectUsage`: Real-time tokens consumed + conversation count for billing
7. **Usage summary** — `getProjectUsageSummary`: Conversations, bots, KBs, tokens for current billing cycle

**Analytics logging:**
- `logTokenUsage` — Called after every LLM call (ai_task, ai_assistant, ask_kb)
- `logUnansweredQuery` — Called when KB returns no results
- `logConversationEvent` — Called on conversation open/close, tracking bot vs agent handling
- `submitCSAT` — Public mutation from widget for satisfaction ratings

**No third-party telemetry** (no Sentry, PostHog, Mixpanel, or Google Analytics found in the Convex backend).

## 🔍 Key Patterns to Identify

### 1. Internal Function Pattern
- Every feature exposes `internal*` variants (`internalQuery`, `internalMutation`, `internalAction`) for cross-module calls without auth overhead
- Used by webhooks, bot engine, scheduler, and cron jobs
- Access via `internal.<module>.<function>` from `convex/_generated/api`

### 2. Bounded Batch Processing
- All bulk operations use `.take(N)` with N typically 100-500 to prevent runaway reads
- Cascading deletion re-schedules via `ctx.scheduler.runAfter(0, ...)` for batches of 100
- Notification cleanup processes MAX_BATCH=200
- Presence cleanup takes 500 profiles

### 3. Optimistic Concurrency Control (OCC) Avoidance
- `conversation_bot_state` is a **separate table** from `conversations` to prevent write conflicts between the bot engine and agent UI
- Deferred conversation metadata updates via `updateMetadataInternal` scheduled mutations
- Bot state updates use dedicated table with `by_conversationId` index

### 4. Event-Driven Architecture via Scheduler
- All cross-cutting concerns triggered via `ctx.scheduler.runAfter(0, internal.*, ...)` for async execution:
  - Webhook firing
  - Notification creation
  - Push notification sending
  - Activity logging
  - Smart routing
  - Tag extraction
  - Bot execution

### 5. Encrypted Credential Storage
- All channel credentials (Telegram bot tokens, WhatsApp access tokens, Messenger app secrets) encrypted with AES using `ENCRYPTION_KEY`
- Decryption only happens at call time, never stored plaintext
- Denormalized lookup fields (phoneNumberId, pageId, webhookSecret) stored alongside encrypted credentials for O(log n) queries

### 6. Multi-Tenancy via Organization Scoping
- Every query filters by `orgId` or `projectId` → project belongs to org
- No cross-org data leakage possible (every function checks org membership)
- `ClerkIdentity` type extended with `org_id` and `org_role` from Clerk tokens

### 7. AI Flow Generation
- `generateFlow` action converts natural language to React Flow nodes/edges
- Detailed system prompt defines 14 node types with exact JSON schemas
- Layout rules enforced (start at y=50, steps at y+180, branches at x=80/420)
- 30-second timeout with graceful error handling

### 8. Webhook System (RestHooks Pattern)
- Subscriptions stored with event filters and signing secrets
- Fire via scheduler for async delivery
- Delivery attempts tracked in `webhook_deliveries` table
- Retry logic (3 attempts implied by delivery tracking)

## ⚠️ Potential Concerns

### HIGH Severity

1. **No rate limiting on AI calls** — `callAITask`/`callAIAssistant` have no rate limiting or quota enforcement beyond per-org API key management. A runaway bot could exhaust OpenRouter credits rapidly.

2. **No fallback for external service failures** — If OpenRouter is down, all bot AI features fail silently. No fallback model or graceful degradation beyond storing error in attributes.

3. **Hard-coded step limit (50) in bot engine** — `executeNextBlock` stops at 50 steps. Complex flows may hit this limit. No configurable threshold.

4. **Silent push notification failures** — All push errors except 410/404 are silently ignored. Failed delivery is not logged or retried.

### MEDIUM Severity

5. **No feature tests for Convex functions** — The `convex/` directory has zero test files. Critical business logic (bot engine, payment orders, contact management) is untested.

6. **Inconsistent error handling** — Some functions throw `ConvexError`, others throw plain `Error`, some return `null`/`[]`. No standardized error envelope for frontend consumption.

7. **Denormalized `orgId` in profiles** — The `profiles` table has its own `orgId` field that can diverge from the project's `orgId` if a user switches orgs. This could lead to stale membership data.

8. **No idempotency on batch imports** — `batchImport` for contacts/orders deduplicates by email but not by other fields. Re-importing the same CSV could create duplicates if email is empty.

9. **Widget creates conversations without auth** — `createFromWidget` is an `internalMutation` called from untrusted client code. No rate limiting or CAPTCHA protection visible.

### LOW Severity

10. **TODO comments for pagination** — `contacts.list` and `conversations.findByVisitor` use `.take(500)` with TODO comments noting they should use paginated aggregation.

11. **No feature flagging** — Features are either fully on or fully off. No gradual rollouts or A/B testing capability.

12. **Magic numbers in conversation status** — Status codes `100` (unassigned), `200` (assigned), `1000` (resolved) are used throughout without named constants.

13. **Missing user feedback for async operations** — Bot deletion uses async scheduler pattern (`_deleteBotFlowsBatch`) but frontend gets immediate success toast before deletion completes.
