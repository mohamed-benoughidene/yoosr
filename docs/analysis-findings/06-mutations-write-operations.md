# Part 06: Mutations (Write Operations)

## 📊 Visual Map

```
convex/ (26 Mutation Files Found)
│
├── Core CRUD Mutations
│   ├── contacts.ts            → Contact CRUD (create, update, remove, batchImport)
│   ├── conversations.ts       → Conversation lifecycle (17 mutations, complex state machine)
│   ├── messages.ts            → Message send pipeline (4 mutations)
│   ├── projects.ts            → Project lifecycle (7 mutations incl. cascading delete)
│   └── orders.ts              → Order CRUD + batch import (4 mutations)
│
├── Bot/AI Mutations
│   ├── bot.ts                 → Internal bot state (3 internal mutations)
│   ├── botFlows.ts            → Bot flow visual editor save (1 mutation)
│   └── bots.ts                → Bot CRUD + batch deletion (4 mutations)
│
├── User/Profile Mutations
│   ├── profiles.ts            → Profile management (8 mutations, presence tracking)
│   └── feedback.ts            → Feedback submission (1 mutation)
│
├── Settings/Configuration
│   ├── settings.ts            → Departments, canned responses, labels, hours (12 mutations)
│   ├── knowledgeBases.ts      → KB CRUD + source management (6 mutations)
│   ├── knowledge.ts           → Internal chunk/source status (2 internal)
│   ├── integrations.ts        → Integration upsert/remove (5 mutations)
│   ├── webhooks.ts            → Webhook subscription management (5 mutations)
│   └── routing.ts             → Internal conversation routing (2 internal)
│
├── Messaging/Communication
│   ├── notifications.ts       → Notification lifecycle (5 mutations)
│   ├── tags.ts                → Tag assignment/removal (3 mutations)
│   ├── labels.ts              → NO MUTATIONS (query-only file)
│   ├── pushActions.ts         → NO MUTATIONS (action-only file)
│   └── pushMutations.ts       → Push subscription management (3 mutations)
│
├── Utility/Ops
│   ├── activityLogs.ts        → Activity log append (2 mutations)
│   ├── migrations.ts          → DISABLED migration (1 mutation, permanently blocked)
│   ├── seed.ts                → Demo data seeding (1 mutation, NO AUTH)
│   ├── wipe.ts                → Full data wipe (1 mutation, NO AUTH)
│   └── utils.ts               → NO MUTATIONS (helper functions only)
│
└── External/Channel
    ├── analytics.ts           → (not analyzed - may contain mutations)
    └── dashboard.ts           → (not analyzed - may contain mutations)
```

## 📁 File Inventory

| File | Purpose | Mutations | Internal Mutations |
|------|---------|-----------|-------------------|
| `convex/contacts.ts` | Contact CRUD + batch import | 3 | 0 |
| `convex/conversations.ts` | Conversation lifecycle management | 10 | 7 |
| `convex/messages.ts` | Message sending pipeline | 2 | 2 |
| `convex/projects.ts` | Project CRUD + cascading delete | 5 | 2 |
| `convex/bot.ts` | Bot execution state management | 0 | 3 |
| `convex/botFlows.ts` | Bot flow visual editor | 1 | 0 |
| `convex/bots.ts` | Bot entity CRUD | 2 | 1 |
| `convex/profiles.ts` | Profile management + presence | 4 | 4 |
| `convex/settings.ts` | Departments, canned responses, labels, hours | 12 | 0 |
| `convex/knowledgeBases.ts` | Knowledge base CRUD + sources | 5 | 1 |
| `convex/knowledge.ts` | Internal knowledge chunk operations | 0 | 2 |
| `convex/notifications.ts` | Notification lifecycle | 3 | 2 |
| `convex/activityLogs.ts` | Activity log append-only | 1 | 1 |
| `convex/feedback.ts` | User feedback submission | 1 | 0 |
| `convex/tags.ts` | Tag assignment to conversations | 2 | 1 |
| `convex/labels.ts` | **NO MUTATIONS** (query-only) | 0 | 0 |
| `convex/integrations.ts` | Channel integration management | 2 | 3 |
| `convex/orders.ts` | Order management | 4 | 0 |
| `convex/routing.ts` | Conversation routing logic | 0 | 2 |
| `convex/webhooks.ts` | Webhook subscription management | 4 | 1 |
| `convex/pushActions.ts` | **NO MUTATIONS** (actions only) | 0 | 0 |
| `convex/pushMutations.ts` | Push notification subscriptions | 1 | 2 |
| `convex/migrations.ts` | Database migrations (DISABLED) | 0 | 1 |
| `convex/seed.ts` | Development seed data | 1 | 0 |
| `convex/wipe.ts` | Full data reset | 1 | 0 |
| `convex/utils.ts` | **NO MUTATIONS** (helper functions only) | 0 | 0 |

