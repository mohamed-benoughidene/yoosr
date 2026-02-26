# Build with AI — Feature Documentation

> **Status:** Beta  
> **Feature area:** Design Studio  
> **Session date:** 2026-02-26

---

## Overview

The **Build with AI** feature allows users to generate a complete chatbot flow on the Design Studio canvas by describing it in plain language (English or Arabic). Instead of manually dragging, connecting, and configuring nodes one by one, a user types a description like:

> *"Greet the visitor with two buttons: Sales and Support, then hand off to an agent."*

…and the canvas is populated with fully-configured, connected nodes automatically.

---

## Architecture

### Backend — `convex/aiFlowBuilder.ts`

A Convex **action** (`generateFlow`) that:

1. Takes a `prompt: string` argument from the client.
2. Sends the prompt to an LLM via OpenRouter using the existing `callAITask` helper (`convex/openrouter.ts`).
3. Parses the JSON response into `{ nodes, edges }` arrays compatible with React Flow.
4. Returns the result to the client.

**Model used:** `openrouter/free` — OpenRouter's free routing tier, which automatically picks from available free models.

**Timeout:** The action races against a 30-second `Promise` timeout so it never hangs indefinitely. If it exceeds 30 s it throws `"AI timed out after 30s — try again"`.

```typescript
const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("AI timed out after 30s — try again")), 30_000)
);
const result = await Promise.race([
    callAITask(SYSTEM_PROMPT, args.prompt, "openrouter/free"),
    timeout,
]);
```

