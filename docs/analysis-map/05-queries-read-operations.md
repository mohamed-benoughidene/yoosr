# Part 05: Queries (Read Operations)

## 📊 Visual Map

```
convex/ (Query Files)
├── contacts.ts            → Contact queries
├── conversations.ts       → Conversation fetching
├── messages.ts            → Message retrieval
├── projects.ts            → Project queries
├── bots.ts                → Bot listings
├── botFlows.ts              → Bot flow definitions
├── dashboard.ts           → Dashboard data aggregation
├── profiles.ts            → User profile queries
├── settings.ts            → Settings retrieval
├── analytics.ts           → Analytics data
├── knowledgeBases.ts      → Knowledge base queries
├── notifications.ts       → Notification fetching
├── activityLogs.ts        → Activity log queries
├── feedback.ts            → Feedback queries
├── tags.ts                → Tag queries
├── labels.ts              → Label queries
├── integrations.ts        → Integration queries
├── knowledge.ts           → Knowledge queries
├── orders.ts              → Order queries
├── routing.ts             → Routing queries
├── webhooks.ts            → Webhook queries
└── diagnostic.ts          → Diagnostic queries
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/*.ts` (query files) | Files containing `query()` and `internalQuery()` functions |
| `convex/_generated/` | Auto-generated Convex types and API (DO NOT EDIT) |

## ✅ Analysis Checklist

- [ ] What query functions exist in each file?
- [ ] What parameters do queries accept?
- [ ] Are queries using indexes effectively?
- [ ] What's the complexity of each query? (simple fetch vs aggregation)
- [ ] Are there pagination patterns?
- [ ] Is there cursor-based pagination for large datasets?
- [ ] Are queries composable or monolithic?
- [ ] How is data filtering implemented?
- [ ] Are there any N+1 query problems?
- [ ] What's the caching strategy?
- [ ] Are real-time subscriptions used? (Convex `.use()` for reactivity)
- [ ] How are authorization checks handled in queries?
- [ ] Are there performance optimizations? (denormalization, pre-computation)
- [ ] Error handling in queries?

## 🔗 Dependencies

- **Depends on:** Part 04 (schema)
- **Connected to:** Part 06 (mutations), Part 07 (auth), Part 14 (state management), Part 15 (features)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Query naming conventions
- Parameter patterns and validation
- Data fetching strategies
- Real-time vs one-time queries
- Authorization patterns in queries

## ⚠️ Potential Concerns to Watch For

- N+1 query anti-patterns
- Missing authorization checks
- Over-fetching data
- No pagination for large datasets
- Inconsistent error handling
- Missing indexes causing slow queries
- Tightly coupled queries
- No query result caching
