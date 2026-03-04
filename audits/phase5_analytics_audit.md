# Phase 5 Audit — Analytics UI + Data Pipeline

**Date:** 2026-03-04  
**Auditor:** Antigravity AI  
**Scope:** `convex/analytics.ts`, `convex/activityLogs.ts`, `convex/bot.ts`, `convex/tags.ts`, `convex/openrouter.ts`, analytics UI under `src/app/dashboard/analytics/`, `src/app/dashboard/activities/`, and all `src/components/analytics/` components.

---

## 1. Analytics Queries in `convex/analytics.ts`

### `getConversationVolume`
✅ **Done**

- **Exists:** Yes — `convex/analytics.ts` line 79.
- **Parameters:** `projectId: Id<"projects">`, `from: number` (Unix ms), `to: number` (Unix ms).
- **Bot vs Agent split:** Yes. Conversations are classified as `"bot"` if `assignedTo` and `resolvedBy` are both absent, otherwise `"agent"`. Returns `{ total, botHandled, agentHandled, daily[] }` where each daily entry has `{ date, bot, agent, total }`.
- **Note:** The bot/agent classification uses `(assignedTo || resolvedBy) ? "agent" : "bot"` — this is a proxy heuristic, not a dedicated `handledBy` field.

---

### `getTokenUsage`
✅ **Done**

- **Exists:** Yes — `convex/analytics.ts` line 133.
- **Parameters:** `projectId`, `from`, `to`.
- **Returns:** `{ totalTokens: number, byModel: { model: string, tokens: number }[] }` — total tokens consumed in the period, grouped by LLM model name.
- **Source table:** `token_usage` (confirmed in schema).

---

### `getUnansweredQueries`
✅ **Done**

- **Exists:** Yes — `convex/analytics.ts` line 168.
- **Parameters:** `projectId`, `limit?: number` (defaults to 20).
- **Returns:** Array of `unanswered_queries` rows sorted by index `by_projectId_count` descending, i.e., highest-frequency unanswered queries first.
- **⚠️ Minor concern:** The query is sorted `.order("desc")` on the `by_projectId_count` index. This works only if the index is actually defined as `by_projectId_count` and includes `count` as the second field. No date-range filtering is applied — all unanswered queries are returned regardless of the `from/to` period selected in the UI.

---

### `getCSATSummary`
⚠️ **Partial — data source mismatch**

- **Exists:** Yes — `convex/analytics.ts` line 188.
- **Parameters:** `projectId`, `from`, `to`.
- **Returns:** `{ average, total, distribution: {1:n, 2:n, 3:n, 4:n, 5:n} }`.
- **⚠️ Data source issue:** The handler reads from the `conversations` table and filters by `c.rating !== undefined`. However, the `submitCSAT` mutation (line 402) writes to **both** `csat_ratings` table AND patches the `conversations.rating` field — so this works. But `submitCSATInternal` (line 377, the HTTP endpoint path) writes **only** to `csat_ratings` and does NOT patch `conversations.rating`. This means ratings submitted via the HTTP API will be silently missed by `getCSATSummary`.
- **Secondary table (`csat_ratings`) is never queried** by any analytics function.

---

### `getActivityLog`
✅ **Done**

- **Exists:** Yes — in `convex/activityLogs.ts` line 6 (separate file, not `analytics.ts`).
- **Pagination:** Yes. Uses Convex's `paginationOptsValidator` and `.paginate()` — fully paginated, newest-first.
- **Additional:** A legacy non-paginated `list` query also exists (takes 100 rows, kept for backward compat).

---

## 2. Token Usage Logging — All OpenRouter Call Sites

OpenRouter is called via two helper functions in `convex/openrouter.ts`: `callAITask` and `callAIAssistant`. All call sites are in `convex/bot.ts` and `convex/tags.ts`.

| File | Block Type | Call | `logTokenUsage` called? |
|---|---|---|---|
| `convex/bot.ts` L57 | `chatgpt_task` | `callAITask(...)` | ✅ Yes — L61–69, wrapped in try/catch |
| `convex/bot.ts` L106 | `ask_kb` (KB answer generation) | `callAITask(...)` | ✅ Yes — L110–115, **not** wrapped in try/catch (best-effort) |
| `convex/bot.ts` L254 | `ai_assistant` (per turn) | `callAIAssistant(...)` | ✅ Yes — L262–270, wrapped in try/catch |
| `convex/tags.ts` L50 | `extractGenerativeTags` | `callAITask(...)` | ✅ Yes — L71–76, but **only if** tags are extracted successfully (skipped on parse failure or empty tags) |

**Summary:** All 4 active call sites log token usage. Minor caveat in `tags.ts`: if the LLM returns valid tokens but zero recognized tags, the token cost is silently dropped (L64 guard: `if (tags.length > 0)`).

---

## 3. Unanswered Query Logging

✅ **Done**

In `convex/bot.ts`, the `ask_kb` block handler (line 87):

1. Calls `searchSimilarChunks`.
2. If `kbResult.length === 0`, falls into the `else` branch (line 120–128).
3. Calls `internal.analytics.logUnansweredQuery` with `{ projectId, query: kbQuery }`.

