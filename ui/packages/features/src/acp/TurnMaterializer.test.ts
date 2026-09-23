import type { SessionUpdate } from "@agentclientprotocol/sdk";
import { describe, expect, it } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  USER_MESSAGE_END_BOUNDARY,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  MAX_AGENT_THOUGHT_CONTENT_BYTES,
  MAX_AGENT_THOUGHT_TEXT_CHARS,
  TurnMaterializer,
  type SessionEvent,
} from "./TurnMaterializer";

function textChunk(
  sessionUpdate: "user_message_chunk" | "agent_message_chunk" | "agent_thought_chunk",
  text: string,
  messageId?: string | null,
  meta?: Record<string, unknown>,
): SessionUpdate {
  return {
    sessionUpdate,
    content: { type: "text", text },
    ...(messageId !== undefined ? { messageId } : {}),
    ...(meta !== undefined ? { _meta: meta } : {}),
  } as SessionUpdate;
}

function imageChunk(
  sessionUpdate: "user_message_chunk" | "agent_message_chunk" | "agent_thought_chunk",
  data: string,
  messageId?: string | null,
): SessionUpdate {
  return {
    sessionUpdate,
    content: { type: "image", data, mimeType: "image/png" },
    ...(messageId !== undefined ? { messageId } : {}),
  } as SessionUpdate;
}

function toolCall(toolCallId: string, title: string): SessionUpdate {
  return { sessionUpdate: "tool_call", toolCallId, title } as SessionUpdate;
}

function toolCallUpdate(toolCallId: string, fields: Record<string, unknown>): SessionUpdate {
  return { sessionUpdate: "tool_call_update", toolCallId, ...fields } as SessionUpdate;
}

function plan(
  entries: Array<{ content: string; priority: string; status: string }>,
): SessionUpdate {
  return { sessionUpdate: "plan", entries } as SessionUpdate;
}

function modeUpdate(currentModeId: string): SessionUpdate {
  return { sessionUpdate: "current_mode_update", currentModeId } as SessionUpdate;
}

