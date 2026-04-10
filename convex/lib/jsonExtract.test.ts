import { describe, it, expect } from "vitest";
import { extractJsonObject } from "./jsonExtract";

describe("extractJsonObject", () => {
  it("handles plain JSON", () => {
    const result = extractJsonObject('{"a": 1, "b": "hello"}');
    expect(result).toEqual({ a: 1, b: "hello" });
  });

  it("handles markdown fences with json tag", () => {
    const result = extractJsonObject('```json\n{"a": 1}\n```');
    expect(result).toEqual({ a: 1 });
  });

  it("handles markdown fences without tag", () => {
    const result = extractJsonObject('```\n{"a": 1}\n```');
    expect(result).toEqual({ a: 1 });
  });

  it("handles preamble text", () => {
    const result = extractJsonObject('Here is the result:\n{"a": 1}');
    expect(result).toEqual({ a: 1 });
  });

  it("handles trailing commas", () => {
    const result = extractJsonObject('{"a": 1, "b": [1, 2,],}');
    expect(result).toEqual({ a: 1, b: [1, 2] });
  });

  it("handles nested objects", () => {
    const result = extractJsonObject('{"outer": {"inner": [1, 2]}}');
    expect(result).toEqual({ outer: { inner: [1, 2] } });
  });

  it("handles multiple JSON blocks (takes first valid)", () => {
    const result = extractJsonObject('{"a": 1}\n{"b": 2}');
    expect(result).toEqual({ a: 1 });
  });

  it("handles escaped quotes inside strings", () => {
    const result = extractJsonObject('{"text": "say \\"hello\\""}');
    expect(result).toEqual({ text: "say \"hello\"" });
  });

  it("handles complex nested structure (nodes/edges pattern)", () => {
    const input = `Sure, here's your flow:

\`\`\`json
{
  "nodes": [
    {"id": "start-1", "type": "start"},
    {"id": "reply-1", "type": "reply", "data": {"text": "Hi!"}}
  ],
  "edges": [
    {"id": "e1", "source": "start-1", "target": "reply-1"}
  ]
}
\`\`\`

Let me know if you need changes!`;

    const result = extractJsonObject(input);
    expect(result).toEqual({
      nodes: [
        { id: "start-1", type: "start" },
        { id: "reply-1", type: "reply", data: { text: "Hi!" } },
      ],
      edges: [
        { id: "e1", source: "start-1", target: "reply-1" },
      ],
    });
  });

  it("throws on no JSON at all", () => {
    expect(() => extractJsonObject("not json at all")).toThrow("No valid JSON object found");
  });

  it("throws on truncated JSON", () => {
    expect(() => extractJsonObject('{"a":')).toThrow("No valid JSON object found");
  });

  it("throws on unclosed string in JSON", () => {
    expect(() => extractJsonObject('{"a": "hello')).toThrow("No valid JSON object found");
  });

  it("handles empty object", () => {
    const result = extractJsonObject("{}");
    expect(result).toEqual({});
  });

  it("handles whitespace around JSON", () => {
    const result = extractJsonObject('  \n\n  {"a": 1}  \n\n  ');
    expect(result).toEqual({ a: 1 });
  });
});
