import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import ToolCallHarness from "./ReadToolCall.test.svelte";

describe("ReadToolCall", () => {
  it("renders only a file link, without file contents or expansion controls", () => {
    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_123",
          title: "Read /repo/src/utils.ts",
          kind: "read",
          status: "completed",
          rawInput: { path: "/repo/src/utils.ts" },
          rawOutput: "raw file body that must stay hidden",
          content: [
            {
              type: "content",
              content: { type: "text", text: "numbered file body that must stay hidden" },
            },
          ],
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "/repo/src/utils.ts" })).toBeInTheDocument();
    expect(screen.queryByText(/file body that must stay hidden/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /expand tool call/i })).not.toBeInTheDocument();
  });
});
