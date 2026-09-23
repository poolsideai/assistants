import type { ClientSideConnection, SessionInfoUpdate } from "@agentclientprotocol/sdk";
import { describe, expect, it, vi } from "vitest";
import {
  CODEX_GOAL_CONTROL_METHOD,
  controlCodexGoal,
  parseClaudeGoalCommand,
  parseClaudeGoalUpdate,
  parseCodexGoalUpdate,
} from "./goals";

describe("parseCodexGoalUpdate", () => {
  it("parses the goal snapshot carried by session_info_update", () => {
    expect(
      parseCodexGoalUpdate({
        _meta: {
          codex: {
            goal: {
              objective: "  Land the release  ",
              status: "active",
              tokenBudget: 50_000,
              timeUsedSeconds: 482,
              createdAt: 1_722_500_000,
              controlMethod: CODEX_GOAL_CONTROL_METHOD,
            },
          },
        },
      } as SessionInfoUpdate),
    ).toEqual({
      source: "codex",
      objective: "Land the release",
      status: "active",
      tokenBudget: 50_000,
      timeUsedSeconds: 482,
      createdAt: 1_722_500_000,
      controlMethod: CODEX_GOAL_CONTROL_METHOD,
    });
  });

  it("distinguishes an explicit clear from an unrelated update", () => {
    expect(parseCodexGoalUpdate({ _meta: { codex: { goal: null } } })).toBeNull();
    expect(parseCodexGoalUpdate({ _meta: { codex: { other: true } } })).toBeUndefined();
    expect(parseCodexGoalUpdate({})).toBeUndefined();
  });

  it.each([
    { objective: "", status: "active" },
    { objective: "Do the work", status: "unknown" },
    { objective: "Do the work" },
  ])("ignores malformed goal snapshots", (goal) => {
    expect(parseCodexGoalUpdate({ _meta: { codex: { goal } } })).toBeUndefined();
  });
});

describe("parseClaudeGoalUpdate", () => {
  it("parses Claude's active_goal notification", () => {
    expect(
      parseClaudeGoalUpdate({
        sessionId: "s1",
        message: {
          type: "active_goal",
          value: {
            condition: " Get the branch ready ",
            iterations: 3,
            set_at: 1_722_500_000,
            tokens_at_start: 12_400,
            last_reason: "Two tests still fail.",
          },
        },
      }),
    ).toEqual({
      sessionId: "s1",
      goal: {
        source: "claude",
        objective: "Get the branch ready",
        status: "active",
        iterations: 3,
        setAt: 1_722_500_000,
        tokensAtStart: 12_400,
        lastReason: "Two tests still fail.",
      },
    });
  });

  it("parses Claude's explicit goal clear", () => {
    expect(
      parseClaudeGoalUpdate({
        sessionId: "s1",
        message: { type: "active_goal", value: null },
      }),
    ).toEqual({ sessionId: "s1", goal: null });
  });

  it.each([
    {},
    { sessionId: "s1", message: { type: "assistant", value: null } },
    { sessionId: "s1", message: { type: "active_goal" } },
    {
      sessionId: "s1",
      message: { type: "active_goal", value: { condition: "Goal", iterations: 1 } },
    },
  ])("rejects unrelated or malformed Claude messages", (params) => {
    expect(parseClaudeGoalUpdate(params)).toBeNull();
  });
});

describe("parseClaudeGoalCommand", () => {
  it("parses goal setup and clear commands", () => {
    expect(parseClaudeGoalCommand("/goal  Land the release  ")).toEqual({
      action: "set",
      objective: "Land the release",
    });
    expect(parseClaudeGoalCommand(" /goal clear ")).toEqual({ action: "clear" });
  });

  it.each(["/goal", "/goal   ", "/goals Land the release", "please /goal now"])(
    "ignores non-mutating or unrelated input: %s",
    (text) => {
      expect(parseClaudeGoalCommand(text)).toBeNull();
    },
  );
});

describe("controlCodexGoal", () => {
  it("sends the native goal control request through the ACP connection", async () => {
    const request = vi.fn().mockResolvedValue({});
    const conn = { request } as unknown as ClientSideConnection;

    await controlCodexGoal(conn, { sessionId: "s1", action: "pause" });

    expect(request).toHaveBeenCalledWith(CODEX_GOAL_CONTROL_METHOD, {
      sessionId: "s1",
      action: "pause",
    });
  });
});
