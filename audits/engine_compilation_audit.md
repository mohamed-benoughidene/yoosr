# Deep Audit: Bot Execution Engine & Compilation Logic

This report provides a detailed analysis of the transformation from frontend React Flow nodes to backend execution actions, and how these actions are processed by the bot engine.

## 1. The `compileToExecutionNodes` Function
This function in `convex/botFlows.ts` is responsible for "compiling" the UI-friendly React Flow nodes into a flattened structure that the execution engine can process efficiently.

```typescript
function compileToExecutionNodes(nodes: any[], edges: any[]) {
    if (!Array.isArray(nodes)) return [];
    const safeEdges = Array.isArray(edges) ? edges : [];

    return nodes.map((node) => {
        const actions: any[] = [];
        const data = node.data || {};

        switch (node.type) {
            case "start":
                break; // No semantic actions
            case "reply":
                actions.push({
                    _type: "reply",
                    text: data.text || "",
                    textVariations: data.textVariations,
                    buttons: data.buttons
                });
                break;
            case "setAttribute":
                actions.push({
                    _type: "set_attribute",
                    key: data.attributeKey || "",
                    value: data.attributeValue || ""
                });
                break;
            case "condition":
                const trueEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target;
                const falseEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target;

                let expr = "";
                if (data.operator === "equals") expr = `{{${data.attributeKey}}} == '${data.compareValue}'`;
                else if (data.operator === "contains") expr = `contains({{${data.attributeKey}}}, '${data.compareValue}')`;
                // Add more complex parsing if needed, but this covers basics

                actions.push({
                    _type: "condition",
                    expression: expr,
                    truePath: trueEdge,
                    falsePath: falseEdge
                });
                break;
            case "webRequest":
                actions.push({
                    _type: "web_request",
                    method: data.method || "GET",
                    url: data.url || "",
                });
                if (data.responseVariable) {
                    actions.push({
                        _type: "set_attribute",
                        key: data.responseVariable,
                        value: "{{api_results}}"
                    });
                }
                break;
            case "aiTask": {
                const successEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target;
                const failureEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target;
                actions.push({
                    _type: "chatgpt_task",
                    prompt: data.prompt || data.systemPrompt || "",
                    systemPrompt: data.systemPrompt || data.prompt || "",
                    userInput: data.userInput || "{{lastUserText}}",
                    model: data.model || "",
                    assignTo: data.outputVariable || "gpt_reply",
                    successPath: successEdge,
                    failurePath: failureEdge,
                });
                break;
            }
            case "ai_assistant": {
                const aiSuccessEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target;
                const aiFailureEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target;
                actions.push({
                    _type: "ai_assistant",
                    systemPrompt: data.systemPrompt || "",
                    model: data.model || "",
                    maxTurns: data.maxTurns || 3,
                    assignTo: data.assignTo || "assistant_reply",
                    successPath: aiSuccessEdge,
                    failurePath: aiFailureEdge,
                });
                break;
            }
            case "hitlHandoff":
                actions.push({ _type: "reply", text: data.handoffMessage || "Transferring you to an agent..." });
                actions.push({ _type: "hitl_handoff" });
                break;
            case "close":
                actions.push({ _type: "reply", text: data.closingMessage || "Conversation ended." });
                break;
            case "if_operating_hours":
                actions.push({
                    _type: "if_operating_hours",
                    truePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target,
                    falsePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "if_online_agent":
                actions.push({
                    _type: "if_online_agent",
                    truePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target,
                    falsePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "ask_kb":
                actions.push({
                    _type: "ask_kb",
                    query: data.query || "",
                    assignTo: data.assignTo || "kb_reply",
                    truePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target,
                    elsePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "capture_user_reply":
                actions.push({
                    _type: "capture_user_reply",
                    attribute: data.attribute || "user_input"
                });
                break;
            case "wait":
                actions.push({
                    _type: "wait",
                    delaySeconds: data.delaySeconds || 2
                });
                break;
            case "replace_bot":
                actions.push({
                    _type: "replace_bot",
                    slug: data.slug || ""
                });
                break;
            case "change_department":
                actions.push({
                    _type: "change_department",
                    departmentId: data.departmentId || ""
                });
                break;
            case "code_action":
                actions.push({
                    _type: "code_action",
                    expression: data.expression || "",
                    assignTo: data.assignTo || "code_result"
                });
                break;
            case "clear_transcript":
                actions.push({
                    _type: "clear_transcript"
                });
                break;
            case "applyLabel":
                actions.push({
                    _type: "applyLabel",
                    labelName: data.labelName || ""
                });
                break;
            default:
                break;
        }

        const nextBlock = safeEdges.find((e: any) => e.source === node.id && !e.sourceHandle)?.target;

        return {
            _id: node.id,
            name: data.label || node.type || "Node",
            actions,
            nextBlock
        };
    });
}
```

