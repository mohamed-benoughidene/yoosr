# Part 06: Mutations (Write Operations) - Findings

## 📊 Visual Map

```
convex/ (Mutation Files) — 30 files, ~181 total Convex functions
├── contacts.ts            → 6 functions (2 queries, 4 mutations)
├── conversations.ts       → 28 functions (8 queries, 12 mutations, 3 internalQueries, 3 internalMutations, 2 internalActions)
├── messages.ts            → 9 functions (4 queries, 3 mutations, 1 internalQuery, 1 internalMutation)
├── projects.ts            → 11 functions (4 queries, 4 mutations, 1 internalQuery, 2 internalMutations)
├── bots.ts                → 6 functions (2 queries, 3 mutations, 1 internalMutation)
├── botFlows.ts            → 2 functions (1 query, 1 mutation)
├── bot.ts                 → 12 functions (5 internalQueries, 5 internalMutations, 2 internalActions) — BOT ENGINE
├── profiles.ts            → 10 functions (3 queries, 5 mutations, 2 internalMutations)
├── settings.ts            → 18 functions (4 queries, 14 mutations) — departments, canned, labels, hours
├── knowledgeBases.ts      → 10 functions (4 queries, 4 mutations, 1 action, 1 internalMutation)
├── notifications.ts       → 7 functions (2 queries, 4 mutations, 1 internalMutation)
├── activityLogs.ts        → 4 functions (2 queries, 1 mutation, 1 internalMutation)
├── feedback.ts            → 1 function (1 mutation)
├── tags.ts                → 5 functions (1 query, 2 mutations, 1 internalQuery, 1 internalMutation, 1 internalAction)
├── labels.ts              → 1 function (1 query)
├── integrations.ts        → 20 functions (7 queries, 3 mutations, 5 internalQueries, 3 internalMutations, 2 actions)
├── knowledge.ts           → 6 functions (2 internalQueries, 3 internalMutations, 1 internalAction)
├── orders.ts              → 6 functions (3 queries, 3 mutations)
├── routing.ts             → 3 functions (1 internalMutation, 1 internalMutation, 1 internalAction)
├── webhooks.ts            → 10 functions (1 query, 4 mutations, 2 internalQueries, 1 internalMutation, 2 internalActions)
├── pushActions.ts         → 2 functions (2 internalActions)
├── pushMutations.ts       → 5 functions (1 query, 1 mutation, 2 internalQueries, 2 internalMutations)
├── analytics.ts           → 18 functions (6 queries, 1 mutation, 4 internalQueries, 4 actions, 3 internalMutations)
├── dashboard.ts           → 1 function (1 query)
├── migrations.ts          → 1 function (1 internalMutation) — DISABLED (throws to prevent re-execution)
├── seed.ts                → 1 function (1 internalMutation)
├── wipe.ts                → 1 function (1 internalMutation) — wipes 18 tables
├── utils.ts               → 0 Convex functions (auth helper utilities)
├── errors.ts              → 0 Convex functions (error factory functions)
├── types.ts               → 0 Convex functions (ClerkIdentity type definition)
├── openrouter_api.ts      → 5 functions (2 queries, 2 mutations, 1 action)
├── openrouter.ts          → 0 Convex functions (SDK wrapper utilities)
├── aiFlowBuilder.ts       → 1 function (1 action)
├── getAny.ts              → 1 function (1 internalQuery)
├── http.ts                → 0 Convex functions (HTTP router — see Part 08)
├── crons.ts               → 0 Convex functions (cron definitions — see Part 08)
├── convex.config.ts       → 0 Convex functions (app configuration)
├── schema.ts              → 0 Convex functions (schema definitions — see Part 04)
└── diagnostic.ts          → (not analyzed — diagnostic/debug functions)

MUTATION SUMMARY BY TYPE:
  Public mutations:        ~55
  Internal mutations:      ~25
  Actions (external HTTP): ~10
  Internal actions:        ~6
  Queries (read):          ~55
  Internal queries:        ~30
  TOTAL:                   ~181 Convex functions
```