function applyAll(updates: SessionUpdate[]): readonly SessionEvent[] {
  const m = new TurnMaterializer();
  for (const u of updates) m.apply(u);
  return m.events;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("TurnMaterializer", () => {
  it("starts with empty items", () => {
    const m = new TurnMaterializer();
    expect(m.events).toEqual([]);
  });

  it("materializes a single text chunk into one message", () => {
    const items = applyAll([textChunk("agent_message_chunk", "hello")]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      eventKind: "agent_message",
      content: [{ type: "text", text: "hello" }],
    });
  });

  it("preserves message metadata and keeps parallel Claude subagent streams separate", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "alpha ", null, {
        claudeCode: { parentToolUseId: "task-a" },
      }),
      textChunk("agent_message_chunk", "bravo", null, {
        claudeCode: { parentToolUseId: "task-b" },
      }),
      textChunk("agent_message_chunk", "done", null, {
        claudeCode: { parentToolUseId: "task-a", phase: "complete" },
      }),
    ]);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      content: [{ type: "text", text: "alpha " }],
      _meta: { claudeCode: { parentToolUseId: "task-a" } },
    });
    expect(items[1]).toMatchObject({
      content: [{ type: "text", text: "bravo" }],
      _meta: { claudeCode: { parentToolUseId: "task-b" } },
    });
    expect(items[2]).toMatchObject({
      content: [{ type: "text", text: "done" }],
      _meta: { claudeCode: { parentToolUseId: "task-a", phase: "complete" } },
    });
  });

  it("merges metadata on chunks from the same Claude subagent message", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "alpha ", "message-a", {
        claudeCode: { parentToolUseId: "task-a", phase: "running" },
      }),
      textChunk("agent_message_chunk", "done", "message-a", {
        claudeCode: { parentToolUseId: "task-a", phase: "complete" },
      }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      content: [{ type: "text", text: "alpha done" }],
      _meta: { claudeCode: { parentToolUseId: "task-a", phase: "complete" } },
    });
  });

  it("keeps an explicit message attached when later chunks omit metadata", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "alpha ", "message-a", {
        claudeCode: { parentToolUseId: "task-a" },
      }),
      textChunk("agent_message_chunk", "done", "message-a"),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      content: [{ type: "text", text: "alpha done" }],
      _meta: { claudeCode: { parentToolUseId: "task-a" } },
    });
  });

  it("marks steering user chunks without marking ordinary user messages", () => {
    const items = applyAll([
      textChunk("user_message_chunk", "initial prompt", "u1"),
      textChunk("user_message_chunk", "focus on tests", "u2", {
        "poolside/steer": true,
      }),
    ]);

    expect(items[0]).toMatchObject({
      eventKind: "user_message",
      messageId: "u1",
    });
    expect(items[0]).not.toHaveProperty("steer");
    expect(items[1]).toMatchObject({
      eventKind: "user_message",
      messageId: "u2",
      steer: true,
    });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("drops replayed handoff context user chunks", () => {
    const m = new TurnMaterializer();
    m.apply(textChunk("user_message_chunk", "hello", "m1"));
    m.apply({
      sessionUpdate: "user_message_chunk",
      messageId: "m1",
      content: {
        type: "resource",
        resource: {
          uri: "poolside://handoff/source-session.md",
          mimeType: "text/markdown",
          text: "<poolside-handoff>\nprior transcript\n</poolside-handoff>",
        },
      },
    } as SessionUpdate);

    expect(m.events).toHaveLength(1);
    expect(m.events[0]).toMatchObject({
      eventKind: "user_message",
      messageId: "m1",
      content: [{ type: "text", text: "hello" }],
    });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          `raw prefix ${USER_MESSAGE_START_BOUNDARY}What is 2 plus 2?${USER_MESSAGE_END_BOUNDARY}poolside://host-context.md`,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("concatenates two text chunks with the same messageId", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "hel", "m1"),
      textChunk("agent_message_chunk", "lo", "m1"),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      eventKind: "agent_message",
      messageId: "m1",
      content: [{ type: "text", text: "hello" }],
    });
  });

  it("keeps text and image as separate content blocks in same message", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "see image:", "m1"),
      imageChunk("agent_message_chunk", "abc123", "m1"),
    ]);
    expect(items).toHaveLength(1);
    const msg = items[0] as SessionEvent & { eventKind: "agent_message" };
    expect(msg.content).toHaveLength(2);
    expect(msg.content[0]).toMatchObject({ type: "text", text: "see image:" });
    expect(msg.content[1]).toMatchObject({ type: "image", data: "abc123" });
  });

  it("creates separate messages for different messageIds", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "first", "m1"),
      textChunk("agent_message_chunk", "second", "m2"),
    ]);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ messageId: "m1", content: [{ text: "first" }] });
    expect(items[1]).toMatchObject({ messageId: "m2", content: [{ text: "second" }] });
  });

  it("uses poolside/step_id as the message identity when messageId is absent", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "hel", undefined, { "poolside/step_id": "step-1" }),
      textChunk("agent_message_chunk", "lo", undefined, { "poolside/step_id": "step-1" }),
      textChunk("agent_message_chunk", "new", undefined, { "poolside/step_id": "step-2" }),
    ]);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      eventKind: "agent_message",
      messageId: "step-1",
      content: [{ type: "text", text: "hello" }],
    });
    expect(items[1]).toMatchObject({
      eventKind: "agent_message",
      messageId: "step-2",
      content: [{ type: "text", text: "new" }],
    });
  });

  it("groups null messageId chunks when contiguous, breaks on tool call", () => {
    const items = applyAll([
      textChunk("agent_message_chunk", "a"),
      textChunk("agent_message_chunk", "b"),
      toolCall("tc1", "Run test"),
      textChunk("agent_message_chunk", "c"),
    ]);
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      eventKind: "agent_message",
      messageId: null,
      content: [{ type: "text", text: "ab" }],
    });
    expect(items[1]).toMatchObject({ eventKind: "tool_call" });
    expect(items[2]).toMatchObject({
      eventKind: "agent_message",
      messageId: null,
      content: [{ type: "text", text: "c" }],
    });
  });

  it("merges tool_call_update into existing tool call", () => {
    const items = applyAll([
      toolCall("tc1", "Read file"),
      toolCallUpdate("tc1", { status: "completed", title: "Read file (done)" }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      eventKind: "tool_call",
      toolCallId: "tc1",
      title: "Read file (done)",
      status: "completed",
    });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("completes open tool calls when a turn is finalized", () => {
    const m = new TurnMaterializer();
    m.apply(toolCall("tc1", "Generate image"));
    m.apply(toolCallUpdate("tc1", { status: "in_progress" }));
    m.apply(toolCall("tc2", "Read file"));
    m.apply(toolCallUpdate("tc2", { status: "failed" }));

    m.completeOpenToolCalls();

    expect(m.events[0]).toMatchObject({ toolCallId: "tc1", status: "completed" });
    expect(m.events[1]).toMatchObject({ toolCallId: "tc2", status: "failed" });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(m.currentTurnStartIndex).toBe(0);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(m.currentTurnStartIndex).toBeNull();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("cancels open tool calls when a turn is cancelled", () => {
    const m = new TurnMaterializer();
    m.apply(toolCall("tc1", "Generate image"));
    m.apply(toolCallUpdate("tc1", { status: "in_progress" }));
    m.apply(toolCall("tc2", "Read file"));
    m.apply(toolCallUpdate("tc2", { status: "failed" }));

    m.cancelOpenToolCalls();

    expect(m.events[0]).toMatchObject({ toolCallId: "tc1", status: "cancelled" });
    expect(m.events[1]).toMatchObject({ toolCallId: "tc2", status: "failed" });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("ignores tool_call_update for unknown toolCallId", () => {
    const items = applyAll([toolCallUpdate("unknown", { status: "completed" })]);
    expect(items).toHaveLength(0);
  });

  it("tracks plan separately from events", () => {
    const m = new TurnMaterializer();
    expect(m.plan).toBeNull();

    m.apply(plan([{ content: "step 1", priority: "high", status: "pending" }]));
    expect(m.events).toHaveLength(0);
    expect(m.plan).toMatchObject({
      entries: [{ content: "step 1", status: "pending" }],
    });

    m.apply(
      plan([
        { content: "step 1", priority: "high", status: "completed" },
        { content: "step 2", priority: "medium", status: "in_progress" },
      ]),
    );
    expect(m.events).toHaveLength(0);
    expect(m.plan).toMatchObject({
      entries: [
        { content: "step 1", status: "completed" },
        { content: "step 2", status: "in_progress" },
      ],
    });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("appends mode_change event for current_mode_update", () => {
    const items = applyAll([modeUpdate("code")]);
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ eventKind: "mode_change", currentModeId: "code" });
  });

  it("appends multiple mode_change events (not replace)", () => {
    const items = applyAll([modeUpdate("code"), modeUpdate("debug"), modeUpdate("chat")]);
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({ eventKind: "mode_change", currentModeId: "code" });
    expect(items[1]).toEqual({ eventKind: "mode_change", currentModeId: "debug" });
    expect(items[2]).toEqual({ eventKind: "mode_change", currentModeId: "chat" });
  });

  it("excludes session-level updates from output", () => {
    const items = applyAll([
      { sessionUpdate: "config_option_update", configOptions: [] } as SessionUpdate,
      { sessionUpdate: "usage_update", size: 100, used: 50 } as SessionUpdate,
      { sessionUpdate: "session_info_update", title: "test" } as SessionUpdate,
      { sessionUpdate: "available_commands_update", availableCommands: [] } as SessionUpdate,
    ]);
    expect(items).toHaveLength(0);
  });

  it("maintains first-appearance order for interleaved items", () => {
    const items = applyAll([
      textChunk("user_message_chunk", "hello", "m1"),
      textChunk("agent_message_chunk", "thinking...", "m2"),
      toolCall("tc1", "Search"),
      toolCallUpdate("tc1", { status: "completed" }),
      textChunk("agent_message_chunk", "done", "m3"),
    ]);
    expect(items.map((i) => i.eventKind)).toEqual([
      "user_message",
      "agent_message",
      "tool_call",
      "agent_message",
    ]);
    expect(items[0]).toMatchObject({ eventKind: "user_message" });
    expect(items[1]).toMatchObject({
      eventKind: "agent_message",
      content: [{ text: "thinking..." }],
    });
    expect(items[2]).toMatchObject({ eventKind: "tool_call", status: "completed" });
    expect(items[3]).toMatchObject({ eventKind: "agent_message", content: [{ text: "done" }] });
  });

  it("handles thought chunks with correct eventKind", () => {
    const items = applyAll([textChunk("agent_thought_chunk", "hmm", "t1")]);
    expect(items[0]).toMatchObject({ eventKind: "agent_thought", messageId: "t1" });
  });

  it("keeps only the newest bounded tail of an oversized thought", () => {
    const items = applyAll([
      textChunk("agent_thought_chunk", "a".repeat(MAX_AGENT_THOUGHT_TEXT_CHARS), "t1"),
      textChunk("agent_thought_chunk", "latest", "t1"),
    ]);
    const thought = items[0];
    expect(thought.eventKind).toBe("agent_thought");
    if (thought.eventKind !== "agent_thought") throw new Error("expected agent_thought");

    const text = thought.content[0];
    expect(text?.type).toBe("text");
    if (text?.type !== "text") throw new Error("expected text");
    expect(text.text).toHaveLength(MAX_AGENT_THOUGHT_TEXT_CHARS);
    expect(text.text.endsWith("latest")).toBe(true);
    expect(thought.truncated).toBe(true);
  });

  it("caps a single oversized thought chunk without affecting assistant messages", () => {
    const oversized = "x".repeat(MAX_AGENT_THOUGHT_TEXT_CHARS + 100);
    const items = applyAll([
      textChunk("agent_thought_chunk", oversized, "t1"),
      textChunk("agent_message_chunk", oversized, "m1"),
    ]);
    const thought = items[0];
    const message = items[1];
    expect(thought).toMatchObject({ eventKind: "agent_thought", truncated: true });
    if (thought.eventKind !== "agent_thought") throw new Error("expected agent_thought");
    expect(thought.content[0]).toMatchObject({ text: "x".repeat(MAX_AGENT_THOUGHT_TEXT_CHARS) });
    expect(message).toMatchObject({
      eventKind: "agent_message",
      content: [{ text: oversized }],
    });
  });

  it("bounds non-text thought blocks without affecting assistant content", () => {
    const imageData = "x".repeat(MAX_AGENT_THOUGHT_CONTENT_BYTES / 4);
    const thoughtChunks = Array.from({ length: 8 }, (_, index) =>
      imageChunk("agent_thought_chunk", `${index}${imageData}`, "t1"),
    );
    const items = applyAll([...thoughtChunks, imageChunk("agent_message_chunk", imageData, "m1")]);
    const thought = items[0];
    const message = items[1];
    expect(thought.eventKind).toBe("agent_thought");
    if (thought.eventKind !== "agent_thought") throw new Error("expected agent_thought");

    expect(thought.truncated).toBe(true);
    expect(thought.content.length).toBeGreaterThan(0);
    expect(thought.content.length).toBeLessThan(thoughtChunks.length);
    expect(thought.content.at(-1)).toMatchObject({ type: "image", data: `7${imageData}` });
    expect(message).toMatchObject({
      eventKind: "agent_message",
      content: [{ type: "image", data: imageData }],
    });
  });

  it("drops an individual non-text thought block larger than the whole budget", () => {
    const items = applyAll([
      imageChunk("agent_thought_chunk", "x".repeat(MAX_AGENT_THOUGHT_CONTENT_BYTES), "t1"),
    ]);

    expect(items[0]).toMatchObject({
      eventKind: "agent_thought",
      content: [],
      truncated: true,
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      const m = new TurnMaterializer();
      m.apply(textChunk("agent_message_chunk", "hello", "m1"));
      m.apply(toolCall("tc1", "Run"));
      m.apply(plan([{ content: "step", priority: "high", status: "pending" }]));
      expect(m.events).toHaveLength(2);
      expect(m.plan).not.toBeNull();

      m.reset();
      expect(m.events).toHaveLength(0);
      expect(m.plan).toBeNull();

      m.apply(textChunk("agent_message_chunk", "fresh", "m2"));
      expect(m.events).toHaveLength(1);
      expect(m.events[0]).toMatchObject({ content: [{ text: "fresh" }] });
    });

    it("does not merge with pre-reset messages", () => {
      const m = new TurnMaterializer();
      m.apply(textChunk("agent_message_chunk", "old", "m1"));
      m.reset();
      m.apply(textChunk("agent_message_chunk", "new", "m1"));
      expect(m.events).toHaveLength(1);
      expect(m.events[0]).toMatchObject({ content: [{ text: "new" }] });
    });
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
});
