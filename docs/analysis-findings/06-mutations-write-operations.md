# Part 06: Mutations (Write Operations)

## 📊 Visual Map

```text
convex/ (Mutation Files)
├── contacts.ts            → Contact mutations (create, update, remove, batchImport)
├── conversations.ts       → Conversation state changes (create, update, join, resolve)
├── messages.ts            → Message writing (send, sendFromWidget)
├── projects.ts            → Project management (ensureProject, create, deleteProjectData)
├── bots.ts                → Bot configuration (create, update, remove)
├── botFlows.ts            → Bot workflow management (save logic tree)
├── profiles.ts            → Profile updates (updateMe, setAvailability)
├── activityLogs.ts        → Centralized audit logging (logActivityInternal)
├── migrations.ts          → One-time data migrations (migrateWidgetTranslations)
├── wipe.ts                → Full project data wipes (wipeAll)
└── seed.ts                → Demo data generation
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/contacts.ts` | Creating/updating visitors and batch imports |
| `convex/conversations.ts` | Managing queue status, routing, human-handoff (botPaused) |
| `convex/messages.ts` | Inserting new chats, sending webhooks on messages |
| `convex/projects.ts` | Scoping data and wiping large relational trees |
| `convex/profiles.ts` | Presences, availability, background clenaups |
| `convex/activityLogs.ts` | Internal audit logger |
| `convex/seed.ts` | Generating massive dummy payload for testing |

## ✅ Analysis Checklist

- [x] **What mutation functions exist in each file?**
  Extensive standard CRUD (e.g., `create`, `update`, `remove`). Also states like `join`, `leave`, `resolve` in `conversations.ts`, and specialized tasks like `batchImport` in `contacts.ts` and `save` (upsert) in `botFlows.ts`.
- [x] **What validation is performed before writes?**
  Strict typing via `v.*`. Business constraints are also manually checked (e.g., in `contacts.ts`, tags must be `<= 20`, each `<= 50` chars. Deduping emails and phones).
- [x] **Are mutations transactional?**
  Yes, natively transactional. A thrown error mid-mutation aborts the entire transaction.
- [x] **How are authorization checks handled?**
  Via imperative checks at the top: `const identity = await ctx.auth.getUserIdentity(); if (!identity) throw authError();`, then manually validating `orgId` alignment via internal helpers like `assertProjectOwnership()`.
- [x] **Is there input sanitization?**
  No active sanitization logic (e.g., stripping HTML). Relying on the front-end format and specific schema limitations.
- [x] **What side effects do mutations trigger?**
  Extensive side effects. Nearly every major write queues background jobs using `ctx.scheduler.runAfter(0, ...)`. Side effects include: generating webhooks, updating activity logs, computing `unreadCount`, pushing notifications to agents, and invoking the AI `routing` engine.
- [x] **Are there optimistic concurrency control patterns?**
  Yes, natively in Convex. Some explicit internal patterns are used to bypass UI race conditions. E.g., `updateMetadataInternal` defers updating the last message to background tasks so simultaneous widget operations don't collide.
- [x] **How are errors handled and reported?**
  Using custom error definitions from `errors.ts` (`authError()`, `notFoundError()`, `userError()`). These are safely thrown and captured up the stack.
- [x] **Is there rate limiting on mutations?**
  None present locally in these mutation files.
- [x] **Are mutations idempotent? (safe to retry)**
  Most are typical relational updates, non-idempotent by default. However, functions like `migrateWidgetTranslations` explicitly check `.typeof(headerTitle)` to allow safe retries, and `batchImport` checks for existing emails.
- [x] **What's the rollback strategy for failed mutations?**
  Automatically rolled back by the platform.
- [x] **Are there audit logs for mutations?**
  Highly present. `internal.activityLogs.logActivityInternal` is fired continually on events like assignment changes, bot creation, department routing, et al.
- [x] **How are batch operations handled?**
  Manually batched in arrays (up to 500 records) like in `contacts.ts` (`batchImport`) parsing via `for` loop. Wiping sequences (`projects.ts` -> `deleteProjectData`) loops exactly `BATCH_SIZE = 100` and recursively re-schedules itself.
- [x] **What happens with cascading deletes?**
  Cascading deletes are manually programmed. For instance, when a project is deleted in `projects.ts`, it invokes a background recursive iterator (`deleteProjectData`) to wipe child tables safely chunk by chunk.

## 📝 Agent Findings

### Advanced Multi-Step Cascading Deletions
Because the structure has heavy relations (many sub-tables tied to a `project`), the `deleteProjectData` handles cleanup via an elaborate recursive state machine processing batches of 100 at a time, moving securely table-by-table.

### Rich Side-Effect Graph
Mutating a seemingly small object—like sending a message—creates a profound ripple effect: it updates the `conversations` last message, computes unread counts, alerts human agents, triggers the tagging engine, hits webhooks, and potentially awakens the bot flow process.

### Safe Internal Workarounds for Public Endpoints
Widget integrations expose sensitive write vectors to unauthenticated users. The backend heavily secures this by relying strictly on `visitorId` matches, sandboxing `internalMutation` calls, and explicitly hiding admin keys beneath backend execution scopes.

## 🔍 Key Patterns to Identify

- **Side Object Updates**: Standard updates routinely utilize the `const { id, ...updates } = args;` extraction pattern, heavily stripping `undefined` fields.
- **Activity Log Standardization**: Every critical state change passes a robust footprint explicitly linking the `actorName` and `actorId` with specific mutation targets.

## ⚠️ Potential Concerns to Watch For

- **HIGH**: Complex state overlaps in `conversations.ts` (`assignToHuman`, `updateStatus`). Many variables (like `botPaused`) are touched conditionally and directly manipulated, risking state divergence.
- **LOW**: Relying on internal mutations to bypass OCC conflicts (`updateMetadataInternal`). While effective, tight coupling between routing hooks and message insertions needs careful logging to avoid hidden background failures.