## 📁 File Inventory

| File | Purpose | Mutations |
|------|---------|-----------|
| `convex/contacts.ts` | Contact CRUD with dedup validation | 4 mutations |
| `convex/conversations.ts` | Conversation lifecycle (create, update, resolve, join, leave, transfer, auto-close, Meta/Telegram integration) | 12 mutations + 3 internalMutations |
| `convex/messages.ts` | Message sending (authenticated + widget), widget file upload | 3 mutations + 1 internalMutation |
| `convex/projects.ts` | Project CRUD, ensure, deletion with cascading scheduler, widget locale | 4 mutations + 2 internalMutations |
| `convex/bots.ts` | Bot CRUD with cascading flow deletion | 3 mutations + 1 internalMutation |
| `convex/botFlows.ts` | Bot flow save/compile to execution nodes | 1 mutation |
| `convex/bot.ts` | Bot engine: execute, state management, human handoff | 5 internalMutations + 2 internalActions |
| `convex/profiles.ts` | Profile sync from Clerk, availability, presence heartbeat | 5 mutations + 2 internalMutations |
| `convex/settings.ts` | Departments, canned responses, labels, operating hours CRUD | 14 mutations |
| `convex/knowledgeBases.ts` | KB CRUD, source management, file upload URL generation | 4 mutations + 1 internalMutation |
| `convex/notifications.ts` | Notification CRUD, mark as read, cleanup | 4 mutations + 1 internalMutation |
| `convex/activityLogs.ts` | Activity logging (public-ish) | 1 mutation + 1 internalMutation |
| `convex/feedback.ts` | Feedback submission | 1 mutation |
| `convex/tags.ts` | Tag assignment/removal, generative AI tag extraction | 2 mutations + 1 internalMutation |
| `convex/labels.ts` | Label listing (queries only, mutations in settings.ts) | 0 mutations |
| `convex/integrations.ts` | Integration CRUD, channel setup (WhatsApp, Messenger, Instagram, Telegram), key encryption | 3 mutations + 3 internalMutations + 2 actions |
| `convex/knowledge.ts` | Knowledge chunk indexing, vector search (all internal) | 3 internalMutations + 1 internalAction |
| `convex/orders.ts` | Order CRUD, batch import | 3 mutations |
| `convex/routing.ts` | Conversation routing (bot-first, least-busy human, department pooling) | 2 internalMutations + 1 internalAction |
| `convex/webhooks.ts` | Webhook subscription CRUD, delivery with retries, HMAC signing | 4 mutations + 1 internalMutation + 2 internalActions |
| `convex/pushActions.ts` | Web push notification sending | 2 internalActions |
| `convex/pushMutations.ts` | Push subscription management | 1 mutation + 2 internalMutations |
| `convex/analytics.ts` | Stats aggregation, CSAT, token usage logging | 1 mutation + 3 internalMutations |
| `convex/migrations.ts` | Disabled migration (migrateStatuses) | 1 internalMutation (disabled) |
| `convex/seed.ts` | Demo data seeding | 1 internalMutation |
| `convex/wipe.ts` | Full data wipe across 18 tables | 1 internalMutation |
| `convex/openrouter_api.ts` | OpenRouter API key management | 2 mutations |
| `convex/aiFlowBuilder.ts` | AI-powered flow generation | 0 mutations (1 action) |

## ✅ Analysis Checklist

### [x] What mutation functions exist in each file?
See the File Inventory table above and the Visual Map. Total: ~55 public mutations, ~25 internal mutations, ~6 internal actions across 30 files. The heaviest files are `conversations.ts` (15 write functions), `settings.ts` (14 mutations), `integrations.ts` (8 write functions), and `bot.ts` (7 write functions).

### [x] What validation is performed before writes?
Validation is multi-layered:

1. **Convex schema-level validation**: All mutation args use `v.string()`, `v.number()`, `v.optional()`, `v.union()`, `v.array()` validators — enforced by Convex runtime.

