import type { GitHubPRStatus, GitHubWorktreeStatus } from "@poolsideai/helperapi";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACPGithubRepositoryWriter } from "./GithubRepository.svelte";

vi.mock("@poolsideai/helperapi", () => ({
  poolsideGithubWorktreeStatuses: vi.fn(),
  poolsideGithubPrDetail: vi.fn(),
  poolsideGithubPrUrl: vi.fn(),
  poolsideGithubLinks: vi.fn(),
  poolsideGithubAuthStatus: vi.fn(),
  poolsideGithubSetToken: vi.fn(),
  poolsideAcpNavGetGithubColorMode: vi.fn(),
  poolsideAcpNavSetGithubColorMode: vi.fn(),
}));

function prStatus(overrides: Partial<GitHubPRStatus> = {}): GitHubPRStatus {
  return {
    state: "open",
    number: 1,
    title: "PR",
    url: "https://github.com/o/r/pull/1",
    isDraft: false,
    reviewDecision: "",
    checks: { status: "success", total: 1, passed: 1, failed: 0, pending: 0 },
    commentCount: 0,
    updatedAt: "2026-06-29T00:00:00Z",
    ...overrides,
  };
}

function worktreeStatus(
  path: string,
  supported: boolean,
  status: GitHubPRStatus,
): GitHubWorktreeStatus {
  return { path, branch: "poolside/x", supported, status };
}

