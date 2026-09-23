import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import type { SessionEvent, ToolCall } from "../../../types";
import { ToolCallExpansionState } from "../../SessionEventsState.svelte";
import Fixture from "./SubagentToolCall.fixture.svelte";

describe("SubagentToolCall", () => {
  it("opens Claude transcripts but keeps Codex activity non-interactive", async () => {
    const onOpen = vi.fn();
    const claude = render(Fixture, {
      props: { events: claudeEvents(), eventId: "task-auth", turnActive: true, onOpen },
    });

    const openTranscript = screen.getByRole("button", {
      name: "Open subagent transcript: Auth researcher, Running",
    });
    expect(within(openTranscript).getByText("Running")).toBeInTheDocument();
    await fireEvent.click(openTranscript);
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "claude:task-auth",
        provider: "claude",
        title: "Auth researcher",
      }),
    );

    claude.unmount();
    render(Fixture, {
      props: { events: codexEvents("completed"), eventId: "spawn-codex", onOpen },
    });

    expect(screen.getByLabelText("Started Codex researcher: Completed")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Open subagent transcript: Codex researcher/ }),
    ).toBeNull();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("keeps a Pool result behind the row and toggles it open", async () => {
    const onOpen = vi.fn();
    const view = render(Fixture, {
      props: { events: poolEvents("pending"), eventId: "pool-review", turnActive: true, onOpen },
    });

    // Pool never reports in_progress, so a pending call must still read as running.
    expect(screen.getByLabelText("Delegated to Review the plan in PLAN.md: Running")).toBeVisible();
    // Nothing to expand until the subagent reports back.
    expect(screen.queryByRole("button")).toBeNull();

    await view.rerender({
      events: poolEvents("completed"),
      eventId: "pool-review",
      turnActive: false,
    });

    const toggle = await screen.findByRole("button", {
      name: "Delegated to Review the plan in PLAN.md: Completed",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Found three gaps.")).toBeNull();

    await fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("Found three gaps.")).toBeVisible();

    // The disclosure must close again, not be a one-way reveal.
    await fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Found three gaps.")).toBeNull();
    // Pool exposes no child transcript, so the row must never open a tab.
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("keeps a Pool result open across the remount virtualization causes", async () => {
    const expansion = new ToolCallExpansionState();
    const props = { events: poolEvents("completed"), eventId: "pool-review", expansion };
    const first = render(Fixture, { props });

    await fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");

    // Scrolling the row out of the virtualized window and back destroys and
    // recreates the component; the user's choice must not be lost with it.
    first.unmount();
    render(Fixture, { props });

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Found three gaps.")).toBeVisible();
  });

  it("updates a Codex row from running to completed", async () => {
    const events = codexEvents("running");
    const view = render(Fixture, {
      props: { events, eventId: "spawn-codex", turnActive: true },
    });

    expect(screen.getByLabelText("Started Codex researcher: Running")).toBeInTheDocument();

    await view.rerender({
      events: codexEvents("completed"),
      eventId: "spawn-codex",
      turnActive: true,
    });

    expect(await screen.findByLabelText("Started Codex researcher: Completed")).toBeInTheDocument();
    expect(screen.queryByLabelText("Started Codex researcher: Running")).toBeNull();
  });

  it("completes a started-only Codex row when its parent turn settles", async () => {
    const events = codexStartedOnlyEvents();
    const view = render(Fixture, {
      props: { events, eventId: "codex-started", turnActive: true },
    });

    expect(screen.getByLabelText("Subagent cwd_check: Running")).toBeInTheDocument();

    await view.rerender({
      events,
      eventId: "codex-started",
      turnActive: false,
    });

    expect(await screen.findByLabelText("Subagent cwd_check: Completed")).toBeInTheDocument();
    expect(screen.queryByLabelText("Subagent cwd_check: Running")).toBeNull();
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

function poolEvents(status: "pending" | "completed"): SessionEvent[] {
  return [
    {
      eventKind: "tool_call",
      toolCallId: "pool-review",
      title: "Subagent: Review the plan in PLAN.md",
      kind: "other",
      status,
      rawInput: { task: "Review the plan in PLAN.md" },
      _meta: { tool_name: "subagent" },
      ...(status === "completed"
        ? {
            content: [{ type: "content", content: { type: "text", text: "Found three gaps." } }],
            rawOutput: { observation: "Found three gaps." },
          }
        : {}),
    } as ToolCall,
  ];
}

function codexEvents(status: "running" | "completed"): SessionEvent[] {
  const spawn: ToolCall = {
    eventKind: "tool_call",
    toolCallId: "spawn-codex",
    title: "spawnAgent",
    status: status === "running" ? "in_progress" : "completed",
    rawInput: {
      prompt: "Inspect tests",
      receiverThreadIds: ["codex-thread"],
      agentsStates: {
        "codex-thread": {
          status,
          message: status === "completed" ? "Inspection complete." : null,
        },
      },
    },
    _meta: {
      codex: {
        collaboration: {
          tool: "spawnAgent",
          receiverThreadIds: ["codex-thread"],
        },
      },
    },
  };
  return [
    spawn,
    {
      eventKind: "tool_call",
      toolCallId: "codex-started",
      title: "Start subagent Codex researcher",
      status: "completed",
      rawInput: {
        agentThreadId: "codex-thread",
        agentPath: "/root/Codex researcher",
        activityKind: "started",
      },
      _meta: {
        codex: {
          subagent: {
            threadId: "codex-thread",
            path: "/root/Codex researcher",
            activity: "started",
          },
        },
      },
    },
  ];
}

function codexStartedOnlyEvents(): SessionEvent[] {
  return [
    {
      eventKind: "tool_call",
      toolCallId: "codex-started",
      title: "Start subagent cwd_check",
      status: "completed",
      rawInput: {
        agentThreadId: "codex-thread",
        agentPath: "/root/cwd_check",
        activityKind: "started",
      },
      _meta: {
        codex: {
          subagent: {
            threadId: "codex-thread",
            path: "/root/cwd_check",
            activity: "started",
          },
        },
      },
    },
  ];
}