2. **Dedup checks via unique indexes**:
   - `contacts.ts`: `by_projectId_email` and `by_projectId_phone` indexes prevent duplicate contacts. On create: `if (existingContact) throw userError("A contact with this email already exists")`.
   - `conversations.ts`: `channelMessageId` dedup for Meta/Telegram messages.

3. **Existence checks**: `notFoundError()` thrown when referenced resource doesn't exist (e.g., `projects.ts:update` throws if project not found).

4. **Union/enum validation**: Status codes are validated (e.g., `updateConversationStatus` accepts 100/200/1000), order status uses union type.

5. **Array bounds**: `contacts.ts:batchImport` validates array length 1-500. `orders.ts:batchImport` same pattern.

6. **Rating clamping**: CSAT ratings clamped to 1-5 in `analytics.ts:submitCSATInternal` and `conversations.ts:rate`.

7. **Resource protection**: `contacts.ts:remove` blocks deletion if contact is linked to a non-resolved conversation (`status !== 1000`). `settings.ts:removeDepartment` blocks deleting the default department.

8. **Filtered updates**: `projects.ts:update` filters out `undefined` values to avoid overwriting with nulls.

### [x] Are mutations transactional?
**Convex guarantees single-mutation atomicity** — each mutation runs in its own transaction. For multi-step operations, the codebase uses several strategies:

1. **Scheduler-based batch processing**: Cascading deletes (`projects.ts:deleteProjectData`, `bots.ts:_deleteBotFlowsBatch`, `knowledgeBases.ts:deleteSourcesBatch`) use the Convex scheduler to process in batches of 100, re-enqueuing if more remains. This is NOT transactional across batches but IS bounded to avoid timeouts.

2. **Internal mutation chaining**: Operations like `conversations.ts:createFromWidget` do multiple writes (create conversation, sync to contacts, send welcome message, trigger routing, fire webhook) — all within a single `internalMutation` transaction.

3. **Upsert patterns**: Many mutations use upsert (`ctx.db.query(...).first()` then `replace` or `insert`) — e.g., `profiles.ts:updateMe`, `integrations.ts:upsert`, `settings.ts:upsertOperatingHours`.

### [x] How are authorization checks handled?
Six-tier authorization model:

1. **No auth (public)**: Widget endpoints (`http.ts`), `activityLogs.ts:log`, `analytics.ts:submitCSAT` — no identity check, rate-limited instead.

2. **Identity optional**: `activityLogs.ts:log` — `getUserIdentity()` returns null if unauthenticated, still logs.

3. **Auth required (early return)**: Most queries return `[]` or `null` if no identity — e.g., `contacts.ts:list`, `profiles.ts:getMe`.

4. **Auth required (throw)**: Mutations throw `authError()` if `getUserIdentity()` returns null — e.g., `messages.ts:send`, `projects.ts:create`.

5. **Admin-only**: `requireAdmin(identity)` checks `org_role === "org:admin"`, throws `ConvexError("Unauthorized: admin access required")` — used in `bots.ts:create/update/remove`, `settings.ts` department/label/canned CRUD, `integrations.ts:upsert/remove`, `webhooks.ts:create/update/remove`, `orders.ts:createOrder/updateOrderStatus/deleteOrder`.

6. **Project ownership**: `assertProjectOwnership(ctx, projectId, identity)` throws `ConvexError("Unauthorized")` if `project.orgId !== identity.org_id`. Used in `contacts.ts:create/update`, `messages.ts:send`, `knowledgeBases.ts:create/addSource/removeSource`, `tags.ts:assignTagToConversation/removeTagFromConversation`.

7. **Org-scoped forbidden**: `forbiddenError()` used for explicit org mismatch after auth — e.g., `orders.ts:listOrders`, `analytics.ts:getProjectUsageSummary`.

### [x] Is there input sanitization?
Limited but present:

1. **HTML stripping**: `knowledgeBases.ts:addSource` strips HTML from URL-based sources before indexing.

