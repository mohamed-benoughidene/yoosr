# Bot Traversal & Execution Engine Audit

This report analyzes the outer traversal loop in `convex/bot.ts` and documents the fix applied to the `chatgpt_task` action.

## 1. Outer Traversal Function (`executeNextBlock`)
The following is the complete `executeNextBlock` function which manages the flow between nodes:

```typescript
export const executeNextBlock = internalAction({
    args: {
        conversationId: v.id("conversations"),
        incomingMessage: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`[BOT ENGINE] Start execution for convo: ${args.conversationId} with msg: "${args.incomingMessage}"`);
        // 1. Fetch conversation state
        const conversation = await ctx.runQuery(internal.bot.getConversationState, { id: args.conversationId });
        if (!conversation) {
            console.log(`[BOT ENGINE] Convo ${args.conversationId} not found`);
            return;
        }

        // HITL Guard: if the conversation was handed off to a human, stop all bot processing.
        if (conversation.botPaused === true) {
            console.log(`[BOT ENGINE] Convo ${args.conversationId} is paused for human handoff. Skipping bot execution.`);
            return;
        }

        if (!conversation.botId) {
            console.log(`[BOT ENGINE] Convo ${args.conversationId} has no assigned botId`);
            return;
        }


        // 2. Fetch bot flow
        console.log(`[BOT ENGINE] Fetching flow for botId: ${conversation.botId}`);
        const flow = await ctx.runQuery(internal.bot.getBotFlow, { botId: conversation.botId as Id<"bots"> });
        if (!flow || !flow.nodes || flow.nodes.length === 0) {
            console.log(`[BOT ENGINE] Bot flow empty or missing for botId ${conversation.botId}`);
            return;
        }

        const executionNodes = flow.executionNodes && flow.executionNodes.length > 0 ? flow.executionNodes : flow.nodes;
        console.log(`[BOT ENGINE] Flow loaded. ${executionNodes.length} nodes found (using ${flow.executionNodes ? "compiled" : "raw"} schema).`);

        // 3. Find current node
        const currentNodeId = conversation.currentNodeId;
        console.log(`[BOT ENGINE] currentNodeId is: ${currentNodeId}`);

        let currentNode = null;
        if (currentNodeId) {
            currentNode = executionNodes.find((n: any) => n._id === currentNodeId || n.id === currentNodeId);
        }
        if (!currentNode) {
            currentNode = executionNodes[0];
        }

        console.log(`[BOT ENGINE] raw next node: ${JSON.stringify(currentNode)}`);

        if (!currentNode) {
            console.log(`[BOT ENGINE] No valid start node found in flow. Aborting.`);
            return;
        }

        console.log(`[BOT ENGINE] Current Node: ${currentNode.name} (${currentNode._id})`);

        // 4. Execute each action sequentially
        let attributes = { ...conversation.attributes };
        let nextNodeId = currentNode.nextBlock;
        let newBotId = null;
        let resetNode = false;

        const actions = Array.isArray(currentNode.actions) ? currentNode.actions : [];

        for (const action of actions) {
            console.log(`[BOT ENGINE] -> Running Action: ${action._type}`);
            const result = await executeAction(ctx, action, attributes, args.incomingMessage, args.conversationId);

            if (result.newAttributes) {
                attributes = { ...attributes, ...result.newAttributes };
            }
            if (result.clearAttributes) {
                attributes = {};
            }
            if (result.nextNodeId) {
                console.log(`[BOT ENGINE] -> Condition override to: ${result.nextNodeId}`);
                nextNodeId = result.nextNodeId;
            }
            if (result.newBotId) {
                newBotId = result.newBotId;
            }
            if (result.resetNodeId) {
                resetNode = true;
            }

            if (result.suspend) {
                console.log(`[BOT ENGINE] -> Action requested suspend at node: ${currentNode._id}`);
                await ctx.runMutation(internal.bot.updateConversationState, {
                    id: args.conversationId,
                    // If we scheduled a future block, advance the pointer now so it doesn't infinite loop.
                    // Otherwise keep it here (e.g., waiting for user reply).
                    currentNodeId: result.scheduleNextBlockAfter ? nextNodeId : currentNode._id,
                    attributes,
                    botId: newBotId,
                });

                if (result.scheduleNextBlockAfter) {
                    await ctx.scheduler.runAfter(result.scheduleNextBlockAfter, internal.bot.executeNextBlock, {
                        conversationId: args.conversationId,
                        incomingMessage: "",
                    });
                }

                return;
            }
        }

        console.log(`[BOT ENGINE] Node actions complete. Next Node ID: ${nextNodeId}`);

        // 5. Advance to next node
        const updatedNodeId = resetNode ? null : (nextNodeId ?? null);
        await ctx.runMutation(internal.bot.updateConversationState, {
            id: args.conversationId,
            currentNodeId: updatedNodeId,
            attributes,
            botId: newBotId,
            executionTrace: {
                nodeId: currentNode._id || currentNode.id,
                type: currentNode.name || "node",
                action: actions.map((a: any) => a._type).join(",") || "continue",
                timestamp: Date.now(),
            },
        });

        // 6. Continue traversal if next node does not require user input
        if (updatedNodeId) {
            const nextNode = executionNodes.find((n: any) => n._id === updatedNodeId || n.id === updatedNodeId);
            const requiresInput = nextNode?.actions?.some((a: any) => a._type === "capture_user_reply");
            console.log(`[BOT ENGINE] Next node is ${nextNode?.name}. Requires input? ${requiresInput}`);

            if (!requiresInput) {
                console.log(`[BOT ENGINE] Auto-continuing to next block.`);
                await ctx.runAction(internal.bot.executeNextBlock, {
                    conversationId: args.conversationId,
                    incomingMessage: "",
                });
            }
        } else if (newBotId) {
            // We replaced a bot, start traversal on new bot
            console.log(`[BOT ENGINE] Bot Replaced. Restarting execution for new bot.`);
            await ctx.runAction(internal.bot.executeNextBlock, {
                conversationId: args.conversationId,
                incomingMessage: "",
            });
        } else {
            console.log(`[BOT ENGINE] End of flow reached.`);
        }
    }
});
```

