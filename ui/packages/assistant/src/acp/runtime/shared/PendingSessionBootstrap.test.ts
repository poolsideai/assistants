import { render, waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import {
  PendingSessionBootstrap,
  type PendingSessionBootstrapInputs,
} from "./PendingSessionBootstrap.svelte";
import BootstrapHarness from "./PendingSessionBootstrap.test.svelte";
import type { Runtime } from "./types";

describe("PendingSessionBootstrap", () => {
  it("prepares an empty pending session when the runtime is idle", async () => {
    const { runtime } = createRuntime();
    const bootstrap = new PendingSessionBootstrap(runtime, inputs());

    render(BootstrapHarness, { props: { bootstrap } });

    await waitFor(() =>
      expect(runtime.acpRepo.createSession).toHaveBeenCalledWith("/workspace", "poolside", null),
    );
    expect(runtime.activeConversationId).toBe("conversation-1");
  });

  it("keeps auto-prepare on the pending conversation cwd", async () => {
    const { runtime } = createRuntime();
    const bootstrap = new PendingSessionBootstrap(
      runtime,
      inputs({
        cwd: () => "/workspace/worktree",
        pendingConversationId: () => "pending-conversation",
      }),
    );

    render(BootstrapHarness, { props: { bootstrap } });

    await waitFor(() =>
      expect(runtime.acpRepo.createSession).toHaveBeenCalledWith(
        "/workspace/worktree",
        "poolside",
        "pending-conversation",
      ),
    );
  });

  it("does not prepare twice for a key that was already created imperatively", async () => {
    const { runtime } = createRuntime();
    const bootstrap = new PendingSessionBootstrap(runtime, inputs());
    bootstrap.markPrepared("poolside", "/workspace");

    render(BootstrapHarness, { props: { bootstrap } });

    await settleEffects();

    expect(runtime.acpRepo.createSession).not.toHaveBeenCalled();
    expect(runtime.activeConversationId).toBeNull();
  });

  it("does not prepare while agent server config or auth gates are blocking", async () => {
    const { runtime } = createRuntime({
      isConfigCacheLoadingFor: true,
      authRequiredForAgent: true,
    });
    const bootstrap = new PendingSessionBootstrap(runtime, inputs());

    render(BootstrapHarness, { props: { bootstrap } });

    await settleEffects();

    expect(runtime.acpRepo.createSession).not.toHaveBeenCalled();
  });

  it("can prepare a local draft before its agent config probe completes", async () => {
    const { runtime } = createRuntime({ isConfigCacheLoadingFor: true });
    const bootstrap = new PendingSessionBootstrap(
      runtime,
      inputs({ prepareWhileConfigLoading: true }),
    );
    render(BootstrapHarness, { props: { bootstrap } });
    await waitFor(() => expect(runtime.acpRepo.createSession).toHaveBeenCalledOnce());
    expect(runtime.activeConversationId).toBe("conversation-1");
  });

  it("does not prepare while the active session is loading, sending, or failed", async () => {
    for (const activeSession of [
      session({ loadState: { status: "loading" } }),
      session({ isSending: true }),
      session({ loadState: { status: "failure", error: new Error("agent failed") } }),
    ]) {
      const { runtime } = createRuntime({ activeSession });
      const bootstrap = new PendingSessionBootstrap(
        runtime,
        inputs({ activeSession: () => activeSession as never }),
      );

      render(BootstrapHarness, { props: { bootstrap } });

      await settleEffects();

      expect(runtime.acpRepo.createSession).not.toHaveBeenCalled();
    }
  });

  it("does not replace a target session with a staged handoff", async () => {
    const activeSession = session({ pendingHandoff: { handoffId: "handoff-1" } });
    const { runtime } = createRuntime({ activeSession });
    const bootstrap = new PendingSessionBootstrap(
      runtime,
      inputs({ activeSession: () => activeSession as never }),
    );

    render(BootstrapHarness, { props: { bootstrap } });

    await settleEffects();

    expect(runtime.acpRepo.createSession).not.toHaveBeenCalled();
  });

  it("refreshes stale draft config on window focus, only while mounted", async () => {
    const { runtime } = createRuntime();
    const bootstrap = new PendingSessionBootstrap(runtime, inputs());

    const { unmount } = render(BootstrapHarness, { props: { bootstrap } });
    await settleEffects();

    window.dispatchEvent(new Event("focus"));
    expect(runtime.acpRepo.refreshStaleConfigForLocalSessions).toHaveBeenCalledTimes(1);

    unmount();
    window.dispatchEvent(new Event("focus"));
    expect(runtime.acpRepo.refreshStaleConfigForLocalSessions).toHaveBeenCalledTimes(1);
  });

  it("surfaces session and non-session bootstrap errors", () => {
    const loadError = new Error("load failed");
    const { runtime } = createRuntime({
      activeSession: session({ loadState: { status: "failure", error: loadError } }),
    });
    const bootstrap = new PendingSessionBootstrap(
      runtime,
      inputs({
        activeSession: () =>
          session({ loadState: { status: "failure", error: loadError } }) as never,
      }),
    );

    expect(bootstrap.sessionError()).toBe(loadError);

    const nonSessionError = new Error("config failed");
    const { runtime: runtimeWithAgentError } = createRuntime({ nonSessionError });
    const bootstrapWithAgentError = new PendingSessionBootstrap(runtimeWithAgentError, inputs());

    expect(bootstrapWithAgentError.sessionError()).toBe(nonSessionError);
  });
});

type Session = {
  conversationId: string;
  sessionId: string | null;
  agentServer: string;
  loadState: { status: "idle" | "loading" | "success" | "failure"; error?: unknown };
  events: unknown[];
  isSending: boolean;
  pendingHandoff: unknown | null;
};

function createRuntime({
  activeSession = null,
  isConfigCacheLoadingFor = false,
  authRequiredForAgent = false,
  nonSessionError = null,
}: {
  activeSession?: Session | null;
  isConfigCacheLoadingFor?: boolean;
  authRequiredForAgent?: boolean;
  nonSessionError?: unknown;
} = {}) {
  let nextConversation = 1;
  const runtime = {
    target: "desktop",
    activeConversationId: null as string | null,
    acpAgentServers: {
      state: { status: "success" },
    },
    acpRepo: {
      agents: {
        isConfigCacheLoadingFor: vi.fn().mockReturnValue(isConfigCacheLoadingFor),
        authRequiredForAgent: vi.fn().mockReturnValue(authRequiredForAgent),
        nonSessionErrorFor: vi.fn().mockReturnValue(nonSessionError),
      },
      createSession: vi.fn(
        (cwd: string, agentServer: string, pendingConversationId: string | null) => {
          const conversationId = `conversation-${nextConversation++}`;
          runtime.activeConversationId = conversationId;
          return { conversationId, cwd, agentServer, pendingConversationId };
        },
      ),
      refreshStaleConfigForLocalSessions: vi.fn(),
    },
  };

  return {
    runtime: runtime as unknown as Runtime & typeof runtime,
    activeSession,
  };
}

function inputs(
  overrides: Partial<PendingSessionBootstrapInputs> = {},
): PendingSessionBootstrapInputs {
  return {
    enabled: () => true,
    activeSession: () => null,
    agentServer: () => "poolside",
    cwd: () => "/workspace",
    pendingConversationId: () => null,
    ...overrides,
  };
}

function session(overrides: Partial<Session> = {}): Session {
  return {
    conversationId: "conversation-current",
    sessionId: null,
    agentServer: "poolside",
    loadState: { status: "idle" },
    events: [],
    isSending: false,
    pendingHandoff: null,
    ...overrides,
  };
}

async function settleEffects() {
  await Promise.resolve();
  await Promise.resolve();
}