2. **Undefined filtering**: `projects.ts:update` and `conversations.ts:updateVisitorInfo` filter out `undefined` values before patching.

3. **Conversation data filtering**: `http.ts:/widget/conversations/get` explicitly strips sensitive fields, returning only `_id`, `status`, `rating`, `projectId`.

4. **No explicit XSS/SQL injection sanitization observed**: The codebase relies on Convex's type-safe API and parameterized queries for injection prevention. Convex's `ctx.db` API does not use string concatenation for queries.

5. **No email/phone normalization**: Contacts store email/phone as-is without normalization (lowercase email, formatted phone).

### [x] What side effects do mutations trigger?
Extensive side-effect chains:

1. **Notifications**: `conversations.ts:update` fires `pushActions.sendPushToAgent` for new messages. `conversations.ts:resolve`, `conversations.ts:join`, `conversations.ts:leave` fire notifications. `routing.ts:routeConversation` notifies all agents if no match found.

2. **Activity logging**: `bots.ts:create/update/remove`, `settings.ts` department/label/canned CRUD all call `activityLogs.logActivityInternal`.

3. **Webhooks**: `conversations.ts:update` fires `webhooks.fireWebhookEvent` for conversation.status_changed. `messages.ts:send` fires webhook for new_message. `conversations.ts:resolve` fires conversation.resolved.

4. **Contact sync**: `conversations.ts:createFromWidget` syncs visitor info to contacts.

5. **Routing triggers**: `conversations.ts:createFromWidget`, `conversations.ts:transferToDepartment`, `messages.ts:sendFromWidget` all call `routing.routeConversation`.

6. **Bot engine**: `messages.ts:sendFromWidget` triggers `bot.executeNextBlock` if a bot is assigned to the conversation.

7. **Tag extraction**: `conversations.ts:resolve` triggers `tags.extractGenerativeTags` (AI-powered tagging).

8. **Meta/Telegram relay**: `conversations.ts:relayToMeta` schedules `sendMetaMessage` action. `bot.ts:createBotMessage` relays to Meta/Telegram channels.

9. **CSAT sync**: `analytics.ts:submitCSATInternal` clamps rating AND syncs `conversation.rating` field.

10. **Profile sync**: `profiles.ts:ensureCurrent` syncs email/name/avatar/org from Clerk on each dashboard load.

### [x] Are there optimistic concurrency control patterns?
**Yes, two notable OCC patterns:**

1. **Dedicated `conversation_bot_state` table** (`bot.ts`): Bot execution state is stored in a separate `conversation_bot_state` table, NOT on the `conversations` table. This prevents OCC conflicts between bot state updates and message/conversation updates happening concurrently. `bot.ts:getConversationState` reads from this dedicated table.

2. **Deferred metadata updates** (`messages.ts:sendFromWidget`): Instead of updating conversation metadata directly (which could conflict with other writes), `sendFromWidget` schedules `updateMetadataInternal` via the Convex scheduler. The `updateMetadataInternal` mutation (`conversations.ts`) only sets `status=100` if it's already 100, designed to avoid OCC conflicts.

3. **Internal mutations for scheduler tasks**: Many scheduler-targeted mutations are `internalMutation` to prevent client-side OCC conflicts — e.g., `conversations.ts:updateMetadataInternal`, `conversations.ts:autoCloseInactive`.

### [x] How are errors handled and reported?
**Typed ConvexError strategy** (`convex/errors.ts`):
- `userError(message)` → `ConvexError(message)` — user-facing validation errors
- `authError()` → `ConvexError("Unauthorized")` — unauthenticated
- `notFoundError(resource)` → `ConvexError("{resource} not found")` — resource not found (often doubles as auth guard)
- `forbiddenError()` → `ConvexError("Forbidden")` — authenticated but unauthorized

