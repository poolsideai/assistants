import type { SessionId } from "@agentclientprotocol/sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationRepositoryWriter, type Notifier } from "./NotificationRepository.svelte";

let createdNotifications: MockNotification[] = [];

class MockNotification {
  static permission: NotificationPermission = "granted";
  static requestPermission = vi.fn(() => Promise.resolve(MockNotification.permission));

  title: string;
  body: string;
  onclick: (() => void) | null = null;
  close = vi.fn();

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.body = options?.body ?? "";
    createdNotifications.push(this);
  }
}

describe("NotificationRepositoryWriter", () => {
  const originalNotification = globalThis.Notification;
  let showSession: ReturnType<typeof vi.fn>;
  let repo: NotificationRepositoryWriter;

  beforeEach(() => {
    vi.restoreAllMocks();
    createdNotifications = [];
    vi.stubGlobal("Notification", MockNotification);
    MockNotification.permission = "granted";
    MockNotification.requestPermission = vi.fn(() => Promise.resolve(MockNotification.permission));
    showSession = vi.fn();
    repo = new NotificationRepositoryWriter(
      showSession,
      () => "Claude agent",
      () => true,
      () => false,
    );
  });

  afterEach(() => {
    vi.stubGlobal("Notification", originalNotification);
  });

  it("shows an agent-labelled notification keyed by session and agent", async () => {
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "read" },
    });

    expect(createdNotifications).toHaveLength(1);
    expect(createdNotifications[0].title).toBe("Claude agent");
    expect(createdNotifications[0].body).toBe("Approval needed to read file");
  });

  it.each([
    ["read", "Approval needed to read file"],
    ["search", "Approval needed to read file"],
    ["fetch", "Approval needed to read file"],
    ["edit", "Approval needed to write to file"],
    ["delete", "Approval needed to write to file"],
    ["move", "Approval needed to write to file"],
    ["execute", "Approval needed to run command"],
    ["think", "Approval needed to continue"],
    ["other", "Approval needed to continue"],
  ] as const)("uses the %s message", async (kind, expectedBody) => {
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind },
    });

    expect(createdNotifications[0].body).toBe(expectedBody);
  });

  it("uses the elicitation body for elicitation notifications", async () => {
    await repo.show({ type: "elicitation", sessionId: "s1" as SessionId, agentServer: "agent-a" });

    expect(createdNotifications[0].body).toBe("Input needed to continue");
  });

  it("uses the turn-completed body for turn-completed notifications", async () => {
    await repo.show({
      type: "turn_completed",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
    });

    expect(createdNotifications[0].body).toBe("Agent finished responding");
  });

  it("does not notify when notifyOnApproval is false", async () => {
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      (agentServer) => agentServer,
      () => false,
      () => false,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(createdNotifications).toHaveLength(0);
  });

  it("does not notify when the editor is focused", async () => {
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      (agentServer) => agentServer,
      () => true,
      () => true,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(createdNotifications).toHaveLength(0);
  });

  it("keeps a single notification per session and agent pair", async () => {
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "read" },
    });

    expect(createdNotifications).toHaveLength(1);
  });

  it("shows separate notifications for different session and agent pairs", async () => {
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    await repo.show({
      type: "approval",
      sessionId: "s2" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-b",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(createdNotifications).toHaveLength(3);
  });

  it("requests permission when it has not been granted", async () => {
    MockNotification.permission = "default";
    MockNotification.requestPermission.mockResolvedValue("granted");

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(MockNotification.requestPermission).toHaveBeenCalled();
  });

  it("does not show a notification when permission is denied", async () => {
    MockNotification.permission = "denied";

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(createdNotifications).toHaveLength(0);
  });

  it("reveals the originating session when clicked", async () => {
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    createdNotifications[0].onclick?.();

    expect(showSession).toHaveBeenCalledWith("agent-a", "s1");
  });

  it("dismisses only the matching session's notification", async () => {
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    await repo.show({
      type: "approval",
      sessionId: "s2" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    const [first, second] = createdNotifications;

    repo.dismiss("s1", "agent-a");

    expect(first.close).toHaveBeenCalled();
    expect(second.close).not.toHaveBeenCalled();
  });

  it("dismissing an unknown pair is a no-op", () => {
    expect(() => repo.dismiss("s1", "agent-a")).not.toThrow();
  });

  it("allows a new notification after dismissing the previous one", async () => {
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    repo.dismiss("s1", "agent-a");
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "read" },
    });

    expect(createdNotifications).toHaveLength(2);
    expect(createdNotifications[1].body).toBe("Approval needed to read file");
  });
});

