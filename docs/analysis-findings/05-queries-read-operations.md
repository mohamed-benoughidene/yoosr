# Part 05: Queries (Read Operations) — Analysis Findings

## 📊 Visual Map

```
convex/ (Query Files — 24 files, ~200+ query functions)
│
├── contacts.ts (6 functions)
│   ├── list (query)              → List contacts for project, .take(500)
│   ├── findByConversation (query) → Get contact by conversation ID
│   └── create, update, remove, batchImport (mutations — see Part 06)
│
├── conversations.ts (16+ functions)
│   ├── list (query)              → Active conversations, .take(100), exclude status=1000
│   ├── get (query)               → Single conversation by ID
│   ├── getBotState (query)       → Bot state for design studio debugger
│   ├── listUnassignedInternal (internalQuery) → Unassigned convos for routing
│   ├── listStaleUnassignedInternal (internalQuery) → Stale unassigned for retry
│   ├── findByVisitor (internalQuery) → Widget lookup by visitor ID
│   └── create, update, resolve, join, leave, etc. (mutations — see Part 06)
│
├── messages.ts (8 functions)
│   ├── list (query)              → Paginated messages for conversation
│   ├── listRecentByProject (query) → Recent visitor messages for notifications
│   ├── getMessages (query)       → Monitor view with isInternal flag
│   ├── listPublic (internalQuery) → Widget message list with sender name enrichment
│   ├── getStorageUrl (query)     → Storage URL for file attachments
│   └── send, sendFromWidget, sendMessage (mutations — see Part 06)
│
├── projects.ts (10 functions)
│   ├── getPublic (internalQuery) → Widget project info (no auth)
│   ├── list (query)              → All org projects with userRole
│   ├── get (query)               → Single project with ownership check
│   ├── getByOrgId (query)        → Project by org ID
│   ├── getByOrgIdInternal (internalQuery) → Internal org lookup
│   └── create, update, ensureProject, etc. (mutations — see Part 06)
│
├── bots.ts (5 functions)
│   ├── list (query)              → Bots for project, .take(100)
│   ├── get (query)               → Single bot with ownership check
│   └── create, update, remove (mutations — see Part 06)
│
├── botFlows.ts (2 functions)
│   ├── get (query)               → Flow for bot with org ownership check
│   └── save (mutation — see Part 06, includes compileToExecutionNodes)
│
├── dashboard.ts (1 function)
│   └── getHomeStats (query)      → Dashboard aggregation (bots, convos, queue, stats)
│       ├── Bots count: .first() for O(log n) existence check
│       ├── Active conversations: .take(250) × 2 (unassigned + assigned)
│       ├── Online teammates: profiles.by_orgId .take(101)
│       ├── Live queue: top 5 recent, enriched with agent names
│       └── Today's snapshot: .take(2000) conversations, .take(2000) events
│
├── profiles.ts (10 functions)
│   ├── getMe (query)             → Current user's profile
│   ├── getByUserId (query)       → Profile by user ID with org check
│   ├── list (query)              → All org profiles, .take(100)
│   └── updateMe, setAvailability, ensureCurrent, etc. (mutations)
│
├── settings.ts (15+ functions — mixed concerns)
│   ├── listDepartments (query)   → Departments for project, .take(100)
│   ├── getMyDepartments (query)  → User's departments
│   ├── listCannedResponses (query) → Canned responses, .take(200)
│   ├── getOperatingHours (query) → Operating hours for project
│   ├── createLabel, updateLabel, removeLabel (mutations — TODO: move to labels.ts)
│   └── Department CRUD, Canned Response CRUD (mutations)
│
├── analytics.ts (20+ functions)
│   ├── getConversationVolume (action)    → Paginated convo volume by date, bot vs agent
│   ├── getVisitorStats (action)          → Unique visitors via pagination
│   ├── getMessageStats (action)          → Message counts by sender type
│   ├── getTokenUsage (action)            → Token usage by model
│   ├── getCSATSummary (action)           → CSAT avg + distribution, paginated
│   ├── getCSATComments (query)           → Recent CSAT comments with ratings
│   ├── getUnansweredQueries (query)      → Top unanswered queries by count
│   ├── getTagsSummary (action)           → Top 10 semantic tags from conversations
│   ├── getProjectUsage (query)           → Current token/convo usage
│   ├── getProjectUsageSummary (query)    → Usage summary with sentinels ("1000+")
│   ├── checkProjectAccess (internalQuery) → Org ownership check
│   └── Various _paginate*Internal queries for action pagination loops
│
├── knowledgeBases.ts (9 functions)
│   ├── list (query)              → KBs for project, .take(100)
│   ├── get (query)               → Single KB with ownership check
│   ├── listSources (query)       → Sources for KB, .take(100)
│   ├── listSourcesPaginated (query) → Sources with pagination
│   └── create, addSource, remove, etc. (mutations + actions)
│
├── notifications.ts (6 functions)
│   ├── listForCurrentUser (query)  → 30 most recent notifications
│   ├── unreadCount (query)         → Unread count with "99+" sentinel
│   └── createNotification, markAsRead, markAllRead, clearAll, cleanupOldNotifications (mutations)
│
├── activityLogs.ts (3 functions)
│   ├── getActivityLog (query)    → Paginated activity, newest first
│   ├── list (query)              → Legacy: last 100 activity logs
│   └── log, logActivityInternal (mutations)
│
├── labels.ts (1 function)
│   └── listLabels (query)        → Labels for project, .take(200)
│
├── tags.ts (4 functions)
│   ├── getProjectLabels (internalQuery) → Labels for tag extraction
│   └── extractGenerativeTags (internalAction), updateConversationTags (internalMutation),
│       assignTagToConversation (mutation), removeTagFromConversation (mutation)
│
├── feedback.ts (1 function)
│   └── submitFeedback (mutation) → Submit org-level feedback
│
├── orders.ts (5 functions)
│   ├── listOrders (query)        → Orders for project, .take(500), sorted by createdAt desc
│   ├── listOrdersPaginated (query) → Orders with cursor pagination
│   └── createOrder, updateOrderStatus, deleteOrder, batchImportOrders (mutations)
│
├── integrations.ts (15+ functions)
│   ├── list (query)              → Integrations for project, .take(100)
│   ├── getDecryptedWhatsAppCredentials (internalQuery) → Decrypted creds for WhatsApp
│   ├── getWhatsAppIntegrationByPhoneNumberId (internalQuery) → Lookup by phone number
│   ├── getMessengerIntegrationByPageId (internalQuery) → Lookup by page ID
│   ├── getInstagramIntegrationByPageId (internalQuery) → Lookup by page ID
│   ├── getTelegramIntegrationByWebhookSecret (internalQuery) → Lookup by webhook secret
│   ├── findTelegramByWebhookSecret (internalQuery) → Raw secret lookup
│   ├── listAllEnabledMetaIntegrations (internalQuery) → All enabled Meta integrations
│   └── upsert, remove, registerTelegramWebhook, etc. (mutations + actions)
│
├── routing.ts (0 query functions)
│   └── routeConversation (internalMutation), retryRoutingForAgent (internalAction),
│       retryUnassignedConversations (internalMutation) — all write operations
│
├── diagnostic.ts (3 functions — DEBUG ONLY)
│   ├── getRecentMessages (internalQuery) → Last 10 messages (dev only)
│   ├── getConvoPointer (internalQuery)   → Last 5 convos with bot state
│   └── getBotFlow (internalQuery)        → ALL bot_flows .collect() — DEV ONLY, OOM risk
│
├── knowledge.ts (internal functions for KB indexing)
│   ├── getChunkInternal (internalQuery)  → Single chunk by ID
│   ├── getSourceInternal (internalQuery) → Single source by ID
│   └── indexSource (internalAction), searchSimilarChunks (internalAction) — processing
│
├── webhooks.ts (3 query functions)
│   ├── list (query)              → Webhook subscriptions for project, .take(100)
│   ├── getSubscriptionById (internalQuery) → Single subscription
│   ├── getActiveSubscriptions (internalQuery) → Active subs for event fan-out
│   └── fireWebhookEvent, deliverWebhook, create, update, remove (mutations/actions)
│
└── Additional files (no queries or write-only):
    ├── auth.config.ts    → Auth configuration
    ├── convex.config.ts  → Convex instance config
    ├── crons.ts          → Cron job definitions
    ├── errors.ts         → Error helpers (no queries)
    ├── getAny.ts         → Utility (not examined in detail)
    ├── http.ts           → HTTP endpoints (webhooks)
    ├── migrations.ts     → Disabled migration
    ├── openrouter.ts     → AI task execution
    ├── openrouter_api.ts → OpenRouter API calls
    ├── pushActions.ts    → Push notification actions
    ├── pushMutations.ts  → Push mutation helpers
    ├── seed.ts           → Seed data
    ├── types.ts          → Type definitions only
    ├── utils.ts          → Auth helpers (requireAdmin, assertProjectOwnership)
    └── wipe.ts           → Data wipe utilities
```

