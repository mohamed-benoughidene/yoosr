# Design Studio & Execution Engine Reference
> Complete technical spec for rebuilding the Tiledesk Design Studio and its execution engine in Next.js / Convex / Clerk.

---

## Table of Contents
1. [JSON Flow Schema](#1-json-flow-schema)
2. [Block Types & Execution Lifecycle](#2-block-types--execution-lifecycle)
3. [Condition & Branching Logic](#3-condition--branching-logic)
4. [State Persistence & Flow Resumption](#4-state-persistence--flow-resumption)
5. [context.attributes Runtime](#5-contextattributes-runtime)
6. [Replace Bot (Multi-Agent Handoff)](#6-replace-bot-multi-agent-handoff)
7. [Error Handling & Fallbacks](#7-error-handling--fallbacks)
8. [Convex Implementation Guide](#8-convex-implementation-guide)

---

## 1. JSON Flow Schema

Every bot flow is stored as a JSON document. This is the single source of truth the execution engine reads and traverses.

### Top-Level Fields

| Field | Type | Description |
|---|---|---|
| `bot_id` | String (UUID) | Unique identifier for this AI agent |
| `project_id` | String | Multi-tenant sandbox ID — isolates all resources |
| `version` | String | Schema version (e.g., `"3.1.0"`) |
| `nodes` | Array | All logic blocks that make up the flow graph |

### Node Object Structure

| Field | Type | Description |
|---|---|---|
| `_id` | String (UUID) | Unique node identifier — used as pointer for state tracking |
| `name` | String | Human-readable label for debugging and visual Studio |
| `actions` | Array | Sequential operations executed when this node is reached |
| `nextBlock` | String | Default pointer to the next node ID (used when no condition overrides) |

### Full Example Flow (4 connected blocks with branching)

```json
{
  "bot_id": "agent_001",
  "project_id": "project_sales_v1",
  "version": "3.1.0",
  "nodes": [
    {
      "_id": "node_welcome",
      "name": "Initial Greeting",
      "actions": [
        {
          "_type": "reply",
          "text": "Hello! I can help with product info or sales. What's on your mind?"
        },
        {
          "_type": "capture_user_reply",
          "attribute": "lastUserText"
        }
      ],
      "nextBlock": "node_intent_classifier"
    },
    {
      "_id": "node_intent_classifier",
      "name": "AI Intent Analysis",
      "actions": [
        {
          "_type": "chatgpt_task",
          "prompt": "Classify the user intent: '{{lastUserText}}'. Reply only with 'pricing' or 'support'.",
          "assignTo": "gpt_reply"
        }
      ],
      "nextBlock": "node_router"
    },
    {
      "_id": "node_router",
      "name": "Branching Logic",
      "actions": [
        {
          "_type": "condition",
          "expression": "{{gpt_reply}} == 'pricing'",
          "truePath": "node_sales_pricing",
          "falsePath": "node_kb_query"
        }
      ]
    },
    {
      "_id": "node_sales_pricing",
      "name": "Sales Path",
      "actions": [
        {
          "_type": "reply",
          "text": "Our current rates are: {{Pricetable}}"
        },
        {
          "_type": "mcp_tool_call",
          "server": "google_sheets",
          "tool": "add_row",
          "args": { "sheet": "Leads", "data": "{{lastUserText}}" }
        }
      ]
    },
    {
      "_id": "node_kb_query",
      "name": "Support Path",
      "actions": [
        {
          "_type": "ask_kb",
          "query": "{{lastUserText}}",
          "kbs": ["product_manual_v2"]
        }
      ]
    }
  ]
}
```

### Variable Scopes

| Scope | Syntax | Description |
|---|---|---|
| Flow Attributes (dynamic) | `{{lastUserText}}`, `{{gpt_reply}}` | Volatile session data captured during conversation |
| Globals (constants) | `{{Pricetable}}`, `{{API_KEY}}` | Project-level static data, consistent across all sessions |

Variable syntax in prompts and text fields: `{{variable_name}}`
Nested JSON access: `{{user.profile.name}}`

---

## 2. Block Types & Execution Lifecycle

Every block has: **inputs** → **action** → **outputs/next pointer**

---

### Reply
- **Inputs**: Text string, Markdown, variables via `{{attr}}` syntax, rich elements (buttons, carousels, images)
- **Action**: Renders message through adaptive multichannel engine — same config renders correctly on Web, WhatsApp, Telegram
- **Outputs**: Message dispatched, immediately triggers `nextBlock` connector

---

### Set Attribute
- **Inputs**: Key name + value (supports expressions like `counter = counter + 1`)
- **Action**: Writes to `context.attributes` in the conversation document. Isolated per project sandbox
- **Outputs**: Updated state available to all subsequent blocks, triggers `nextBlock`

---

### Capture User Reply
- **Inputs**: Target attribute name to store the user's response
- **Action**: **Suspends execution** and waits for next incoming user message. Saves raw text to the specified attribute
- **Outputs**: Resumes flow from `nextBlock` once user replies. Stored in `lastUserText` or custom attribute

---

### Web Request
- **Inputs**: URL, Method (GET/POST), Headers, JSON Body — all support `{{variable}}` injection
- **Action**: Async HTTP call to external API. Uses AI Conditions to validate returned JSON before proceeding
- **Outputs**: Populates attributes from response (e.g., `{{api_results}}`). Routes to success or failure connector based on response validity

---

### Ask Knowledge Base
- **Inputs**: Query string (usually `{{lastUserText}}`), list of KB IDs to query (`kbs: ["kb_id_1", "kb_id_2"]`)
- **Action**: Executes Hybrid Search — Full-text (exact match) + Semantic vector (Qdrant). Re-ranking via cross-encoder selects most relevant snippets. Chains KBs sequentially (priority docs → FAQs → web index)
- **Outputs**: `gpt_reply` attribute populated with synthesized answer OR "Else/No Answer" branch fires if confidence threshold not met

---

### ChatGPT Task
- **Inputs**: System prompt (persona + guardrails) + user input via `{{lastUserText}}`
- **Action**: Sends prompt chain to LLM. Automatically detects JSON in response and maps it to `context.attributes` (System Automatic Mapping)
- **Outputs**: Text or structured JSON saved to `gpt_reply` or custom attribute. Used downstream in Condition blocks or Reply blocks

**NER Example Prompt:**
```
Detect the user's fullname and email.
Reply strictly with this JSON: {"userName": "detected_name", "userEmail": "detected_email"}.
If missing, use null.
```
After execution: `context.attributes.userName` and `context.attributes.userEmail` are automatically populated and available to all subsequent blocks. Form blocks will auto-skip fields already populated.

---

### Condition / Branch
- **Inputs**: Expression evaluating `context.attributes` values
- **Action**: Evaluates condition using supported operators (see Section 3). Deterministic true/false routing
- **Outputs**: Routes to `truePath` node ID or `falsePath` node ID

---

### Replace Bot
- **Inputs**: Target bot identified by **slug** (not hard-coded ID — allows dynamic replacement across environments)
- **Action**: Swaps current bot for specialist bot. **Full `context.attributes` state is preserved and passed to new bot**
- **Outputs**: New bot activates from its own "start" block with inherited context. Old bot deactivated

---

### HITL Handoff (Human-in-the-Loop)
- **Inputs**: Department ID or specific agent ID, full conversation transcript, all `context.attributes`
- **Action**: Smart Assignment routes to available human agent. Bot replies suspended. Agent receives full context — history, tags, attributes — no repeated questions
- **Outputs**: Push notification + email alert fired to agent. Agent picks up in Unified Messaging inbox

---

### Code Action
- **Inputs**: Raw JavaScript / Node.js code
- **Action**: Executes custom logic to manipulate `context.attributes` directly
- **Outputs**: Updated attributes available to all subsequent blocks

```javascript
// Example: message counter
context.setAttribute('counter', context.attributes.counter + 1);

// Example: dynamic key access
const key = context.attributes.dynamicKey;
const value = context.attributes[key];
```

---

### MCP Tool Call
- **Inputs**: MCP server name, tool name, args (support `{{variable}}` injection)
- **Action**: Calls external MCP server (Google Sheets, Calendar, HubSpot, etc.)
- **Outputs**: Tool result available as attribute, triggers `nextBlock`

---

## 3. Condition & Branching Logic

### Supported Operators

| Operator | Function | Example Use Case |
|---|---|---|
| `Equals` | Exact string/value match | `{{gpt_reply}} == 'pricing'` |
| `Contains` | Substring exists in value | `{{lastUserText}}` contains `'refund'` |
| `Matches` | Regex pattern match | Multi-language detection, email format validation |
| `Greater Than` | Numeric comparison | `{{counter}} > 3` → trigger HITL |
| `Less Than` | Numeric comparison | `{{sentiment_score}} < 0.3` → escalate |

### Path Selection Strategy

- **Sequential evaluation**: When multiple outgoing connectors exist, evaluated top-to-bottom as defined in the Studio
- **High-priority logic first**: Put HITL triggers and critical branches at the top of the evaluation order
- **True/False model**: Every condition produces exactly two paths — `truePath` and `falsePath`

### Reading and Writing Variables in Conditions

```
Read:  context.attributes.KEY        (dot notation)
Read:  context.attributes[KEY]       (bracket notation for dynamic keys)
Write: context.setAttribute(KEY, VALUE)
```

### Chain of Knowledge (RAG Fallback Sequence)

```
1. Query official product documentation (highest priority)
2. If confidence low → query general FAQs
3. If still no result → query web-crawled index
4. If entire chain fails → fire "Else" branch → HITL or ticket
```

### Regex Example (Multi-language routing)

```
^((?!it|es).)*$   →  matches any language that is NOT Italian or Spanish
                      use to route non-supported languages to English default flow
```

---

## 4. State Persistence & Flow Resumption

### What Is Stored and Where

| Data | Storage | Access Pattern |
|---|---|---|
| Conversation history, attributes, metadata | MongoDB (primary document store) | Persistent, source of truth |
| Current node pointer, active session state | Redis (session store) | Low-latency, real-time retrieval |
| Vector embeddings for KB search | Qdrant | Semantic search queries |

### Resumption Protocol (Step by Step)

When a new user message arrives:

```
1. Engine identifies project_id and conversation namespace (multi-tenant isolation)
2. Queries Redis for "Current Block ID" — the pointer to the last suspended node
3. Re-establishes context.attributes from MongoDB
4. Resumes execution from the exact node identified by the pointer
5. Continues graph traversal from that node
```

### How capture_user_reply Suspends and Resumes

```
1. capture_user_reply block fires
2. Engine saves current node _id as "Current Block ID" in Redis
3. Execution STOPS — bot is now waiting
4. User sends a message (new inbound event)
5. Engine fetches Current Block ID from Redis
6. Saves user message to specified attribute
7. Advances to nextBlock and continues traversal
```

This is the core mechanism for multi-turn conversations — every `capture_user_reply` is a suspension point.

### Intent Classification as Resume Trigger

Beyond simple pointer-based resumption, the NLU core (LSTM/BERT via `nlu.json`) can also act as a trigger to switch or resume specific nodes based on recognized intent — allowing mid-conversation re-routing even during a wait state.

---

## 5. context.attributes Runtime

### System Attributes (Auto-populated at Session Start)

| Attribute | Description | Source |
|---|---|---|
| `user_language` | ISO language code (`'en'`, `'it'`) | Browser settings (Web) / country code prefix (WhatsApp) |
| `lastUserText` | Most recent raw user input | Inbound message stream |
| `project_id` | Sandbox identifier | System metadata |
| `lastUserDocumentAsInlineURL` | Secure URL for uploaded file | File metadata |
| `lastUserDocumentName` | Filename of uploaded document | File metadata |
| `lastUserDocumentType` | MIME type of upload | File metadata |
| `gpt_reply` | Output from ChatGPT Task block | LLM response |

### Attribute Scope Rules

1. **Conversation-wide**: Attributes are never block-specific — they persist for the entire session
2. **Survive Replace Bot**: `context.attributes` is fully transferred when switching to a specialist bot via Replace Bot action
3. **Survive HITL handoff**: Human agent receives all attributes and full history
4. **Persist across turns**: Stored in MongoDB — survives session gaps and reconnections

### ChatGPT Task → Automatic JSON Mapping

When a ChatGPT Task returns valid JSON, the engine **automatically** maps each key to a flat attribute:

```
LLM Response:
{"userName": "John Doe", "userEmail": "john@example.com"}

Result in context.attributes:
context.attributes.userName  = "John Doe"
context.attributes.userEmail = "john@example.com"
```

These are immediately available to all downstream blocks. Form blocks auto-skip fields already populated — eliminates redundant questioning.

### Code Action Patterns

```javascript
// Simple write
context.setAttribute('lead_score', 85);

// Increment counter
context.setAttribute('counter', context.attributes.counter + 1);

// Dynamic key access
const key = context.attributes.dynamicKey;
const value = context.attributes[key];

// Write from API response
const result = JSON.parse(context.attributes.api_results);
context.setAttribute('account_type', result.data.account_type);
```

---

## 6. Replace Bot (Multi-Agent Handoff)

### How It Works

```
1. Current bot reaches Replace Bot block
2. Target bot identified by SLUG (not ID — allows environment flexibility)
3. Full context.attributes copied to new bot session
4. Message history preserved in same conversation document
5. New bot activates from its own "start" block
6. Old bot fully deactivated
```

### What Is Preserved

- ✅ All `context.attributes` (lead data, scores, captured entities)
- ✅ Full message history
- ✅ Same `conversation_id` / `request_id`
- ✅ `project_id` sandbox scope

### What Resets

- ✅ New bot starts from its own start node
- ✅ New bot's own flow graph is used from that point

### Why Slug Instead of ID

Using a slug property (e.g., `"sales-specialist"`) instead of a hard-coded UUID means the handoff works correctly across dev/staging/production environments where bot IDs differ.

---

## 7. Error Handling & Fallbacks

### Web Request Failures

```
Success path: API returns 200 + valid JSON → validate with AI Conditions → continue
Failure path: Timeout (504) / AMQP error / invalid payload → route to "Failure" connector

Best practice:
- Always validate returned JSON keys before using them downstream
- Use AI Conditions to check structural integrity of API response
- Provide explicit "Failure" connector on every Web Request block
- Failure connector should route to recovery message OR retry loop OR HITL
```

### Knowledge Base "No Answer" (Else Branch)

```
1. Ask KB block fires
2. Hybrid search executes (full-text + semantic + re-ranking)
3. If confidence threshold NOT met → "Else" branch fires
4. Else branch options:
   a. Chain to next KB in sequence (Chain of Knowledge)
   b. Run secondary GPT Task to validate/rephrase the answer
   c. Route to HITL handoff
5. Failed queries auto-captured in "Unanswered Questions" admin section
6. Self-learning loop: human resolutions fed back into KB
```

**Crawler limitation**: Tiledesk's URL crawler cannot extract content from JavaScript-rendered pages. Use plain text uploads or structured FAQ CSVs for JS-heavy sites.

### LLM Failures (ChatGPT Task)

```
- Timeout or invalid response → Default Fallback block catches it
- Default Fallback = global safety net for any unrecognized intent or failed AI task
- From Default Fallback → route to HITL or generic recovery message
```

### Global vs Per-Block Error Strategy

| Level | Mechanism | Use For |
|---|---|---|
| Per-block | Success/Failure connectors on each block | Granular recovery, local retries, data correction |
| Global | Default Fallback block | Catch-all for unhandled states, LLM failures |
| Ultimate | HITL Handoff | Complex/ambiguous cases, high-value leads, unresolvable queries |

### HITL as Final Safety Net

When the bot hits a dead-end, HITL fires with:
- Full `context.attributes` (all captured data)
- Complete message history
- Department or agent routing
- Push notification + email to agent

The human agent picks up exactly where the bot left off — no repeated questions.

---

## 8. Convex Implementation Guide

### Store Bot Flows in Convex

```typescript
// convex/schema.ts
botFlows: defineTable({
  orgId: v.string(),          // Clerk org — multi-tenant isolation
  botId: v.string(),
  slug: v.string(),           // used by Replace Bot action
  version: v.string(),
  nodes: v.array(v.any()),    // full JSON node array
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_slug", ["orgId", "slug"]),
```

### Store Conversation Execution State

```typescript
// convex/schema.ts
conversations: defineTable({
  orgId: v.string(),
  status: v.union(v.literal(100), v.literal(200), v.literal(1000)),
  currentNodeId: v.optional(v.string()),   // pointer for resumption
  botId: v.optional(v.string()),
  attributes: v.any(),                      // context.attributes object
  participants: v.array(v.string()),
  leadId: v.id("leads"),
  deptId: v.optional(v.id("departments")),
  firstText: v.optional(v.string()),
  tags: v.array(v.string()),
})
  .index("by_org", ["orgId"])
  .index("by_status", ["orgId", "status"]),
```

### Execution Engine (Convex Action)

```typescript
// convex/bot.ts
export const executeNextBlock = action({
  args: {
    conversationId: v.id("conversations"),
    incomingMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch conversation state (replaces Redis pointer lookup)
    const conversation = await ctx.runQuery(api.conversations.get, {
      id: args.conversationId
    });

    // 2. Fetch bot flow
    const flow = await ctx.runQuery(api.botFlows.getByBotId, {
      botId: conversation.botId
    });

    // 3. Find current node
    const currentNode = flow.nodes.find(
      n => n._id === conversation.currentNodeId
    ) ?? flow.nodes[0]; // start node if no pointer

    // 4. Execute each action in the node sequentially
    let attributes = { ...conversation.attributes };
    let nextNodeId = currentNode.nextBlock;

    for (const action of currentNode.actions) {
      const result = await executeAction(ctx, action, attributes, args.incomingMessage);
      attributes = { ...attributes, ...result.newAttributes };
      if (result.nextNodeId) nextNodeId = result.nextNodeId; // condition override
      if (result.suspend) {
        // capture_user_reply — save pointer and stop
        await ctx.runMutation(api.conversations.updateState, {
          id: args.conversationId,
          currentNodeId: currentNode._id,
          attributes,
        });
        return;
      }
    }

    // 5. Advance to next node
    await ctx.runMutation(api.conversations.updateState, {
      id: args.conversationId,
      currentNodeId: nextNodeId,
      attributes,
    });

    // 6. Continue traversal if next node doesn't require user input
    const nextNode = flow.nodes.find(n => n._id === nextNodeId);
    const requiresInput = nextNode?.actions.some(a => a._type === "capture_user_reply");
    if (!requiresInput && nextNodeId) {
      await ctx.runAction(api.bot.executeNextBlock, {
        conversationId: args.conversationId,
        incomingMessage: "",
      });
    }
  }
});
```

### Block Execution Switch

```typescript
async function executeAction(ctx, action, attributes, userMessage) {
  switch (action._type) {
    case "reply":
      // interpolate {{variables}}, send message
      const text = interpolate(action.text, attributes);
      await ctx.runMutation(api.messages.create, { text, type: "bot" });
      return { newAttributes: {} };

    case "capture_user_reply":
      // save user message to specified attribute, suspend
      return {
        newAttributes: { [action.attribute]: userMessage },
        suspend: true,
      };

    case "set_attribute":
      return {
        newAttributes: { [action.key]: evaluateExpression(action.value, attributes) }
      };

    case "condition":
      const result = evaluateCondition(action.expression, attributes);
      return {
        newAttributes: {},
        nextNodeId: result ? action.truePath : action.falsePath,
      };

    case "chatgpt_task":
      const prompt = interpolate(action.prompt, attributes);
      const llmResponse = await callLLM(prompt);
      const parsed = tryParseJSON(llmResponse); // auto-map if JSON
      return {
        newAttributes: parsed
          ? parsed                                    // flat map all keys
          : { [action.assignTo ?? "gpt_reply"]: llmResponse }
      };

    case "ask_kb":
      const answer = await queryKnowledgeBase(action.query, action.kbs, attributes);
      if (!answer) return { newAttributes: {}, nextNodeId: action.elsePath };
      return { newAttributes: { gpt_reply: answer } };

    case "web_request":
      const response = await fetch(interpolate(action.url, attributes), {
        method: action.method,
        body: action.body ? JSON.stringify(interpolateObject(action.body, attributes)) : undefined,
      });
      if (!response.ok) return { newAttributes: {}, nextNodeId: action.failurePath };
      const data = await response.json();
      return { newAttributes: { api_results: JSON.stringify(data) } };

    case "replace_bot":
      const newBot = await ctx.runQuery(api.botFlows.getBySlug, { slug: action.slug });
      await ctx.runMutation(api.conversations.updateState, {
        botId: newBot.botId,
        currentNodeId: null, // reset to new bot's start
        attributes,          // preserve all attributes
      });
      return { newAttributes: {} };

    case "hitl_handoff":
      await ctx.runMutation(api.conversations.updateState, {
        status: 100,         // back to unassigned pool
        botId: null,
      });
      await ctx.runAction(api.routing.assignAgent, { conversationId, deptId: action.deptId });
      return { newAttributes: {}, suspend: true };
  }
}
```

### Variable Interpolation Helper

```typescript
function interpolate(template: string, attributes: Record<string, any>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], attributes) ?? '';
  });
}
```

---

*This reference covers the complete Design Studio and execution engine. Use it as the spec — every block type, state transition, error path, and Convex implementation pattern is documented above.*
