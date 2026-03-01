# Design Studio Bot Execution Engine Audit

This report documents the current state of the Design Studio bot execution engine, the frontend node definitions, and the Convex schema as of March 1, 2026.

## 1. Execution Engine Block Types
The main bot execution logic is located in `convex/bot.ts`. The `executeAction` function handles the following block types (mapped to `action._type`):

- `reply`
- `capture_user_reply`
- `set_attribute`
- `condition`
- `chatgpt_task`
- `ask_kb`
- `web_request`
- `replace_bot`
- `hitl_handoff`
- `mcp_tool_call`
- `wait`
- `if_operating_hours`
- `if_online_agent`
- `change_department`
- `code_action`
- `clear_transcript`
- `ai_assistant`
- `applyLabel`

## 2. Frontend Node Types
The Design Studio flow builder frontend node types are defined in `src/components/design-studio/FlowEditor.tsx`:

- `start`
- `reply`
- `setAttribute`
- `condition`
- `webRequest`
- `aiTask`
- `hitlHandoff`
- `close`
- `if_operating_hours`
- `if_online_agent`
- `capture_user_reply`
- `wait`
- `ask_kb`
- `replace_bot`
- `change_department`
- `code_action`
- `clear_transcript`
- `ai_assistant`
- `applyLabel`

## 3. Node Type Mismatches
There are several naming mismatches between the frontend node types and the backend `action._type` identifiers as used in the execution engine. These are resolved during the "compilation" process in `convex/botFlows.ts`.

| Frontend Node Type | Backend `action._type` |
|--------------------|-------------------------|
| `setAttribute`     | `set_attribute`         |
| `webRequest`       | `web_request`           |
| `aiTask`           | `chatgpt_task`          |
| `hitlHandoff`      | `hitl_handoff`          |
| `close`            | (Maps to `reply` only)  |

> [!NOTE]
> The `close` node in the frontend is compiled into a `reply` action with closing text, but doesn't have a unique `_type` in the execution engine's main loop.

## 4. Block Type Discriminator
The field used as the block type discriminator is **`_type`** on the action object within a node's `actions` array.

## 5. Edges and Connections Storage
Edges are stored in two formats in the `bot_flows` table:
1. **`edges` field**: Stores the raw React Flow `Edge[]` array (marked as legacy in the schema but still used for frontend state).
2. **`executionNodes` field**: Stores a compiled version of the flow. In this format:
   - Simple linear connections are stored in **`nextBlock`** at the node level.
   - Branching connections (e.g., in `condition` or `ask_kb`) are stored in **`truePath`** and **`falsePath`** (or `elsePath`) within the action object.

## 6. Recent Structural Changes
The system has recently transitioned to use an **`executionNodes`** array in the `bot_flows` table. 
- The `convex/botFlows.ts` file now contains a `compileToExecutionNodes` function that runs during every save.
- This function transforms React Flow nodes and edges into a flattened execution-ready schema.
- The `bot.ts` engine prefers `executionNodes` if they exist:
  ```typescript
  const executionNodes = flow.executionNodes && flow.executionNodes.length > 0 ? flow.executionNodes : flow.nodes;
  ```

## 7. Save and Load Logic

### Load Query (`convex/botFlows.ts`)
```typescript
export const get = query({
    args: { botId: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();
    },
});
```

### Save Mutation (`convex/botFlows.ts`)
```typescript
export const save = mutation({
    args: {
        botId: v.id("bots"),
        nodes: v.any(),
        edges: v.any(),
        variables: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // if (!identity) throw new Error("Not authenticated");

        const executionNodes = compileToExecutionNodes(args.nodes, args.edges);

        // Check if flow already exists for this bot
        const existing = await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                nodes: args.nodes,
                edges: args.edges,
                executionNodes,
                variables: args.variables,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("bot_flows", {
                botId: args.botId,
                nodes: args.nodes,
                edges: args.edges,
                executionNodes,
                variables: args.variables,
            });
        }
    },
});
```