## 📁 File Inventory

| File | Query Functions | Total Functions | Purpose |
|------|----------------|-----------------|---------|
| `contacts.ts` | 2 | 6 | Contact listing, lookup by conversation |
| `conversations.ts` | 4 (+ 2 internalQuery) | 16+ | Conversation listing, creation, routing, status |
| `messages.ts` | 4 (+ 1 internalQuery) | 8 | Message listing, sending, widget support |
| `projects.ts` | 4 (+ 2 internalQuery) | 10 | Project CRUD, widget info, org scoping |
| `bots.ts` | 2 | 5 | Bot listing and retrieval |
| `botFlows.ts` | 1 | 2 | Bot flow retrieval and saving |
| `dashboard.ts` | 1 | 1 | Dashboard home stats aggregation |
| `profiles.ts` | 3 | 10 | User profiles, availability, presence |
| `settings.ts` | 4 | 15+ | Departments, canned responses, labels, hours |
| `analytics.ts` | 5 (+ 6 internalQuery) | 20+ | Volume, tokens, CSAT, tags, usage stats |
| `knowledgeBases.ts` | 4 | 9 | KB listing, source management |
| `notifications.ts` | 2 | 6 | Notification listing, unread count |
| `activityLogs.ts` | 2 | 3 | Activity log listing |
| `labels.ts` | 1 | 1 | Label listing |
| `tags.ts` | 1 (internalQuery) | 4 | Tag extraction, assignment |
| `feedback.ts` | 0 | 1 | Feedback submission |
| `orders.ts` | 2 | 5 | Order listing (bounded + paginated) |
| `integrations.ts` | 1 (+ 7 internalQuery) | 15+ | Integration CRUD, decrypted creds, lookups |
| `webhooks.ts` | 1 (+ 2 internalQuery) | 7 | Webhook subscription listing |
| `diagnostic.ts` | 3 (internalQuery) | 3 | Debug-only queries (dev environment only) |
| `knowledge.ts` | 2 (internalQuery) | 6 | KB chunk/source lookup, indexing, search |
| `routing.ts` | 0 | 2 | Smart assignment engine (mutations only) |