**Totals:** ~64 public mutations, ~33 internal mutations across 22 files with mutation content

## ✅ Analysis Checklist

### What mutation functions exist in each file?

**[x] Answered in File Inventory above.** The codebase contains 26 TypeScript files in `convex/`, of which 22 contain mutation functions. Total: ~64 public mutations + ~33 internal mutations = ~97 mutation functions.

Breakdown by category:
- **Core CRUD:** contacts (4), conversations (17), messages (4), projects (7), orders (4)
- **Bot/AI:** bot (3 internal), botFlows (1), bots (4)
- **User/Profile:** profiles (8), feedback (1)
- **Settings/Config:** settings (12), knowledgeBases (6), knowledge (2 internal), integrations (5), webhooks (5), routing (2 internal)
- **Messaging:** notifications (5), tags (3), pushMutations (3)
- **Utility/Ops:** activityLogs (2), migrations (1 disabled), seed (1), wipe (1)

Notable: `labels.ts`, `pushActions.ts`, and `utils.ts` contain zero mutations.

### What validation is performed before writes?

**[x]** Validation occurs at multiple levels:

1. **Schema-level validation (Convex built-in):** All mutations use `v.string()`, `v.id()`, `v.optional()`, `v.number()`, `v.union()` etc. in their argument validators. This is enforced by the Convex runtime automatically.

2. **Bounds checking:**
   - `contacts.batchImport`: rejects if `args.contacts.length === 0 || args.contacts.length > 500` (throws `ConvexError`)
   - `orders.batchImportOrders`: same pattern, validates 1-500 range
   - `notifications.markAllRead`/`clearAll`: bounded to MAX_BATCH=200
   - `notifications.cleanupOldNotifications`: bounded to MAX_BATCH=500
   - `profiles.cleanupStalePresence`: bounded to 500 profiles with 90-second stale threshold
   - `conversations.autoCloseInactive`: processes up to 100 conversations
   - `routing.retryUnassignedConversations`: bounded to 100 projects, 50 conversations each

3. **Existence checks:** Most update/remove mutations verify the target entity exists before operating:
   - `conversations.update`: checks conversation exists
   - `bots.update`: checks bot exists
   - `settings.removeDepartment`: checks department exists
   - `knowledgeBases.removeSource`: checks source and KB exist

4. **Range validation:**
   - `conversations.rate`: explicit check `args.rating < 1 || args.rating > 5`

5. **Enum validation:**
   - `feedback.submitFeedback`: `v.union(v.literal("bug"), v.literal("feature"), v.literal("general"))`
   - `orders.batchImportOrders`: normalizes status to valid literals

6. **Deduplication:**
   - `contacts.batchImport`: deduplicates by email within a project, skips existing
   - `settings.addMemberToDepartment`: only adds if not already a member
   - `conversations.createOrUpdateFromMeta`: deduplicates via `channelMessageId`
   - `conversations.createOrUpdateFromTelegram`: same dedup pattern
   - `tags.assignTagToConversation`: checks if tag already exists before adding

