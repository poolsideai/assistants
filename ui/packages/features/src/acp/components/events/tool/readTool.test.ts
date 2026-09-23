import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import { isReadToolCall } from "./readTool";

function tool(fields: Partial<ToolCall>): ToolCall {
  return {
    eventKind: "tool_call",
    toolCallId: "call_123",
    title: "Read utils.ts",
    status: "completed",
    ...fields,
  };
}

describe("read ACP tool override", () => {
  it("claims reads regardless of whether they include output", () => {
    expect(isReadToolCall(tool({ kind: "read" }))).toBe(true);
    expect(
      isReadToolCall(
        tool({ kind: "other", rawOutput: "file contents", _meta: { tool_name: "read" } }),
      ),
    ).toBe(true);
  });

  it("does not claim directory listings, MCP tools, skills, or other tool kinds", () => {
    expect(isReadToolCall(tool({ kind: "read", _meta: { tool_name: "list_directory" } }))).toBe(
      false,
    );
    expect(isReadToolCall(tool({ kind: "read", _meta: { tool_name: "mcp__files__read" } }))).toBe(
      false,
    );
    expect(isReadToolCall(tool({ kind: "read", _meta: { tool_name: "skill" } }))).toBe(false);
    expect(isReadToolCall(tool({ kind: "edit" }))).toBe(false);
  });
});
