import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import type { SessionEvent } from "../../types";
import Fixture from "./SubagentChatPane.test.svelte";

describe("SubagentChatPane", () => {
  it("renders the delegated prompt as a user bubble above the Claude transcript", async () => {
    render(Fixture, {
      props: {
        events: claudeEvents(),
        subagentKey: "claude:task-auth",
      },
    });

    expect(screen.getByRole("heading", { name: "Auth researcher" })).toBeInTheDocument();
    expect(screen.getByText("Claude subagent")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
    const delegatedPrompt = screen.getByText("Investigate authentication");
    expect(delegatedPrompt.closest(".user-bubble")).not.toBeNull();
    expect(delegatedPrompt.closest(".markdown.user")).not.toBeNull();
    expect(await screen.findByText("The child transcript is here.")).toBeInTheDocument();
  });
});

function claudeEvents(): SessionEvent[] {
  return [
    {
      eventKind: "tool_call",
      toolCallId: "task-auth",
      title: "Research auth",
      status: "in_progress",
      rawInput: { prompt: "Investigate authentication", description: "Auth researcher" },
      _meta: { claudeCode: { toolName: "Task", subagent: true } },
    },
    {
      eventKind: "agent_message",
      messageId: null,
      content: [{ type: "text", text: "The child transcript is here." }],
      _meta: { claudeCode: { parentToolUseId: "task-auth" } },
    },
  ];
}