## ✅ Analysis Checklist

- [x] **What query functions exist in each file?**
  Documented in the visual map above. Total: ~50+ `query()` exports, ~25+ `internalQuery()` exports across 24 files.

- [x] **What parameters do queries accept?**
  Common parameter patterns:
  - `projectId: v.id("projects")` — nearly all queries require project scoping
  - `paginationOpts: paginationOptsValidator` — for cursor-based pagination (messages, activity logs, orders, KB sources)
  - `id: v.id("table")` — single document lookup
  - `kbId: v.id("knowledge_bases")` — KB-scoped queries
  - `conversationId: v.id("conversations")` — conversation-scoped queries
  - `botId: v.id("bots")` — bot-scoped queries
  - No queries accept arbitrary string input — all use typed Convex IDs

- [x] **Are queries using indexes effectively?**
  **Yes — consistently.** Almost all queries use `.withIndex()`:
  - `by_projectId` — standard for project-scoped listing
  - `by_userId` — profile lookups
  - `by_conversationId` — message/contact lookups
  - `by_botId` — flow lookups
  - `by_kbId` — source lookups
  - `by_orgId` — org-scoped profile/project lookups
  - `by_recipient` — notification lookups
  - `by_projectId_status` — conversation filtering
  - `by_projectId_createdAt` — time-range filtering
  - **One exception**: `dashboard.getHomeStats` does client-side filtering after `.take(2000)` for some stats (see N+1 concerns)

