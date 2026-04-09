# Part 05: Queries (Read Operations)

## 📊 Visual Map

```text
convex/ (Query Files)
├── contacts.ts            → Contact queries (list, findByConversation)
├── conversations.ts       → Conversation queries (list, get, findByVisitor, etc.)
├── messages.ts            → Message retrieval (list, listRecentByProject, getMessages)
├── projects.ts            → Project queries (list, get, getByOrgId, getPublic)
├── bots.ts                → Bot listings (list, get)
├── botFlows.ts            → Bot flow definitions (get)
├── dashboard.ts           → Dashboard data aggregation (getHomeStats)
├── profiles.ts            → User profile queries (getMe, getByUserId, list)
├── activityLogs.ts        → Activity log queries (getActivityLog, list)
└── utils.ts               → Shared helpers (checkProjectOwnership)
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/contacts.ts` | Fetching project contacts |
| `convex/conversations.ts` | Fetching conversations, open queues, bot states |
| `convex/messages.ts` | Real-time message streams, recent visitors |
| `convex/projects.ts` | Getting project info and validating org access |
| `convex/dashboard.ts` | Aggregating comprehensive live and historical metrics |
| `convex/profiles.ts` | Fetching teammate profiles and availability |
| `convex/activityLogs.ts` | Reading audit/activity trail |

## ✅ Analysis Checklist

- [x] **What query functions exist in each file?**
  Most files provide a standard `list` and `get`. Example from `conversations.ts`: `list`, `get`, `listUnassignedInternal`, `getBotState`, `findByVisitor`. `messages.ts` has `list`, `getMessages`, `listRecentByProject`.
- [x] **What parameters do queries accept?**
  Parameters are validated with Convex `v` types. Common patterns: `projectId: v.id("projects")` and `paginationOpts: paginationOptsValidator`.
- [x] **Are queries using indexes effectively?**
  Yes, highly consistent use of indexes. Examples: `.withIndex("by_projectId")` or specifically compound indexes `.withIndex("by_projectId_status")` as seen in `dashboard.ts`.
- [x] **What's the complexity of each query? (simple fetch vs aggregation)**
  Most are simple fetches with index scanning. However, `dashboard.ts` -> `getHomeStats` is complex. It fetches multiple arrays (conversations, profiles) and manually filters, sorts, and maps over them in memory since Convex doesn't have native nested aggregations.
- [x] **Are there pagination patterns?**
  Yes, there are two distinct patterns: explicit `.take(100)` (used in `dashboard.ts`, `profiles.ts`) and true pagination using `paginate(args.paginationOpts)` (used in `messages.ts` and `activityLogs.ts`).
- [x] **Is scaleable Cursor-based pagination used for large datasets?**
  Yes, via Convex's `.paginate()`, which returns `{ page, isDone, continueCursor }`.
- [x] **Are queries composable or monolithic?**
  Queries are mostly monolithic endpoints mapped to UI components. Some logic composition exists in helper functions like `checkProjectOwnership`.
- [x] **How is data filtering implemented?**
  Mainly done via index equality (`.eq()`) followed by `.filter(q => q.neq(...))` or in-JS filtering (e.g., in `dashboard.ts` with `filter` arrays).
- [x] **Are there any N+1 query problems?**
  There's a potential N+1 pattern in `dashboard.ts` when resolving agent names for the live queue, but it's mitigated by `Promise.all`: `await Promise.all(activeQueue.map(async (conv) => ... ctx.db.query("profiles")))`.
- [x] **What's the caching strategy?**
  Convex automatically caches query results and maintains reactivity. There's no manual custom LRU/redis caching.
- [x] **Are real-time subscriptions used? (Convex `.use()` for reactivity)**
  Yes, Convex queries are inherently reactive. The UI subscribes directly to these queries.
- [x] **How are authorization checks handled in queries?**
  Handled imperatively at the start of functions: `await ctx.auth.getUserIdentity()`, followed by validating whether the `identity.org_id` matches the document's `orgId`. Returns `null` or `[]` if unauthorized.
- [x] **Are there performance optimizations? (denormalization, pre-computation)**
  Yes, in `dashboard.ts`, multiple queries are fired concurrently using `Promise.all` (e.g., getting the first agent message for average wait time calculation). Unread counts are denormalized on `conversations`.
- [x] **Error handling in queries?**
  Typically, queries return `null`, `[]`, or throw custom errors (`authError()`, `notFoundError()`) from `errors.ts`. 

## 📝 Agent Findings

### Consistency in Access Control
Read operations reliably return `null` or empty arrays `[]` when `ctx.auth.getUserIdentity()` fails, preventing abrupt crashes on the client side while safely withholding data.

### Heavy Relational Joins in Dashboard
Because Convex lacks native SQL-like joins, `getHomeStats` in `dashboard.ts` manually performs several table scans (up to 2000 records) spanning `conversations` and `messages`. This is an area sensitive to performance as the project scales.

### Soft Dependencies Between Data
To retrieve messages securely, `messages.ts` -> `list` needs to fetch the `conversation` first to check the `projectId`, ensuring the user belongs to the project's org.

## 🔍 Key Patterns to Identify

- **Index Optimization**: `withIndex` is almost strictly enforced before any `.filter()` calls.
- **Param Validation**: Every query uses strict `v.object()` schemas for arguments.
- **Fallback Returns**: Returning clean empty states (`[]` or `null`) over throwing errors for simple auth omissions, though explicit access violations do throw `forbiddenError()`.

## ⚠️ Potential Concerns to Watch For

- **MEDIUM**: `dashboard.ts` -> `getHomeStats` bounds queries to `.take(2000)`. If a project exceeds 2000 conversations a day, dashboard metrics will be inaccurate. 
- **LOW**: The `list` query in `contacts.ts` uses `.take(500)` with a `TODO: replace with paginated aggregation` comment.
- **MEDIUM**: Mapping inside `dashboard.ts` to fetch profiles per item in `liveQueue` might slow down dashboard rendering. Denormalizing `assignedAgentName` could improve this.
