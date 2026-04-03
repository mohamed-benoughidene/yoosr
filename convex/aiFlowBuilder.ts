/**
 * AI Flow Builder — Convex action
 *
 * Accepts a plain-language prompt and returns { nodes, edges }
 * ready to be loaded directly into React Flow via setNodes / setEdges.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { callAITask } from "./openrouter";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a chatbot flow designer that converts user descriptions into a JSON flow graph.

OUTPUT FORMAT:
- Respond with ONLY a raw JSON object. No markdown fences, no explanation, no extra text.
- The JSON must have exactly two keys: "nodes" (array) and "edges" (array).

CRITICAL — FAITHFULNESS:
- Map every sentence/step in the user's description to exactly one node, in the same order.
- Do NOT skip any step the user mentions.
- Do NOT add steps the user did not mention.
- Do NOT combine two steps into one node.

NODE SCHEMA:
{ "id": string, "type": string, "position": {"x": number, "y": number}, "data": object }

EDGE SCHEMA:
{ "id": string, "source": string, "target": string, "sourceHandle"?: string }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE NODE TYPES — FULL DATA SHAPES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"start"
  data: { "label": "Start" }
  One outgoing edge (no sourceHandle).

"reply"
  Sends a message to the visitor — optionally with quick-reply buttons.
  data: {
    "label": string,
    "text": string,                         // main message text (always include)
    "textVariations"?: string[],            // if the user mentions message variations, list them here
    "buttons"?: [                           // include ONLY when user asks for buttons/options
      { "label": string, "value": string, "type": "text" }
    ]
  }
  One outgoing edge.

"capture_user_reply"
  Waits for the user to type a reply and saves it.
  data: { "label": string, "attribute": string }   // attribute = snake_case variable name
  One outgoing edge.

"condition"
  Branches based on a saved attribute.
  data: {
    "label": string,
    "attributeKey": string,
    "operator": "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan",
    "compareValue": string
  }
  TWO outgoing edges: sourceHandle "true" and sourceHandle "false".

"setAttribute"
  Sets a variable to a value.
  data: { "label": string, "attributeKey": string, "attributeValue": string }
  One outgoing edge.

"hitlHandoff"
  Transfers to a human agent. Terminal node.
  data: { "label": string, "handoffMessage": string }

"close"
  Ends the conversation. Terminal node.
  data: { "label": string, "closingMessage": string }

"wait"
  Pauses execution for N seconds.
  data: { "label": string, "delaySeconds": number }
  One outgoing edge.

"webRequest"
  Makes an HTTP request.
  data: { "label": string, "method": "GET"|"POST"|"PUT"|"DELETE", "url": string, "responseVariable"?: string }
  One outgoing edge.

"aiTask"
  Runs an LLM task and stores output.
  data: { "label": string, "prompt": string, "systemPrompt": string, "userInput": "{{lastUserText}}", "outputVariable": string, "model"?: string }
  One outgoing edge.

"ai_assistant"
  Gives full control to an AI assistant for multi-turn conversation.
  data: { "label": string, "systemPrompt": string, "model"?: string, "maxTurns": number, "assignTo": string }
  One outgoing edge.

"ask_kb"
  Searches the knowledge base.
  data: { "label": string, "query": "{{lastUserText}}", "assignTo": "kb_reply" }
  TWO outgoing edges: sourceHandle "true" (found) and "false" (not found).

"code_action"
  Evaluates a JS expression.
  data: { "label": string, "expression": string, "assignTo": string }
  One outgoing edge.

"replace_bot"
  Switches to another bot by slug.
  data: { "label": string, "slug": string }
  Terminal node.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Start: x=250, y=50
- Each sequential step: y += 180, x = 250
- Condition true-branch: x=80; false-branch: x=420
- After branch rejoins: resume x=250, continue y from deepest branch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLE — "Greet user with two buttons (Sales / Support), then hand off to agent":
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "nodes": [
    { "id": "start-1", "type": "start", "position": {"x":250,"y":50}, "data": {"label":"Start"} },
    { "id": "reply-1", "type": "reply", "position": {"x":250,"y":230}, "data": {
        "label": "Welcome",
        "text": "Hi! How can we help you today?",
        "buttons": [
          { "label": "Sales", "value": "sales", "type": "text" },
          { "label": "Support", "value": "support", "type": "text" }
        ]
    }},
    { "id": "hitl-1", "type": "hitlHandoff", "position": {"x":250,"y":410}, "data": {
        "label": "Hand Off", "handoffMessage": "Connecting you with our team..."
    }}
  ],
  "edges": [
    { "id": "e1", "source": "start-1", "target": "reply-1" },
    { "id": "e2", "source": "reply-1", "target": "hitl-1" }
  ]
}`;

// ─── Helper: strip markdown code fences ───────────────────────────────────────

function stripFences(raw: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

// ─── Action ───────────────────────────────────────────────────────────────────

export const generateFlow = action({
  args: {
    prompt: v.string(),
  },
  handler: async (_ctx, args): Promise<{ nodes: unknown[]; edges: unknown[] }> => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI timed out after 30s — try again")), 30_000)
    );

    const result = await Promise.race([
      callAITask(SYSTEM_PROMPT, args.prompt, "openrouter/free"),
      timeout,
    ]);

    const cleaned = stripFences(result.text);

    let parsed: { nodes: unknown[]; edges: unknown[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to extract the first {...} block in case there's preamble text
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
        }
      } else {
        throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
      }
    }

    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error("AI response missing required nodes/edges arrays");
    }

    return { nodes: parsed.nodes, edges: parsed.edges };
  },
});
