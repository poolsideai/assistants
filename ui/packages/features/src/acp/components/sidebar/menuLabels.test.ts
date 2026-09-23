import { describe, expect, it } from "vitest";
import { sidebarInlineRenameLabel, sidebarOpensViewLabel, sidebarRenameLabel } from "./menuLabels";

describe("sidebar menu labels", () => {
  it("marks actions that open another view with an ellipsis", () => {
    expect(sidebarOpensViewLabel("Settings")).toBe("Settings...");
  });

  it("names the kind of thing being renamed", () => {
    expect(sidebarRenameLabel("Worktree")).toBe("Rename Worktree...");
  });

  it("leaves the ellipsis off in-place renames", () => {
    expect(sidebarInlineRenameLabel("Worktree")).toBe("Rename Worktree");
  });
});
