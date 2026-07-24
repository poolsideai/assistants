import { beforeEach, describe, expect, it, vi } from "vitest";
import { rpc } from "../rpc/client";
import { trackClick } from "./interactions";

vi.mock("../rpc/client", () => ({
  rpc: {
    reportEvent: vi.fn(),
  },
}));

vi.mock("../ConversationManager", () => ({
  getLastMessage: vi.fn(() => ({
    conversation_id: "conv-123",
    id: "msg-456",
  })),
  isCurrentConversationAgentic: {
    subscribe: vi.fn(),
  },
}));

vi.mock("svelte/store", () => ({
  get: vi.fn(() => true),
}));

describe("trackClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches click handler and reports telemetry", async () => {
    const node = document.createElement("button");
    const action = trackClick(node, { target: "clipboard_copy" });

    node.click();

    await waitForMicrotasks();

    expect(rpc.reportEvent).toHaveBeenCalledWith("user_interaction", {
      interaction_type: "click",
      target: "clipboard_copy",
      conversation_id: "conv-123",
      message_id: "msg-456",
      is_agent_mode: true,
    });

    action?.destroy();
  });

  it("sets telemetry target in dataset", () => {
    const node = document.createElement("button");
    const action = trackClick(node, { target: "clipboard_copy" });

    expect(node.dataset.telemetryTarget).toBe("clipboard_copy");

    action?.destroy();
    expect(node.dataset.telemetryTarget).toBeUndefined();
  });

  it("reports click with data", async () => {
    const node = document.createElement("button");
    const action = trackClick(node, {
      target: "file_diff_toggle",
      data: { additions: 10, deletions: 5 },
    });

    node.click();

    await waitForMicrotasks();

    expect(rpc.reportEvent).toHaveBeenCalledWith("user_interaction", {
      interaction_type: "click",
      target: "file_diff_toggle",
      additions: 10,
      deletions: 5,
      conversation_id: "conv-123",
      message_id: "msg-456",
      is_agent_mode: true,
    });

    action?.destroy();
  });

  it("reports click with function data", async () => {
    const node = document.createElement("button");
    let toolCount = 1;
    const action = trackClick(node, {
      target: "tool_group_expand",
      data: () => ({ tool_count: toolCount }),
    });

    toolCount = 3;
    node.click();

    await waitForMicrotasks();

    expect(rpc.reportEvent).toHaveBeenCalledWith("user_interaction", {
      interaction_type: "click",
      target: "tool_group_expand",
      tool_count: 3,
      conversation_id: "conv-123",
      message_id: "msg-456",
      is_agent_mode: true,
    });

    action?.destroy();
  });

  it("does nothing when options is undefined", () => {
    const node = document.createElement("button");
    const action = trackClick(node, undefined);

    node.click();

    expect(rpc.reportEvent).not.toHaveBeenCalled();

    action?.destroy();
  });
});

async function waitForMicrotasks() {
  return new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
}
