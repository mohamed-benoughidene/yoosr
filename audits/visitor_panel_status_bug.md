# Audit Report: Open, Unassigned Conversation Status Bug

## Investigation Findings

### 1. The `api.conversations.get` Query
The query returns the raw document from the database. For an newly opened conversation that displays the bug, it returns `status: 200` but leaves `assignedTo` `undefined`.

### 2. The Conversations Schema
In `convex/schema.ts`, the `status` field is defined as:
```typescript
status: v.optional(v.union(v.literal(100), v.literal(200), v.literal(1000))), 
// 100: unassigned, 200: assigned, 1000: closed
```

### 3. Conversation Creation Mutation
When a conversation is initially created via `api.conversations.create` or `internal.conversations.createFromWidget`, it correctly sets the default status to `100`:
```typescript
status: 100, // 100: unassigned
```
However, immediately after creation, it triggers the smart routing engine:
```typescript
await ctx.scheduler.runAfter(0, internal.routing.routeConversation, { ... });
```

### 4. Smart Routing and Assignments (`convex/routing.ts`)
The root cause of the bug lives inside the `routeConversation` function in `convex/routing.ts`:
- The engine first tries to assign a human agent.
- If no human agents are available (or routing rules dictate otherwise), it falls back to assigning an AI Bot.
- If an active bot is found, the engine explicitly updates the conversation's status to `200` (Assigned) to indicate the bot has taken over:
  ```typescript
  await ctx.db.patch(args.conversationId, {
      // assignedTo remains undefined as they are not Clerk Users
      botId: botIdToAssign, // Set the specific bot owner
      status: 200, // Bot is now the assigned actor (status 200)
      participants,
      updatedAt: Date.now(),
  });
  ```

## Conclusion

- **Stored Value:** The stored status value is `200` (Assigned).
- **Is anything incorrectly setting it?** Yes and No. The backend explicitly sets the status to `200` upon creation because the *Bot* takes ownership of the conversation, acting as the "assigned" agent. 
- **The Core Issue:** The display mapping creates a UX discrepancy. The backend considers the conversation "Assigned" (`status: 200`) because a bot is handling it. However, the `assignedTo` field is exclusively for human Clerk User IDs, so it remains `undefined` (resulting in the frontend displaying "Unassigned"). This causes the panel to confidently tell the user that the status is "Assigned" while simultaneously stating it is "Unassigned".
