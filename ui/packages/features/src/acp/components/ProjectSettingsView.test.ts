import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ACPProjectRepository } from "../features/ProjectRepository.svelte";
import type { ACPNavProjectSettings } from "../navTypes";
import Harness from "./ProjectSettingsView.test.svelte";

const PROJECT_PATH = "/tmp/project";

function makeProjectsRepo(initial: Partial<ACPNavProjectSettings> = {}) {
  const getProjectSettings = vi.fn(async (path: string) => ({
    path,
    setupScript: "",
    teardownScript: "",
    userPrompt: "",
    ...initial,
  }));
  // Mirror the helper, which trims scripts before persisting and echoes the
  // trimmed settings back in the save response.
  const setProjectSettings = vi.fn(async (settings: ACPNavProjectSettings) => ({
    path: settings.path,
    setupScript: settings.setupScript.trim(),
    teardownScript: settings.teardownScript.trim(),
    userPrompt: settings.userPrompt.trim(),
  }));
  return {
    repo: {
      getProjectSettings,
      setProjectSettings,
      renameProject: vi.fn(async () => {}),
      removeProject: vi.fn(async () => {}),
    } as unknown as ACPProjectRepository,
    getProjectSettings,
    setProjectSettings,
  };
}

async function flushTimersAndMicrotasks(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
}

describe("ProjectSettingsView setup script editing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps a newline inserted at the top after the debounced auto-save", async () => {
    const { repo, setProjectSettings } = makeProjectsRepo({ setupScript: "pnpm install" });
    render(Harness, { projects: repo, projectPath: PROJECT_PATH });

    const textarea = (await vi.waitFor(() =>
      screen.getByLabelText("Worktree setup script"),
    )) as HTMLTextAreaElement;
    await vi.waitFor(() => expect(textarea.value).toBe("pnpm install"));

    await fireEvent.input(textarea, { target: { value: "\npnpm install" } });
    await flushTimersAndMicrotasks(400);

    expect(setProjectSettings).toHaveBeenCalledWith({
      path: PROJECT_PATH,
      setupScript: "\npnpm install",
      teardownScript: "",
      userPrompt: "",
    });
    // The helper's trimmed echo must not rewrite the textarea mid-edit.
    expect(textarea.value).toBe("\npnpm install");
  });

  it("does not re-save when nothing changed after the save settles", async () => {
    const { repo, setProjectSettings } = makeProjectsRepo({ setupScript: "pnpm install" });
    render(Harness, { projects: repo, projectPath: PROJECT_PATH });

    const textarea = (await vi.waitFor(() =>
      screen.getByLabelText("Worktree setup script"),
    )) as HTMLTextAreaElement;
    await vi.waitFor(() => expect(textarea.value).toBe("pnpm install"));

    await fireEvent.input(textarea, { target: { value: "\npnpm install" } });
    await flushTimersAndMicrotasks(400);
    expect(setProjectSettings).toHaveBeenCalledTimes(1);

    await flushTimersAndMicrotasks(1000);
    expect(setProjectSettings).toHaveBeenCalledTimes(1);
  });

  it("saves a follow-up edit made while a save is in flight", async () => {
    const { repo, setProjectSettings } = makeProjectsRepo({ setupScript: "pnpm install" });
    render(Harness, { projects: repo, projectPath: PROJECT_PATH });

    const textarea = (await vi.waitFor(() =>
      screen.getByLabelText("Worktree setup script"),
    )) as HTMLTextAreaElement;
    await vi.waitFor(() => expect(textarea.value).toBe("pnpm install"));

    await fireEvent.input(textarea, { target: { value: "\npnpm install" } });
    await flushTimersAndMicrotasks(400);
    await fireEvent.input(textarea, { target: { value: "cd ui\npnpm install" } });
    await flushTimersAndMicrotasks(400);

    expect(setProjectSettings).toHaveBeenCalledTimes(2);
    expect(setProjectSettings).toHaveBeenLastCalledWith({
      path: PROJECT_PATH,
      setupScript: "cd ui\npnpm install",
      teardownScript: "",
      userPrompt: "",
    });
    expect(textarea.value).toBe("cd ui\npnpm install");
  });
});
