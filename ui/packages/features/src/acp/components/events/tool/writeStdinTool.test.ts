import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import {
  getWriteStdinInput,
  getWriteStdinOutput,
  getWriteStdinSessionId,
  isWriteStdinToolCall,
} from "./writeStdinTool";

describe("write_stdin ACP tool override", () => {
  it("matches Codex write_stdin events and extracts session details", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "write_stdin",
      status: "failed",
      rawInput: {
        chars: "\u0003",
        session_id: 82330,
      },
      rawOutput:
        "write_stdin failed: stdin is closed for this session; rerun exec_command with tty=true to keep stdin open",
    } satisfies ToolCall;

    expect(isWriteStdinToolCall(tool)).toBe(true);
    expect(getWriteStdinSessionId(tool)).toBe("82330");
    expect(getWriteStdinInput(tool)).toBe("\u0003");
    expect(getWriteStdinOutput(tool)).toContain("stdin is closed");
  });

  it("does not match other tools", () => {
    expect(
      isWriteStdinToolCall({
        eventKind: "tool_call",
        toolCallId: "call_123",
        title: "exec_command",
        status: "completed",
      } satisfies ToolCall),
    ).toBe(false);
  });
});
