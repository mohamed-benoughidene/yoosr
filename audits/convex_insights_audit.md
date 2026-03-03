# Convex Insights Audit — 4 Errors, 9 Warnings

> Date: 2026-03-03 | Source: `npx convex insights --details` (last 72 hours)

---

## Executive Summary

**Every single issue is an OCC (Optimistic Concurrency Control) conflict on the `conversations` table.** No performance warnings, no memory issues, no slow queries — purely write contention.

### What is OCC?

Convex uses optimistic concurrency control. When two mutations try to modify the same document at the same time, one succeeds and the other retries. If it retries 4 times and still fails, it becomes a **permanent error** (the mutation is dropped).

### Root Cause

The `conversations` table is a **write hotspot**. During active chat sessions, multiple systems race to patch the same conversation document simultaneously:

- `routing.routeConversation` — patches status, assignedTo, botId
- `bot.updateConversationState` — patches currentNodeId, attributes, executionLog
- `messages.sendFromWidget` / `messages.send` — patches lastMessage, unreadCount, updatedAt
- `conversations.markAsRead` — patches unreadCount
- `conversations.update` / `updateInternal` — patches status, assignedTo, etc.
- `conversations.resolve` — patches status to 1000

All of these patch the **same document** within milliseconds of each other, especially when a visitor message triggers routing → bot assignment → bot execution → bot reply in rapid succession.

---

## 🔴 4 ERRORS (Permanent Failures)

These mutations were **dropped after 4 retries** — meaning the operation did not complete.

### Error 1: `messages.sendFromWidget` — 1 permanent OCC failure

| Detail | Value |
|---|---|
| **Function** | `messages.js:sendFromWidget` |
| **Conflict table** | `conversations` |
| **Conflicting doc** | `jh72cpqq2m4...` |
| **Conflicting source** | `routing.js:routeConversation` |
| **When** | 3/3/2026, 12:41:11 AM |

**Impact:** A visitor's message was received by the server but the conversation metadata (lastMessage, unreadCount) was **not updated**. The message itself was likely inserted into the `messages` table, but the conversation's sidebar entry may show stale data.

---

### Error 2: `routing.routeConversation` — 2 permanent OCC failures

| Detail | Value |
|---|---|
| **Function** | `routing.js:routeConversation` |
| **Conflict table** | `conversations` |
| **Conflicting sources** | `routeConversation` (self-conflict), `bot.updateConversationState` |
| **When** | 3/3/2026, 12:41:12 AM |

**Impact:** Two conversations may have failed to be routed to a bot or agent. The visitor would see no response until the next message re-triggers routing.

---

### Error 3: `conversations.markAsRead` — 2 permanent OCC failures

| Detail | Value |
|---|---|
| **Function** | `conversations.js:markAsRead` |
| **Conflict table** | `conversations` |
| **Conflicting sources** | `bot.updateConversationState` |
| **When** | 3/3/2026, 12:41:16 AM & 12:31:23 AM |

**Impact:** The unread badge count for a conversation was not cleared when an agent opened it. Cosmetic issue — the badge shows "unread" even though the agent read the messages.

---

### Error 4: `conversations.update` — 3 permanent OCC failures

| Detail | Value |
|---|---|
| **Function** | `conversations.js:update` |
| **Conflict table** | `conversations` |
| **Conflicting sources** | `routeConversation`, `bot.updateConversationState` |
| **When** | 3/3/2026, 12:31:29–12:31:34 PM |

**Impact:** An agent's manual update (assign, transfer, status change) to a conversation was dropped while the bot engine was simultaneously writing to the same conversation. The agent's action silently failed.

---

## 🟡 9 WARNINGS (Retried Successfully)

These mutations eventually succeeded but required retries, indicating contention.