- [x] **What's the complexity of each query?**
  - **Simple fetch** (O(log n)): `get`, `getMe`, `getById` — single document by ID
  - **Indexed listing** (O(log n + k)): `list`, `listSources`, `listDepartments` — `.withIndex().take(N)`
  - **Paginated listing** (O(log n + k)): `listPaginated`, `getActivityLog`, `listOrdersPaginated` — cursor-based
  - **Aggregation** (O(n)): `getHomeStats` — multiple `.take()` calls with client-side filtering
  - **Paginated action** (O(n/k rounds)): `getConversationVolume`, `getCSATSummary`, `getVisitorStats` — loop with 200-item pages
  - **Vector search** (O(log n)): `searchSimilarChunks` — vector index lookup with filter

- [x] **Are there pagination patterns?**
  **Yes — two patterns:**
  1. **Bounded `.take(N)`** — Most common. Uses sentinel values for "more" detection:
     - `.take(100)` — standard listing (bots, departments, integrations, KBs, contacts)
     - `.take(200)` — canned responses, labels
     - `.take(500)` — contacts, orders (larger lists)
     - `.take(1000)` — analytics conversation volume
     - `.take(2000)` — dashboard daily snapshot
     - `.take(101)` — "100+" sentinel for bots count
     - `.take(51)` — "50+" sentinel for KB count
     - `.take(1001)` — "1000+" sentinel for conversations count
  2. **Cursor-based pagination** — `paginationOptsValidator` for infinite scroll:
     - `messages.list`, `messages.getMessages`
     - `knowledgeBases.listSourcesPaginated`
     - `orders.listOrdersPaginated`
     - `activityLogs.getActivityLog`

- [x] **Is there cursor-based pagination for large datasets?**
  Yes, for the largest datasets: messages, activity logs, KB sources, orders. Uses Convex's built-in `paginate()` API with `paginationOptsValidator`.

- [x] **Are queries composable or monolithic?**
  **Mixed:**
  - **Composable**: Internal queries (`internalQuery`) are called from other Convex functions (e.g., `internal.messages.listPublic` called from `tags.extractGenerativeTags`)
  - **Monolithic**: `dashboard.getHomeStats` is a single function that does 10+ database reads across 5+ tables — could be split into smaller composable queries
  - **Scheduler-based composition**: Many mutations schedule internal queries/mutations for async processing (e.g., webhook firing, notification creation)

- [x] **How is data filtering implemented?**
  - **Index-based filtering**: `.withIndex("by_projectId", q => q.eq("projectId", ...))` — primary method
  - **Compound filtering**: `.withIndex("by_projectId_status", q => q.eq("projectId", ...).eq("status", 100))`
  - **Post-filter**: `.filter(q => q.neq(q.field("status"), 1000))` — additional filtering after index
  - **Client-side filtering**: `dashboard.getHomeStats` filters arrays in JS after `.take()` (e.g., `.filter(c => c.status === 100 || c.status === 200)`)
  - **Time-range filtering**: `.filter(q => q.gte(q.field("_creationTime"), startOfTodayMs))` for date-based queries