describe("ACPGithubRepositoryWriter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("maps statuses by path, exposes supported/category, and reports configured", async () => {
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses).mockResolvedValue({
      configured: true,
      statuses: [
        worktreeStatus("/a", true, prStatus({ state: "merged" })),
        worktreeStatus("/b", false, prStatus({ state: "none" })),
      ],
    });

    const repo = new ACPGithubRepositoryWriter();
    await repo.refresh(["/a", "/b"]);

    expect(repo.configured).toBe(true);
    expect(repo.statusFor("/a")?.state).toBe("merged");
    expect(repo.branchFor("/a")).toBe("poolside/x");
    expect(repo.supportedFor("/a")).toBe(true);
    expect(repo.supportedFor("/b")).toBe(false);
    expect(repo.categoryFor("/a")).toBe("merged");
    expect(repo.branchFor("/missing")).toBe("");
    expect(repo.supportedFor("/missing")).toBe(false);
  });

  it("exposes isRepoFor, undefined until the status arrives", async () => {
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses).mockResolvedValue({
      configured: false,
      statuses: [
        { ...worktreeStatus("/repo", false, prStatus({ state: "none" })), isRepo: true },
        { ...worktreeStatus("/plain", false, prStatus({ state: "none" })), isRepo: false },
      ],
    });

    const repo = new ACPGithubRepositoryWriter();
    expect(repo.isRepoFor("/repo")).toBeUndefined();
    await repo.refresh(["/repo", "/plain"]);

    expect(repo.isRepoFor("/repo")).toBe(true);
    expect(repo.isRepoFor("/plain")).toBe(false);
    expect(repo.isRepoFor("/missing")).toBeUndefined();
  });

  it("prunes paths that are no longer tracked", async () => {
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses)
      .mockResolvedValueOnce({
        configured: true,
        statuses: [worktreeStatus("/a", true, prStatus()), worktreeStatus("/b", true, prStatus())],
      })
      .mockResolvedValueOnce({
        configured: true,
        statuses: [worktreeStatus("/a", true, prStatus())],
      });

    const repo = new ACPGithubRepositoryWriter();
    await repo.refresh(["/a", "/b"]);
    expect(repo.statusFor("/b")).toBeDefined();

    await repo.refresh(["/a"]);
    expect(repo.statusFor("/a")).toBeDefined();
    expect(repo.statusFor("/b")).toBeUndefined();
  });

  it("guards against overlapping refreshes (inFlight)", async () => {
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    let resolveFirst!: (v: { configured: boolean; statuses: GitHubWorktreeStatus[] }) => void;
    const pending = new Promise<{ configured: boolean; statuses: GitHubWorktreeStatus[] }>((r) => {
      resolveFirst = r;
    });
    vi.mocked(poolsideGithubWorktreeStatuses).mockReturnValueOnce(pending);

    const repo = new ACPGithubRepositoryWriter();
    const first = repo.refresh(["/a"]);
    const second = repo.refresh(["/a"]); // should early-return while first is in flight
    resolveFirst({ configured: true, statuses: [worktreeStatus("/a", true, prStatus())] });
    await Promise.all([first, second]);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(1);
  });

  it("force bypasses the inFlight guard (e.g. after a token change)", async () => {
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    let resolveFirst!: (v: { configured: boolean; statuses: GitHubWorktreeStatus[] }) => void;
    const pending = new Promise<{ configured: boolean; statuses: GitHubWorktreeStatus[] }>((r) => {
      resolveFirst = r;
    });
    vi.mocked(poolsideGithubWorktreeStatuses)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce({
        configured: true,
        statuses: [worktreeStatus("/a", true, prStatus())],
      });

    const repo = new ACPGithubRepositoryWriter();
    const first = repo.refresh(["/a"]); // in flight
    const forced = repo.refresh(["/a"], { force: true }); // bypasses the guard
    resolveFirst({ configured: true, statuses: [] }); // superseded result
    await Promise.all([first, forced]);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(2);
    // The forced (newer) result wins; the stale in-flight one is discarded.
    expect(repo.statusFor("/a")).toBeDefined();
  });

  it("does not retry a stale failed refresh after a newer refresh succeeds", async () => {
    vi.useFakeTimers();
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    let rejectFirst!: (error: Error) => void;
    const pending = new Promise<{ configured: boolean; statuses: GitHubWorktreeStatus[] }>(
      (_resolve, reject) => {
        rejectFirst = reject;
      },
    );
    vi.mocked(poolsideGithubWorktreeStatuses)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce({
        configured: true,
        statuses: [worktreeStatus("/a", true, prStatus())],
      });

    const repo = new ACPGithubRepositoryWriter();
    const first = repo.refresh(["/a"]);
    const forced = repo.refresh(["/a"], { force: true });
    rejectFirst(new Error("stale failure"));
    await Promise.all([first, forced]);
    await vi.advanceTimersByTimeAsync(1_500);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(2);
    expect(repo.statusFor("/a")).toBeDefined();
  });

  it("retries shortly after a failed refresh", async () => {
    vi.useFakeTimers();
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses)
      .mockRejectedValueOnce(new Error("helper unavailable"))
      .mockResolvedValueOnce({
        configured: true,
        statuses: [worktreeStatus("/a", true, prStatus())],
      });

    const repo = new ACPGithubRepositoryWriter();
    await repo.refresh(["/a"]);
    expect(repo.statusFor("/a")).toBeUndefined();

    await vi.advanceTimersByTimeAsync(1_500);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(2);
    expect(repo.statusFor("/a")).toBeDefined();
  });

  it("clears a pending retry when there are no tracked paths", async () => {
    vi.useFakeTimers();
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses).mockRejectedValueOnce(
      new Error("helper unavailable"),
    );

    const repo = new ACPGithubRepositoryWriter();
    await repo.refresh(["/a"]);
    await repo.refresh([]);
    await vi.advanceTimersByTimeAsync(1_500);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(1);
  });

  it("does not schedule a retry after stop", async () => {
    vi.useFakeTimers();
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses).mockRejectedValueOnce(
      new Error("helper unavailable"),
    );

    const repo = new ACPGithubRepositoryWriter();
    repo.stop();
    await repo.refresh(["/a"]);
    await vi.advanceTimersByTimeAsync(1_500);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(1);
  });

  it("bounds short retries during a sustained failure", async () => {
    vi.useFakeTimers();
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses).mockRejectedValue(new Error("helper unavailable"));

    const repo = new ACPGithubRepositoryWriter();
    await repo.refresh(["/a"]);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(4);
  });

  it("resets bounded retries after a successful refresh", async () => {
    vi.useFakeTimers();
    const { poolsideGithubWorktreeStatuses } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideGithubWorktreeStatuses)
      .mockRejectedValueOnce(new Error("helper unavailable"))
      .mockResolvedValueOnce({
        configured: true,
        statuses: [worktreeStatus("/a", true, prStatus())],
      })
      .mockRejectedValue(new Error("helper unavailable"));

    const repo = new ACPGithubRepositoryWriter();
    await repo.refresh(["/a"]);
    await vi.advanceTimersByTimeAsync(1_500);
    await repo.refresh(["/a"]);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);

    expect(poolsideGithubWorktreeStatuses).toHaveBeenCalledTimes(6);
  });

  it("persists the color mode and reflects it immediately", async () => {
    const { poolsideAcpNavSetGithubColorMode, poolsideGithubWorktreeStatuses } = await import(
      "@poolsideai/helperapi"
    );
    vi.mocked(poolsideAcpNavSetGithubColorMode).mockResolvedValue({ colorMode: "review" });
    vi.mocked(poolsideGithubWorktreeStatuses).mockResolvedValue({ configured: true, statuses: [] });

    const repo = new ACPGithubRepositoryWriter();
    repo.setColorMode("review");

    expect(repo.colorMode).toBe("review");
    expect(poolsideAcpNavSetGithubColorMode).toHaveBeenCalledWith({ colorMode: "review" });
  });

  it("loads the persisted color mode on start and cleans up on stop", async () => {
    const { poolsideAcpNavGetGithubColorMode } = await import("@poolsideai/helperapi");
    vi.mocked(poolsideAcpNavGetGithubColorMode).mockResolvedValue({ colorMode: "review" });

    const repo = new ACPGithubRepositoryWriter();
    expect(repo.colorMode).toBe("checks");

    repo.start(() => []);
    await vi.waitFor(() => expect(repo.colorMode).toBe("review"));
    repo.stop();
  });
});
