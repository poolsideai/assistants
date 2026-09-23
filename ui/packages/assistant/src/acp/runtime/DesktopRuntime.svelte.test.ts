__POOL_SYNTHETIC_IMPORT_BASELINE__
import { initializeStatefulModule as initializeHelperApi } from "@poolsideai/helperapi";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    initializeHelperApi({
      jsonrpcCall: vi.fn().mockResolvedValue({ path: "/state/poolside/chat" }),
      jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(core.acpAgentServers.refresh).not.toHaveBeenCalled();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("creates a standalone chat in helper-managed state storage", async () => {
    const jsonrpcCall = vi.fn().mockResolvedValue({ path: "/state/poolside/chat-1" });
    initializeHelperApi({
      jsonrpcCall,
      jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
    });
    const core = createCore({ projects: [project("/repo")] });
    const runtime = new DesktopRuntime(core);

    const conversationId = await runtime.handleNewChat();

    expect(conversationId).toMatch(/^conversation:/);
    expect(jsonrpcCall).toHaveBeenCalledWith("poolside/acpNav/createChat", {
      sessionId: conversationId,
    });
    expect(core.acpRepo.createSession).toHaveBeenCalledWith(
      "/state/poolside/chat-1",
      "codex",
      conversationId,
      { isChat: true },
    );
    expect(
      core.acpRepo.getSessionByConversationId(conversationId)!.persistPendingConversation,
    ).toHaveBeenCalled();
    expect(core.activeConversationId).toBe(conversationId);
  });

  it("opens another draft immediately while the current agent session is loading", async () => {
    const core = createCore({ projects: [project("/repo")] });
    const old = core.acpRepo.createSession("/repo/old", "codex", "old");
    old.loadState = { status: "loading" };
    core.activeConversationId = old.conversationId;
    // Even an indefinitely delayed refresh must not gate a known configured agent.
    core.acpAgentServers.refresh.mockImplementation(() => new Promise(() => {}));
    const runtime = new DesktopRuntime(core);
    const result = await runtime.handleNewConversation("/repo/new");
    expect(result).not.toBe(old.conversationId);
    expect(core.activeConversationId).toBe(result);
    expect(core.acpAgentServers.refresh).not.toHaveBeenCalled();
    old.loadState = {
      status: "success",
      value: {
        sessionId: "old",
        agentServer: "codex",
        sessionInfo: null,
        events: [],
        plan: null,
        configOptions: [],
        availableCommands: [],
        modes: null,
      },
    };
    expect(core.activeConversationId).toBe(result);
  });

  it.each(["conversation", "settings"] as const)(
    "preserves a later %s selection when a new chat directory arrives",
    async (destination) => {
      const directory = deferred<{ path: string }>();
      initializeHelperApi({
        jsonrpcCall: vi.fn().mockReturnValue(directory.promise),
        jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
      });
      const core = createCore({ projects: [project("/repo")] });
      const onNavigationChange = vi.fn();
      const runtime = new DesktopRuntime(core, { onNavigationChange });
      core.activeConversationId = "original";
      const pending = runtime.handleNewChat();

      if (destination === "conversation") runtime.openConversation("selected-later");
      else runtime.showSettings();
      onNavigationChange.mockClear();
      directory.resolve({ path: "/state/poolside/stale-chat" });

      expect(await pending).toBeNull();
      expect(runtime.view).toBe(destination === "settings" ? "settings" : "chat");
      expect(core.activeConversationId).toBe(
        destination === "conversation" ? "selected-later" : "original",
      );
      expect(core.acpRepo.createSession).not.toHaveBeenCalled();
      expect(core.acpAgentServers.refresh).not.toHaveBeenCalled();
      expect(onNavigationChange).not.toHaveBeenCalled();
    },
  );

  it.each(["conversation", "settings"] as const)(
    "preserves a later %s selection when agent discovery finishes",
    async (destination) => {
      const discovery = deferred<void>();
      const core = createCore({ projects: [project("/repo")] });
      core.acpAgentServers.state = { status: "loading" };
      core.acpAgentServers.refresh.mockReturnValue(discovery.promise);
      const onNavigationChange = vi.fn();
      const runtime = new DesktopRuntime(core, { onNavigationChange });
      core.activeConversationId = "original";
      const pending = runtime.handleNewConversation("/repo/new");

      if (destination === "conversation") runtime.openConversation("selected-later");
      else runtime.showSettings();
      onNavigationChange.mockClear();
      core.acpAgentServers.state = { status: "success", value: {} };
      discovery.resolve();

      expect(await pending).toBeNull();
      expect(runtime.view).toBe(destination === "settings" ? "settings" : "chat");
      expect(core.activeConversationId).toBe(
        destination === "conversation" ? "selected-later" : "original",
      );
      expect(core.acpRepo.createSession).not.toHaveBeenCalled();
      expect(onNavigationChange).not.toHaveBeenCalled();
    },
  );

  it("preserves a different project's settings while a chat directory is pending", async () => {
    const directory = deferred<{ path: string }>();
    initializeHelperApi({
      jsonrpcCall: vi.fn().mockReturnValue(directory.promise),
      jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
    });
    const core = createCore({ projects: [project("/repo")] });
    const runtime = new DesktopRuntime(core);
    runtime.showProjectSettings("/repo");
    const pending = runtime.handleNewChat();
    runtime.showProjectSettings("/other");
    directory.resolve({ path: "/state/poolside/stale-chat" });

    expect(await pending).toBeNull();
    expect(runtime.view).toBe("project-settings");
    expect(runtime.projectSettingsPath).toBe("/other");
    expect(core.acpRepo.createSession).not.toHaveBeenCalled();
  });

  it.each(["older first", "newer first"] as const)(
    "honors the newest chat request when directories finish %s",
    async (order) => {
      const older = deferred<{ path: string }>();
      const newer = deferred<{ path: string }>();
      initializeHelperApi({
        jsonrpcCall: vi.fn().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise),
        jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
      });
      const core = createCore({ projects: [project("/repo")] });
      const runtime = new DesktopRuntime(core);
      const first = runtime.handleNewChat();
      const second = runtime.handleNewChat();

      if (order === "older first") {
        older.resolve({ path: "/state/poolside/older" });
        expect(await first).toBeNull();
        expect(core.acpRepo.createSession).not.toHaveBeenCalled();
      }
      newer.resolve({ path: "/state/poolside/newer" });
      const selected = await second;
      if (order === "newer first") {
        older.resolve({ path: "/state/poolside/older" });
        expect(await first).toBeNull();
      }

      expect(selected).not.toBeNull();
      expect(core.activeConversationId).toBe(selected);
      expect(core.acpRepo.createSession).toHaveBeenCalledTimes(1);
      expect(core.acpRepo.getSessionByConversationId(selected)!.cwd).toBe("/state/poolside/newer");
    },
  );

  it.each(["older first", "newer first"] as const)(
    "honors the newest conversation request when discovery finishes %s",
    async (order) => {
      const older = deferred<void>();
      const newer = deferred<void>();
      const core = createCore({ projects: [project("/repo")] });
      core.acpAgentServers.state = { status: "loading" };
      core.acpAgentServers.refresh
        .mockReturnValueOnce(older.promise)
        .mockReturnValueOnce(newer.promise);
      const runtime = new DesktopRuntime(core);
      const first = runtime.handleNewConversation("/repo/older");
      const second = runtime.handleNewConversation("/repo/newer");

      if (order === "older first") {
        older.resolve();
        expect(await first).toBeNull();
        expect(core.acpRepo.createSession).not.toHaveBeenCalled();
      }
      core.acpAgentServers.state = { status: "success", value: {} };
      newer.resolve();
      const selected = await second;
      if (order === "newer first") {
        older.resolve();
        expect(await first).toBeNull();
      }

      expect(selected).not.toBeNull();
      expect(core.activeConversationId).toBe(selected);
      expect(core.acpRepo.createSession).toHaveBeenCalledTimes(1);
      expect(core.acpRepo.getSessionByConversationId(selected)!.cwd).toBe("/repo/newer");
    },
  );

  it("still opens an explicitly requested chat from Settings after both prerequisites finish", async () => {
    const directory = deferred<{ path: string }>();
    const discovery = deferred<void>();
    initializeHelperApi({
      jsonrpcCall: vi.fn().mockReturnValue(directory.promise),
      jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
    });
    const core = createCore({ projects: [project("/repo")] });
    core.acpAgentServers.state = { status: "loading" };
    core.acpAgentServers.refresh.mockReturnValue(discovery.promise);
    const runtime = new DesktopRuntime(core);
    runtime.showSettings();
    const pending = runtime.handleNewChat();
    directory.resolve({ path: "/state/poolside/requested" });
    await vi.waitFor(() => expect(core.acpAgentServers.refresh).toHaveBeenCalledTimes(1));
    core.acpAgentServers.state = { status: "success", value: {} };
    discovery.resolve();

    const selected = await pending;
    expect(selected).not.toBeNull();
    expect(runtime.view).toBe("chat");
    expect(core.activeConversationId).toBe(selected);
    const session = core.acpRepo.getSessionByConversationId(selected)!;
    expect(session.cwd).toBe("/state/poolside/requested");
    expect(session.persistPendingConversation).toHaveBeenCalledTimes(1);
    expect(session.requestPromptFocus).toHaveBeenCalledTimes(1);
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
  it("opens a conversation from the host, leaving any settings view for the chat", () => {
    const core = createCore();
    const runtime = new DesktopRuntime(core);
    runtime.showSettings();

    runtime.openConversation("conversation-notified");

    expect(runtime.view).toBe("chat");
    expect(core.activeConversationId).toBe("conversation-notified");
    expect(core.acpRepo.createSession).not.toHaveBeenCalled();
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
    expect(core.acpAgentServers.refresh).not.toHaveBeenCalled();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  it("settles the initial screen only after navigation and the new session terminate", () => {
    const core = createCore({
      projects: [project("/repo")],
      projectRefreshState: { status: "loading" },
    });
    const runtime = new DesktopRuntime(core);

    expect(runtime.initialScreenSettled).toBe(false);

    core.acpProjectRepo.refreshState = { status: "success", value: core.acpProjectRepo.projects };
    expect(runtime.initialScreenSettled).toBe(false);

    const session = core.acpRepo.createSession("/repo", "codex", null);
    core.activeConversationId = session.conversationId;
    session.loadState = { status: "loading" };
    expect(runtime.initialScreenSettled).toBe(false);

    session.loadState = { status: "failure", error: new Error("load failed") };
    expect(runtime.initialScreenSettled).toBe(true);
  });

  it("tracks agent readiness separately from a locally available conversation", () => {
    const core = createCore({ projects: [project("/repo")] });
    const runtime = new DesktopRuntime(core);
    core.activeConversationId = core.acpRepo.createSession("/repo", "codex", null).conversationId;
    core.acpRepo.agents.isConfigCacheLoadingFor.mockReturnValue(true);
    expect(runtime.initialScreenSettled).toBe(true);
    expect(runtime.initialAgentReady).toBe(false);
    core.acpRepo.agents.isConfigCacheLoadingFor.mockReturnValue(false);
    expect(runtime.initialAgentReady).toBe(true);
    core.acpRepo.agents.authRequiredForAgent.mockReturnValue(true);
    expect(runtime.initialAgentReady).toBe(false);
  });

  it("treats an initial navigation failure as settled", () => {
    const core = createCore({
      projectRefreshState: { status: "failure" },
    });

    expect(new DesktopRuntime(core).initialScreenSettled).toBe(true);
  });

  it("reports the initial-screen gate inputs in the diagnostics snapshot", () => {
    const core = createCore({ projects: [project("/repo")] });
    // A selected conversation with no loaded session is the stuck state the
    // snapshot exists to expose: not settled, and nothing left to load it.
    core.activeConversationId = "conversation-missing";
    const runtime = new DesktopRuntime(core);

    expect(runtime.startupDiagnosticsSnapshot()).toMatchObject({
      initialScreenSettled: false,
      view: "chat",
      projectStatus: "success",
      conversationStatus: "success",
      agentServersStatus: "success",
      projectCount: 1,
      conversationCount: 0,
      isDesktop: true,
      activeConversationId: "conversation-missing",
      hasActiveSession: false,
      activeSessionLoadState: null,
      agentServer: "codex",
      defaultAgentServer: "codex",
      authRequired: false,
      configCacheLoading: false,
      sessionError: null,
    });

    const session = core.acpRepo.createSession("/repo", "codex", null);
    core.activeConversationId = session.conversationId;

    expect(runtime.startupDiagnosticsSnapshot()).toMatchObject({
      initialScreenSettled: true,
      hasActiveSession: true,
      activeSessionLoadState: "idle",
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
  projectRefreshState = { status: "success" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  conversationRefreshState?: { status: "loading" | "success" | "failure" };
  projectRefreshState?: { status: "loading" | "success" | "failure" };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      sessions: [],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      refreshState: projectRefreshState,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        authInProgressForAgent: vi.fn().mockReturnValue(false),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        (
          cwd: string,
          agentServer: string,
          pendingConversationId: string | null,
          _options?: { isChat?: boolean },
        ) => {
          const conversationId = pendingConversationId ?? `conversation-${nextConversation++}`;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}
