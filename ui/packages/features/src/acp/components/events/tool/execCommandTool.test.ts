import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import {
  getExecCommand,
  getExecOutput,
  isExecCommandToolCall,
  stripWrappingCodeFence,
} from "./execCommandTool";

describe("exec command ACP tool override", () => {
  it("matches Codex exec_command events with parsed command data", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Run",
      kind: "execute",
      status: "completed",
      rawInput: {
        command: ["/bin/zsh", "-lc", "echo acp-tool-override-demo"],
        parsed_cmd: [{ cmd: "echo acp-tool-override-demo", type: "unknown" }],
      },
      rawOutput: {
        stdout: "acp-tool-override-demo\n",
        aggregated_output: "acp-tool-override-demo\n",
      },
    } satisfies ToolCall;

    expect(isExecCommandToolCall(tool)).toBe(true);
    expect(getExecCommand(tool)).toBe("echo acp-tool-override-demo");
    expect(getExecOutput(tool)).toBe("acp-tool-override-demo\n");
  });

  it("does not match generic execute tools without command details", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Run",
      kind: "execute",
      status: "completed",
    } satisfies ToolCall;

    expect(isExecCommandToolCall(tool)).toBe(false);
  });

  it("matches explicit Codex exec_command titles even when kind is omitted", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "exec_command",
      status: "completed",
    } satisfies ToolCall;

    expect(isExecCommandToolCall(tool)).toBe(true);
  });

  it("strips a code fence wrapping the entire output", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "exec_command",
      status: "completed",
      rawOutput: { output: "```console\nTests  940 passed (940)\n```\n" },
    } satisfies ToolCall;

    expect(getExecOutput(tool)).toBe("Tests  940 passed (940)");
  });

  describe("stripWrappingCodeFence", () => {
    it("strips fences with and without an info string", () => {
      expect(stripWrappingCodeFence("```shell\nls -la\n```")).toBe("ls -la");
      expect(stripWrappingCodeFence("```\nls -la\n```")).toBe("ls -la");
      expect(stripWrappingCodeFence("````console\nfour ticks\n````")).toBe("four ticks");
    });

    it("keeps interior lines verbatim, including inner fences", () => {
      expect(stripWrappingCodeFence("```console\na\n\n```inner\nb\n```")).toBe("a\n\n```inner\nb");
    });

    it("leaves two separate fenced blocks alone", () => {
      const twoBlocks = "```console\n$ ls\n```\nnote\n```console\nmore\n```";
      expect(stripWrappingCodeFence(twoBlocks)).toBe(twoBlocks);
    });

    it("leaves output alone when the fence does not wrap all of it", () => {
      const trailing = "```console\nls\n```\nextra";
      expect(stripWrappingCodeFence(trailing)).toBe(trailing);
      const leading = "extra\n```console\nls\n```";
      expect(stripWrappingCodeFence(leading)).toBe(leading);
      const unclosed = "```console\nls";
      expect(stripWrappingCodeFence(unclosed)).toBe(unclosed);
      const shortClosing = "````console\nls\n```";
      expect(stripWrappingCodeFence(shortClosing)).toBe(shortClosing);
      const plain = "ls -la\ntotal 0";
      expect(stripWrappingCodeFence(plain)).toBe(plain);
    });
  });
});
