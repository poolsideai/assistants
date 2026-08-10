import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionStreamGate, type StaleSession } from "./sessionStreamGate";

function envelope(seq: number, opts: { epoch?: string; originDevice?: string } = {}) {
  return {
    agentServer: "poolside",
    message: {
      jsonrpc: "2.0",
      method: "session/update",
      params: {
        sessionId: "s1",
        update: {
          sessionUpdate: "agent_message_chunk",
          content: { type: "text", text: `c${seq}` },
        },
      },
    },
    sessionSeq: seq,
    sessionEpoch: opts.epoch ?? "epoch-1",
    ...(opts.originDevice ? { originDevice: opts.originDevice } : {}),
  };
}

describe("SessionStreamGate", () => {
  let stale: StaleSession[];
  let ownDevice: string | null;
  let gate: SessionStreamGate;

  beforeEach(() => {
    vi.useFakeTimers();
    stale = [];
    ownDevice = null;
    gate = new SessionStreamGate({
      onStale: (s) => stale.push(s),
      ownDeviceId: () => ownDevice,
      stallMs: 1000,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes unstamped payloads through", () => {
    expect(gate.admit({ agentServer: "poolside", message: { jsonrpc: "2.0" } })).toBeNull();
    expect(gate.admit("not an object")).toBeNull();
  });

  it("adopts the first stamped event and forwards in-order events", () => {
    expect(gate.admit(envelope(5))).toEqual([envelope(5)]);
    expect(gate.admit(envelope(6))).toEqual([envelope(6)]);
  });

  it("drops duplicates and stale seqs", () => {
    gate.admit(envelope(5));
    expect(gate.admit(envelope(5))).toEqual([]);
    expect(gate.admit(envelope(3))).toEqual([]);
  });

  it("buffers ahead-of-order events and drains them once the gap fills", () => {
    gate.admit(envelope(1));
    expect(gate.admit(envelope(4))).toEqual([]);
    expect(gate.admit(envelope(3))).toEqual([]);
    // 2 arrives (e.g. replayed by resume): 2, 3, 4 all drain in order.
    expect(gate.admit(envelope(2))).toEqual([envelope(2), envelope(3), envelope(4)]);
    expect(stale).toHaveLength(0);
  });

  it("declares the session stale when a gap never fills", () => {
    gate.admit(envelope(1));
    gate.admit(envelope(3));
    vi.advanceTimersByTime(1100);
    expect(stale).toEqual([{ agentServer: "poolside", sessionId: "s1" }]);
    // Until a reload re-arms the cursor, further events are dropped.
    expect(gate.admit(envelope(4))).toEqual([]);
    // The reload's baseline re-arms the stream.
    expect(gate.setBaseline("poolside", "s1", "epoch-1", 5)).toEqual([]);
    expect(gate.admit(envelope(6))).toEqual([envelope(6)]);
  });

  it("declares the session stale on an epoch change (helper restart)", () => {
    gate.admit(envelope(9));
    expect(gate.admit(envelope(1, { epoch: "epoch-2" }))).toEqual([]);
    expect(stale).toEqual([{ agentServer: "poolside", sessionId: "s1" }]);
    // The reload against the new helper run re-arms with the new epoch.
    gate.setBaseline("poolside", "s1", "epoch-2", 1);
    expect(gate.admit(envelope(2, { epoch: "epoch-2" }))).toEqual([
      envelope(2, { epoch: "epoch-2" }),
    ]);
  });

  it("drops this device's own relayed prompt echoes but advances the cursor", () => {
    ownDevice = "dev-a";
    gate.admit(envelope(1));
    expect(gate.admit(envelope(2, { originDevice: "dev-a" }))).toEqual([]);
    // No gap: seq 3 applies immediately.
    expect(gate.admit(envelope(3))).toEqual([envelope(3)]);
    // Another device's relay is forwarded (this device is watching).
    expect(gate.admit(envelope(4, { originDevice: "dev-b" }))).toEqual([
      envelope(4, { originDevice: "dev-b" }),
    ]);
  });

  it("anchors the cursor from a load response and drops the replayed range", () => {
    // Events sneak in while the load response is in flight.
    gate.admit(envelope(7));
    gate.admit(envelope(9));
    // The load's replay covered up to 8: 7 is a duplicate (already applied
    // here), 9 drains as the next live event.
    const drained = gate.setBaseline("poolside", "s1", "epoch-1", 8);
    expect(drained).toEqual([envelope(9)]);
    expect(gate.admit(envelope(9))).toEqual([]);
    expect(gate.admit(envelope(10))).toEqual([envelope(10)]);
  });

  it("reports cursors for resumable sessions only", () => {
    gate.admit(envelope(3));
    gate.markStale("poolside", "s1");
    expect(gate.cursors()).toEqual([]);
    gate.setBaseline("poolside", "s1", "epoch-1", 12);
    expect(gate.cursors()).toEqual([
      { agentServer: "poolside", sessionId: "s1", epoch: "epoch-1", seq: 12 },
    ]);
  });

  it("fires onStale at most once until re-armed", () => {
    gate.admit(envelope(1));
    gate.admit(envelope(5));
    vi.advanceTimersByTime(1100);
    gate.admit(envelope(9, { epoch: "epoch-2" }));
    expect(stale).toHaveLength(1);
  });
});
