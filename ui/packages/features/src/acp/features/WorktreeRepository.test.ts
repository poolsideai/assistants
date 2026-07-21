import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ACPNavProject, WorktreeBusyKind } from "../navTypes";
import type { AssistantTerminalRepository } from "./AssistantTerminalRepository.svelte";
import type { AcpSetupScriptOutputRepository } from "./SetupScriptOutputRepository.svelte";
import {
  createACPWorktreeRepository,
  createAssistantTerminalCommandRunner,
  type ACPWorktreeCommandRunner,
} from "./WorktreeRepository";

vi.mock("@poolsideai/helperapi", () => ({
  poolsideAcpNavCreateWorktree: vi.fn(),
  poolsideAcpNavGetProjectSettings: vi.fn(),
  poolsideAcpNavList: vi.fn(),
  poolsideAcpNavPrepareWorktree: vi.fn(),
  poolsideAcpNavReleasePreparedWorktree: vi.fn(),
  poolsideAcpNavRemoveWorktree: vi.fn(),
}));

function commandRunner(): ACPWorktreeCommandRunner {
  return {
    createTab: vi.fn().mockResolvedValue(undefined),
    closeProject: vi.fn().mockResolvedValue(undefined),
    closeWorktree: vi.fn().mockResolvedValue(undefined),
    runSetup: vi.fn().mockResolvedValue(undefined),
    runTeardown: vi.fn().mockResolvedValue(undefined),
  };
}

const prepared: ACPNavProject = {
  path: "/repo/worktrees/feature",
  name: "feature",
  isWorktree: true,
  parentPath: "/repo",
  collapsed: false,
  displayOrder: 0,
  createdAt: "2026-05-20T10:00:00Z",
  updatedAt: "2026-05-20T10:00:00Z",
};

