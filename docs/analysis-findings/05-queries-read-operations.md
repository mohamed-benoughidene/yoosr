# Part 05: Queries (Read Operations) — Analysis Findings

## 📊 Visual Map

```
convex/ (Query Files — 21 files analyzed)
│
├── contacts.ts              → 2 queries (list, findByConversation) + 4 mutations
├── conversations.ts         → 6 queries + 2 internalQueries + 12 mutations/actions (LARGEST: 1401 lines)
├── messages.ts              → 4 queries + 1 internalQuery + 4 mutations
├── projects.ts              → 3 queries + 1 internalQuery + 7 mutations
├── bots.ts                  → 2 queries + 3 mutations
├── botFlows.ts              → 1 query (get) + 1 mutation (save)
├── dashboard.ts             → 1 query (getHomeStats)
├── profiles.ts              → 3 queries + 7 mutations
├── settings.ts              → 4 queries + 12 mutations (departments, canned responses, labels, hours)
├── analytics.ts             → 6 queries + 10 internalQueries + 8 mutations/actions (844 lines)
├── knowledgeBases.ts        → 5 queries + 6 mutations
├── notifications.ts         → 2 queries + 5 mutations/internalMutations
├── activityLogs.ts          → 2 queries + 2 mutations
├── tags.ts                  → 0 public queries + 1 internalQuery + 2 mutations + 1 internalAction
├── labels.ts                → 1 query (listLabels) — MINIMAL (18 lines)
├── integrations.ts          → 1 query + 9 internalQueries + 5 mutations/actions
├── knowledge.ts             → 0 public queries + 2 internalQueries + 2 internalMutations + 2 internalActions
├── orders.ts                → 2 queries + 4 mutations
├── routing.ts               → NO queries (mutations/actions only)
├── webhooks.ts              → 1 query + 2 internalQueries + 4 mutations + 2 internalActions
├── diagnostic.ts            → 0 public queries + 3 internalQueries (dev-only)
└── bot.ts                   → 0 public queries + 5 internalQueries + actions (889 lines — bot execution engine)
```

## 📁 File Inventory

| File | Purpose | Lines | Query Count | Has internalQuery? |
|------|---------|-------|-------------|-------------------|
| `contacts.ts` | Contact CRUD + batch import | ~180 | 2 | No |
| `conversations.ts` | Conversation lifecycle, Meta/Telegram integration, SLA, webhooks | 1401 | 6 | Yes (2) |
| `messages.ts` | Message CRUD, widget sending, webhooks | ~370 | 4 | Yes (1) |
| `projects.ts` | Project CRUD, cascading deletion, default labels | ~340 | 3 | Yes (1) |
| `bots.ts` | Bot CRUD, cascading flow deletion | ~170 | 2 | No |
| `botFlows.ts` | Flow editor → execution node compilation | ~340 | 1 | No |
| `dashboard.ts` | Dashboard aggregation (bots, live stats, queue, snapshot) | ~170 | 1 | No |
| `profiles.ts` | User profile, Clerk sync, presence/heartbeat | ~260 | 3 | No |
| `settings.ts` | Departments, canned responses, labels, operating hours | ~430 | 4 | No |
| `analytics.ts` | Stats, CSAT, token usage, tags, SLA, unanswered queries | 844 | 6 | Yes (10) |
| `knowledgeBases.ts` | KB CRUD, source management, batch deletion | ~200 | 5 | No |
| `notifications.ts` | In-app notifications (capped at 50/user) | ~200 | 2 | No |
| `activityLogs.ts` | Paginated activity log + legacy list | ~90 | 2 | No |
| `tags.ts` | AI tag extraction, manual tag assignment | ~170 | 0 | Yes (1) |
| `labels.ts` | List labels for project | ~18 | 1 | No |
| `integrations.ts` | Channel integrations (WhatsApp, Messenger, Instagram, Telegram) | ~350 | 1 | Yes (9) |
| `knowledge.ts` | KB indexing, vector search, embeddings | ~280 | 0 | Yes (2) |
| `orders.ts` | Order management CRUD + batch import | ~200 | 2 | No |
| `routing.ts` | Smart routing engine | N/A | 0 | No |
| `webhooks.ts` | Outbound webhooks with HMAC signing, retry logic | ~260 | 1 | Yes (2) |
| `diagnostic.ts` | Dev-only debugging queries | ~40 | 0 | Yes (3) |
| `bot.ts` | Core bot execution engine (889 lines) | 889 | 0 | Yes (5) |

