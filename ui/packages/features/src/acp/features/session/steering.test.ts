import type { ClientSideConnection, InitializeResponse } from "@agentclientprotocol/sdk";
import { describe, expect, it, vi } from "vitest";
import {
  ACP_SESSION_STEERING_METHOD,
  sessionSteeringTransport,
  steerSession,
  supportsSessionSteering,
} from "./steering";

describe("ACP session steering", () => {
  it("uses the native extension advertised by Codex or Claude", () => {
    const response = {
      protocolVersion: 1,
      agentCapabilities: {},
      authMethods: [],
      _meta: { steering: { supported: true } },
    } as InitializeResponse;

    expect(sessionSteeringTransport(response)).toEqual({ kind: "extension" });
    expect(supportsSessionSteering(response)).toBe(true);
  });

  it("ignores prompt commands when the native extension is unavailable", () => {
    const response = {
      protocolVersion: 1,
      agentCapabilities: {},
      authMethods: [],
    } as InitializeResponse;

    expect(sessionSteeringTransport(response)).toBeNull();
    expect(supportsSessionSteering(response)).toBe(false);
  });

  it("requires native steering metadata", () => {
    expect(
      supportsSessionSteering({
        protocolVersion: 1,
        agentCapabilities: {},
        authMethods: [],
        _meta: { steering: { supported: true } },
      } as InitializeResponse),
    ).toBe(true);
    expect(
      supportsSessionSteering({
        protocolVersion: 1,
        agentCapabilities: {},
        authMethods: [],
        _meta: { steering: { supported: false } },
      } as InitializeResponse),
    ).toBe(false);
    expect(
      supportsSessionSteering({
        protocolVersion: 1,
        agentCapabilities: {},
        authMethods: [],
      } as InitializeResponse),
    ).toBe(false);
    expect(supportsSessionSteering(null)).toBe(false);
  });

  it("sends native steering through the generic ACP connection", async () => {
    const request = vi.fn().mockResolvedValue({ outcome: "injected" });
    const conn = { request } as unknown as ClientSideConnection;

    await expect(
      steerSession(conn, {
        sessionId: "session-1",
        prompt: [{ type: "text", text: "Focus on the failing test" }],
      }),
    ).resolves.toEqual({ outcome: "injected" });
    expect(request).toHaveBeenCalledWith(ACP_SESSION_STEERING_METHOD, {
      sessionId: "session-1",
      prompt: [{ type: "text", text: "Focus on the failing test" }],
      _meta: { steering: { idleBehavior: "promptRequired" } },
    });
  });

  it("relays idle outcomes the agent reports instead of injecting", async () => {
    const request = vi.fn().mockResolvedValue({ outcome: "promptRequired" });
    const conn = { request } as unknown as ClientSideConnection;

    await expect(
      steerSession(conn, {
        sessionId: "session-1",
        prompt: [{ type: "text", text: "Focus on the failing test" }],
      }),
    ).resolves.toEqual({ outcome: "promptRequired" });
  });
});