## 2. Start Node Identification
The engine identifies the starting node for a conversation as follows:
- First, it checks `conversation.currentNodeId`.
- It matches this against both `_id` and `id` in the `executionNodes` list.
- If `currentNodeId` is null OR no match is found, it defaults to the **first element in the array** (`executionNodes[0]`).

## 3. Node Lookup Matching
When searching for the next node to execute, the engine uses:
```typescript
currentNode = executionNodes.find((n: any) => n._id === currentNodeId || n.id === currentNodeId);
```
This ensures compatibility with both the compiled schema (`_id`) and the raw React Flow schema (`id`).

## 4. Handling `executeAction` Return Values
The engine maintains a local `nextNodeId` variable initialized to `currentNode.nextBlock`.
- For each action within a node, it calls `executeAction`.
- If `executeAction` returns a `nextNodeId`, the local variable is **overwritten** with the new ID.
- This allows conditional blocks (like `condition` or `ask_kb`) to override the default linear path defined by `nextBlock`.

## 5. Return Values for Specific Blocks

### `condition`
```typescript
return {
    newAttributes: {},
    nextNodeId: result ? action.truePath : action.falsePath,
};
```

### `ask_kb`
```typescript
if (!kbAnswer) return { nextNodeId: action.elsePath };
return { newAttributes: { [action.assignTo ?? "kb_reply"]: kbAnswer }, nextNodeId: action.truePath };
```

### `chatgpt_task` (FIXED)
Previously, this only returned `newAttributes`. It has been fixed to include the success path:
```typescript
return {
    newAttributes: parsed
        ? { ...parsed, [action.assignTo ?? "gpt_reply"]: llmResult.text }
        : { [action.assignTo ?? "gpt_reply"]: llmResult.text },
    nextNodeId: action.successPath ?? null,
};
```
On failure, it returns:
```typescript
return { newAttributes: { ai_error: e.message }, nextNodeId: action.failurePath };
```

### `ai_assistant`
```typescript
return {
    newAttributes: { [action.assignTo ?? "assistant_reply"]: lastReply },
    nextNodeId: action.successPath,
};
// On failure:
return {
    newAttributes: { ai_error: e.message },
    nextNodeId: action.failurePath,
};
```

## 6. Loop Guard & Maximum Step Limit
Currently, there is **no maximum step limit or loop guard** implemented.
- The engine uses `await ctx.runAction(internal.bot.executeNextBlock, ...)` to auto-continue if a node does not require user input.
- **DANGER**: If a flow contains a logical cycle (e.g., Node A -> Node B -> Node A) where no node has a `capture_user_reply` or `suspend: true` action, the engine will enter an **infinite recursive loop**.