**Total:** 21 files | **Public queries:** ~40 | **Internal queries:** ~32 | **Total query functions:** ~72

## ✅ Analysis Checklist

### [x] What query functions exist in each file?

Detailed inventory per file (see File Inventory table above). Key observations:
- **Largest files:** `conversations.ts` (1401 lines, 6 queries + 2 internalQueries), `analytics.ts` (844 lines, 6 queries + 10 internalQueries), `bot.ts` (889 lines, 5 internalQueries)
- **Smallest files:** `labels.ts` (18 lines, 1 query), `diagnostic.ts` (40 lines, 3 internalQueries)
- **Files with NO public queries:** `tags.ts`, `knowledge.ts`, `routing.ts`, `bot.ts`, `diagnostic.ts` — these are mutation/internal-action heavy
- **Note:** `feedback.ts` has NO queries at all (only `submitFeedback` mutation)

### [x] What parameters do queries accept?

Common parameter patterns found:
- **`projectId: v.id("projects")`** — Used in ~80% of queries as primary scoping parameter
- **`paginationOpts: paginationOptsValidator`** — Used in paginated queries (activityLogs, messages, knowledgeBases, orders)
- **`id: v.id("<table>")`** — Single-entity lookups (bots, contacts, projects, conversations)
- **`kbId: v.id("knowledge_bases")`** — Knowledge base-scoped queries
- **`conversationId: v.id("conversations")`** — Conversation-scoped queries
- **Date range filters:** `from: v.number(), to: v.number()` — Used in analytics queries
- **`limit: v.optional(v.number())`** — Used in top-N queries (getUnansweredQueries, getCSATComments)
- **`departmentId: v.optional(v.id("departments"))`** — Optional filter in conversations.list
- **No-param queries:** `profiles.getMe`, `profiles.list`, `notifications.listForCurrentUser`, `notifications.unreadCount` — rely on `ctx.auth.getUserIdentity()` for scoping

### [x] Are queries using indexes effectively?

**Yes — strong index usage throughout the codebase.** Pattern: `.withIndex("by_<field>", q => q.eq("<field>", args.<field>))`

Indexes observed in use:
- `by_projectId` — Most common, used across nearly all tables (contacts, conversations, bots, projects, knowledge_bases, integrations, webhook_subscriptions, activity_logs, departments, canned_responses, labels, operating_hours, orders, profiles via orgId)
- `by_orgId` — Projects and profiles, scoped to organization
- `by_projectId_status` — Conversations (composite index for status filtering, e.g., `q.eq("projectId", X).eq("status", 100)`)
- `by_conversationId` — Messages, contact, conversation_bot_state
- `by_userId` — Profiles
- `by_kbId` — Knowledge base sources
- `by_projectId_senderType` — Messages (composite)
- `by_projectId_createdAt` — Conversation events, CSAT ratings (composite with range)
- `by_projectId_count` — Unanswered queries (composite with count for ordering)
- `by_recipient` — Notifications
- `by_project_recipient` — Notifications (composite)
- `by_createdAt` — Notifications (for cleanup cron)
- `by_projectId_isActive` — Webhook subscriptions (composite)
- `by_provider_phoneNumberId`, `by_provider_pageId`, `by_provider_webhookSecret`, `by_provider_enabled` — Integrations (multiple composite indexes for channel lookups)
- `by_botId` — Bot flows

**Effective use of composite indexes:** `conversations.by_projectId_status`, `integrations.by_provider_enabled`, `notifications.by_project_recipient`

### [x] What's the complexity of each query? (simple fetch vs aggregation)

**Simple fetches (O(log n) or O(1)):**
- `projects.get`, `bots.get`, `contacts.findByConversation`, `knowledgeBases.get`, `profiles.getMe`, `profiles.getByUserId` — Single-entity lookups via `ctx.db.get()` or `.first()`
- `settings.getOperatingHours` — `.first()` on by_projectId index

