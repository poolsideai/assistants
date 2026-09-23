import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import { getReadImagePath, isReadImageToolCall } from "./readImageTool";

describe("read image ACP tool override", () => {
  it("matches read tools whose path is a previewable image", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Read image",
      kind: "read",
      status: "completed",
      rawInput: { path: "/tmp/cat.png" },
    } satisfies ToolCall;

    expect(isReadImageToolCall(tool)).toBe(true);
    expect(getReadImagePath(tool)).toBe("/tmp/cat.png");
  });

  it("normalizes file URI image paths before previewing", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Read image",
      kind: "read",
      status: "completed",
      rawInput: { path: "file:///tmp/cat.png" },
    } satisfies ToolCall;

    expect(isReadImageToolCall(tool)).toBe(true);
    expect(getReadImagePath(tool)).toBe("/tmp/cat.png");
  });

  it("does not match non-image reads or non-read image tools", () => {
    expect(
      isReadImageToolCall({
        eventKind: "tool_call",
        toolCallId: "call_123",
        title: "Read README.md",
        kind: "read",
        status: "completed",
        rawInput: { path: "/tmp/README.md" },
      } satisfies ToolCall),
    ).toBe(false);

    expect(
      isReadImageToolCall({
        eventKind: "tool_call",
        toolCallId: "call_456",
        title: "Write cat.png",
        kind: "edit",
        status: "completed",
        rawInput: { path: "/tmp/cat.png" },
      } satisfies ToolCall),
    ).toBe(false);
  });
});