7. **Business rule validation:**
   - `conversations.update`: HITL safeguard - if `assignedTo` is set, forces `status = 200`, `botPaused = true`
   - `contacts.remove`: blocks deletion if contact is linked to an active conversation (`status !== 1000`)
   - `settings.removeDepartment`: blocks deletion of default department (`isDefault` check throws `ConvexError`)
   - `routing.routeConversation`: guards against routing resolved conversations (status 1000)

8. **Input sanitization (undefined filtering):**
   - `contacts.update`, `conversations.update`, `conversations.updateVisitorInfo`: filter out `undefined` values into `cleanUpdates` object to avoid overwriting with undefined

### Are mutations transactional?

**[x]** Yes, by design of the Convex platform. Every mutation function runs as a single atomic transaction. If any part of the mutation fails, the entire mutation rolls back.

Additionally, the codebase uses a **step-based batch pattern** for large operations that exceed Convex's transaction limits:
- `projects.deleteProjectData`: 19-step cascading delete, each step processes up to 100 records, self-reschedules via `ctx.scheduler.runAfter()` if more remain
- `bots._deleteBotFlowsBatch`: deletes bot_flows in batches of 100, then deletes the bot
- `knowledgeBases.deleteSourcesBatch`: deletes sources in batches of 100, then deletes the KB
- `conversations.autoCloseInactive`: processes up to 100, self-reschedules if more exist
- `routing.retryUnassignedConversations`: processes 50 conversations per project, reschedules remaining

This self-rescheduling pattern is the codebase's strategy for handling operations that exceed Convex's per-transaction limits.

### How are authorization checks handled?

**[x]** Authorization is **inconsistent** across mutation files. There are several patterns:

1. **`requireAdmin()` from `utils.ts`** — strongest check, requires `org_role === "org:admin"`:
   - `projects.update`
   - `bots.create`, `bots.update`, `bots.remove`
   - `settings` — ALL 12 mutations
   - `integrations.upsert`, `integrations.remove`
   - `orders.createOrder`, `orders.updateOrderStatus`, `orders.deleteOrder`
   - `webhooks.create`, `webhooks.update`, `webhooks.remove`

2. **`assertProjectOwnership()` from `utils.ts`** — verifies user's org owns the project:
   - `contacts.update`
   - `knowledgeBases.create`, `knowledgeBases.addSource`, `knowledgeBases.removeSource`

3. **Manual orgId verification:**
   - `knowledgeBases.remove`: manually checks `project.orgId === identity.org_id`
   - `contacts.batchImport`: derives orgId from identity and queries projects
   - `orders.batchImportOrders`: same pattern

4. **Auth-only checks (`getUserIdentity()` without role):**
   - `contacts.create`, `contacts.remove`
   - `conversations.create`, `conversations.update`, `conversations.resolve`, etc.
   - `messages.sendMessage`
   - `profiles.updateMe`, `profiles.setAvailability`, etc.
   - `notifications.markAsRead`, `notifications.markAllRead`, `notifications.clearAll`
   - `feedback.submitFeedback`
   - `tags.assignTagToConversation`, `tags.removeTagFromConversation`
   - `pushMutations.registerPushSubscription`
   - `webhooks.backfillWebhookSecrets` (no auth at all!)

5. **No authentication (internal mutations or public endpoints):**
   - All `internalMutation()` functions (by design, called from actions/HTTP)
   - `conversations.createFromWidget`, `conversations.createOrUpdateFromMeta`, `conversations.createOrUpdateFromTelegram` (webhook/widget facing)
   - `messages.send`, `messages.sendFromWidget` (widget facing)
   - `seed.seedDemoData` — **SECURITY CONCERN: no auth, anyone with projectId can seed**
   - `wipe.wipeAll` — **SECURITY CONCERN: no auth, anyone with projectId can wipe all data**
   - `webhooks.backfillWebhookSecrets` — **SECURITY CONCERN: no auth check**