- [x] **Are there any N+1 query problems?**
  **Yes — several identified:**
  1. **`dashboard.getHomeStats`**: For each of 5 live queue items, it does a separate profile lookup to get agent names — `Promise.all` parallelizes this, but it's still 5 separate reads. (Mitigated by parallelization.)
  2. **`messages.listPublic`**: For each unique agent senderId, it does a separate profile lookup. Uses `Promise.all` for parallelization but still N reads.
  3. **`contacts.list`**: Returns up to 500 contacts without enrichment — if the frontend needs project names or conversation details, it would need N additional queries.
  4. **`analytics.getConversationVolume`**: Paginated loop reading 200 conversations at a time, then for each conversation checking `assignedTo`/`resolvedBy` — not N+1 per se, but O(n) total reads.

- [x] **What's the caching strategy?**
  **Convex handles caching automatically:**
  - Convex caches query results at the edge and invalidates on writes
  - Real-time subscriptions via Convex `.use()` on the frontend (not in query code)
  - No explicit TTL caching or Redis-style caching in query code
  - **No query result memoization** — each call hits the database

- [x] **Are real-time subscriptions used?**
  The queries themselves don't configure reactivity — Convex makes all `query()` functions reactive by default when used with Convex's React hooks (`useQuery()`). The `internalQuery()` functions are not directly reactive (not exposed to the frontend).

- [x] **How is authorization handled in queries?**
  **Consistent pattern across all queries:**
  1. `const identity = await ctx.auth.getUserIdentity()` — get auth identity
  2. If no identity: return `[]`, `null`, or throw `authError()` (varies by query)
  3. Project ownership check: `checkProjectOwnership()` or manual `project.orgId !== identity.org_id` check
  4. Org-scoped queries use `by_orgId` index with `identity.org_id`
  5. Internal queries skip auth (trusted callers only)

  **Notable patterns:**
  - Public queries (for widget) use `internalQuery` and are called from HTTP endpoints
  - `list` queries return empty arrays for unauthenticated users (not errors)
  - `get` queries return `null` for unauthenticated or unauthorized users
  - Analytics queries use `action()` type with internal pagination queries to bypass Convex's single-query read limits

- [x] **Are there performance optimizations?**
  - **`.first()` instead of `.take(1)`**: `dashboard.getHomeStats` uses `.first()` for O(log n) existence check on bots
  - **`Promise.all` parallelization**: `dashboard.getHomeStats` parallelizes profile lookups for agent names
  - **Sentinel values**: Using `.take(N+1)` to detect "more than N" without counting all (e.g., `.take(101)` for "100+" bots)
  - **Bounded loops**: All pagination loops use fixed page sizes (200, 500) to prevent runaway reads
  - **Vector search with filter**: `searchSimilarChunks` uses `filterFields` in vector index to scope by projectId
  - **Denormalized indexes**: Integration lookups use denormalized fields (`phoneNumberId`, `pageId`, `webhookSecret`) for O(log n) instead of full-table scan + filter
  - **Separated bot state**: `conversation_bot_state` table prevents OCC conflicts on the main `conversations` table

- [x] **Error handling in queries?**
  - **Graceful degradation**: Most queries return `null` or `[]` on auth failure or not found
  - **`authError()` thrown**: Some queries throw for auth failures (e.g., `labels.listLabels`, `activityLogs.getActivityLog`)
  - **No try/catch**: Queries don't wrap database calls in try/catch — Convex handles errors at the framework level
  - **Actions use try/catch**: `action()` functions (analytics, knowledge) use try/catch for external API calls (OpenRouter, fetch)

## 📝 Agent Findings

### Query Architecture
The codebase has **~200+ query functions** across 24 files. The architecture follows clear patterns:

