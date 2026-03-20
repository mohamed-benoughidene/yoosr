# Ask Knowledge Base Block — Upgrade Spec
# SPECS/phase-kb-upgrade.md

## Goal
Upgrade the Ask Knowledge Base block to be self-contained: it searches the KB,
generates an LLM reply using retrieved context, auto-sends it to the widget,
and loops for a configurable number of turns before exiting via Success.
Remove the AI Assistant block entirely.

---

## Scope

### IN
- Add System Prompt field to the KB block config
- Add Max Turns field to the KB block config (integer, min 1)
- KB block auto-sends the LLM-generated reply to the widget (no Reply block needed)
- KB block loops turn-by-turn, waiting for the next user message each turn
- Success exit fires after the last reply is sent (max turns consumed)
- Failure exit fires when KB search returns no relevant results — replaces the
  previous hardcoded handoff; the user connects whatever they want downstream
- Remove AI Assistant block from the block palette and from bot.ts execution engine
- Turn counter stored in conversation bot state (same pattern as other stateful blocks)

### OUT
- No changes to KB schema, embedding pipeline, or vector search logic
- No changes to any other block type
- No changes to how KB sources or knowledge bases are managed
- No UI changes outside the Design Studio block config panel

---

## Block Config (stored in the flow node data)
```ts
{
  knowledgeBaseId: Id<"knowledge_bases">,  // existing — unchanged
  systemPrompt: string,                    // NEW — user-defined LLM behavior guidance
  maxTurns: number,                        // NEW — integer, min 1, default 5
  minRelevanceScore?: number               // existing optional field — unchanged
}
```

---

## Execution Logic (bot.ts)

### Entry
When the bot flow reaches the KB block:
1. Read `botState.kbTurns` from conversation state (initialize to 0 if absent)
2. Wait for user message (same await pattern as Capture User Reply block)

### Per Turn
3. Search KB using the user's message as query
4. If no result above relevance threshold → fire **Failure exit**, stop
5. If result found:
   a. Build LLM prompt:
      - System: `[systemPrompt]\n\nUse the following context to answer:\n[kb chunks]`
      - Messages: last N conversation messages as history (same pattern as AI Assistant)
   b. Call OpenRouter with project's `defaultModel`
   c. Auto-send LLM reply to widget (same mechanism AI Assistant used — no Reply block)
   d. Log token usage via `logTokenUsage`
   e. Increment `botState.kbTurns` by 1
6. If `botState.kbTurns >= maxTurns`:
   - Fire **Success exit** (reply already sent before this)
   - Reset `botState.kbTurns` to 0 in conversation state
7. If `botState.kbTurns < maxTurns`:
   - Loop — wait for next user message (go to step 2)

---

## Exit Points

| Exit | Condition |
|------|-----------|
| Success | Max turns reached, last reply already sent |
| Failure | KB search returned no relevant result on any turn |

---

## Design Studio UI Changes

### Block Config Panel — Ask Knowledge Base
Add two new fields below the existing KB selector:

1. **System Prompt** — multiline textarea
   Label: "System Prompt"
   Placeholder: "You are a helpful support assistant. Answer only based on
   the provided context. Be concise and friendly."

2. **Max Turns** — number input, min 1, default 5
   Label: "Max Turns"
   Helper text: "How many user messages this block handles before exiting via Success."

### Block Palette
- Remove "AI Assistant" block entry from the palette
- Remove its icon, label, and config panel

### Existing Flows with AI Assistant Nodes
- Any flow node with type `aiAssistant` renders a visible error card in the canvas:
  "This block has been removed. Replace it with the Knowledge Base block."
- Do not silently delete or auto-migrate — let the user decide

---

## bot.ts Changes

- Delete the `aiAssistant` case from the block execution switch
- Rewrite the `askKnowledgeBase` case to implement the turn loop above
- Extract a shared `buildKbPrompt(systemPrompt, chunks, history)` helper
- Reuse the existing `callOpenRouter(model, messages)` helper

---

## Acceptance Criteria

1. AI Assistant block no longer appears in the block palette
2. Existing flows with an AI Assistant node show an error card, not a crash
3. KB block config panel shows System Prompt textarea and Max Turns number input
4. Setting Max Turns to 3 and sending 3 messages causes Success exit to fire
   after the third reply is sent
5. If KB returns no result on any turn, Failure exit fires immediately with no
   auto-reply sent — downstream blocks handle it (e.g. handoff, message)
6. LLM reply is auto-sent to widget without a Reply block downstream
7. System Prompt is reflected in the LLM call — changing it changes reply tone
8. Turn counter resets to 0 after Success exit fires
9. Token usage logged per turn via logTokenUsage

---

## Dependencies

- Existing KB search pipeline (searchKnowledgeBase action) must be working
- Existing OpenRouter call helper must be working
- bot.ts must support awaiting user messages (already does — Capture block uses it)

---

## Tasks
(Written after spec is approved and audit is run)