6. **`activityLogs.log`** — checks identity but does NOT throw if null; stores `undefined` as the actor.

**Critical gaps:**
- `messages.send` has no auth check — only validates conversation exists
- `wipe.ts` and `seed.ts` are completely unprotected
- `webhooks.backfillWebhookSecrets` has no auth

### Is there input sanitization?

**[x]** Minimal explicit input sanitization:

1. **Undefined filtering pattern** — used in `contacts.update`, `conversations.update`, `conversations.updateVisitorInfo`:
   ```typescript
   const cleanUpdates: Partial<...> = {};
   for (const [key, value] of Object.entries(args)) {
     if (value !== undefined) {
       (cleanUpdates as any)[key] = value;
     }
   }
   ```
   This prevents accidental overwrites with `undefined` values.

2. **Cryptographic secret generation** — `webhooks.create`:
   ```typescript
   crypto.getRandomValues(new Uint8Array(32))
   ```
   Generates 32 bytes of cryptographically secure random data for webhook secrets.

3. **No XSS/HTML sanitization** — The codebase relies on Convex's type-safe API and frontend sanitization. No server-side HTML/content sanitization was found in mutation files.

4. **No SQL injection concern** — Convex is a document database (not SQL), so SQL injection is not applicable.

### What side effects do mutations trigger?

**[x]** Side effects are extensive, especially in conversation-related mutations:

| Mutation | Side Effects |
|----------|-------------|
| `conversations.create` | Updates `project_usage.conversationsCount`, schedules `routing.routeConversation` |
| `conversations.update` | Creates notification (assigned), push notification to agent, activity log (`conversation_assigned`), webhook (`agent.assigned`), webhook (`conversation.closed`), notification (resolved) |
| `conversations.createFromWidget` | Updates project_usage, creates contact, inserts welcome message, inserts initial message, fires webhook (`conversation.opened`), push to org, schedules routing |
| `conversations.resolve` | Logs conversation event, fires webhook (`conversation.closed`), notifies assigned agent, schedules tag extraction, inserts system "resolved" message, sends Telegram message, logs activity |
| `conversations.join` | Inserts system message, sends Telegram message, updates SLA deadline |
| `conversations.transferToDepartment` | Schedules routing, logs activity (`conversation_department_changed`) |
| `conversations.autoCloseInactive` | Patches status, logs event, fires webhook, schedules tag extraction, inserts system message, sends Telegram, self-reschedules |
| `messages.send` | Updates conversation (lastMessage, unreadCount, updatedAt), creates notification for assigned agent, fires webhook (`message.create`) |
| `messages.sendFromWidget` | Schedules metadata update, creates notification, schedules routing or bot execution, fires webhook (`message.create`) |
| `messages.sendMessage` | Patches conversation (status 200, botPaused, participants, firstResponseAt), fires webhook for non-internal messages |
| `contacts.create` | Schedules webhook (`contact.created`) |
| `contacts.remove` | Blocks if active conversation exists |
| `bot.createBotMessage` | Schedules `sendMetaMessage` (messenger/instagram/whatsapp), schedules `sendTelegramMessage` |
| `bot.assignToHuman` | Clears bot state (currentNodeId to null), sets SLA deadline |
| `bots.create` | Logs activity (`bot_created`) |
| `bots.update` | Logs activity (`bot_updated`) |
| `bots.remove` | Schedules `_deleteBotFlowsBatch`, logs activity (`bot_deleted`) |
| `knowledgeBases.addSource` | Schedules `indexSource` action |
| `knowledgeBases.remove` | Schedules `deleteSourcesBatch` |
| `settings.*` (all CRUD) | Logs activity for every operation (department/label/canned_response created/updated/deleted, member added/removed) |
| `settings.removeLabel` | CASCADE: removes label name from all conversation tags in project (up to 500 conversations) |
| `tags.assignTagToConversation` | Logs activity (`label_applied`) |
| `tags.removeTagFromConversation` | Logs activity (`label_removed`) |
| `profiles.setAvailability` | Schedules `retryRoutingForAgent` when becoming available |

