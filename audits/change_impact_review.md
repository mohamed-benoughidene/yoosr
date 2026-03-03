# Change Impact Review

> [!IMPORTANT]
> This is a **read-only audit**. No code was changed. This reviews all changes we made and predicts breakage risks.

---

## Summary of Changes Made

| File | Function | Change |
|---|---|---|
| `conversations.ts` | `list` | `.collect()` → `.take(100)` |
| `conversations.ts` | `getConversations` | `.collect()` → `.take(100)` + N+1 profile fix (bulk lookup via Map) |
| `dashboard.ts` | `getHomeStats` | Bots: `.collect()` → `.take(1)`. Convos: added `.filter(status ≠ 1000)`. Events: added redundant `.filter(createdAt)` |
| `routing.ts` | `routeConversation` | Bots: `.collect()` + JS filter → `.filter(status=active).first()` |

---

## 1. `conversations.list` — `.take(100)`

### Consumers (5 total)

| Consumer | File | How it uses the data |
|---|---|---|
| **History page** | [history/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/history/page.tsx#L35-L41) | Filters for `status === 1000` (resolved) |
| **Requests page** | [requests/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/requests/page.tsx#L45-L82) | Filters for non-resolved, counts unassigned/mine/bot-escalated |
| **DashboardSidebar** | [DashboardSidebar.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/DashboardSidebar.tsx#L36-L44) | Counts unread + unassigned for badge numbers |
| **ConversationList (Chat)** | [ConversationList.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ConversationList.tsx#L28-L34) | Filters for `assignedTo === user.id` |
| **DebuggerPanel** | [DebuggerPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/DebuggerPanel.tsx#L21-L28) | Finds conversation with `executionLog` |

### 🔴 BREAKING: History Page

**Severity: HIGH**

The History page ([history/page.tsx:41](file:///home/mohamed/lab/yoosr/src/app/dashboard/history/page.tsx#L41)) does:
```typescript
const conversations = allConversations.filter((c: any) => c.status === 1000)
```

The `list` query now returns at most 100 conversations ordered `desc` (most recent first). Since resolved conversations (status 1000) accumulate over time and typically outnumber active ones, the 100 most recent conversations are likely a **mix** of active and resolved. This means:

- ✅ The History page will still show **some** resolved conversations (whichever are in the top 100)
- ❌ It will **silently miss older resolved conversations** beyond position 100
- ❌ The total count is capped — the user can't see their full history anymore
- ❌ Date range filtering on the History page becomes misleading — older dates may show zero results even though data exists

> [!WARNING]
> **The History page should really have its own dedicated query** that filters for `status === 1000` at the index level, ideally with pagination. Right now it's silently truncated.

### 🟡 LOW RISK: Requests Page

The Requests page filters out resolved conversations (`status === 1000`), so it only cares about active ones. Since active conversations are typically far fewer than 100, the `.take(100)` is very unlikely to cut any off. **No practical breakage expected**, unless a project has 100+ simultaneously active conversations.

It also computes badge counts (`unassignedCount`, `myCount`, `botEscalatedCount`) from `allConversations` — these will be capped at 100 too, but again only matters if 100+ active conversations exist.

### 🟡 LOW RISK: DashboardSidebar

Same analysis — counts unread and unassigned badges. Capped at 100, but active conversations rarely exceed this. **No practical breakage.**

### 🟡 LOW RISK: ConversationList (Chat)

Filters for `assignedTo === user.id`. An agent with 100+ assigned conversations is extremely rare. **No practical breakage.**

### 🟢 SAFE: DebuggerPanel

Just finds any conversation with an `executionLog`. The most recent ones (top 100) are the most relevant. **No breakage.**

---

## 2. `conversations.getConversations` — `.take(100)` + bulk profile fix

### Consumers (1 total)

| Consumer | File | How it uses the data |
|---|---|---|
| **Monitor Layout** | [monitor-layout.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/monitor-layout.tsx#L23-L26) | Renders conversation list, selects first by default |

### 🟢 SAFE: Return shape

The return shape is identical — same object structure with `id`, `status`, `assignedAgent`, `user`, `details`, etc. The bulk profile lookup produces the exact same `assignedAgent` objects. **No shape breakage.**

### 🟢 SAFE: `.take(100)` limit

The Monitor view is a real-time dashboard showing active conversations. 100 is a generous cap. **No practical breakage.**

### 🟢 SAFE: Bulk profile fix

The `profileMap` approach returns identical results to the previous per-conversation lookup — it's purely a performance refactoring. One subtle difference: the old code used `async` map with `Promise.all`, the new code uses a synchronous `.map()`. This is functionally equivalent since the profile data is pre-fetched. **No breakage.**

---

## 3. `dashboard.getHomeStats` — three sub-changes

### Consumers (1 total)

| Consumer | File | How it uses the data |
|---|---|---|
| **Dashboard page** | [page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/page.tsx#L26-L53) | Destructures `botsCount`, `liveStats`, `liveQueue`, `recentActivities`, `todaySnapshot` |

### 🔴 BREAKING: `botsCount` semantics changed

**Severity: MEDIUM**

`botsCount` previously returned the **total number of bots** in the project. Now it returns 0 or 1 (existence check).

The Dashboard page uses it as:
```typescript
{botsCount === 0 && ( <OnboardingBanner /> )}
```

This specific usage only checks `=== 0`, so **it still works correctly** — the onboarding banner appears when there are no bots and hides when at least one exists.

However, if any other code (or future code) uses `botsCount` as an actual count (e.g., "You have 3 bots"), it would now incorrectly show "1" regardless of actual count.

> [!NOTE]
> The current consumer is safe, but the field name `botsCount` is now semantically misleading. Consider renaming to `hasBot` if this stays as a boolean check.

### 🔴 BREAKING: Resolved conversations excluded — `todaySnapshot` affected

**Severity: HIGH**

The `.filter(q => q.neq(q.field("status"), 1000))` excludes resolved conversations from `allConversations`. This directly affects:

```typescript
const conversationsToday = allConversations.filter(c => (c._creationTime ?? 0) >= startOfTodayMs);
const conversationsYesterday = allConversations.filter(c => ...);
```

**`todaySnapshot.todayCount`** now counts only **non-resolved** conversations created today. A conversation created today and then resolved today will be **excluded**. The previous behavior counted **all** conversations created today regardless of status.

**`todaySnapshot.diffFromYesterday`** is similarly affected — the comparison is now apples-to-oranges if yesterday's resolved conversations are excluded but conceptually should be included.

The **`avgWaitTimeTodayMs`** computation is also affected — resolved conversations (which are the ones most likely to have a first agent message) are now excluded from the sample, potentially making the average wait time `null` more often.

> [!WARNING]
> The "Conversations Today" metric on the dashboard will now **undercount** by excluding conversations that were created and then resolved within the same day. This is a **data accuracy regression** for the Today's Snapshot section.

### 🟢 SAFE: `liveStats` (openCount, waitingCount, myAssignedCount)

These only care about status 100 and 200 conversations, which are non-resolved by definition. Excluding status 1000 **doesn't affect** these counts at all.

### 🟢 SAFE: `liveQueue`

Same — only shows status 100/200 conversations. **No breakage.**

### 🟢 SAFE: `conversation_events` redundant filter

The `.filter(q => q.gte(q.field("createdAt"), startOfTodayMs))` just reinforces the index range bound. The index `by_projectId_createdAt` already constrains to `>= startOfTodayMs`. The extra filter is harmless — it may or may not help performance depending on Convex internals, but it **cannot change results**. **No breakage.**

---

## 4. `routing.routeConversation` — `.filter().first()`

### Callers (5 total)

| Caller | File | Args passed |
|---|---|---|
| `conversations.create` | [conversations.ts:73](file:///home/mohamed/lab/yoosr/convex/conversations.ts#L73) | `conversationId, projectId` |
| `conversations.createFromWidget` | [conversations.ts:308](file:///home/mohamed/lab/yoosr/convex/conversations.ts#L308) | `conversationId, projectId, initialMessage` |
| `conversations.transferToDepartment` | [conversations.ts:546](file:///home/mohamed/lab/yoosr/convex/conversations.ts#L546) | `conversationId, projectId, departmentId` |
| `bot.ts (change_department)` | [bot.ts:201](file:///home/mohamed/lab/yoosr/convex/bot.ts#L201) | `conversationId, projectId, departmentId, skipBot: true` |
| `messages.sendFromWidget` | [messages.ts:121](file:///home/mohamed/lab/yoosr/convex/messages.ts#L121) | `conversationId, projectId` |
| `messages.sendFromWidget` (2nd call) | [messages.ts:166](file:///home/mohamed/lab/yoosr/convex/messages.ts#L166) | `conversationId, projectId` |

### 🟢 SAFE: Functional equivalence

The old code:
```typescript
const bots = await ctx.db.query("bots").withIndex(...).collect();
const activeBots = bots.filter(b => b.status === "active");
if (activeBots.length > 0) botIdToAssign = activeBots[0]._id;
```

The new code:
```typescript
const activeBot = await ctx.db.query("bots").withIndex(...).filter(q => q.eq(q.field("status"), "active")).first();
if (activeBot) botIdToAssign = activeBot._id;
```

Both select the **first active bot** for the project. The order is determined by the index `by_projectId`, which uses insertion order by default. As long as the index ordering hasn't changed, `.first()` returns the same record as `activeBots[0]`. **No breakage.**

### 🟢 SAFE: No callers affected

All callers pass the same args and don't depend on internal implementation details. The return type of `routeConversation` is `void` (it patches the DB). **No breakage.**

---

## Risk Summary

| Change | Risk | Issue |
|---|---|---|
| `list` → `.take(100)` | 🔴 **HIGH** | History page silently truncated — resolved conversations beyond #100 are invisible |
| `getConversations` → `.take(100)` + bulk profile | 🟢 Safe | Return shape identical, 100 is generous for monitor |
| `getHomeStats` → bots `.take(1)` | 🟡 **Low** | `botsCount` is now 0/1, but current consumer only checks `=== 0` |
| `getHomeStats` → exclude status 1000 | 🔴 **HIGH** | `todayCount` and `diffFromYesterday` now undercount by excluding resolved-today conversations |
| `getHomeStats` → events filter | 🟢 Safe | Redundant filter, no behavioral change |
| `routeConversation` → `.filter().first()` | 🟢 Safe | Functionally equivalent |

---

## Recommended Fixes

### Fix 1: History Page needs its own query
The History page should **not** be using `conversations.list`. It needs a dedicated query that:
- Filters for `status === 1000` at the index level (requires a composite index like `by_projectId_status`)
- Uses `.paginate()` for proper cursor-based pagination
- Can handle date range filtering server-side

### Fix 2: Dashboard `todaySnapshot` needs resolved conversations
The `todaySnapshot` counts require **all** conversations (including resolved) to be accurate. Two options:
- **Option A**: Remove the `status ≠ 1000` filter and use `.take(N)` instead (but this loses the performance gain)
- **Option B**: Run a separate lightweight query just for today's count that includes resolved conversations, or use a pre-computed counter in `project_usage`

### Fix 3: Rename `botsCount` field
Since it's now a boolean check, rename to `hasBot: boolean` or `botsExist: boolean` to prevent confusion in future code.