**Bounded list fetches (.take(N)):**
- `contacts.list` — `.take(500)` with TODO comment to replace with pagination
- `conversations.list` — `.take(100)` excluding resolved
- `messages.listRecentByProject` — `.take(10)`
- `bots.list` — `.take(100)`
- `knowledgeBases.list` — `.take(100)`
- `knowledgeBases.listSources` — `.take(100)`
- `notifications.listForCurrentUser` — `.take(30)`
- `activityLogs.list` — `.take(100)`
- `labels.listLabels` — `.take(200)` with TODO comment
- `settings.listDepartments` — `.take(100)`
- `settings.listCannedResponses` — `.take(200)`
- `orders.listOrders` — `.take(500)` with comment "Use listOrdersPaginated for full pagination"
- `webhooks.list` — `.take(100)`
- `integrations.list` — `.take(100)`
- `profiles.list` — `.take(100)`

**Paginated queries (Convex `.paginate()`):**
- `activityLogs.getActivityLog` — proper cursor-based pagination
- `messages.list` — proper cursor-based pagination
- `messages.getMessages` — proper cursor-based pagination (with data transformation)
- `knowledgeBases.listSourcesPaginated` — proper cursor-based pagination
- `orders.listOrdersPaginated` — proper cursor-based pagination

**Complex aggregation queries:**
- `dashboard.getHomeStats` (~170 lines) — Aggregates bots count, live stats, queue, today's snapshot. Uses multiple bounded queries (`.take(250)`, `.take(2000)`, `.take(101)`, `.take(20)` for sampling). **Estimated complexity: O(N) across 4+ tables with bounded reads.**
- `analytics.getConversationVolume` — Paginated action loop over all conversations, filters by date range, groups by day
- `analytics.getTokenUsage` — Paginated action loop over token_usage, groups by model
- `analytics.getCSATSummary` — Paginated action loop over csat_ratings, computes average + distribution
- `analytics.getTagsSummary` — Paginated action loop over conversations, aggregates tag counts
- `analytics.getProjectUsageSummary` — 4 separate `.collect()` calls (conversations, bots, knowledgeBases, project_usage) — **potential concern**

### [x] Are there pagination patterns?

**Yes — two patterns observed:**

1. **Convex native pagination** (`.paginate(paginationOpts)`):
   - `activityLogs.getActivityLog` — Returns `{page, isDone, continueCursor}`
   - `messages.list` — Returns `{page, isDone, continueCursor}`
   - `messages.getMessages` — Returns transformed page data
   - `knowledgeBases.listSourcesPaginated` — Returns `{page, isDone, continueCursor}`
   - `orders.listOrdersPaginated` — Returns `{page, isDone, continueCursor}`

2. **Manual pagination** (action-level cursor loops):
   - `analytics.getConversationVolume` — Manual `while (!isDone)` loop with 200-item pages
   - `analytics.getTokenUsage` — Manual loop with 200-item pages
   - `analytics.getCSATSummary` — Manual loop with 500-item pages over csat_ratings
   - `analytics.getVisitorStats` — Manual loop aggregating unique visitors
   - `analytics.getMessageStats` — Manual loop counting messages by senderType
   - `analytics.getTagsSummary` — Manual loop over conversations

### [x] Is there cursor-based pagination for large datasets?

**Yes.** All Convex `.paginate()` calls use cursor-based pagination via `paginationOptsValidator` from `convex/server`. The manual action-level pagination also uses cursor-based patterns with `continueCursor` from Convex `.paginate()` results.

### [x] Are queries composable or monolithic?

**Mixed pattern:**

**Composable:** Internal queries (`internalQuery`) are designed to be called from actions/other queries via `ctx.runQuery()`:
- `analytics._paginateConversationsForStats` → called by `getConversationStats` action
- `analytics._checkProjectOwnership` → called by `getConversationVolume`, `getTokenUsage`, `getTagsSummary`
- `analytics.checkProjectAccess` → called by `getCSATSummary`
- `analytics.getCSATRatingsPage` → called by `getCSATSummary`
- `messages.listPublic` → called by `tags.extractGenerativeTags` action
- `webhooks.getActiveSubscriptions` → called by `fireWebhookEvent` action
- `webhooks.getSubscriptionById` → called by `deliverWebhook` action

