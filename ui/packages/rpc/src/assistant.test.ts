import { describe, expect, it } from "vitest";
import { appliedSourceNotificationCount, coalesceACPTextChunkNotificationBatch } from "./assistant";

function textChunk(
  text: string,
  sequence: number,
  options: { messageId?: string; sessionId?: string; kind?: string } = {},
) {
  return {
    agentServer: "codex-acp",
    sessionEpoch: "epoch-1",
    sessionSeq: sequence,
    message: {
      jsonrpc: "2.0",
      method: "session/update",
      params: {
        sessionId: options.sessionId ?? "session-1",
        update: {
          sessionUpdate: options.kind ?? "agent_message_chunk",
          content: { type: "text", text },
          messageId: options.messageId ?? "message-1",
        },
      },
    },
  };
}

function chunkText(value: unknown): string | undefined {
  return (value as any)?.message?.params?.update?.content?.text;
}

describe("coalesceACPTextChunkNotificationBatch", () => {
  it("tracks how many source notifications each coalesced message represents", () => {
    const toolUpdate = {
      agentServer: "codex-acp",
      message: {
        jsonrpc: "2.0",
        method: "session/update",
        params: {
          sessionId: "session-1",
          update: { sessionUpdate: "tool_call_update", toolCallId: "tool-1" },
        },
      },
    };

    const result = coalesceACPTextChunkNotificationBatch([
      textChunk("a", 1),
      textChunk("b", 2),
      textChunk("c", 3),
      toolUpdate,
      textChunk("d", 4, { messageId: "message-2" }),
      textChunk("e", 5, { messageId: "message-2" }),
    ]);

    expect(result.sourceCounts).toEqual([3, 1, 2]);
    expect(result.notifications).toHaveLength(3);
    expect(chunkText(result.notifications[0])).toBe("abc");
    expect(result.notifications[1]).toBe(toolUpdate);
    expect(chunkText(result.notifications[2])).toBe("de");
    expect(appliedSourceNotificationCount(result.sourceCounts, 0)).toBe(0);
    expect(appliedSourceNotificationCount(result.sourceCounts, 1)).toBe(3);
    expect(appliedSourceNotificationCount(result.sourceCounts, 2)).toBe(4);
    expect(appliedSourceNotificationCount(result.sourceCounts, 3)).toBe(6);
  });
});
