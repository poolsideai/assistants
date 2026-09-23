import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import {
  getCuaReplContent,
  getCuaReplInput,
  getCuaReplMethod,
  isCuaReplToolCall,
} from "./cuaReplTool";

function tool(overrides: Partial<ToolCall> = {}): ToolCall {
  return {
    eventKind: "tool_call",
    toolCallId: "cua-1",
    title: "mcp.cua_repl.js",
    status: "completed",
    ...overrides,
  };
}

describe("cua_repl tool detection", () => {
  it.each(["mcp.cua_repl.js", "cua_repl.js", "mcp__cua_repl__js", "cua_repl__js"])(
    "recognizes %s in titles and metadata",
    (name) => {
      expect(isCuaReplToolCall(tool({ title: name }))).toBe(true);
      expect(
        isCuaReplToolCall(tool({ title: "Inspect checkout", _meta: { tool_name: name } })),
      ).toBe(true);
    },
  );

  it.each(["mcp.cua_repl.js_reset", "mcp__cua_repl__js_reset"])("recognizes resets: %s", (title) =>
    expect(getCuaReplMethod(tool({ title }))).toBe("js_reset"),
  );

  it.each([
    "js",
    "js_reset",
    "mcp.other.js",
    "mcp.cua_repl.other",
    "mcp.custom.cua_repl.js",
    "mcp.cua_repl.js_extra",
    "Inspect cua_repl.js output",
  ])("does not claim unrelated tools: %s", (title) => {
    expect(isCuaReplToolCall(tool({ title }))).toBe(false);
  });

  it("leaves permission denials to the generic renderer", () => {
    expect(
      isCuaReplToolCall(
        tool({ status: "failed", rawOutput: { observation: "user denied computer use" } }),
      ),
    ).toBe(false);
  });
});

describe("cua_repl input", () => {
  it("unwraps live Codex MCP calls and restored history", () => {
    const args = { title: "Inspect checkout", code: "await cua.getState();" };
    for (const rawInput of [
      { server: "cua_repl", tool: "js", arguments: args },
      { name: "mcp__cua_repl__js", arguments: args },
      { name: "mcp__cua_repl__js", arguments: JSON.stringify(args) },
    ]) {
      expect(getCuaReplInput(tool({ rawInput }))).toEqual(args);
    }
  });

  it("reads object and serialized input without changing code whitespace", () => {
    const input = { title: "  Inspect checkout  ", code: "  await cua.getState();\n" };
    for (const rawInput of [input, JSON.stringify(input)]) {
      expect(getCuaReplInput(tool({ rawInput }))).toEqual({
        title: "Inspect checkout",
        code: input.code,
      });
    }
  });

  it.each([null, [], "{incomplete", { title: 123, code: [] }, { title: " ", code: " " }])(
    "tolerates missing or malformed input: %j",
    (rawInput) => {
      const input = getCuaReplInput(tool({ rawInput }));
      expect(input.title).toBeUndefined();
      expect(input.code).toBeUndefined();
    },
  );
});

describe("cua_repl output", () => {
  it("keeps unexpected blocks and errors inspectable without losing valid output", () => {
    const rawOutput = {
      result: {
        content: [
          { type: "text", text: "Partial output" },
          { type: "unknown", value: "future content" },
          { type: "image", data: 123 },
        ],
      },
      error: { message: "Screenshot failed" },
    };
    expect(getCuaReplContent(tool({ rawOutput }))).toEqual([
      { type: "content", content: { type: "text", text: "Partial output" } },
      {
        type: "content",
        content: { type: "text", text: JSON.stringify(rawOutput.result.content[1], null, 2) },
      },
      {
        type: "content",
        content: { type: "text", text: JSON.stringify(rawOutput.result.content[2], null, 2) },
      },
      {
        type: "content",
        content: { type: "text", text: JSON.stringify(rawOutput.error, null, 2) },
      },
    ]);
  });

  it.each([null, "{invalid", { result: null, error: { message: "Failed" } }, { output: "text" }])(
    "leaves unstructured output to the raw fallback: %j",
    (rawOutput) => expect(getCuaReplContent(tool({ rawOutput }))).toEqual([]),
  );
});
