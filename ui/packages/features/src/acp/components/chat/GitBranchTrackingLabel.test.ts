import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import GitBranchTrackingLabel from "./GitBranchTrackingLabel.svelte";

describe("GitBranchTrackingLabel", () => {
  it("shows only the local branch inline with no tooltip, keeping tracking info for a11y", () => {
    const { container } = render(GitBranchTrackingLabel, {
      props: { branch: "feature/branch", upstream: "origin/feature/branch" },
    });
    const label = container.querySelector(".git-branch-tracking");

    expect(label?.textContent?.trim()).toBe("feature/branch");
    expect(label?.getAttribute("title")).toBeNull();
    expect(label?.getAttribute("aria-label")).toBe("feature/branch › origin/feature/branch");
  });

  it("falls back to the branch alone when there is no tracking branch", () => {
    const { container } = render(GitBranchTrackingLabel, {
      props: { branch: "main" },
    });
    const label = container.querySelector(".git-branch-tracking");

    expect(label?.textContent?.trim()).toBe("main");
    expect(label?.getAttribute("title")).toBeNull();
    expect(label?.getAttribute("aria-label")).toBe("main");
  });
});