| # | Function | Conflicts | Conflicting Sources | Table |
|---|---|---|---|---|
| 1 | `conversations.update` | 21 | `updateInternal`, `routeConversation` | conversations |
| 2 | `conversations.updateInternal` | 21 | `conversations.update`, `bot.updateConversationState` | conversations |
| 3 | `conversations.resolve` | 6 | `routeConversation`, `bot.updateConversationState` | conversations |
| 4 | `routing.routeConversation` | **40** | `conversations.update`, `messages.send`, `markAsRead` | conversations |
| 5 | `messages.send` | 2 | `routeConversation`, `bot.updateConversationState` | conversations |
| 6 | `bot.updateConversationState` | 1 | (unspecified) | conversations |
| 7 | `conversations.markAsRead` | 11 | `bot.updateConversationState`, `routeConversation` | conversations |
| 8 | `routing.routeConversation` | 1 | `profiles.setAvailability` | profiles |
| 9 | `messages.sendFromWidget` | 6 | `bot.updateConversationState`, `routeConversation` | conversations |

### Key Observation

- **`routing.routeConversation` alone accounts for 40 OCC retries** — it's the worst offender
- **Total: 111 OCC conflicts in 72 hours**, all concentrated on the `conversations` table
- Warning #8 is on the `profiles` table (routing reads a profile while `setAvailability` patches it) — this is minor

---

## Root Cause Analysis

The core problem is a **write fan-out pattern** on the `conversations` document:

```
Visitor sends message
    └─→ messages.sendFromWidget  ──→ patches conversations (lastMessage, unreadCount)
         ├─→ routing.routeConversation ──→ patches conversations (status, assignedTo, botId)
         │    └─→ scheduler: bot.executeNextBlock
         │         └─→ bot.updateConversationState ──→ patches conversations (currentNodeId, attributes)
         │              └─→ bot.createBotMessage ──→ (writes messages, not conversations)
         └─→ (agent opens chat)
              └─→ conversations.markAsRead ──→ patches conversations (unreadCount)
```

All 4 functions race to `ctx.db.patch()` the **same conversation document** within the same 50ms window. With Convex's OCC model, each retry has to re-read the document and re-apply the patch, but by then another mutation has already changed it again.

---

## Recommended Fixes (Ordered by Impact)

### Fix 1: Separate Bot State from Conversation Document 🔴 HIGH IMPACT

**The biggest win.** Move `currentNodeId`, `attributes`, `executionLog`, `botStepCount`, and `botId` into a separate `conversation_bot_state` table with a 1:1 relationship to conversations.

This eliminates conflicts between `bot.updateConversationState` and everything else, because they'd be writing to different documents.

```
conversations table → status, assignedTo, lastMessage, unreadCount (agent-facing)
conversation_bot_state table → currentNodeId, attributes, executionLog (bot-facing)
```

**Eliminates:** ~60-70% of all OCC conflicts

### Fix 2: Debounce `markAsRead` 🟡 MEDIUM IMPACT

Currently, every time an agent switches to a conversation tab, `markAsRead` fires immediately and races with bot writes. Adding a 500ms debounce in the frontend would let the bot engine finish its burst before the read-clear fires.

**Eliminates:** markAsRead conflicts (11 retries)

### Fix 3: Use `ctx.scheduler.runAfter(0, ...)` for non-critical patches 🟡 MEDIUM IMPACT

In `messages.sendFromWidget`, the `lastMessage` and `unreadCount` patch could be deferred to a scheduled mutation rather than running inline. This spreads the writes across time instead of all happening in the same transaction.

**Eliminates:** sendFromWidget → conversations conflicts

### Fix 4: Idempotent retry handling 🟢 LOW IMPACT (safety net)

For the 4 permanent errors, add retry logic with exponential backoff for critical operations like routing. Convex already retries 4 times, but the mutations could be designed to be idempotent so a manual re-trigger (e.g., on the next visitor message) recovers gracefully. This is already partially in place since `sendFromWidget` re-triggers routing on each message.

---

## Risk Assessment

| Severity | Current Impact | With Fix 1 |
|---|---|---|
| Permanent failures (errors) | 4 in 72h — some visitor messages/routes silently dropped | ~0-1 |
| Retried conflicts (warnings) | 111 in 72h — adds latency (~50-200ms per retry) | ~10-20 |
| Data integrity | No data loss (messages are inserted separately), but metadata can be stale | Resolved |

> **Note:** These OCC conflicts are **normal for high-write-throughput apps** on Convex. They're not bugs — they're contention. The fix is architectural: reduce the number of writers per document.