1. **Auth-first**: Every query checks identity before returning data
2. **Project-scoped**: Almost all queries require a `projectId` argument
3. **Index-driven**: Consistent use of `.withIndex()` for O(log n) lookups
4. **Bounded results**: `.take(N)` with sentinel values for "more" detection
5. **Cursor pagination**: For unbounded datasets (messages, activity logs)

### Action-Based Analytics Queries
Analytics queries use Convex `action()` type instead of `query()` because they need to paginate through large datasets exceeding Convex's single-query read limits. They loop with `internalQuery` pagination helpers (200 items per page).

### Internal Query Pattern
`internalQuery` functions serve as:
- Building blocks for actions (pagination helpers)
- Cross-function calls (e.g., `internal.messages.listPublic` called from `tags.extractGenerativeTags`)
- Widget/public endpoints (no auth required, called from HTTP endpoints)

### Diagnostic File
`diagnostic.ts` contains debug-only queries that are **intentionally unsafe** for production:
- `getBotFlow` uses `.collect()` on ALL bot_flows globally — will OOM on real data
- Gated by `process.env.NODE_ENV !== "development"` check

### Mixed Concerns in settings.ts
`settings.ts` contains queries for 4 different entities (departments, canned responses, labels, operating hours) — should be split. A TODO comment in the file acknowledges this: "TODO: move createLabel and removeLabel to convex/labels.ts for consistency."

## 🔍 Key Patterns to Identify

- **Auth gating**: `getUserIdentity()` → return null/[] or throw on every query
- **Project ownership**: `checkProjectOwnership()` or manual orgId comparison
- **Bounded listing**: `.take(N)` with N+1 sentinel for "more than N" detection
- **Cursor pagination**: `paginationOptsValidator` + `.paginate()` for infinite scroll
- **Internal composition**: `internalQuery` for cross-function calls and action pagination
- **Parallel enrichment**: `Promise.all` for batch profile lookups
- **Action + internalQuery pattern**: Analytics use action() + paginated internalQuery to bypass read limits
- **Vector search**: OpenRouter embeddings + Convex vector index for KB semantic search

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| **N+1 profile lookups in dashboard** | MEDIUM | `getHomeStats` does up to 5 separate profile reads for agent names in the live queue. Mitigated by `Promise.all` but still 5x reads per dashboard render. |
| **N+1 profile lookups in messages.listPublic** | MEDIUM | For each unique agent sender, a separate profile query is made. Could be optimized with a single org-profiles fetch and client-side matching. |
| **`.take(500)` on contacts without pagination** | MEDIUM | `contacts.list` takes up to 500 contacts. If a project has thousands of contacts, this will break. TODO comment acknowledges: "replace with paginated aggregation". |
| **`.take(200)` on labels without pagination** | LOW | `labels.listLabels` takes 200 labels. Unlikely to hit limits but has a TODO for pagination. |
| **Monolithic dashboard query** | LOW | `getHomeStats` reads from 5+ tables with 10+ database operations. Could be split into smaller composable queries for better caching and testability. |
| **Client-side filtering after large .take()** | LOW | `dashboard.getHomeStats` takes 2000 conversations then filters in JS. Inefficient if most are filtered out. |
| **Inconsistent auth response patterns** | LOW | Some queries return `null`/`[]` on auth failure, others throw `authError()`. Clients need to handle both patterns. |
| **Diagnostic queries in production code** | LOW | `diagnostic.ts` is in the codebase (not a separate debug package). If the NODE_ENV check fails in production, `getRecentMessages` and `getConvoPointer` would expose data. |
| **No rate limiting on queries** | INFO | Convex has built-in rate limiting, but no application-level rate limiting on query functions. The `@convex-dev/rate-limiter` package is a dependency but only used in specific flows. |
| **Analytics action functions bypass Convex caching** | INFO | `action()` functions don't benefit from Convex's automatic query caching — each call re-reads from the database. |