**Defensive JSON parsing:** The raw LLM response is stripped of markdown fences (` ```json `) before parsing. If direct `JSON.parse` fails, a regex extracts the first `{...}` block as a fallback.

---

## System Prompt

The system prompt (`SYSTEM_PROMPT` constant) is the core of the feature. It instructs the LLM to:

- Output **only** a raw JSON object with `nodes` and `edges` arrays — no markdown, no explanations.
- Map every sentence or step in the user's description to exactly **one** node, **in order** — never skip, never combine.
- Use only the **registered node types** of this Design Studio (detailed below).
- Apply layout rules so nodes are positioned correctly on the canvas.

### Available Node Types & Full Data Shapes

| Type | Purpose | Key `data` fields |
|---|---|---|
| `start` | First node, always required | `label` |
| `reply` | Send a message, optionally with buttons | `label`, `text`, `textVariations[]`, `buttons[]` |
| `capture_user_reply` | Wait for user input, save to variable | `label`, `attribute` |
| `condition` | Branch on a saved attribute | `label`, `attributeKey`, `operator`, `compareValue` |
| `hitlHandoff` | Transfer to human agent (terminal) | `label`, `handoffMessage` |
| `close` | End the conversation (terminal) | `label`, `closingMessage` |
| `wait` | Pause execution | `label`, `delaySeconds` |
| `setAttribute` | Set a variable | `label`, `attributeKey`, `attributeValue` |
| `aiTask` | Run an LLM sub-task | `label`, `prompt`, `systemPrompt`, `userInput`, `outputVariable`, `model` |
| `ai_assistant` | Multi-turn AI conversation | `label`, `systemPrompt`, `model`, `maxTurns`, `assignTo` |
| `ask_kb` | Search knowledge base (branches on found/not-found) | `label`, `query`, `assignTo` |
| `webRequest` | HTTP call | `label`, `method`, `url`, `responseVariable` |
| `code_action` | Evaluate a JS expression | `label`, `expression`, `assignTo` |
| `replace_bot` | Switch to another bot | `label`, `slug` |

**Buttons on `reply` nodes:**
```json
"buttons": [
  { "label": "Sales", "value": "sales", "type": "text" },
  { "label": "Support", "value": "support", "type": "text" }
]
```

**Branching nodes** (`condition`, `ask_kb`) require two outgoing edges with `sourceHandle: "true"` and `sourceHandle: "false"`.

### Layout Rules

- Start node: `x=250, y=50`
- Each sequential step: `y += 180`, `x = 250`
- Condition `true`-branch: `x=80`; `false`-branch: `x=420`
- After a branch rejoins: resume `x=250`, continue `y` from the deepest branch point

---

## Frontend Components

### `AIPromptBar` — `src/components/design-studio/AIPromptBar.tsx`

A floating input bar positioned at the **bottom center** of the Design Studio canvas. It is the primary UI for the feature.

**Structure:**
```
[ 📖 Examples ] | [ prompt input ............ ] [ ✨ Generate ]
                         ↑ Beta badge (amber pill, top-right)
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `onGenerate` | `(nodes, edges) => void` | Called when a flow is successfully generated |
| `visible` | `boolean` (default `true`) | Completely hides/shows the bar |

**Behaviour:**
- Typing and pressing **Enter** (or clicking Generate) triggers generation.
- Shows a spinner on the Generate button while generating.
- On success: calls `onGenerate`, clears the input, shows a `sonner` success toast.
- On error: parses the Convex error message (stripping the `[CONVEX A(...)] Server Error` prefix) and maps it to a user-friendly toast:

| Error pattern | Toast title | Description shown |
|---|---|---|
| `timed out` | Request timed out | "The AI took too long to respond. Try again in a moment." |
| `invalid json` | Unexpected AI response | "The AI returned an unreadable format. Try rephrasing your prompt." |
| `provider returned error` | AI provider error | "The model returned an error. Try again or rephrase your prompt." |
| `missing required nodes` | Incomplete response | "The AI didn't return a valid flow. Try a more specific description." |
| anything else | Generation failed | cleaned raw message |

**Example prompts (built into the popover):**

1. **Greeting with buttons** — `Greet the visitor with 2 buttons: Sales and Support, then hand off to an agent.`
2. **Lead capture** — `Welcome the visitor, ask for their name, then ask for their email, then close the conversation with a thank-you message.`
3. **Customer check** — `Greet the user, ask for their name, then check if the attribute 'is_customer' equals 'yes' — if yes hand off to an agent, if no close the conversation.`
4. **Knowledge base lookup** — `Ask the visitor their question and search the knowledge base — if an answer is found, reply with it and close; if not, hand off to a human agent.`
5. **AI assistant flow** — `Greet the visitor, then let an AI assistant handle the conversation for up to 5 turns and save the reply, then close the conversation.`

---

### `FlowToolbar` — `src/components/design-studio/FlowToolbar.tsx`

The top toolbar of the Design Studio. Two props were added:

| Prop | Type | Description |
|---|---|---|
| `isAIBarOpen` | `boolean` | Whether the bar is currently visible (used to highlight the button) |
| `onToggleAIBar` | `() => void` | Toggles visibility of the AI prompt bar |

The **✨ Build with AI** button appears between the Save button and the Debugger button. It uses `variant="secondary"` when the bar is open and `variant="outline"` when closed, giving clear visual feedback.

---

### Design Studio Page — `src/app/design-studio/[botId]/page.tsx`

The orchestrator. Key state added:

```typescript
const [isAIBarOpen, setIsAIBarOpen]   = useState(false);      // bar starts hidden
const [flowEditorKey, setFlowEditorKey] = useState(0);         // forces FlowEditor re-mount
const [generatedFlow, setGeneratedFlow] = useState<...>(null); // AI-generated nodes/edges
```

**`handleGeneratedFlow`** — the central sanitization function that runs before any AI-generated data reaches React Flow:

```typescript
const handleGeneratedFlow = useCallback((nodes, edges) => {
    // 1. Normalize node type (maps AI mistakes to valid registered types)
    // 2. Guarantee position (fallback: vertical cascade x=250, y=50+index*180)
    // 3. Guarantee data object (fallback: { label: type })
    // 4. Guarantee id (fallback: "node-{index}")
    setGeneratedFlow({ nodes: safeNodes, edges });
    setFlowEditorKey(k => k + 1); // re-mounts FlowEditor with clean state
}, []);
```

**Type normalization map** — covers ~25 common AI naming mistakes:

```typescript
const TYPE_MAP = {
    greeting: "reply",  message: "reply",    text: "reply",
    input: "capture_user_reply",             capture: "capture_user_reply",
    handoff: "hitlHandoff",                  escalate: "hitlHandoff",
    end: "close",        finish: "close",
    if: "condition",     branch: "condition", decision: "condition",
    delay: "wait",       set: "setAttribute",
    ai: "aiTask",        kb: "ask_kb",        search: "ask_kb",
    // ... more
};
```

Any type that is still unrecognized after mapping falls back to `"reply"` so React Flow always renders a proper custom node instead of a plain white box.

---

## Data Flow

```
User types prompt
       │
       ▼
AIPromptBar.handleGenerate()
       │  useAction(api.aiFlowBuilder.generateFlow)
       ▼
[Convex Action] aiFlowBuilder.ts
       │  callAITask(SYSTEM_PROMPT, prompt, "openrouter/free")
       │  Promise.race([aiCall, 30s timeout])
       ▼
OpenRouter API → LLM → JSON response
       │  stripFences() + JSON.parse()
       ▼
{ nodes: [...], edges: [...] }
       │  returned to client
       ▼
handleGeneratedFlow() in page.tsx
       │  normalizeType() + position guard + data guard + id guard
       ▼
setGeneratedFlow() + setFlowEditorKey(k+1)
       │  FlowEditor re-mounts with clean sanitized data
       ▼
ReactFlow canvas renders the generated flow
```

---

## Files Modified / Created

| File | Status | Description |
|---|---|---|
| `convex/aiFlowBuilder.ts` | **NEW** | Convex action with system prompt, AI call, timeout, and JSON parsing |
| `src/components/design-studio/AIPromptBar.tsx` | **NEW** | Floating prompt bar with examples popover, Beta badge, error handling |
| `src/components/design-studio/FlowToolbar.tsx` | **MODIFIED** | Added `isAIBarOpen` / `onToggleAIBar` props and the ✨ Build with AI button |
| `src/app/design-studio/[botId]/page.tsx` | **MODIFIED** | Added `isAIBarOpen`, `generatedFlow`, `flowEditorKey` states; `handleGeneratedFlow` with full node sanitization |

---

## Known Limitations (Beta)

- **`openrouter/free` is non-deterministic** — it routes to whichever free model is available. Some models follow the system prompt more faithfully than others. Results may vary between requests.
- **Generation replaces the entire canvas** — there is no partial or incremental edit mode. Each submission fully replaces the current flow.
- **No undo for generation** — replacing unsaved work is permanent. Users should save before generating if they want to keep the current flow.
- **Complex flows may be truncated** — very long descriptions with many steps may exceed the model's reliable instruction-following capability. Break complex flows into smaller generation requests and connect them manually.
- **Language support** — the input bar supports Arabic (`dir="auto"`), but the system prompt is in English. Arabic descriptions generally work well; the LLM infers intent and still uses English in the `label`/`text` fields of generated nodes.