describe("NotificationRepositoryWriter with custom backend", () => {
  function createMockBackend(overrides: Partial<Notifier> = {}): Notifier & {
    sent: Array<{ title: string; body: string; onClick: () => void }>;
  } {
    const sent: Array<{ title: string; body: string; onClick: () => void }> = [];
    return {
      isSupported: () => true,
      ensurePermission: () => Promise.resolve(true),
      send(opts) {
        sent.push(opts);
        return undefined;
      },
      sent,
      ...overrides,
    };
  }

  it("delegates to the custom backend", async () => {
    const backend = createMockBackend();
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(backend.sent).toHaveLength(1);
    expect(backend.sent[0].title).toBe("Agent");
    expect(backend.sent[0].body).toBe("Approval needed to run command");
  });

  it("calls showSession when the backend triggers onClick", async () => {
    const backend = createMockBackend();
    const showSession = vi.fn();
    const repo = new NotificationRepositoryWriter(
      showSession,
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    backend.sent[0].onClick();

    expect(showSession).toHaveBeenCalledWith("agent-a", "s1");
  });

  it("skips notification when backend reports unsupported", async () => {
    const backend = createMockBackend({ isSupported: () => false });
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(backend.sent).toHaveLength(0);
  });

  it("does not notify when ensurePermission resolves false", async () => {
    const backend = createMockBackend({
      ensurePermission: () => Promise.resolve(false),
    });
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(backend.sent).toHaveLength(0);
  });

  it("does not notify when dismissed while the permission check is pending", async () => {
    let resolvePermission!: (granted: boolean) => void;
    const backend = createMockBackend({
      ensurePermission: () =>
        new Promise<boolean>((resolve) => {
          resolvePermission = resolve;
        }),
    });
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    const showing = repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    repo.dismiss("s1", "agent-a");
    resolvePermission(true);
    await showing;

    expect(backend.sent).toHaveLength(0);
  });

  it("does not double-notify when show is called twice during a permission check", async () => {
    let resolvePermission!: (granted: boolean) => void;
    const backend = createMockBackend({
      ensurePermission: () =>
        new Promise<boolean>((resolve) => {
          resolvePermission = resolve;
        }),
    });
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    const first = repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    const second = repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    resolvePermission(true);
    await first;
    await second;

    expect(backend.sent).toHaveLength(1);
  });

  it("invokes the backend close handle on dismiss", async () => {
    const close = vi.fn();
    const backend = createMockBackend();
    backend.send = (opts) => {
      backend.sent.push(opts);
      return close;
    };
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });
    repo.dismiss("s1", "agent-a");

    expect(close).toHaveBeenCalled();
  });

  it("dismiss works when the backend returns no close handle", async () => {
    const backend = createMockBackend();
    const repo = new NotificationRepositoryWriter(
      vi.fn(),
      () => "Agent",
      () => true,
      () => false,
      backend,
    );

    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "execute" },
    });

    expect(() => repo.dismiss("s1", "agent-a")).not.toThrow();
    await repo.show({
      type: "approval",
      sessionId: "s1" as SessionId,
      agentServer: "agent-a",
      toolCall: { toolCallId: "tool-1", kind: "read" },
    });
    expect(backend.sent).toHaveLength(2);
  });
});
