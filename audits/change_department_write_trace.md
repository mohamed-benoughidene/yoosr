# Audit: Every Write to `conversations` During `change_department` Flow

## 1. `change_department` Case in `bot.ts` — Verbatim

```typescript
case "change_department":
    const c3 = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
    await ctx.runMutation(internal.conversations.updateInternal, {
        id: conversationId,
        departmentId: action.departmentId,
    });
    // Clear the active bot before routing so the router cannot re-assign it
    await ctx.runMutation(internal.conversations.updateInternal, {
        id: conversationId,
        botPaused: true,
        botId: undefined,
    });
    await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
        conversationId: conversationId,
        projectId: c3.projectId,
        departmentId: action.departmentId,
        skipBot: true,
    });
    return { suspend: true };
```

**Call count:** 1 `ctx.runQuery` + 2 `ctx.runMutation` + 1 `ctx.scheduler.runAfter` = **4 calls total** (3 in the action, 1 scheduled).

---

## 2. `executeNextBlock` — What Runs After `{ suspend: true }` — Verbatim

```typescript
if (result.suspend) {
    console.log(`[BOT ENGINE] -> Action requested suspend at node: ${currentNode._id}`);
    await ctx.runMutation(internal.bot.updateConversationState, {
        id: args.conversationId,
        currentNodeId: result.scheduleNextBlockAfter ? nextNodeId : currentNode._id,
        attributes,
        botId: newBotId,
        botStepCount: result.scheduleNextBlockAfter ? nextStepCount : 0,
    });

    if (result.scheduleNextBlockAfter) {
        await ctx.scheduler.runAfter(result.scheduleNextBlockAfter, internal.bot.executeNextBlock, {
            conversationId: args.conversationId,
            incomingMessage: "",
        });
    }

    return;
}
```

**1 mutation** after suspend: `internal.bot.updateConversationState`. Since `change_department` returns `{ suspend: true }` without `scheduleNextBlockAfter`, no scheduler call is made here.

---

## 3. `updateInternal` Mutation (`convex/conversations.ts`) — Verbatim

```typescript
export const updateInternal = internalMutation({
    args: {
        id: v.id("conversations"),
        status: v.optional(v.number()),
        assignedTo: v.optional(v.string()),
        unreadCount: v.optional(v.number()),
        participants: v.optional(v.array(v.string())),
        departmentId: v.optional(v.id("departments")),
        botPaused: v.optional(v.boolean()),
        botId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const cleanUpdates: Record<string, any> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(args.id, cleanUpdates);
    }
});
```

**Note:** The `if (value !== undefined)` check means `botId: undefined` passed from `change_department` will be **silently skipped** — it will NOT clear `botId` from the conversation record.

---

## 4. `routeConversation` Patches on Conversations (`convex/routing.ts`)

With `skipBot: true`, the bot block is entirely skipped. Two `ctx.db.patch` calls remain:

**Patch A — Agent found (line 136):**
```typescript
await ctx.db.patch(args.conversationId, {
    assignedTo: chosenAgentId,
    status: 200,
    participants,
    updatedAt: Date.now(),
});
```

**Patch B — No agent found (line 151):**
```typescript
await ctx.db.patch(args.conversationId, {
    status: 100,
    updatedAt: Date.now(),
});
```

**Count:** Exactly **1 patch** on conversations per execution (one branch or the other, never both).

---

## Full Write Sequence During `change_department`

| Step | Location | Write Target | Fields Patched |
|------|----------|-------------|----------------|
| 1 | `executeAction` → `updateInternal` | `conversations` | `departmentId`, `updatedAt` |
| 2 | `executeAction` → `updateInternal` | `conversations` | `botPaused`, `updatedAt` (**⚠️ `botId: undefined` is skipped!**) |
| 3 | `executeNextBlock` → `updateConversationState` | `conversations` | `currentNodeId`, `attributes`, `botStepCount` |
| 4 | (scheduled) `routeConversation` → `ctx.db.patch` | `conversations` | `assignedTo`/`status`/`participants`/`updatedAt` OR `status`/`updatedAt` |

**Total: 4 writes to the conversations table** (3 in the action transaction, 1 in the scheduled mutation).

---

## ⚠️ Critical Bug Found

**`botId: undefined` is never written.** In step 2, `updateInternal` passes `botId: undefined`, but the handler's loop skips `undefined` values:

```typescript
if (value !== undefined) cleanUpdates[key] = value;
```

So `botId` remains set on the conversation record. The `skipBot` flag in the router prevents re-assignment, but the conversation still shows the old bot as owner. This could cause issues if:
- The bot resumes processing later (e.g., if `botPaused` is cleared without also clearing `botId`)
- UI displays show the bot as still owning the conversation