Side effect delivery mechanism: Most side effects are scheduled via `ctx.scheduler.runAfter(0, internal.xxx.fn())` to decouple the mutation from the side effect execution.

### Are there optimistic concurrency control patterns?

**[x]** **Minimal explicit OCC.** No mutation uses Convex's `_creationTime` or explicit version fields for optimistic concurrency control.

The only OCC-like patterns found:

1. **`conversations.updateMetadataInternal`**: reads conversation, checks `status === 100` before patching — a soft guard to prevent updates on resolved conversations.

2. **Deduplication by `channelMessageId`** in `conversations.createOrUpdateFromMeta` and `conversations.createOrUpdateFromTelegram`: checks for existing message ID before creating, preventing duplicate conversations from webhook retries.

3. **Convex platform-level OCC:** Convex automatically handles concurrent mutation conflicts at the platform level. Mutations that conflict are retried automatically.

4. **Self-rescheduling batch pattern:** Large batch operations use a pattern of processing up to N records, then checking if more remain and self-rescheduling. This avoids transaction limit errors but is not OCC per se.

**Gap:** No explicit version fields or `_creationTime` checks for update-conflict detection on contested resources.

### How are errors handled and reported?

**[x]** Error handling is **uniform but minimal**:

1. **Public mutations:** Throw `Error("Not authenticated")` or `Error("Conversation not found")` — plain JavaScript Error with string message.

2. **Authorization failures:** Throw `ConvexError({ message: "..." })` from `requireAdmin()` and `assertProjectOwnership()` in `utils.ts`.

3. **Validation failures:** Throw `ConvexError({ message: "..." })` for business rule violations:
   - `contacts.batchImport`: `ConvexError` for >500 contacts
   - `settings.removeDepartment`: `ConvexError` for attempting to delete default department

4. **Internal mutations:** Use early returns instead of throws:
   - `bot.updateConversationState`: `if (!conversation) return;`
   - `bot.assignToHuman`: `if (!conversation) return;`

5. **No try/catch blocks** in any mutation function. All mutations rely on Convex's automatic error handling and retry logic.

6. **Actions** (not mutations) use try/catch with `console.error` — but these are in the action files, not mutation files.

7. **No error codes or structured errors** — all errors are string messages. Clients must parse error messages to determine error type.

### Is there rate limiting on mutations?

**[x]** **No application-level rate limiting exists on any mutation.**

The only rate limiting is at the Convex platform level (which enforces default rate limits on API calls). The codebase does not implement:
- Per-user rate limits
- Per-IP rate limits
- Per-project rate limits
- Token bucket or sliding window rate limiters

**Gap:** High-frequency mutations like `messages.send`, `conversations.createFromWidget`, and `pushMutations.registerPushSubscription` have no rate limiting, making them potentially vulnerable to abuse.

### Are mutations idempotent? (safe to retry)

**[x]** **Mixed idempotency:**

**Idempotent mutations:**
- `contacts.batchImport` — deduplicates by email, skips existing
- `projects.ensureProject` — checks existing before creating
- `projects.deleteProjectData` — step-based, only deletes what exists
- `botFlows.save` — upsert pattern (checks existing by botId)
- `bots._deleteBotFlowsBatch` — batch delete with self-reschedule
- `profiles.updateMe` — upsert
- `profiles.ensureCurrent` — upsert with sync
- `profiles.upsertFromClerk` — upsert
- `settings.addMemberToDepartment` — checks before adding
- `settings.removeMemberFromDepartment` — checks before removing
- `settings.upsertOperatingHours` — upsert
- `knowledgeBases.getOrCreateDefault` — upsert
- `knowledgeBases.deleteSourcesBatch` — batch delete with self-reschedule
- `notifications.markAsRead` — patching `read: true` on already-read is no-op
- `notifications.markAllRead` — idempotent
- `notifications.clearAll` — idempotent
- `tags.assignTagToConversation` — checks if tag exists before adding
- `tags.removeTagFromConversation` — filter on non-existent tag is no-op
- `integrations.upsert` — upsert
- `integrations.upsertInternal` — upsert
- `integrations.patchCredentials` — overwrites (effectively idempotent)
- `integrations.patchWebhookSecret` — overwrites (effectively idempotent)
- `webhooks.backfillWebhookSecrets` — checks `!sub.secret` before patching
- `pushMutations.savePushSubscription` — upsert
- `pushMutations.registerPushSubscription` — upsert

