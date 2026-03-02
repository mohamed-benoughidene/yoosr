# Bot to Agent Transition Audit Report

## 1. `join` and `update` Mutations in the Conversations Backend

### `join` mutation
When an agent manually joins a conversation, it auto-assigns it to them if currently unassigned.
```typescript
// convex/conversations.ts:L362-389
export const join = mutation({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        const participants = conversation.participants || [];
        if (!participants.includes(identity.subject)) {
            participants.push(identity.subject);
        }

        const updates: Record<string, any> = {
            participants,
            updatedAt: Date.now(),
        };

        // Auto-assign to first joining agent if unassigned
        if (!conversation.assignedTo) {
            updates.assignedTo = identity.subject;
            updates.status = 200; // Assigned
        }

        await ctx.db.patch(args.id, updates);
    },
});
```

### `update` mutation
When an agent is manually assigned via the `update` mutation, `botPaused` is explicitly set to `false`.
```typescript
// convex/conversations.ts:L74-136
export const update = mutation({
    // ... args omitted for brevity ...
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const { id, ...updates } = args;
        const cleanUpdates: Record<string, any> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        // HITL Safeguards: if manually assigning, status becomes 200 and botPaused is cleared
        if (args.assignedTo) {
            cleanUpdates.status = 200;
            cleanUpdates.botPaused = false; // Human has taken over — re-enable bot for future if needed
            const conversation = await ctx.db.get(args.id);
            if (conversation) {
                const participants = conversation.participants || [];
                if (!participants.includes(args.assignedTo)) {
                    participants.push(args.assignedTo);
                }
                cleanUpdates.participants = participants;
            }
        }
        // ... patch and notification logic omitted ...
    }
});
```

---

## 2. Full Search for `botPaused`

The `botPaused` field is used as a hard-stop flag to prevent the bot engine from processing messages.

*   **Read**:
    *   `convex/bot.ts:L342`: **`if (conversation.botPaused === true)`** — Used by the engine to abort execution.
*   **Written to `true`**:
    *   `convex/bot.ts:L573`: In `assignToHuman` (Internal mutation called by HITL Handoff block).
    *   `convex/messages.ts:L263`: In `sendMessage` (When an agent manually sends a message to the visitor).
*   **Written to `false`**:
    *   `convex/conversations.ts:L94`: In `update` (When an agent is manually assigned).
    *   `convex/conversations.ts:L506`: In `transferToDepartment` (Resets flag so a new department's bot can pick it up).

---

## 3. Bot Execution Engine Guard

The bot engine (`convex/bot.ts`) and the message trigger (`convex/messages.ts`) use multiple guards to prevent bot execution when an agent is involved.

### The Engine Guard in `convex/bot.ts`:
```typescript
// convex/bot.ts:L341-345
        // HITL Guard: if the conversation was handed off to a human, stop all bot processing.
        if (conversation.botPaused === true) {
            console.log(`[BOT ENGINE] Convo ${args.conversationId} is paused for human handoff. Skipping bot execution.`);
            return;
        }
```

### The Trigger Guard in `convex/messages.ts`:
The bot engine is only scheduled if `assignedTo` (the human agent ID) is null.
```typescript
// convex/messages.ts:L170-180
        } else if (conversation.status === 200 && conversation.participants && conversation.participants.length > 0 && !conversation.assignedTo) {
            // It is assigned, but `assignedTo` (which tracks human Clerk ID) is null.
            // This means one of the participants is a bot! Let's trigger the execution engine.
            await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                conversationId,
                incomingMessage: args.content,
            });
        }
```

---

## 4. Mechanism for Mid-flow Interruption

When a bot is mid-flow (e.g., waiting for user reply), it stops via two parallel mechanisms:

1.  **Trigger Inhibition**: As soon as an agent joins or is assigned, `assignedTo` is populated. The next time the visitor sends a message, `sendFromWidget` (the trigger) will see that `assignedTo` is not null and will **not** schedule the bot engine.
2.  **Hard Stop on Reply**: If an agent sends a message manually, the `sendMessage` mutation sets `botPaused: true`. Even if a bot execution was already scheduled or in flight, it will hit the `botPaused === true` check and abort immediately.

---

## 5. System Messages

Several system-generated messages are sent as "bot" sender type:

*   **Agent Joined**: `"An agent has joined the conversation."` (Sent in `convex/routing.ts:L76` during auto-assignment).
*   **Resolved**: `"This conversation has been resolved. Thank you!"` (Sent in `convex/conversations.ts:L356`).
*   **Auto-Closed**: `"This conversation was automatically closed due to inactivity."` (Sent in `convex/conversations.ts:L567`).
*   **Transferred**: `"Conversation transferred to [Agent Name/Department]"` (Sent from the Monitor UI via `ChatArea.tsx`).

There is **no** system message explicitly stating "Bot paused".

---

## 6. HITL Handoff Block Implementation

The HITL Handoff block triggers an escalation that explicitly pauses the bot and clears its metadata.

```typescript
// convex/bot.ts:L152-157 (Action handler)
        case "hitl_handoff":
            await ctx.runMutation(internal.bot.assignToHuman, {
                conversationId,
                deptId: action.deptId,
            });
            return { newAttributes: {}, suspend: true };

// convex/bot.ts:L564-579 (Execution Logic)
export const assignToHuman = internalMutation({
    args: { conversationId: v.id("conversations"), deptId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        await ctx.db.patch(args.conversationId, {
            status: 100,            // Back to unassigned pool
            botId: undefined,       // Detach bot so it won't be re-triggered
            botPaused: true,        // Hard-stop guard — even if botId leaks back
            handoffSource: "bot",   // Agent UI badge: this came from a bot escalation
            currentNodeId: null,    // Clear node pointer
            assignedTo: undefined,  // Ensure no stale agent assignment
        });
    }
});
```
