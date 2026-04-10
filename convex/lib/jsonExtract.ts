/**
 * Robust JSON extraction from LLM responses.
 *
 * LLMs often wrap JSON in markdown fences, preamble text, or add trailing commas.
 * This utility extracts the first valid JSON object by tracking bracket nesting depth,
 * handling all common edge cases.
 */

/**
 * Extracts the first valid JSON object from a string by tracking bracket nesting depth.
 *
 * Handles:
 * - Preamble text before JSON ("Here is the result:\n{...}")
 * - Markdown fences ("```json\n{...}\n```")
 * - Trailing commas ("{"a": 1,}")
 * - Nested objects and arrays
 * - Multiple JSON blocks (returns the first valid one)
 *
 * @param text - The raw LLM response string
 * @returns The parsed JSON value
 * @throws Error if no valid JSON object is found
 */
export function extractJsonObject(text: string): unknown {
  // Step 1: Remove markdown fences if present
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Step 2: Find the outermost { ... } by tracking nesting depth
  let depth = 0;
  let start = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          // Found a complete JSON block
          let candidate = text.slice(start, i + 1);
          // Strip trailing commas (invalid JSON)
          candidate = candidate.replace(/,\s*([}\]])/g, "$1");
          try {
            return JSON.parse(candidate);
          } catch {
            // Try next block
            start = -1;
          }
        }
      }
    }
  }

  throw new Error("No valid JSON object found in response");
}