**NOT idempotent:**
- `contacts.create` — always inserts
- `messages.send` — always inserts new message
- `messages.sendFromWidget` — always inserts
- `messages.sendMessage` — always inserts
- `conversations.create` — always inserts
- `conversations.resolve` — not idempotent (side effects re-fire)
- `bots.create` — always inserts (but logs activity each time)
- `knowledgeBases.create` — always inserts
- `knowledgeBases.addSource` — always inserts
- `feedback.submitFeedback` — always inserts
- `orders.createOrder` — always inserts
- `orders.batchImportOrders` — always inserts, no dedup
- `webhooks.create` — always creates with new secret
- `activityLogs.log` — always inserts (append-only by design)
- `seed.seedDemoData` — always inserts
- `wipe.wipeAll` — idempotent in effect (data already wiped) but not in execution

### What's the rollback strategy for failed mutations?

**[x]** **No explicit rollback strategy exists.**

1. **Convex atomicity:** All mutations run as atomic transactions. If any part fails, the entire mutation is rolled back automatically by Convex.

2. **No manual rollback/compensating transactions:** No mutation implements a compensating action on failure (e.g., undo a partial write).

3. **Scheduled side effects are fire-and-forget:** Side effects scheduled via `ctx.scheduler.runAfter()` run independently. If they fail, they don't roll back the originating mutation.

4. **No retry logic for transient failures:** Mutations do not implement retry loops. Convex retries mutations automatically on conflict, but application-level transient failures (e.g., external API calls in scheduled actions) are not retried by mutations.

5. **`migrations.migrateStatuss`** is permanently disabled by throwing an error — this is the only explicit "undo prevention" in the codebase.

### Are there audit logs for mutations?

**[x]** **Partial audit logging.** The codebase has an `activityLogs.ts` module with `log()` and `logActivityInternal()` mutations that append to an append-only activity log table.

**What IS logged:**
- `bots.create` → `bot_created`
- `bots.update` → `bot_updated`
- `bots.remove` → `bot_deleted`
- `conversations.update` → `conversation_assigned`
- `conversations.resolve` → `conversation_resolved`
- `conversations.transferToDepartment` → `conversation_department_changed`
- `conversations.join` → `conversation_joined`
- `conversations.autoCloseInactive` → conversation event logged
- `settings` — ALL department, label, canned_response CRUD operations log activity
- `tags.assignTagToConversation` → `label_applied`
- `tags.removeTagFromConversation` → `label_removed`

**What is NOT logged:**
- `contacts.*` — no activity logging
- `messages.*` — no activity logging
- `projects.*` — no activity logging
- `knowledgeBases.*` — no activity logging
- `integrations.*` — no activity logging
- `orders.*` — no activity logging
- `webhooks.*` — no activity logging
- `profiles.*` — no activity logging
- `notifications.*` — no activity logging
- `pushMutations.*` — no activity logging

**Gap:** Many mutation categories have zero audit trail. The audit log is append-only with no expiration/cleanup policy found.

### How are batch operations handled?

**[x]** Batch operations use two patterns:

1. **In-transaction batch loops:**
   - `contacts.batchImport`: loops over up to 500 contacts, inserting one at a time within a single mutation transaction
   - `orders.batchImportOrders`: same pattern, up to 500 orders
   - `notifications.markAllRead`/`clearAll`: processes up to 200 notifications in one mutation
   - `notifications.cleanupOldNotifications`: deletes up to 500 old notifications

