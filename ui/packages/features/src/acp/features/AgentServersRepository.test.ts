import { isFailure, isSuccess } from "@poolsideai/lib/async-state";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      defaultAgentServerPinned: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      setPinnedDefaultAgentServer: vi.fn(async function (
        this: { defaultAgentServer: string; defaultAgentServerPinned: boolean },
        agentServer,
      ) {
        this.defaultAgentServer = agentServer;
        this.defaultAgentServerPinned = true;
        return {
          agentServers: get(appStore).userSettings.acpAgentServers,
          defaultAgentServer: agentServer,
        };
      }),
      unpinDefaultAgentServer: vi.fn(async function (this: {
        defaultAgentServer: string;
        defaultAgentServerPinned: boolean;
      }) {
        this.defaultAgentServerPinned = false;
        return {
          agentServers: get(appStore).userSettings.acpAgentServers,
          defaultAgentServer: this.defaultAgentServer,
        };
      }),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("keeps ready chats usable during background refreshes and transient failures", async () => {
    const appStore = createAppStore({});
    const { repo } = createRepo(appStore);
    const { poolsideAcpNavListAgentServers } = await import("@poolsideai/helperapi");
    const installed = { "codex-acp": { command: "npx" } };
    vi.mocked(poolsideAcpNavListAgentServers).mockResolvedValueOnce({ agentServers: installed });
    await repo.refresh();
    const ready = repo.state;

    let rejectRefresh!: (error: Error) => void;
    vi.mocked(poolsideAcpNavListAgentServers).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectRefresh = reject;
        }),
    );
    const refreshing = repo.refresh({ background: true });
    await flushPromises();
    expect(repo.state).toBe(ready);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      rejectRefresh(new Error("helper transport closed"));
      await refreshing;
      expect(repo.state).toBe(ready);
      expect(get(appStore).userSettings.acpAgentServers).toEqual(installed);

      const updated = { "codex-acp": { command: "codex-acp" } };
      vi.mocked(poolsideAcpNavListAgentServers).mockResolvedValueOnce({ agentServers: updated });
      await repo.refresh({ background: true });
      expect(repo.agentServers).toEqual(updated);
      expect(get(appStore).userSettings.acpAgentServers).toEqual(updated);
    } finally {
      consoleError.mockRestore();
    }
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
    // No list read has happened yet, so the pin mirror is still unknown
    // (undefined) — configureAgentServers must not clear a pin it never saw.
__POOL_SYNTHETIC_IMPORT_BASELINE__
      ["poolside", "codex-acp"],
__POOL_SYNTHETIC_IMPORT_BASELINE__
      undefined,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // The list carried no pin flag, which means unpinned (Go omits false).
__POOL_SYNTHETIC_IMPORT_BASELINE__
      ["poolside", "codex-acp"],
__POOL_SYNTHETIC_IMPORT_BASELINE__
      false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("exposes config parse failures without logging an expected error", async () => {
    const appStore = createAppStore({
      environment: { assistantHost: "vscode" },
      userSettings: {
        acpAgentServers: { "codex-acp": { command: "npx" } },
      },
    });
    const error = new Error("assistant config: parsing assistant.json: invalid character");
    const { poolsideAcpNavListAgentServers } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideAcpNavListAgentServers).mockRejectedValue(error);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { repo } = createRepo(appStore);

    try {
      await repo.refresh();

      expect(isFailure(repo.state)).toBe(true);
      expect(repo.state).toEqual({ status: "failure", error });
      expect(get(appStore).userSettings.acpAgentServers).toEqual({
        "codex-acp": { command: "npx" },
      });
      expect(consoleError).not.toHaveBeenCalled();

      repo.refreshWhenReady();
      await flushPromises();
      expect(poolsideAcpNavListAgentServers).toHaveBeenCalledTimes(1);
    } finally {
      consoleError.mockRestore();
    }
  });

  it("logs unexpected agent server load failures", async () => {
    const appStore = createAppStore({
      environment: { assistantHost: "vscode" },
      userSettings: {
        acpAgentServers: { "codex-acp": { command: "npx" } },
      },
    });
    const error = new Error("helper transport closed");
    const { poolsideAcpNavListAgentServers } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideAcpNavListAgentServers).mockRejectedValue(error);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { repo } = createRepo(appStore);

    try {
      await repo.refresh();

      expect(isFailure(repo.state)).toBe(true);
      expect(consoleError).toHaveBeenCalledWith("Failed to load ACP agent servers", error);
    } finally {
      consoleError.mockRestore();
    }
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
    // The pin mirror synced from the session repo's agents (unpinned here).
__POOL_SYNTHETIC_IMPORT_BASELINE__
      ["poolside", "codex-acp"],
__POOL_SYNTHETIC_IMPORT_BASELINE__
      false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  it("mirrors agent pin and unpin through the session repo", async () => {
    const appStore = createAppStore({
      environment: { assistantHost: "vscode" },
      userSettings: {
        acpAgentServers: { "codex-acp": { command: "npx" } },
      },
    });
    const { repo, sessionRepo } = createRepo(appStore);

    await repo.setPinnedDefaultAgentServer("codex-acp");
    expect(sessionRepo.agents.setPinnedDefaultAgentServer).toHaveBeenCalledExactlyOnceWith(
      "codex-acp",
    );
    expect(repo.defaultAgentServer).toBe("codex-acp");
    expect(repo.defaultAgentServerPinned).toBe(true);
    expect(sessionRepo.reconcileAgentServerConfiguration).toHaveBeenCalled();

    await repo.unpinDefaultAgentServer();
    expect(sessionRepo.agents.unpinDefaultAgentServer).toHaveBeenCalledTimes(1);
    expect(repo.defaultAgentServer).toBe("codex-acp");
    expect(repo.defaultAgentServerPinned).toBe(false);
  });

  it("keeps the local agent when the Desktop helper advertises it", async () => {
    const appStore = createAppStore({
      environment: { assistantHost: "desktop" },
      userSettings: { acpAgentServers: {} },
    });
    const { poolsideAcpNavListAgentServers } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideAcpNavListAgentServers).mockResolvedValue({
      agentServers: { local: { type: "local" } },
    });
    const { repo, sessionRepo } = createRepo(appStore);

    await repo.refresh();

    expect(sessionRepo.agents.configureAgentServers).toHaveBeenCalledWith(
      ["poolside", "local"],
      undefined,
      false,
    );
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