**Monolithic:** `dashboard.getHomeStats` is a single monolithic query that performs 10+ separate database reads in one function. `conversations.list` is simple but the file itself is monolithic at 1401 lines mixing queries, mutations, Meta/Telegram integration, and webhook firing.

### [x] How is data filtering implemented?

**Three filtering patterns observed:**

1. **Index-based filtering** (primary pattern):
   - `.withIndex("by_projectId", q => q.eq("projectId", args.projectId))` — most common
   - Composite indexes: `.withIndex("by_projectId_status", q => q.eq("projectId", X).eq("status", 100))`

2. **Post-filter with `.filter()`**:
   - `conversations.list` — `.filter(q => q.neq(q.field("status"), 1000))` after index scan
   - `contacts.list` batch import — `.filter(q => q.eq(q.field("email"), contact.email))`
   - `notifications.listForCurrentUser` — `.filter(q => q.eq(q.field("projectId"), project._id))`
   - `notifications.unreadCount` — `.filter(q => q.eq(q.field("read"), false))`
   - `conversations.listStaleUnassignedInternal` — `.filter(q => q.and(q.eq(q.field("assignedTo"), undefined), q.lt(q.field("updatedAt"), args.threshold)))`

3. **Client-side filtering after fetch**:
   - `dashboard.getHomeStats` — `.filter(c => c.status === 100 || c.status === 200)` in memory
   - `settings.getMyDepartments` — `.filter(d => d.memberIds?.includes(userId))` in memory
   - `analytics.getUnansweredQueries` — `.filter(row => row.lastAskedAt >= args.from && row.lastAskedAt <= args.to)` in memory

### [x] Are there any N+1 query problems?

**YES — Several potential N+1 patterns found:**

1. **HIGH — `dashboard.getHomeStats` (dashboard.ts:~80-95):**
   ```typescript
   const liveQueue = await Promise.all(activeQueue.map(async (conv) => {
       if (conv.assignedTo) {
           const profile = await ctx.db
               .query("profiles")
               .withIndex("by_userId", q => q.eq("userId", conv.assignedTo!))
               .first();
           // ...
       }
   }));
   ```
   Up to 5 profile lookups in parallel — bounded but still N+1. Mitigated by `Promise.all` (parallel, not serial).

2. **MEDIUM — `dashboard.getHomeStats` (dashboard.ts:~105-115):**
   ```typescript
   const sampledTodayConv = conversationsToday.slice(0, 20);
   for (const conv of sampledTodayConv) {
       const firstAgentMessage = await ctx.db
           .query("messages")
           .withIndex("by_conversationId", q => q.eq("conversationId", conv._id))
           .filter(q => q.eq(q.field("senderType"), "agent"))
           .first();
   }
   ```
   Up to 20 message queries in a serial loop. Bounded by `.slice(0, 20)` but still sequential N+1.

