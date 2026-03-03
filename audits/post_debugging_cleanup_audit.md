# Audit: Post-Debugging Cleanup Opportunities

## 1. bot.ts — `change_department` Case: Redundant Mutations?

**Current state (verbatim):**
```typescript
case "change_department":
    const c3 = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
    await ctx.runMutation(internal.conversations.updateInternal, {
        id: conversationId,
        departmentId: action.departmentId,
        botPaused: true,
        clearBotId: true,
    });
    await ctx.scheduler.runAfter(2000, internal.routing.routeConversation, {
        conversationId: conversationId,
        projectId: c3.projectId,
        departmentId: action.departmentId,
        skipBot: true,
    });
    return { suspend: true };
```

**Finding:** ✅ Clean — only 1 `runQuery` + 1 `runMutation` + 1 `scheduler.runAfter`. The earlier duplicate mutations were already consolidated.

---

## 2. conversations.ts — `clearBotId` Usage

**Present in `updateInternal` args:** Yes.

```typescript
clearBotId: v.optional(v.boolean()),
```

**Used in the codebase:**

| File | Line | Usage |
|------|------|-------|
| `convex/conversations.ts:158` | Arg definition | `clearBotId: v.optional(v.boolean())` |
| `convex/conversations.ts:161` | Destructured | `const { id, clearBotId, ...updates } = args;` |
| `convex/conversations.ts:167` | Handler logic | `if (clearBotId) { cleanUpdates["botId"] = undefined; }` |
| `convex/bot.ts:199` | Only caller | `clearBotId: true` |

**Finding:** Only used by `change_department` in bot.ts. This is fine — it's a targeted workaround for the `undefined`-skipping loop. No dead code.

---

## 3. routing.ts — Leftover Debug `console.log` Statements

**4 debug logs found (all added during this debugging session):**

```
Line 79:  console.log("[ROUTE] availableAgents before dept filter:", availableAgents.map(a => a.userId));
Line 85:  console.log("[ROUTE] department:", department?.name, "memberIds:", department?.memberIds);
Line 97:  console.log("[ROUTE] availableAgents after dept filter:", availableAgents.map(a => a.userId));
Line 128: console.log("[ROUTE] chosenAgentId:", chosenAgentId);
```

**Finding:** ⚠️ **All 4 should be removed** — they were added for debugging and log potentially sensitive data (user IDs, department membership).

---

## 4. bot.ts — `console.log` Statements

**19 log statements found, all with `[BOT ENGINE]` prefix:**

```
Line 332: console.log(`[BOT ENGINE] Start execution for convo: ...`)
Line 336: console.log(`[BOT ENGINE] Convo ${...} not found`)
Line 350: console.log(`[BOT ENGINE] Convo ${...} is paused for human handoff. ...`)
Line 355: console.log(`[BOT ENGINE] Convo ${...} has no assigned botId`)
Line 361: console.log(`[BOT ENGINE] Fetching flow for botId: ...`)
Line 364: console.log(`[BOT ENGINE] Bot flow empty or missing ...`)
Line 369: console.log(`[BOT ENGINE] Flow loaded. ${...} nodes found ...`)
Line 373: console.log(`[BOT ENGINE] currentNodeId is: ...`)
Line 383: console.log(`[BOT ENGINE] raw next node: ${JSON.stringify(currentNode)}`)
Line 386: console.log(`[BOT ENGINE] No valid start node found ...`)
Line 390: console.log(`[BOT ENGINE] Current Node: ...`)
Line 401: console.log(`[BOT ENGINE] -> Running Action: ...`)
Line 411: console.log(`[BOT ENGINE] -> Condition override to: ...`)
Line 422: console.log(`[BOT ENGINE] -> Action requested suspend ...`)
Line 444: console.log(`[BOT ENGINE] Node actions complete ...`)
Line 466: console.log(`[BOT ENGINE] Next node is ... Requires input? ...`)
Line 469: console.log(`[BOT ENGINE] Auto-continuing to next block.`)
Line 477: console.log(`[BOT ENGINE] Bot Replaced. Restarting execution ...`)
Line 483: console.log(`[BOT ENGINE] End of flow reached.`)
```

**Finding:** These are **pre-existing** bot engine debug logs — they were NOT added during this session. They're verbose but functionally harmless. Consider converting to a `debug`/`trace` level logger in a future cleanup pass.

---

## 5. Dead Imports / Unused Variables / Commented-Out Code

| File | Finding |
|------|---------|
| `convex/bot.ts` | ✅ No dead imports or commented-out code introduced this session |
| `convex/routing.ts` | ✅ Clean aside from the 4 debug logs |
| `convex/conversations.ts` | ✅ Clean |
| `convex/botFlows.ts` | ✅ Clean |
| `convex/settings.ts` | ✅ Clean |
| `monitor-layout.tsx` | ✅ Clean — `myDepartments` was removed as requested |
| `requests/page.tsx` | ✅ Clean — `myDepartments` query is actively used for filtering |

**Finding:** No dead code artifacts from this session.

---

## 6. Departments Table — `botId` Type

**Current state (verbatim from schema.ts line 146):**
```typescript
botId: v.optional(v.string()), // Bot ID if AI-assigned
```

**Finding:** ⚠️ Still typed as `v.string()`, NOT `v.id("bots")`. This is inconsistent with other tables:
- `bot_flows.botId` uses `v.id("bots")` (line 100)
- `conversations.botId` uses `v.optional(v.string())` (line 54)

This means there is no referential integrity enforced by Convex for bot IDs in either `departments` or `conversations`.

---

## Summary of Actionable Cleanup Items

| Priority | Item | File |
|----------|------|------|
| **High** | Remove 4 debug `console.log` statements | `routing.ts` |
| **Low** | Consider converting `[BOT ENGINE]` logs to a proper logger | `bot.ts` |
| **Low** | Change `departments.botId` from `v.string()` to `v.id("bots")` | `schema.ts` |
| **Low** | Change `conversations.botId` from `v.string()` to `v.id("bots")` | `schema.ts` |
