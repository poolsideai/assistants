import { fireEvent, render } from "@testing-library/svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";
import DesktopGitChangesSummary from "./DesktopGitChangesSummary.svelte";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    })),
  );
});

describe("DesktopGitChangesSummary", () => {
  it("uses the translucent popover treatment when it floats on desktop", () => {
    const { getByTestId } = render(DesktopGitChangesSummary, {
      props: {
        files: 0,
        additions: 0,
        deletions: 0,
        branch: "main",
        desktop: true,
        onReview: vi.fn(),
        onOpenDiff: vi.fn(),
      },
    });

    expect(getByTestId("desktop-git-changes-summary")).toHaveClass(
      "desktop-tinted-glass",
      "backdrop-blur-sm",
    );
  });

  it("links the left-hand branch to Stage and Commit without showing the action text", async () => {
    const onReview = vi.fn();
    const { getByTitle, getByTestId } = render(DesktopGitChangesSummary, {
      props: {
        files: 0,
        additions: 0,
        deletions: 0,
        branch: "main",
        upstream: "origin/main",
        onReview,
        onOpenDiff: vi.fn(),
      },
    });

    const branch = getByTitle("Stage and Commit...");
    expect(branch).toHaveTextContent("main");
    expect(getByTestId("desktop-git-changes-summary")).not.toHaveTextContent("Stage and Commit...");

    await fireEvent.click(branch);
    expect(onReview).toHaveBeenCalledOnce();
  });

  it("keeps addition and deletion stats on the right and links them to Review Diff", async () => {
    const onOpenDiff = vi.fn();
    const { getByTitle } = render(DesktopGitChangesSummary, {
      props: {
        files: 2,
        additions: 7,
        deletions: 3,
        branch: "main",
        upstream: "origin/main",
        onReview: vi.fn(),
        onOpenDiff,
      },
    });

    const branch = getByTitle("Stage and Commit...");
    const stats = getByTitle("Review Diff...");
    expect(stats).toHaveTextContent("7 additions");
    expect(stats).toHaveTextContent("3 deletions");
    expect(stats).not.toHaveTextContent("files");
    expect(branch.compareDocumentPosition(stats)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    await fireEvent.click(stats);
    expect(onOpenDiff).toHaveBeenCalledOnce();
  });

  it("keeps the branch bar visible but hides diff stats for a clean repository", () => {
    const { container, getByTestId, getByTitle, queryByTitle } = render(DesktopGitChangesSummary, {
      props: {
        files: 0,
        additions: 0,
        deletions: 0,
        branch: "main",
        onReview: vi.fn(),
        onOpenDiff: vi.fn(),
      },
    });

    expect(getByTestId("desktop-git-changes-summary")).toBeInTheDocument();
    expect(getByTitle("Stage and Commit...")).toHaveTextContent("main");
    expect(queryByTitle("Review Diff...")).toBeNull();
    expect(container).not.toHaveTextContent("file");
  });

  it("does not substitute a file count when changed files have no line totals", () => {
    const { container, queryByTitle } = render(DesktopGitChangesSummary, {
      props: {
        files: 1,
        additions: 0,
        deletions: 0,
        branch: "main",
        onReview: vi.fn(),
        onOpenDiff: vi.fn(),
      },
    });

    expect(queryByTitle("Review Diff...")).toBeNull();
    expect(container).not.toHaveTextContent("1 file");
  });
});