**Patterns observed:**
- Errors are thrown (not returned) from mutations, relying on Convex's error propagation to the client.
- Actions that make external HTTP calls (e.g., `openrouter_api.ts:testOpenRouterKey`, `integrations.ts:registerTelegramWebhook`) catch errors and return structured `{ ok: false, error: message }` instead of throwing — preventing unhandled promise rejections.
- Webhook handlers (`http.ts`) wrap everything in `try/catch` and always return 200 (per Meta/Telegram requirements to stop retries), logging errors via `console.error`.
- **Bug found**: `webhooks.ts` lines 214-216 has dead code — `requireAdmin()` is called before a null check on identity, making the null check unreachable since `requireAdmin` already throws if identity is null.

### [x] Is there rate limiting on mutations?
**Yes, but only on public/widget endpoints:**

1. **`@convex-dev/rate-limiter`** configured in `convex.config.ts` and used in `http.ts`:
   - `createConversation`: Fixed window, 5 requests per 60 seconds, keyed by `visitorId ?? projectId`.
   - `sendMessage`: Token bucket, 20 requests per 60 seconds, capacity of 5, keyed by `visitorId ?? conversationId`.
   - Rate limiter uses `{ throws: false }` to return `{ ok: false }` for custom 429 responses.

2. **No rate limiting on authenticated mutations**: All dashboard mutations (bot CRUD, settings, contacts, etc.) have NO rate limiting — they rely on auth-based access control instead.

3. **No rate limiting on AI calls**: `openrouter.ts` and `aiFlowBuilder.ts` make unbounded LLM calls — relies on OpenRouter's own rate limits.

### [x] Are mutations idempotent? (safe to retry)
**Mixed:**

1. **Upsert patterns are idempotent**: `profiles.ts:upsertFromClerk`, `integrations.ts:upsert`, `settings.ts:upsertOperatingHours`, `pushMutations.ts:savePushSubscription` — safe to retry.

2. **Create mutations are NOT idempotent**: `contacts.ts:create`, `conversations.ts:create`, `messages.ts:send`, `projects.ts:create` — retrying creates duplicates (though contacts have dedup checks that prevent email/phone duplicates).

3. **Dedup-based creates are semi-idempotent**: `contacts.ts:create` throws on duplicate email/phone, so retrying the same data is safe (returns error). `conversations.ts:createOrUpdateFromMeta` dedups by `channelMessageId`, making it idempotent for the same message.

4. **Counter/increment mutations are NOT idempotent**: `analytics.ts:logTokenUsage` (upsert with count increment), `analytics.ts:logUnansweredQuery` — retrying inflates counts.

5. **No explicit idempotency keys** observed on non-upsert mutations.

### [x] What's the rollback strategy for failed mutations?
**Convex auto-rollback**: All Convex mutations are transactional — if a mutation throws, all database writes within that transaction are automatically rolled back by Convex.

**No manual rollback strategy** observed for multi-step operations. The scheduler-based batch deletions (`projects.ts:deleteProjectData`, `bots.ts:_deleteBotFlowsBatch`) don't have rollback — if a batch fails mid-process, partial deletion has occurred. This is a concern for data integrity.

### [x] Are there audit logs for mutations?
**Yes, partial audit logging via `activityLogs.ts`:**

1. `activityLogs.log` (public mutation) and `activityLogs.logActivityInternal` (internal mutation) log events to the `activity_logs` table.

2. **Logged mutations** (call `logActivityInternal`):
   - `bots.ts:create`, `bots.ts:update`, `bots.ts:remove`
   - `settings.ts:createDepartment`, `settings.ts:updateDepartment`, `settings.ts:removeDepartment`
   - `settings.ts:createCannedResponse`, `settings.ts:updateCannedResponse`, `settings.ts:removeCannedResponse`
   - `settings.ts:createLabel`, `settings.ts:updateLabel`, `settings.ts:removeLabel`
   - `settings.ts:upsertOperatingHours`
   - `tags.ts:assignTagToConversation`, `tags.ts:removeTagFromConversation`