describe("ACPWorktreeRepositoryWriter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prepares a worktree name before creation", async () => {
    const { poolsideAcpNavPrepareWorktree } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideAcpNavPrepareWorktree).mockResolvedValue(prepared);
    const repo = createACPWorktreeRepository(commandRunner());

    const result = await repo.prepareWorktree("/repo");

    expect(poolsideAcpNavPrepareWorktree).toHaveBeenCalledWith({ projectPath: "/repo" });
    expect(result?.name).toBe("feature");
  });

  it("creates a worktree with the prepared name and runs the parent setup script", async () => {
    const { poolsideAcpNavCreateWorktree, poolsideAcpNavGetProjectSettings } = await import(
      "@poolsideai/helperapi"
    );
    vi.mocked(poolsideAcpNavCreateWorktree).mockResolvedValue(prepared);
    vi.mocked(poolsideAcpNavGetProjectSettings).mockResolvedValue({
      settings: {
        path: "/repo",
        setupScript: "pnpm install\n",
        teardownScript: "",
        userPrompt: "",
      },
    });
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);
    const kinds: WorktreeBusyKind[] = [];

    const created = await repo.createWorktree("/repo", prepared, (kind) => kinds.push(kind));

    expect(poolsideAcpNavCreateWorktree).toHaveBeenCalledWith({
      projectPath: "/repo",
      worktreeName: "feature",
    });
    expect(poolsideAcpNavGetProjectSettings).toHaveBeenCalledWith({ path: "/repo" });
    expect(kinds).toEqual(["running_setup"]);
    expect(runner.runSetup).toHaveBeenCalledWith(
      "/repo/worktrees/feature",
      "pnpm install",
      undefined,
    );
    expect(created?.path).toBe("/repo/worktrees/feature");
  });

  it("does not create when the delete signal is already aborted", async () => {
    const { poolsideAcpNavCreateWorktree } = await import("@poolsideai/helperapi");
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);
    const controller = new AbortController();
    controller.abort();

    const created = await repo.createWorktree("/repo", prepared, undefined, controller.signal);

    expect(created).toBeUndefined();
    expect(poolsideAcpNavCreateWorktree).not.toHaveBeenCalled();
    expect(runner.runSetup).not.toHaveBeenCalled();
  });

  it("removes the worktree when delete is requested while git create is running", async () => {
    const {
      poolsideAcpNavCreateWorktree,
      poolsideAcpNavGetProjectSettings,
      poolsideAcpNavList,
      poolsideAcpNavRemoveWorktree,
    } = await import("@poolsideai/helperapi");
    const controller = new AbortController();
    let finishCreate: (project: ACPNavProject) => void = () => {};
    vi.mocked(poolsideAcpNavCreateWorktree).mockReturnValue(
      new Promise<ACPNavProject>((resolve) => {
        finishCreate = resolve;
      }),
    );
    vi.mocked(poolsideAcpNavList).mockResolvedValue({ conversations: [], projects: [] });
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);

    const created = repo.createWorktree("/repo", prepared, undefined, controller.signal);
    controller.abort();
    finishCreate(prepared);

    await expect(created).resolves.toBeUndefined();
    expect(poolsideAcpNavGetProjectSettings).not.toHaveBeenCalled();
    expect(runner.closeWorktree).toHaveBeenCalledWith("/repo/worktrees/feature");
    expect(poolsideAcpNavRemoveWorktree).toHaveBeenCalledWith({
      path: "/repo/worktrees/feature",
    });
  });

  it("skips setup and removes the worktree when delete arrives after git create", async () => {
    const {
      poolsideAcpNavCreateWorktree,
      poolsideAcpNavGetProjectSettings,
      poolsideAcpNavList,
      poolsideAcpNavRemoveWorktree,
    } = await import("@poolsideai/helperapi");
    const controller = new AbortController();
    vi.mocked(poolsideAcpNavCreateWorktree).mockImplementation(async () => {
      controller.abort();
      return prepared;
    });
    vi.mocked(poolsideAcpNavList).mockResolvedValue({ conversations: [], projects: [] });
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);

    const created = await repo.createWorktree("/repo", prepared, undefined, controller.signal);

    expect(created).toBeUndefined();
    expect(poolsideAcpNavGetProjectSettings).not.toHaveBeenCalled();
    expect(runner.runSetup).not.toHaveBeenCalled();
    expect(poolsideAcpNavRemoveWorktree).toHaveBeenCalledWith({
      path: "/repo/worktrees/feature",
    });
  });

  it("removes the worktree when delete arrives while fetching an empty setup script", async () => {
    const {
      poolsideAcpNavCreateWorktree,
      poolsideAcpNavGetProjectSettings,
      poolsideAcpNavList,
      poolsideAcpNavRemoveWorktree,
    } = await import("@poolsideai/helperapi");
    const controller = new AbortController();
    let finishSettings: () => void = () => {};
    vi.mocked(poolsideAcpNavCreateWorktree).mockResolvedValue(prepared);
    vi.mocked(poolsideAcpNavGetProjectSettings).mockReturnValue(
      new Promise((resolve) => {
        finishSettings = () =>
          resolve({
            settings: {
              path: "/repo",
              setupScript: "",
              teardownScript: "",
              userPrompt: "",
            },
          });
      }),
    );
    vi.mocked(poolsideAcpNavList).mockResolvedValue({ conversations: [], projects: [] });
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);

    const created = repo.createWorktree("/repo", prepared, undefined, controller.signal);
    await vi.waitFor(() => expect(poolsideAcpNavGetProjectSettings).toHaveBeenCalled());
    controller.abort();
    finishSettings();

    await expect(created).resolves.toBeUndefined();
    expect(runner.runSetup).not.toHaveBeenCalled();
    expect(poolsideAcpNavRemoveWorktree).toHaveBeenCalledWith({
      path: "/repo/worktrees/feature",
    });
  });

  it("aborts setup and removes the created worktree", async () => {
    const { poolsideAcpNavCreateWorktree, poolsideAcpNavGetProjectSettings, poolsideAcpNavList } =
      await import("@poolsideai/helperapi");
    vi.mocked(poolsideAcpNavCreateWorktree).mockResolvedValue(prepared);
    vi.mocked(poolsideAcpNavGetProjectSettings).mockResolvedValue({
      settings: {
        path: "/repo",
        setupScript: "pnpm install",
        teardownScript: "",
        userPrompt: "",
      },
    });
    vi.mocked(poolsideAcpNavList).mockResolvedValue({ conversations: [], projects: [] });
    const controller = new AbortController();
    const runner = commandRunner();
    vi.mocked(runner.runSetup).mockImplementation(
      (_path, _command, signal) =>
        new Promise<void>((resolve) => {
          signal?.addEventListener("abort", () => resolve(), { once: true });
        }),
    );
    const repo = createACPWorktreeRepository(runner);

    const created = repo.createWorktree("/repo", prepared, undefined, controller.signal);
    await vi.waitFor(() => expect(runner.runSetup).toHaveBeenCalled());
    controller.abort();

    await expect(created).resolves.toBeUndefined();
    expect(runner.closeWorktree).toHaveBeenCalledWith("/repo/worktrees/feature");
  });

  it("does not run setup when worktree creation returns no project", async () => {
    const { poolsideAcpNavCreateWorktree, poolsideAcpNavGetProjectSettings } = await import(
      "@poolsideai/helperapi"
    );
    vi.mocked(poolsideAcpNavCreateWorktree).mockResolvedValue(
      undefined as unknown as ACPNavProject,
    );
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);

    const created = await repo.createWorktree("/repo", prepared);

    expect(created).toBeUndefined();
    expect(poolsideAcpNavGetProjectSettings).not.toHaveBeenCalled();
    expect(runner.runSetup).not.toHaveBeenCalled();
  });

  it("closes, tears down, removes, and closes the worktree again", async () => {
    const { poolsideAcpNavList, poolsideAcpNavRemoveWorktree } = await import(
      "@poolsideai/helperapi"
    );
    vi.mocked(poolsideAcpNavList).mockResolvedValue({
      conversations: [],
      projects: [
        {
          path: "/repo",
          name: "assistant",
          isWorktree: false,
          collapsed: false,
          displayOrder: 0,
          createdAt: "2026-05-20T09:00:00Z",
          updatedAt: "2026-05-20T09:00:00Z",
          teardownScript: "pnpm clean\n",
        },
        {
          path: "/repo/worktrees/feature",
          name: "feature",
          isWorktree: true,
          parentPath: "/repo",
          collapsed: false,
          displayOrder: 0,
          createdAt: "2026-05-20T10:00:00Z",
          updatedAt: "2026-05-20T10:00:00Z",
        },
      ],
    });
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);
    const kinds: WorktreeBusyKind[] = [];

    await repo.removeWorktree("/repo/worktrees/feature", (kind) => kinds.push(kind));

    expect(kinds).toEqual(["tearing_down", "deleting"]);
    expect(runner.closeWorktree).toHaveBeenNthCalledWith(1, "/repo/worktrees/feature");
    expect(vi.mocked(runner.closeWorktree).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(poolsideAcpNavList).mock.invocationCallOrder[0],
    );
    expect(runner.runTeardown).toHaveBeenCalledWith("/repo/worktrees/feature", "pnpm clean");
    expect(poolsideAcpNavRemoveWorktree).toHaveBeenCalledWith({
      path: "/repo/worktrees/feature",
    });
    expect(runner.closeWorktree).toHaveBeenNthCalledWith(2, "/repo/worktrees/feature");
  });

  it("discardPreparedWorktree releases the reservation and does not call removeWorktree", async () => {
    const { poolsideAcpNavReleasePreparedWorktree, poolsideAcpNavRemoveWorktree } = await import(
      "@poolsideai/helperapi"
    );
    const runner = commandRunner();
    const repo = createACPWorktreeRepository(runner);

    await repo.discardPreparedWorktree("/repo/worktrees/feature");

    expect(poolsideAcpNavReleasePreparedWorktree).toHaveBeenCalledWith({
      path: "/repo/worktrees/feature",
    });
    expect(poolsideAcpNavRemoveWorktree).not.toHaveBeenCalled();
    expect(runner.closeWorktree).toHaveBeenCalledWith("/repo/worktrees/feature");
  });

  it("adapts assistant terminal repositories to command runner operations", async () => {
    const assistantTerminals = {
      createTab: vi.fn().mockResolvedValue(undefined),
      closeProject: vi.fn().mockResolvedValue(undefined),
      closeWorktree: vi.fn().mockResolvedValue(undefined),
      runCommandAndWait: vi.fn().mockResolvedValue(0),
    };
    const setupScriptOutputs = {
      clear: vi.fn(),
      start: vi.fn(),
      append: vi.fn(),
      complete: vi.fn(),
      fail: vi.fn(),
    };
    const runner = createAssistantTerminalCommandRunner(
      assistantTerminals as unknown as AssistantTerminalRepository,
      setupScriptOutputs as unknown as AcpSetupScriptOutputRepository,
    );

    await runner.createTab("/repo", "setup");
    await runner.closeProject("/repo");
    await runner.closeWorktree("/repo/worktrees/feature");
    await runner.runSetup("/repo/worktrees/feature", "setup");
    await runner.runTeardown("/repo/worktrees/feature", "cleanup");

    expect(assistantTerminals.createTab).toHaveBeenCalledWith("/repo", "setup");
    expect(assistantTerminals.closeProject).toHaveBeenCalledWith("/repo");
    expect(assistantTerminals.closeWorktree).toHaveBeenCalledWith("/repo/worktrees/feature");
    expect(setupScriptOutputs.clear).toHaveBeenCalledWith("/repo");
    expect(setupScriptOutputs.clear).toHaveBeenCalledWith("/repo/worktrees/feature");
    expect(assistantTerminals.runCommandAndWait).toHaveBeenCalledWith(
      "/repo/worktrees/feature",
      "setup",
      undefined,
      expect.objectContaining({
        onOutput: expect.any(Function),
      }),
    );
    expect(setupScriptOutputs.start).toHaveBeenCalledWith("/repo/worktrees/feature", "setup", {
      surface: "inline",
    });
    const runSetupOptions = vi.mocked(assistantTerminals.runCommandAndWait).mock.calls[0]?.[3];
    runSetupOptions?.onOutput?.("setup output");
    expect(setupScriptOutputs.append).toHaveBeenCalledWith(
      "/repo/worktrees/feature",
      "setup output",
    );
    expect(setupScriptOutputs.complete).toHaveBeenCalledWith("/repo/worktrees/feature", 0);
    expect(assistantTerminals.runCommandAndWait).toHaveBeenCalledWith(
      "/repo/worktrees/feature",
      "cleanup",
      undefined,
      expect.objectContaining({
        onOutput: expect.any(Function),
      }),
    );
  });

  it("throws when the teardown script exits non-zero, including the output tail", async () => {
    const assistantTerminals = {
      createTab: vi.fn().mockResolvedValue(undefined),
      closeProject: vi.fn().mockResolvedValue(undefined),
      closeWorktree: vi.fn().mockResolvedValue(undefined),
      runCommandAndWait: vi.fn().mockImplementation(async (_path, _command, _signal, options) => {
        options?.onOutput?.("stopping services\ncommand not found: spoolside\n");
        return 1;
      }),
    };
    const runner = createAssistantTerminalCommandRunner(
      assistantTerminals as unknown as AssistantTerminalRepository,
    );

    await expect(runner.runTeardown("/repo/worktrees/feature", "cleanup")).rejects.toThrow(
      "Teardown script exited with code 1: cleanup\nstopping services\ncommand not found: spoolside",
    );
  });

  it("throws when the teardown script could not run at all", async () => {
    const assistantTerminals = {
      createTab: vi.fn().mockResolvedValue(undefined),
      closeProject: vi.fn().mockResolvedValue(undefined),
      closeWorktree: vi.fn().mockResolvedValue(undefined),
      runCommandAndWait: vi.fn().mockResolvedValue(undefined),
    };
    const runner = createAssistantTerminalCommandRunner(
      assistantTerminals as unknown as AssistantTerminalRepository,
    );

    await expect(runner.runTeardown("/repo/worktrees/feature", "cleanup")).rejects.toThrow(
      "Teardown script did not run: cleanup",
    );
  });

  it("does not treat an aborted teardown as a failure", async () => {
    const controller = new AbortController();
    const assistantTerminals = {
      createTab: vi.fn().mockResolvedValue(undefined),
      closeProject: vi.fn().mockResolvedValue(undefined),
      closeWorktree: vi.fn().mockResolvedValue(undefined),
      runCommandAndWait: vi.fn().mockImplementation(async () => {
        controller.abort();
        return undefined;
      }),
    };
    const runner = createAssistantTerminalCommandRunner(
      assistantTerminals as unknown as AssistantTerminalRepository,
    );

    await expect(
      runner.runTeardown("/repo/worktrees/feature", "cleanup", controller.signal),
    ).resolves.toBeUndefined();
  });

  it("runs setup scripts in a visible interactive terminal when configured", async () => {
    const assistantTerminals = {
      createTab: vi.fn().mockResolvedValue(undefined),
      closeProject: vi.fn().mockResolvedValue(undefined),
      closeWorktree: vi.fn().mockResolvedValue(undefined),
      runCommandAndWait: vi.fn().mockResolvedValue(0),
    };
    const setupScriptOutputs = {
      clear: vi.fn(),
      start: vi.fn(),
      append: vi.fn(),
      complete: vi.fn(),
      fail: vi.fn(),
    };
    const runner = createAssistantTerminalCommandRunner(
      assistantTerminals as unknown as AssistantTerminalRepository,
      setupScriptOutputs as unknown as AcpSetupScriptOutputRepository,
      { setupInVisibleTerminal: true },
    );

    await runner.runSetup("/repo/worktrees/feature", "setup", undefined, {
      terminalLayoutKey: "conversation-1",
    });

    expect(setupScriptOutputs.start).toHaveBeenCalledWith("/repo/worktrees/feature", "setup", {
      surface: "terminal",
    });
    expect(assistantTerminals.runCommandAndWait).toHaveBeenCalledWith(
      "/repo/worktrees/feature",
      "setup",
      undefined,
      expect.objectContaining({
        visible: true,
        placement: "splitRight",
        reuseExisting: true,
        keepAliveAfterCommand: true,
        layoutKey: "conversation-1",
        // Shown, never focused: the user creates a worktree to type a prompt.
        focus: false,
      }),
    );
    expect(setupScriptOutputs.append).not.toHaveBeenCalled();
    expect(setupScriptOutputs.complete).toHaveBeenCalledWith("/repo/worktrees/feature", 0);
  });

  it("runs visible setup scripts in the configured placement", async () => {
    const assistantTerminals = {
      createTab: vi.fn().mockResolvedValue(undefined),
      closeProject: vi.fn().mockResolvedValue(undefined),
      closeWorktree: vi.fn().mockResolvedValue(undefined),
      runCommandAndWait: vi.fn().mockResolvedValue(0),
    };
    const setupScriptOutputs = {
      clear: vi.fn(),
      start: vi.fn(),
      append: vi.fn(),
      complete: vi.fn(),
      fail: vi.fn(),
    };
    const setupPlacement = vi.fn().mockReturnValue("bottomPanel");
    const runner = createAssistantTerminalCommandRunner(
      assistantTerminals as unknown as AssistantTerminalRepository,
      setupScriptOutputs as unknown as AcpSetupScriptOutputRepository,
      { setupInVisibleTerminal: true, setupPlacement },
    );

    await runner.runSetup("/repo/worktrees/feature", "setup");

    expect(setupPlacement).toHaveBeenCalled();
    expect(assistantTerminals.runCommandAndWait).toHaveBeenCalledWith(
      "/repo/worktrees/feature",
      "setup",
      undefined,
      expect.objectContaining({
        visible: true,
        placement: "bottomPanel",
        reuseExisting: true,
      }),
    );
  });
});