`logUnansweredQuery` upserts the `unanswered_queries` table — incrementing `count` and updating `lastAskedAt` if the query already exists, or inserting a new row.

**Confirmed:** `logUnansweredQuery` **is** called when `searchSimilarChunks` returns no results.

---

## 4. Analytics UI (`src/app/dashboard/analytics/page.tsx`)

### Is there an analytics page?
✅ **Done**

Route: `/dashboard/analytics` — fully implemented, not a placeholder.

### Date Range Picker
✅ **Done**

Two `<Input type="date">` fields (`from` / `to`) with a "Last 30 days" reset button. Default range is last 30 days. All queries are reactive to date changes.

### Stats Row
✅ **Done**

5-card stats row rendering: Total Conversations, Bot Handled, Agent Handled, Avg CSAT, Total Tokens. All values are live from Convex queries (not hardcoded).

### Line Chart — Conversation Volume
✅ **Done**

`<ConversationVolumeChart>` (`src/components/analytics/ConversationVolumeChart.tsx`) uses Recharts `<LineChart>` with two lines: Bot Handled and Agent Handled. Renders loading spinner and empty state. Connected to real `getConversationVolume` data.

### Unanswered Queries Table
✅ **Done**

`<AnalyticsUnansweredQueries>` (`src/components/analytics/AnalyticsUnansweredQueries.tsx`) renders a `<Table>` with columns: Query, Asked (count badge), Last Asked date, and a "Create KB Entry" action that navigates to the KB page with the query pre-filled.

### CSAT Breakdown Section
✅ **Done**

`<AnalyticsCSAT>` (`src/components/analytics/AnalyticsCSAT.tsx`) renders the average score with star icons and a 5-bar distribution breakdown (star 5 to 1) with `<Progress>` bars and percentage labels.

### Bonus components on the page (not in original spec):
- `<AnalyticsUsageQuotas>` — token and conversation quota progress bars (hardcoded limits, real consumption from `getProjectUsage`).
- `<AnalyticsTagsChart>` — Recharts `<PieChart>` of AI-generated topic tags from `getTagsSummary`.

---

## 5. Activity Log UI

### Is there an Activity Log page?
✅ **Done**

Route: `/dashboard/activities` — fully implemented at `src/app/dashboard/activities/page.tsx`.

### Connected to real data?
✅ **Done — real data, paginated**

Uses `usePaginatedQuery(api.activityLogs.getActivityLog, ...)` with page size of 25. Renders an `<ActivitiesDataTable>` (TanStack Table columns in `src/components/activities/columns.tsx`) with a "Load More" button that calls `loadMore(25)`. Shows loading spinner while fetching, and an empty-state message if no logs yet.

---

## Summary Table

| Item | Status | Notes |
|---|---|---|
| `getConversationVolume` exists + bot/agent split | ✅ Done | Heuristic classification (no explicit `handledBy` field) |
| `getTokenUsage` exists + returns by-model breakdown | ✅ Done | |
| `getUnansweredQueries` exists + sorted by frequency | ✅ Done | No date-range filter applied |
| `getCSATSummary` exists | ⚠️ Partial | Reads `conversations.rating`, misses ratings submitted via HTTP endpoint (writes only to `csat_ratings` table) |
| `getActivityLog` exists + paginated | ✅ Done | In `activityLogs.ts`, not `analytics.ts` |
| Token logging — `chatgpt_task` block | ✅ Done | try/catch protected |
| Token logging — `ask_kb` (answer gen) | ✅ Done | No try/catch but non-critical |
| Token logging — `ai_assistant` block | ✅ Done | try/catch protected |
| Token logging — `extractGenerativeTags` | ⚠️ Partial | Skipped if no tags recognized despite tokens being consumed |
| `logUnansweredQuery` on zero KB results | ✅ Done | |
| Analytics page exists at `/dashboard/analytics` | ✅ Done | |
| Date range picker | ✅ Done | |
| Stats row | ✅ Done | |
| Conversation volume line chart | ✅ Done | |
| Unanswered queries table | ✅ Done | |
| CSAT breakdown section | ✅ Done | |
| Activity Log page + real data | ✅ Done | Paginated with Load More |

---

## Issues to Address

1. **CSAT data source mismatch** (Medium): `getCSATSummary` queries `conversations.rating` but `submitCSATInternal` (the HTTP endpoint path) writes only to the `csat_ratings` table. Ratings submitted via HTTP will not appear in the CSAT summary. Fix: Either update `submitCSATInternal` to also patch `conversations.rating`, or rewrite `getCSATSummary` to query `csat_ratings` instead.

2. **Token cost dropped on empty tag extraction** (Low): In `tags.ts`, if the LLM returns valid output but no recognized tags, the token usage is not logged. Add unconditional token logging after the `callAITask` call.

3. **Unanswered queries not date-range filtered** (Low): `getUnansweredQueries` ignores the `from/to` date range selected in the UI — it always returns the global top-20. Consider adding `from`/`to` params if time-scoped analysis is needed.
