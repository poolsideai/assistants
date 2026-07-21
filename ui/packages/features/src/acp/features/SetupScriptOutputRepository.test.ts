import { describe, expect, it } from "vitest";
import { AcpSetupScriptOutputRepositoryWriter } from "./SetupScriptOutputRepository.svelte";

describe("AcpSetupScriptOutputRepositoryWriter", () => {
  it("tracks setup output and completion by normalized path", () => {
    const repo = new AcpSetupScriptOutputRepositoryWriter();

    repo.start("/Repo/Worktree/", "pnpm install");
    repo.append("/Repo/Worktree", "installing\n");
    repo.complete("/Repo/Worktree", 0);

    expect(repo.outputFor("/Repo/Worktree/")).toMatchObject({
      path: "/Repo/Worktree/",
      command: "pnpm install",
      output: "installing\n",
      status: "completed",
      exitCode: 0,
      collapsed: false,
    });
  });

  it("collapses and toggles a setup output", () => {
    const repo = new AcpSetupScriptOutputRepositoryWriter();

    repo.start("/repo/worktree", "setup");
    repo.collapse("/repo/worktree");
    expect(repo.outputFor("/repo/worktree")?.collapsed).toBe(true);

    repo.toggle("/repo/worktree");
    expect(repo.outputFor("/repo/worktree")?.collapsed).toBe(false);
  });

  it("clears setup output by normalized path", () => {
    const repo = new AcpSetupScriptOutputRepositoryWriter();

    repo.start("/repo/worktree/", "setup");
    repo.clear("/repo/worktree");

    expect(repo.outputFor("/repo/worktree/")).toBeNull();
  });

  it("tracks the start offset when capped setup output slides forward", () => {
    const repo = new AcpSetupScriptOutputRepositoryWriter();

    repo.start("/repo/worktree", "setup");
    repo.append("/repo/worktree", "a".repeat(199_999));
    repo.append("/repo/worktree", "bc");

    expect(repo.outputFor("/repo/worktree")).toMatchObject({
      outputStartOffset: 1,
    });
    expect(repo.outputFor("/repo/worktree")?.output).toHaveLength(200_000);
    expect(repo.outputFor("/repo/worktree")?.output.endsWith("bc")).toBe(true);

    repo.append("/repo/worktree", "d");

    expect(repo.outputFor("/repo/worktree")).toMatchObject({
      outputStartOffset: 2,
    });
    expect(repo.outputFor("/repo/worktree")?.output).toHaveLength(200_000);
    expect(repo.outputFor("/repo/worktree")?.output.endsWith("bcd")).toBe(true);
  });

  it("evicts the oldest setup outputs when the entry cap is exceeded", () => {
    const repo = new AcpSetupScriptOutputRepositoryWriter();

    for (let i = 0; i < 55; i++) {
      repo.start(`/repo/worktree-${i}`, "setup");
    }

    expect(repo.outputFor("/repo/worktree-0")).toBeNull();
    expect(repo.outputFor("/repo/worktree-4")).toBeNull();
    expect(repo.outputFor("/repo/worktree-5")).toMatchObject({
      path: "/repo/worktree-5",
      command: "setup",
    });
    expect(repo.outputFor("/repo/worktree-54")).toMatchObject({
      path: "/repo/worktree-54",
      command: "setup",
    });
  });

  it("tracks terminal-backed setup state without changing output behavior", () => {
    const repo = new AcpSetupScriptOutputRepositoryWriter();

    repo.start("/repo/worktree", "setup", { surface: "terminal" });
    repo.complete("/repo/worktree", 0);

    expect(repo.outputFor("/repo/worktree")).toMatchObject({
      surface: "terminal",
      status: "completed",
      output: "",
    });
  });
});