2. **Self-rescheduling batch pattern (for operations exceeding Convex limits):**
   - `projects.deleteProjectData`: 19-step process, each step deletes up to 100 records from one table, then self-reschedules for next step via `ctx.scheduler.runAfter()`
   - `bots._deleteBotFlowsBatch`: deletes up to 100 bot_flows, self-reschedules if more exist, then deletes bot
   - `knowledgeBases.deleteSourcesBatch`: deletes up to 100 sources, self-reschedules if more, then deletes KB
   - `conversations.autoCloseInactive`: processes up to 100, self-reschedules if batch was full
   - `routing.retryUnassignedConversations`: 50 conversations per project, reschedules remaining

The self-rescheduling pattern is:
```typescript
const batch = await ctx.db.query("table").limit(BATCH_SIZE).collect();
for (const item of batch) { /* process */ }
if (batch.length === BATCH_SIZE) {
  await ctx.scheduler.runAfter(0, internal.self, args);
}
```

### What happens with cascading deletes?

**[x]** Cascading deletes are implemented in three places:

1. **`projects.remove` + `projects.deleteProjectData`:** Most comprehensive cascading delete. Deletes across 19 tables in dependency order:
   - Step 1-3: bot_flows, bots, knowledge_base_sources
   - Step 4-6: knowledge_bases, messages, conversations
   - Step 7-9: contacts, integrations, activity_logs
   - Step 10-12: departments, canned_responses, labels
   - Step 13-15: operating_hours, project_usage, unanswered_queries
   - Step 16-18: webhook_subscriptions, webhook_deliveries, projects
   - Uses BATCH_SIZE=100 with self-rescheduling

2. **`bots.remove` + `bots._deleteBotFlowsBatch`:** Deletes all bot_flows for the bot, then the bot itself. Batch size 100.

3. **`knowledgeBases.remove` + `knowledgeBases.deleteSourcesBatch`:** Deletes all knowledge_base_sources for the KB, then the KB itself. Batch size 100.

4. **`settings.removeLabel`:** Cascades to remove label name from all conversation tags in the project. Bounded to 500 conversations (not self-rescheduling — may leave orphaned tags if >500).

5. **`contacts.remove`:** **Guards against cascading** — blocks deletion if contact is linked to an active conversation (status !== 1000). Does not force-delete.

**Gap:** `settings.removeDepartment` does NOT cascade — it deletes the department without checking for orphaned references (e.g., conversations assigned to that department, members of the department). This could leave orphaned references.

## 🔍 Key Patterns to Identify

### Mutation naming conventions
- **Standard CRUD:** `create`, `update`, `remove`, `send`, `resolve`, `join`, `leave` — short, verb-based names
- **Internal naming:** Internal mutations use descriptive names like `updateConversationState`, `createBotMessage`, `assignToHuman`, `deleteProjectData`
- **No consistent prefix for internal mutations** — some use `_` prefix (`_deleteBotFlowsBatch`), others don't

### Validation patterns
- Schema validation via Convex `v.*` validators is universal
- Bounds checking for batch operations (typically 100-500 limits)
- Existence checks before updates/deletes
- Deduplication on upsert and batch import operations
- Business rule validation (HITL safeguards, status guards, default protection)
- Undefined filtering in update mutations to prevent accidental overwrites

### Authorization patterns
- **Three-tier model:** `requireAdmin()` (strongest) → `assertProjectOwnership()` → `getUserIdentity()` (weakest)
- Internal mutations have no auth (by design)
- Public-facing mutations (widget/webhook) have no auth (by design)
- **Inconsistent application:** Some mutations that modify org data only check identity without role verification

### Error handling strategies
- Throw `Error` for not-found/auth failures
- Throw `ConvexError` for validation failures and authorization
- No try/catch in mutations (Convex handles retries)
- Early returns in internal mutations
- No structured error codes

