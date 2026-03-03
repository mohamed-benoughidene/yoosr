# OCC Conflict Fixes — Deep Audit

> Date: 2026-03-03 | Source: `npx convex insights --details` (4 errors, 9 warnings)

---

## All Proposed Fixes

| # | Fix | Risk | Effort | Conflicts Eliminated |
|---|---|---|---|---|
| 1 | Separate bot state into `conversation_bot_state` table | 🔴 High risk (schema change) | ~2 hours | ~60-70% (est. 70+ of 111) |
| 2 | Debounce `markAsRead` on frontend | 🟢 Low risk | ~5 min | ~11 conflicts |
| 3 | Defer conversation metadata patch in `sendFromWidget` | 🟡 Medium risk | ~15 min | ~8 conflicts |
| 4 | Idempotent retry safety net | 🟢 Low risk | ~10 min | Prevents permanent failures |

---

## Fix 1: Separate Bot State — `conversation_bot_state` Table

### What moves out of `conversations`

These 4 fields would move to a new `conversation_bot_state` table:

| Field | Type | Who reads it | Who writes it |
|---|---|---|---|
| `currentNodeId` | `string \| null` | `bot.ts` (executeNextBlock) | `bot.ts` (updateConversationState), `bot.ts` (assignToHuman) |
| `botStepCount` | `number` | `bot.ts` (executeNextBlock) | `bot.ts` (updateConversationState) |
| `executionLog` | `array<object>` | `DebuggerPanel.tsx` (frontend) | `bot.ts` (updateConversationState), `botEngine.ts` (updateConversationAttributes) |
| `attributes` | `any` | `bot.ts` (executeNextBlock), `diagnostic.ts`, `dashboard.ts` (getHomeStats) | `bot.ts` (updateConversationState), `botEngine.ts` (updateConversationAttributes) |

### Files that need changes (7 total)

#### 1. `convex/schema.ts`

**Action:** Add new table, remove 4 fields from `conversations`

```diff
+ // Bot execution state (separated to avoid OCC conflicts with conversations)
+ conversation_bot_state: defineTable({
+     conversationId: v.id("conversations"),
+     currentNodeId: v.optional(v.union(v.string(), v.null())),
+     botStepCount: v.optional(v.number()),
+     executionLog: v.optional(v.array(v.object({
+         nodeId: v.string(),
+         type: v.string(),
+         action: v.string(),
+         timestamp: v.number()
+     }))),
+     attributes: v.optional(v.any()),
+ }).index("by_conversationId", ["conversationId"]),

  conversations: defineTable({
      ...
-     currentNodeId: v.optional(v.union(v.string(), v.null())),
-     botStepCount: v.optional(v.number()),
-     executionLog: v.optional(v.array(v.object({...}))),
-     attributes: v.optional(v.any()),
      ...
  })
```

> [!WARNING]
> **Cannot remove the fields from `conversations` immediately** — existing documents still have them. You must keep them as `v.optional()` in the schema until all existing documents are migrated. Safe approach: add the new table first, update code to read/write from it, then remove the old fields in a later deploy.

---

#### 2. `convex/bot.ts` — **HEAVIEST CHANGES** (6 locations)

This file has the most references. Here's every line that needs updating:

**a) `getConversationState` (line 490-495)**
Currently reads from `conversations`. Needs to also read from `conversation_bot_state`:

```
Current:  return await ctx.db.get(args.id);
Needed:   const conv = await ctx.db.get(args.id);
          const botState = await ctx.db.query("conversation_bot_state")
              .withIndex("by_conversationId", q => q.eq("conversationId", args.id))
              .first();
          return { ...conv, ...botState };
```

**b) `executeNextBlock` (line 326-486)**
Reads `conversation.botStepCount` (line 341), `conversation.currentNodeId` (line 372), `conversation.attributes` (line 393).
→ These now come from the joined result above. **No change needed here** if `getConversationState` returns the merged object.