3. **NOT logged**: Contact CRUD, conversation CRUD, message sending, project CRUD, order CRUD, integration CRUD, webhook CRUD, push subscription management. Significant gap for sensitive operations.

4. The `activity_logs` table stores `userId`, `action`, `resource`, `resourceId`, `metadata`, `createdAt`.

### [x] How are batch operations handled?
**Three batch patterns:**

1. **Scheduler-based batching with re-enqueue**: Used for cascading deletes (`projects.ts:deleteProjectData` across 20 tables, `bots.ts:_deleteBotFlowsBatch`, `knowledgeBases.ts:deleteSourcesBatch`). Processes 100 records per batch, re-schedules if more remain. Also used for `conversations.ts:autoCloseInactive` (re-enqueues if `.take(100)` returns full batch).

2. **Bounded batch reads**: `.take(N)` limits on non-paginated queries (50-2000). Sentinel values ("1000+", "100+", "50+") when limits are exceeded.

3. **Client-side batch arrays**: `contacts.ts:batchImport` and `orders.ts:batchImportOrders` accept arrays of 1-500 items, iterate and skip invalid/duplicate entries.

4. **Notification cap**: `notifications.ts:createNotification` caps at 50 per recipient, deleting oldest when exceeded.

5. **Bot step limit**: `bot.ts:executeNextBlock` has a hard limit of 50 steps per conversation with infinite loop guard.

6. **KB chunk cap**: `knowledge.ts:indexSource` caps at 200 chunks, processes in batches of 20 for embedding.

### [x] What happens with cascading deletes?
**Explicit cascading delete patterns:**

1. **Project deletion** (`projects.ts:deleteProjectData`): Most comprehensive — deletes across 20 tables in order: conversations, messages, contacts, bots, bot_flows, knowledge_base_sources, knowledge_base_chunks, notifications, activity_logs, webhook_subscriptions, push_subscriptions, orders, labels, tags, conversation_tags, departments (members first), profiles, projects. Uses scheduler batching (100/table, re-enqueues).

2. **Bot deletion** (`bots.ts:remove`): Sets bot `status="deleting"`, schedules `_deleteBotFlowsBatch` which deletes all flows (100/batch) then the bot. Logs activity.

3. **Knowledge Base deletion** (`knowledgeBases.ts:remove`): Sets KB `status="deleting"`, schedules `deleteSourcesBatch` which deletes sources (100/batch) then the KB.

4. **Label deletion** (`settings.ts:removeLabel`): Cascades tag removal from ALL conversations using the label — bounded to `.take(500)` conversation_tags. This is a potential performance concern for large datasets.

5. **Contact deletion protection** (`contacts.ts:remove`): Blocks deletion if contact is linked to non-resolved conversations (`status !== 1000`). Returns `userError`.

6. **Department deletion protection** (`settings.ts:removeDepartment`): Blocks deletion of the default department. Returns `userError`.

7. **Organization deletion** (via Clerk webhook `http.ts`): `organization.deleted` event removes the associated project via `internal.projects.remove`.

**Concern**: Department member removal (`settings.ts:removeMemberFromDepartment`) does NOT cascade — orphaned member references may persist.

## 📝 Agent Findings

### Mutation Architecture
The codebase has a well-organized mutation layer with clear separation between public mutations (auth-required), internal mutations (Convex-only callable), and actions (external HTTP calls). The use of `internalMutation` for scheduler jobs and engine logic is correct Convex practice.

### Function Count by Domain
- **Conversation management**: 28 functions (largest domain)
- **Integrations**: 20 functions
- **Settings**: 18 functions (departments + canned responses + labels + hours)
- **Analytics**: 18 functions (+ 7 internal helpers)
- **Bot engine**: 12 functions (all internal)
- **Projects**: 11 functions
- **Profiles**: 10 functions
- **Knowledge Bases**: 10 functions
- **Webhooks**: 10 functions
- **Notifications**: 7 functions