### Side effect management
- Side effects are scheduled via `ctx.scheduler.runAfter(0, internal.xxx.fn())` for decoupling
- Heavy side effects in conversation lifecycle mutations
- Activity logging is manually called in specific mutations, not automatic
- Webhook notifications are the most common side effect

### Audit logging approach
- Append-only activity log table
- Manually invoked in specific mutations (not automatic)
- Covers bot, conversation, settings, and tag operations
- Missing coverage for contacts, messages, projects, knowledge, integrations, orders, webhooks, profiles, notifications

## ⚠️ Potential Concerns

### HIGH Severity

| # | Concern | Details | Files |
|---|---------|---------|-------|
| 1 | **No authentication on `wipe.wipeAll`** | Anyone with a projectId can delete all data across 18 tables using `.collect()` (unbounded). This is a critical data loss risk. | `convex/wipe.ts` |
| 2 | **No authentication on `seed.seedDemoData`** | Anyone with a projectId can inject arbitrary demo data into a project. | `convex/seed.ts` |
| 3 | **No authentication on `webhooks.backfillWebhookSecrets`** | Can regenerate webhook secrets for all subscriptions without authentication. | `convex/webhooks.ts` |
| 4 | **`messages.send` has no auth check** | Only validates conversation exists. Any caller who knows a conversation ID can send messages. | `convex/messages.ts` |
| 5 | **No application-level rate limiting** | All mutations rely solely on Convex platform rate limits. High-frequency mutations are unprotected. | All mutation files |

### MEDIUM Severity

| # | Concern | Details | Files |
|---|---------|-------|
| 6 | **Inconsistent authorization patterns** | Some mutations check `requireAdmin()`, others only check identity. Same data category may have different auth levels. | `contacts.ts` vs `orders.ts` |
| 7 | **`wipe.wipeAll` uses unbounded `.collect()`** | On large datasets, this will timeout or exceed Convex limits. Should use batch delete with self-reschedule. | `convex/wipe.ts` |
| 8 | **`settings.removeLabel` cascade bounded to 500** | If >500 conversations have the label, orphaned tags remain. Should use self-rescheduling batch pattern. | `convex/settings.ts` |
| 9 | **`settings.removeDepartment` no cascade** | Deleting a department may leave orphaned references in conversations, members. | `convex/settings.ts` |
| 10 | **Partial audit log coverage** | Many mutation categories (contacts, messages, projects, orders, integrations, webhooks, profiles, notifications) have zero audit trail. | Multiple files |
| 11 | **Non-idempotent batch imports** | `orders.batchImportOrders` always inserts, no dedup. Retrying will create duplicates. | `convex/orders.ts` |
| 12 | **No explicit OCC on contested resources** | No version fields or `_creationTime` checks for update-conflict detection on conversations, profiles. | `conversations.ts`, `profiles.ts` |

### LOW Severity

| # | Concern | Details | Files |
|---|---------|-------|
| 13 | **No structured error codes** | All errors are string messages. Clients must parse strings to determine error type. | All mutation files |
| 14 | **No retry logic in mutations** | Mutations rely on Convex's automatic retry. No application-level retry for transient failures. | All mutation files |
| 15 | **Inconsistent internal mutation naming** | Some use `_` prefix (`_deleteBotFlowsBatch`), others don't (`deleteProjectData`). | `bots.ts` vs `projects.ts` |
| 16 | **`activityLogs.log` stores undefined actor** | If unauthenticated, stores `undefined` as actor instead of rejecting. | `convex/activityLogs.ts` |
| 17 | **No error handling in `deleteProjectData`** | Cascading delete has no try/catch. If one step fails mid-way, partial deletion has occurred. | `convex/projects.ts` |
| 18 | **`seed.ts` is included in production build** | Development-only code is shipped to production. Should be behind feature flag or excluded. | `convex/seed.ts` |