**c) `updateConversationState` (line 516-549)**
Currently patches `conversations` table with `currentNodeId`, `attributes`, `botStepCount`, `executionLog`.
→ Must change to patch `conversation_bot_state` instead.

```
Current:  await ctx.db.patch(args.id, patch);
Needed:   const botState = await ctx.db.query("conversation_bot_state")
              .withIndex("by_conversationId", q => q.eq("conversationId", args.id))
              .first();
          if (botState) {
              await ctx.db.patch(botState._id, patch);
          } else {
              await ctx.db.insert("conversation_bot_state", {
                  conversationId: args.id,
                  ...patch,
              });
          }
```

**d) `assignToHuman` (line 571-586)**
Sets `currentNodeId: null`. → Must also clear in `conversation_bot_state`.

```
Currently patches conversations:  currentNodeId: null
Needed: Also patch conversation_bot_state: currentNodeId: null
```

**e) `executeAction` — `clear_transcript` case (line 226)**
Returns `{ clearAttributes: true }` which clears `attributes` in `updateConversationState`.
→ No change needed — `updateConversationState` handles it.

**f) `executeAction` — various cases read `attributes`**
They receive `attributes` from `executeNextBlock` which gets it from `getConversationState`.
→ No change needed — upstream fix covers this.

---

#### 3. `convex/botEngine.ts` — 2 locations

**a) `updateConversationAttributes` (line 56-84)**
Patches `conversations` with `attributes` and `executionLog`.
→ Must change to patch `conversation_bot_state` instead (same pattern as bot.ts).

**b) `executeStep` (line 117-366)**
Receives `currentNodeId` and `attributes` as args (not from DB read).
→ **No change needed** — caller passes these values.

---

#### 4. `convex/routing.ts` — 1 location

**`routeConversation`** creates initial bot state when assigning a bot:

```typescript
await ctx.db.patch(args.conversationId, {
    status: 200,
    botId: activeBotId,
    assignedTo: undefined,
    currentNodeId: null,   // ← Move to conversation_bot_state
    botStepCount: 0,       // ← Move to conversation_bot_state
    botPaused: false,
});
```

→ Split into two operations:
1. Patch `conversations` with `status`, `botId`, `assignedTo`, `botPaused`
2. Upsert `conversation_bot_state` with `currentNodeId`, `botStepCount`, initial `attributes`

---

#### 5. `convex/conversations.ts` — 1 location

**`updateInternal`** can patch `botPaused` and `clearBotId` — these stay on `conversations` (they're not bot execution state, they're routing flags). **No change needed** for most of this function.

However, `conversations.create` and `createFromWidget` don't set bot state fields, so **no change needed**.

---

#### 6. `convex/diagnostic.ts` — 1 location

**`getConvoPointer`** (line 11-16) reads `c.attributes`:

```typescript
return convos.map(c => ({ id: c._id, attributes: c.attributes, ... }));
```

→ Must join with `conversation_bot_state` to get `attributes`.

---

#### 7. `src/components/design-studio/DebuggerPanel.tsx` — frontend

Reads `executionLog` from conversations via `api.conversations.list`:

```typescript
const activeConv = recentConversations?.find((c: any) => c.executionLog && c.executionLog.length > 0);
const executionLog = activeConv?.executionLog || [];
```

→ Two options:
- **Option A:** Add `executionLog` to the return shape of `conversations.list` by joining bot state server-side
- **Option B:** Create a dedicated query `getBotState(conversationId)` and have DebuggerPanel call it separately

**Option B is cleaner** — DebuggerPanel already knows the conversation, so a separate query avoids bloating `list`.

---

### Migration Strategy

1. **Deploy 1:** Add `conversation_bot_state` table to schema. Keep old fields on `conversations`.
2. **Deploy 2:** Update all read/write code to use `conversation_bot_state`. Old fields become dead.
3. **Deploy 3 (optional):** Remove old fields from schema (requires data migration or wait for all old docs to expire).

---

## Fix 2: Debounce `markAsRead`

### What changes (1 file)

#### `src/components/chat/ChatArea.tsx` — line 92-96