3. **MEDIUM — `analytics.getConversationVolume`, `analytics.getTagsSummary`, etc.:**
   These use paginated action loops with `ctx.runQuery()` in `while (!isDone)` patterns. Each page fetch is a separate RPC call within Convex. Not truly N+1 (it's batched pagination), but the pattern involves multiple round trips.

4. **LOW — `messages.listPublic` (messages.ts:~240-255):**
   ```typescript
   const profiles = await Promise.all(
       agentIds.map(id =>
           ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", id)).first()
       )
   );
   ```
   Parallel profile lookups for agent names — mitigated by `Promise.all`.

5. **MEDIUM — `knowledge.searchSimilarChunks` (knowledge.ts:~230-245):**
   ```typescript
   const chunks = await Promise.all(
       relevantResults.map(async (result) => {
           const chunk = await ctx.runQuery(internal.knowledge.getChunkInternal, { id: result._id });
           return chunk;
       })
   );
   ```
   N individual `runQuery` calls for each chunk — could be replaced with batch `ctx.db.get()` calls.

### [x] What's the caching strategy?

**Convex provides automatic real-time caching** — all `query()` functions are automatically cached by Convex's reactive engine. When underlying data changes, subscribed clients re-render automatically.

**No explicit application-level caching** (Redis, in-memory, etc.) found in the query layer. The codebase relies entirely on Convex's built-in caching.

**Sentinel value pattern** (lightweight cache avoidance):
- `notifications.unreadCount` — Uses `.take(51)` and returns `999` as "99+" sentinel to avoid counting beyond threshold
- `dashboard.getHomeStats` — Uses `.take(101)` for org profiles and checks `isAvailable` with a "99+" sentinel pattern
- `knowledgeBases.list` — `.take(500)` with TODO to replace with pagination

### [x] Are real-time subscriptions used? (Convex `.use()` for reactivity)

**No explicit `.use()` calls found in query files.** Convex queries are inherently real-time when used with `useQuery()` on the frontend — the reactivity is handled by the Convex client SDK, not server-side. The server-side code uses plain `query()` and `internalQuery()` which Convex automatically makes reactive when called from the frontend.

**Real-time by design:** `messages.list` explicitly notes "real-time by default!" in its comment. The frontend uses Convex's `useQuery()` hook for automatic reactivity.

### [x] How are authorization checks handled in queries?

**Three authorization patterns observed:**

1. **Identity gate with early return** (most common in queries):
   ```typescript
   const identity = await ctx.auth.getUserIdentity();
   if (!identity) return [];  // or return null
   ```
   Used in: contacts.list, conversations.list, messages.list, bots.list, projects.list, knowledgeBases.list, notifications queries, activityLogs queries, webhooks.list, integrations.list, etc.

2. **Project ownership verification** (via `checkProjectOwnership` from `utils.ts`):
   ```typescript
   const project = await checkProjectOwnership(ctx, contact.projectId, identity as unknown as { org_id: string });
   if (!project) return null;
   ```
   Used in: contacts.findByConversation, knowledgeBases.get, bots.get, projects.get, analytics.getCSATComments, analytics.getProjectUsage, analytics.getProjectUsageSummary

3. **Organization-scoped queries** (no project check needed):
   ```typescript
   const orgId = (identity as unknown as { org_id: string }).org_id;
   return await ctx.db.query("profiles").withIndex("by_orgId", q => q.eq("orgId", orgId)).take(100);
   ```
   Used in: profiles.list, notifications.listForCurrentUser, notifications.unreadCount

4. **`requireAdmin()` for mutations** (not queries, but consistent pattern):
   Used across all mutation files for admin-only operations

5. **No authorization** — Diagnostic queries (`diagnostic.ts`) are `internalQuery` only, not callable from client. `knowledge.ts` has no public queries at all.

**Notable:** Some queries return `null`/`[]` on auth failure (silent), while others `throw new Error("Not authenticated")` (loud). Queries tend to be silent (early return), mutations tend to throw.

### [x] Are there performance optimizations? (denormalization, pre-computation)

**Yes — several optimizations observed:**

1. **Denormalization in schema:**
   - `conversations.lastMessage`, `conversations.unreadCount`, `conversations.updatedAt` — denormalized from messages table to avoid JOINs
   - `conversations.visitorName`, `conversations.visitorId` — denormalized from contacts
   - `integrations.phoneNumberId`, `integrations.pageId`, `integrations.webhookSecret` — denormalized from encrypted credentials for indexing
   - `project_usage.tokensConsumed`, `project_usage.conversationsCount` — pre-aggregated counters updated in real-time

2. **Bounded reads:**
   - Universal use of `.take(N)` instead of `.collect()` for list queries
   - Sampling in dashboard: `.slice(0, 20)` for wait time calculation
   - Dashboard uses `.take(2000)` for daily snapshot (comment: "sufficient for 100+ conversations/day")
   - Dashboard uses `.first()` for bot existence check (comment: "O(log n) existence check")

3. **Composite indexes:**
   - `by_projectId_status` for conversations (avoids full scan + filter)
   - `by_provider_enabled` for integrations (direct lookup of enabled integrations)
   - `by_project_recipient` for notifications (composite projectId + recipientId)

4. **Deferred updates to avoid OCC conflicts:**
   - `conversations.updateMetadataInternal` — scheduled via `ctx.scheduler.runAfter(0, ...)` to avoid Optimistic Concurrency Control conflicts with routing/bot engine

5. **Batched operations:**
   - `knowledgeBases.deleteSourcesBatch` — recursive batch deletion of 100 items, re-scheduling via scheduler
   - `bots._deleteBotFlowsBatch` — same pattern
   - `projects.deleteProjectData` — multi-step cascading deletion in 100-item batches

6. **Vector search with minimum relevance threshold:**
   - `knowledge.searchSimilarChunks` — `MIN_RELEVANCE_SCORE = 0.25` filter to avoid returning irrelevant results

### [x] Error handling in queries?

**Error handling patterns:**

1. **Early returns on auth failure** (queries):
   - Most queries: `if (!identity) return [];` or `if (!identity) return null;`
   - Clean, no exceptions thrown from queries

2. **Explicit throws** (some queries):
   - `labels.listLabels` — `throw new Error("Not authenticated")` (inconsistent with other queries that return [])
   - `messages.getMessages` — `throw new Error("Not authenticated")`
   - `profiles.getByUserId` — `throw new Error("Unauthenticated")` + `throw new Error("Unauthorized")`
   - `analytics.getCSATComments` — `throw new Error("Unauthenticated: identity required")`
   - `analytics.getProjectUsageSummary` — `throw new Error("Not authenticated")` + `throw new Error("Unauthorized: ...")`
   - `knowledgeBases.listSourcesPaginated` — `throw new Error("Knowledge base not found")`

3. **Diagnostic guard** (`diagnostic.ts`):
   ```typescript
   if (process.env.NODE_ENV !== "development") {
       throw new Error("diagnostic.getBotFlow is disabled outside development");
   }
   ```

4. **Graceful degradation:**
   - `notifications.unreadCount` — Returns `999` sentinel instead of exact count when >50
   - `dashboard.getHomeStats` — Returns `avgWaitTimeTodayMs: null` when no data
   - `knowledge.searchSimilarChunks` — Returns `[]` on any error (API key missing, API failure, empty results)

5. **No try/catch in queries** — Convex handles error propagation; queries either succeed or throw. Error handling is done via early returns (null/[]) or explicit throws.

6. **Action-level error handling** (not queries, but related):
   - `knowledge.indexSource` — try/catch around URL/file processing with status updates
   - `knowledge.searchSimilarChunks` — try/catch around OpenRouter API calls
   - `tags.extractGenerativeTags` — try/catch around AI calls with console.error logging

## 🔍 Key Patterns to Identify

### Query Naming Conventions
- **`list`** — List items for a project (universal pattern)
- **`get`** — Get single entity by ID
- **`getBy<X>`** — Get by specific field (getByOrgId, getByUserId, findByConversation)
- **`list<X>Paginated`** — Paginated variant of list (listOrdersPaginated, listSourcesPaginated)
- **`_paginate<X>`** — Internal pagination helper (analytics internal queries, underscore-prefixed)
- **`get<X>Summary`** — Aggregated data (getTagsSummary, getProjectUsageSummary)
- **`get<X>Internal`** — Server-side only variant (getInternal, getByOrgIdInternal, getPublic)
- **`list<X>Internal`** — Server-side list (listUnassignedInternal, listStaleUnassignedInternal)
- **`create<X>`, `update<X>`, `remove<X>`** — Mutation naming (consistent across files)

### Parameter Patterns and Validation
- **`v.id("<table>")`** — Strongly typed Convex ID validation
- **`v.optional(v.<type>)`** — Optional parameters
- **`paginationOptsValidator`** — Standard Convex pagination
- **`v.union(v.literal(...))`** — Enum-like validation (order status, notification types)
- **`v.any()`** — Used for flexible fields like `credentials`, `metadata`, `widgetConfig`

### Data Fetching Strategies
1. **Index-first approach** — Always `.withIndex()` before `.filter()` or `.take()`
2. **Bounded reads** — `.take(N)` everywhere, `.collect()` only for analytics and small tables
3. **Action-level pagination** — For full-table scans, use action with `ctx.runQuery()` in loops
4. **Scheduled deferred updates** — `ctx.scheduler.runAfter(0, ...)` to avoid OCC conflicts
5. **Batched deletions** — Recursive 100-item batches with scheduler re-scheduling

### Real-time vs One-time Queries
- All `query()` exports are real-time when called via `useQuery()` on frontend
- `internalQuery` exports are server-side only (not reactive from client)
- `action` functions are one-time executions (not reactive)
- Dashboard and notification queries are designed for real-time UI updates

### Authorization Patterns
- **Query layer:** Identity check → return null/[] (silent)
- **Mutation layer:** Identity check + `requireAdmin()` → throw (loud)
- **Project ownership:** `checkProjectOwnership()` or `assertProjectOwnership()` from `utils.ts`
- **Organization scoping:** Direct `orgId` comparison on project records

## ⚠️ Potential Concerns

### HIGH Severity

1. **N+1 in `dashboard.getHomeStats`** — Serial loop of 20 message queries (dashboard.ts:~105-115). Should use batched fetch with `ctx.db.query().withIndex("by_projectId").filter().collect()` or pagination.
   - **Impact:** Up to 20 sequential DB reads on every dashboard load
   - **Fix:** Single batch query or pre-computed wait times

2. **`.collect()` in `analytics.getProjectUsageSummary`** — Four separate `.collect()` calls on conversations, bots, knowledgeBases, and project_usage. No bounds on conversations collection.
   - **Impact:** Unbounded read on conversations table (could be thousands of records)
   - **Fix:** Use `.take(N)` with generous limit or paginated count

3. **Inconsistent authorization in queries** — Some queries `return null`, some `return []`, some `throw Error`, some silently pass. `labels.listLabels` throws but `contacts.list` returns `[]`.
   - **Impact:** Frontend must handle both null and empty array returns inconsistently
   - **Fix:** Standardize on one pattern (return null for single-entity, return [] for lists)

### MEDIUM Severity

4. **`.take(500)` without pagination in `contacts.list`** — Has TODO comment. Will break at scale.
   - **Impact:** 500 contacts returned at once; frontend may lag
   - **Fix:** Implement paginated variant

5. **`.take(200)` in `labels.listLabels`** — Has TODO comment. Same issue.
   - **Impact:** 200 labels returned; unlikely to hit limit but inconsistent
   - **Fix:** Implement paginated variant

6. **`.take(250)` for conversations in `dashboard.getHomeStats`** — Only fetches unassigned (status 100) + assigned (status 200), but then filters in memory. If org has 500+ active conversations, data is silently truncated.
   - **Impact:** Dashboard shows incomplete data for high-volume orgs
   - **Fix:** Paginated variant or pre-computed counters

7. **Missing authorization on some `get` queries** — `conversations.get` returns `ctx.db.get(args.id)` after only checking identity, not project ownership. Any authenticated user could theoretically fetch any conversation by ID if they guess it.
   - **Impact:** Potential data leak across organizations
   - **Fix:** Add `checkProjectOwnership` to `conversations.get`

8. **`analytics` action pattern uses many `ctx.runQuery()` calls** — Each paginated stats query involves 1+N RPC calls within Convex (action → runQuery → runQuery → ...). While efficient within Convex, this creates tight coupling between action and internal query functions.
   - **Impact:** Tight coupling, harder to refactor
   - **Fix:** Acceptable within Convex architecture, but document the pattern

### LOW Severity

9. **`diagnostic.ts` global `.collect()` on bot_flows** — Comment notes "will OOM on real data." Protected by NODE_ENV check.
   - **Impact:** None in production (guarded)
   - **Note:** Consider removing or limiting to first N records even in development

10. **`settings.getMyDepartments` fetches all departments then filters in memory** — `.take(100)` then `.filter(d => d.memberIds?.includes(userId))`.
    - **Impact:** Minor inefficiency; 100 records is small
    - **Fix:** Could use `.filter()` at query level if Convex supports array containment

11. **Hardcoded limits scattered throughout** — 500, 250, 200, 100, 50, 30, 20, 10, 5 — no central configuration.
    - **Impact:** Hard to tune limits globally
    - **Fix:** Extract to constants file (e.g., `constants.ts` with `MAX_CONTACTS_PER_PAGE = 500`)

12. **`labels.ts` is only 18 lines** — Only has `listLabels` query. All label CRUD mutations live in `settings.ts` (see TODO comment in settings.ts: "TODO: move createLabel and removeLabel to convex/labels.ts for consistency").
    - **Impact:** Code organization inconsistency
    - **Fix:** Consolidate label logic into `labels.ts`