## 2. Node Type Mappings in Compilation

| Frontend Node Type | Produced `_type` Mapping(s) |
|--------------------|-----------------------------|
| `start`            | (None - sets `nextBlock`) |
| `reply`            | `reply` |
| `setAttribute`     | `set_attribute` |
| `condition`        | `condition` |
| `webRequest`       | `web_request` (and optionally `set_attribute` for results) |
| `aiTask`           | `chatgpt_task` |
| `ai_assistant`     | `ai_assistant` |
| `hitlHandoff`      | `reply` THEN `hitl_handoff` |
| `close`            | `reply` (only) |
| `if_operating_hours`| `if_operating_hours` |
| `if_online_agent`  | `if_online_agent` |
| `ask_kb`           | `ask_kb` |
| `capture_user_reply`| `capture_user_reply` |
| `wait`             | `wait` |
| `replace_bot`      | `replace_bot` |
| `change_department`| `change_department` |
| `code_action`      | `code_action` |
| `clear_transcript` | `clear_transcript` |
| `applyLabel`       | `applyLabel` |

## 3. Handling of Specific Nodes

### `close` Node
The `close` node is handled by producing a **`reply`** action with the closing message.
> [!WARNING]
> The compilation logic for `close` does NOT produce a specific termination action or clear the `nextBlock`. If a user connects an edge *out* of a `close` node, the bot will continue execution after sending the message. Furthermore, there is no "close" case in the backend execution engine's action dispatcher.

### `applyLabel` Node
The `applyLabel` node is handled correctly, producing an action with **`_type: "applyLabel"`**.

## 4. Behavior for Unknown/Unrecognized Node Types
When the compiler encounters a node type that is not in its `switch` statement:
- It **skips** adding any actions to the `actions` array (the array remains empty).
- It **still processes edges** starting from that node, meaning it will still set the `nextBlock` if an edge exists.
- The execution engine will treat this as a "no-op" node and immediately advance to the `nextBlock`.

## 5. Execution Dispatch Logic (`bot.ts`)
The execution engine in `convex/bot.ts` dispatches actions based on the mapped `_type` field.

```typescript
async function executeAction(ctx: any, action: any, attributes: any, incomingMessage: string, conversationId: any) {
    switch (action._type) {
        case "reply":
            // ... logic ...
            return { newAttributes: {} };

        case "capture_user_reply":
            // ... logic ...

        case "set_attribute":
            // ... logic ...

        case "condition":
            // ... logic ...

        case "chatgpt_task": {
            // ... logic ...
        }

        case "ask_kb": {
            // ... logic ...
        }

        case "web_request":
            // ... logic ...

        case "replace_bot":
            // ... logic ...

        case "hitl_handoff":
            // ... logic ...

        case "mcp_tool_call":
            // ... logic ...

        case "wait":
            // ... logic ...

        case "if_operating_hours":
            // ... logic ...

        case "if_online_agent":
            // ... logic ...

        case "change_department":
            // ... logic ...

        case "code_action":
            // ... logic ...

        case "clear_transcript":
            // ... logic ...

        case "ai_assistant": {
            // ... logic ...
        }

        case "applyLabel": {
            // ... logic ...
        }

        default:
            console.warn("Unknown bot action type: ", action._type);
            return { newAttributes: {} };
    }
}
```

## 6. Error Handling & Silent Failures

### SILENT FAILURES
1. **`web_request`**: If a web request fails (network error or non-200 response), the code catches the error or checks `!response.ok` and returns the `failurePath`. However, it **does not log anything** to the console or the execution log. If no `failurePath` is wired in the UI, the bot simply stops or continues to the next block without any indication of what went wrong.
2. **Unknown Node Types**: As noted above, unknown node types result in an empty action list. The engine will log the node entry but perform no actions, silently skipping the node's intended logic.

### LOGGED ERRORS
1. **`chatgpt_task`**: Logs with `console.error("[BOT ENGINE] AI Task failed:", e.message);`.
2. **`ask_kb`**: Logs with `console.error("[BOT ENGINE] KB answer generation failed:", e.message);`.
3. **`code_action`**: Logs with `console.error("Code action error:", e.message);`.
4. **`ai_assistant`**: Logs with `console.error("[BOT ENGINE] AI Assistant failed:", e.message);`.
5. **Unknown Actions**: The `default` case in the action switcher logs `console.warn("Unknown bot action type: ", action._type);`.