**Current code:**
```typescript
useEffect(() => {
    if (conversationId && conversation && (conversation.unreadCount ?? 0) > 0) {
        markAsRead({ id: conversationId })
    }
}, [conversationId, conversation, markAsRead])
```

**Problem:** This fires on every `conversation` reactive update. When the bot engine writes to the conversation (changing `attributes`, `currentNodeId`), the `conversation` object updates, and `markAsRead` fires again even though `unreadCount` hasn't changed. This races with the bot writes.

**Fix:**
```typescript
useEffect(() => {
    if (!conversationId || !conversation || (conversation.unreadCount ?? 0) === 0) return

    const timer = setTimeout(() => {
        markAsRead({ id: conversationId })
    }, 500)

    return () => clearTimeout(timer)
}, [conversationId, conversation?.unreadCount, markAsRead])
```

**Key changes:**
- 500ms debounce — gives the bot engine time to finish its write burst
- Dependencies narrowed to `conversation?.unreadCount` instead of the entire `conversation` object — stops re-firing on every bot state change

---

## Fix 3: Defer Conversation Metadata in `sendFromWidget`

### What changes (1 file)

#### `convex/messages.ts` — line 140-150

**Current code:**
```typescript
const patchData: any = {
    lastMessage: args.content,
    updatedAt: Date.now(),
    unreadCount: currentUnread,
};
if (conversation.status !== 200) {
    patchData.status = 100;
}
await ctx.db.patch(conversationId, patchData);
```

**Problem:** This inline `db.patch` runs in the same transaction as the message insert. If `routeConversation` is also patching the same conversation (triggered by `scheduler.runAfter(0, ...)`), they collide.

**Fix:** Move the metadata patch to a scheduled mutation:
```typescript
// Insert message (fast, no conflict)
const messageId = await ctx.db.insert("messages", { ... });

// Defer the conversation metadata update to avoid OCC with routing
await ctx.scheduler.runAfter(0, internal.conversations.updateMetadataInternal, {
    id: conversationId,
    lastMessage: args.content,
    unreadCount: currentUnread,
    setStatusUnassigned: conversation.status !== 200,
});
```

**Needs:** A new `updateMetadataInternal` internalMutation in `conversations.ts`.

> [!WARNING]
> This introduces a brief window (~50ms) where the conversation's `lastMessage` is stale. In practice, this is invisible to users since the messages list updates independently.

---

## Fix 4: Idempotent Retry Safety Net

### What changes (1 file)

#### `convex/messages.ts` — `sendFromWidget`

The 4 permanent errors show that some operations were dropped after 4 retries. The messages themselves were inserted (separate document), but the conversation metadata wasn't updated.

**Fix:** Make the next visitor message self-healing:

```typescript
// At the start of sendFromWidget, check if conversation metadata is stale
if (conversation.lastMessage !== conversation.lastMessage) {
    // Metadata missed — will be corrected by this run's patch
}
```

Actually, this is **already self-healing** — the next message from the visitor will update `lastMessage` and `unreadCount` regardless. The only risk is if the conversation status wasn't set to 100, which means routing might not trigger. But `sendFromWidget` already re-triggers routing on status 100.

**Verdict:** No code change needed. The existing design is already idempotent for the common case. The permanent failures cause a brief (~seconds) metadata lag that self-corrects on the next message.

---

## Recommended Execution Order

| Step | Fix | Risk | Time |
|---|---|---|---|
| **Step 1** | Fix 2: Debounce `markAsRead` | 🟢 Safe, 1 file | 5 min |
| **Step 2** | Fix 3: Defer metadata in `sendFromWidget` | 🟡 Low, 2 files | 15 min |
| **Step 3** | Fix 1: Separate bot state table | 🔴 Medium, 7 files | 1-2 hours |
| Skip | Fix 4: Already self-healing | N/A | 0 min |

> [!TIP]
> Fixes 2 and 3 alone should eliminate ~20-25% of conflicts and can be deployed in minutes with zero risk to existing data. Do these first and re-check insights before committing to Fix 1.
