# Bot Traversal & Node Navigation Audit

This report specifically examines the outer execution loop and navigation logic within `convex/bot.ts`.

## 1. Outer Traversal Function (`executeNextBlock`)
The main entry point for executing a bot flow is the `executeNextBlock` internal action.

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

## 2. Finding the Starting Node
The engine finds the starting node based on the following priority logic:
1. **`conversation.currentNodeId`**: If the conversation already has a pointer to a specific node, it tries to find that node in the `executionNodes` array.
2. **`executionNodes[0]`**: If `currentNodeId` is null OR if no node in the flow matches that ID, it defaults to the **first node in the array** (`executionNodes[0]`).

## 3. Node ID Lookup (id vs _id)
When looking up nodes (either for the current start or for auto-continuation), the engine uses a dual-match logic:
```typescript
currentNode = executionNodes.find((n: any) => n._id === currentNodeId || n.id === currentNodeId);
```
It attempts to match `currentNodeId` against both the **`_id`** field (used in compiled `executionNodes`) and the **`id`** field (used in raw React Flow nodes).

## 4. Decision Logic for Paths
The next node to execute is determined as follows:
1. **Initial Value**: `nextNodeId` is initialized to `currentNode.nextBlock`. This is the "default" linear path set by the compiler.
2. **Override**: If any action executed within the node returns a `nextNodeId` property (e.g., from a condition), it **overwrites** the current `nextNodeId`.
3. **Execution**: After all actions in the node are processed, the *final* value of `nextNodeId` is used to update the conversation state and determine the next step.

## 5. `executeAction` Return Values (Success/Failure Paths)

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

### `aiTask` (`chatgpt_task`)
- **Success**: Returns `newAttributes` only (falls back to default `nextBlock`).
- **Failure**:
```typescript
return { newAttributes: { ai_error: e.message }, nextNodeId: action.failurePath };
```

### `ai_assistant`
```typescript
return {
    newAttributes: { [action.assignTo ?? "assistant_reply"]: lastReply },
    nextNodeId: action.successPath,
};
// Or on error:
return {
    newAttributes: { ai_error: e.message },
    nextNodeId: action.failurePath,
};
```

## 6. Execution Limit & Loop Guard
There is **NO maximum step limit or loop guard** implemented in this version of the execution engine. 
- The engine will continue to traverse nodes as long as `requiresInput` is false.
- A logic loop (e.g., Node A points to Node B, and Node B points back to Node A) where neither node contains a `capture_user_reply` action will cause an **infinite recursive loop**.
- While Convex may eventually limit actions/time, there is no application-level protection against logical cycles.