### Authorization Utility Functions
`convex/utils.ts` provides three core auth helpers used across ~40+ mutation/query call sites:
- `requireAdmin(identity)` — checks `org_role === "org:admin"`
- `assertProjectOwnership(ctx, projectId, identity)` — throws on org mismatch
- `checkProjectOwnership(ctx, projectId, identity)` — returns null on org mismatch

### Error Handling Factory
`convex/errors.ts` provides four typed error factories: `userError()`, `authError()`, `notFoundError()`, `forbiddenError()` — all returning `ConvexError` with consistent messages.

## 🔍 Key Patterns to Identify

### Mutation Naming Conventions
- CRUD standard: `list`, `get`, `create`, `update`, `remove` (not `delete`)
- Internal variants: `*Internal` suffix (e.g., `upsertFromClerk`, `logActivityInternal`)
- Action verbs: `send`, `resolve`, `join`, `leave`, `transferToDepartment`, `markAsRead`
- Batch operations: `batchImport`, `*Batch` suffix for scheduler functions

### Validation Patterns
- Convex `v.*` validators on all mutation args
- Unique index dedup checks before insert
- Existence checks with `notFoundError()` before updates
- Array bounds validation for batch operations
- Union/enum validation for status fields

### Authorization Patterns
- Six-tier: public → optional auth → required auth → admin → project ownership → org-scoped forbidden
- Consistent use of `ClerkIdentity` type with `subject`, `org_id`, `org_role`
- `requireAdmin()` for all admin-only operations
- `assertProjectOwnership()` for project-scoped mutations

### Error Handling Strategies
- Typed `ConvexError` via factory functions
- Actions return `{ ok: false, error }` for external call failures
- Webhook handlers always return 200 with error logging

### Side Effect Management
- Notifications, webhooks, activity logs, routing, bot engine triggers
- Internal mutations used for side-effect chains within transactions
- Scheduler used for deferred side effects (auto-close, cleanup, retry)

### Audit Logging Approach
- `activityLogs.logActivityInternal` called from settings/bots/tags mutations
- Partial coverage — many mutation domains lack audit logging

## ⚠️ Potential Concerns

| # | Concern | Severity | Details |
|---|---------|----------|---------|
| 1 | **Dead code in webhooks.ts** | MEDIUM | Lines 214-216: `requireAdmin()` called before null check, making null check unreachable. Should reorder or remove dead code. |
| 2 | **Incomplete audit logging** | MEDIUM | Contact CRUD, conversation CRUD, message sending, project CRUD, integration CRUD, webhook CRUD are NOT logged. Sensitive operations should all have audit trails. |
| 3 | **No rate limiting on authenticated mutations** | LOW | All dashboard mutations are unbounded. While auth-gated, a compromised admin account could abuse mutations without rate limits. |
| 4 | **Non-idempotent create mutations** | LOW | Retrying `contacts:create`, `messages:send`, etc. creates duplicates (contacts have dedup, messages don't). Consider idempotency keys for critical paths. |
| 5 | **Partial rollback for cascading deletes** | MEDIUM | Scheduler-based batch deletes (`deleteProjectData`) are NOT transactional across batches. If a batch fails mid-process, partial data loss occurs with no rollback. |
| 6 | **Label deletion scans 500 conversations** | LOW | `settings.ts:removeLabel` cascades tag removal across up to 500 conversation_tags. For large datasets, this could be slow or hit Convex limits. |
| 7 | **No input normalization** | LOW | Emails not lowercased, phone numbers not formatted. Could cause dedup inconsistencies. |
| 8 | **Counter mutations not idempotent** | LOW | `logTokenUsage`, `logUnansweredQuery` increment counters — retrying inflates values. |
| 9 | **Widget endpoints fully public** | MEDIUM | `http.ts` widget endpoints have no auth, only rate limiting. Anyone with a projectId can create conversations and send messages. This is by design but worth noting. |
| 10 | **Bot infinite loop guard at 50 steps** | LOW | The 50-step limit in `bot.ts:executeNextBlock` is arbitrary. Complex flows could hit this limit. No configurable threshold. |
