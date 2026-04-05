# Part 06: Mutations (Write Operations)

## 📊 Visual Map

```
convex/ (Mutation Files)
├── contacts.ts            → Contact CRUD mutations
├── conversations.ts       → Conversation create/update/delete
├── messages.ts            → Message send/edit/delete
├── projects.ts            → Project mutations
├── bots.ts                → Bot management
├── botFlows.ts              → Bot flow mutations
├── profiles.ts            → Profile updates
├── settings.ts            → Settings mutations
├── knowledgeBases.ts      → Knowledge base CRUD
├── notifications.ts       → Notification mutations
├── activityLogs.ts        → Logging mutations
├── feedback.ts            → Feedback submission
├── tags.ts                → Tag mutations
├── labels.ts              → Label mutations
├── integrations.ts        → Integration setup
├── knowledge.ts           → Knowledge mutations
├── orders.ts              → Order mutations
├── routing.ts             → Routing mutations
├── webhooks.ts            → Webhook mutations
├── pushActions.ts         → Push notification actions
├── pushMutations.ts       → Push notification mutations
├── migrations.ts          → Data migration functions
├── seed.ts                → Seed data functions
├── wipe.ts                → Data wiping functions
└── utils.ts               → Mutation utilities
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/*.ts` (mutation files) | Files containing `mutation()` and `internalMutation()` functions |
| `convex/migrations.ts` | Database migration functions |
| `convex/seed.ts` | Development seed data |
| `convex/wipe.ts` | Data cleanup/reset functions |

## ✅ Analysis Checklist

- [ ] What mutation functions exist in each file?
- [ ] What validation is performed before writes?
- [ ] Are mutations transactional?
- [ ] How are authorization checks handled?
- [ ] Is there input sanitization?
- [ ] What side effects do mutations trigger? (notifications, logs, etc.)
- [ ] Are there optimistic concurrency control patterns?
- [ ] How are errors handled and reported?
- [ ] Is there rate limiting on mutations?
- [ ] Are mutations idempotent? (safe to retry)
- [ ] What's the rollback strategy for failed mutations?
- [ ] Are there audit logs for mutations?
- [ ] How are batch operations handled?
- [ ] What happens with cascading deletes?

## 🔗 Dependencies

- **Depends on:** Part 04 (schema), Part 05 (queries)
- **Connected to:** Part 07 (auth), Part 08 (utilities), Part 14 (state management), Part 15 (features)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Mutation naming conventions
- Validation patterns
- Authorization patterns
- Error handling strategies
- Side effect management
- Audit logging approach

## ⚠️ Potential Concerns to Watch For

- Missing authorization checks
- No input validation
- Missing error handling
- Non-idempotent mutations
- No rate limiting
- Cascading deletes without proper cleanup
- Missing audit trails
- Race conditions in concurrent updates
- No retry logic for transient failures
