import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Performance invariants for desktop chrome behavior that jsdom can verify
// without pinning exact visual declarations.

// Paths are relative to the package root (vitest's cwd); jsdom rewrites
// import.meta.url to an http URL, so file URLs can't be derived from it.
function read(packageRelativePath: string): string {
  return readFileSync(packageRelativePath, "utf-8");
}

describe("desktop animation performance invariants", () => {
  it("keeps pane SVGs tracking while panel geometry animates", () => {
    const source = read("src/acp/components/chat/DesktopSplitsPane.svelte");

    expect(source).toContain("animatePaneShapesUntilGeometrySettles");
    expect(source).toContain("paneShapeAnimating={paneShapesAnimating}");
  });

  it("wires floating conversation overlays to transcript overflow state", () => {
    const source = read("src/acp/components/chat/ChatPane.svelte");

    expect(source).toMatch(/desktop-conversation-overlays absolute [^"]*z-10/);
    expect(source).toContain("desktopConversationOverlaysHeight");
    expect(source).toContain("desktop={isDesktop}");
    expect(source).toContain("data-overflow-top={hasTranscriptTopOverflow}");
    expect(source).toContain("data-overflow-bottom={hasTranscriptBottomOverflow}");
    expect(source).toContain('isDesktop && "z-10"');
  });

  it("terminal settled fits go through the shared one-per-frame queue", () => {
    const source = read("src/acp/components/AssistantTerminalView.svelte");

    // Panel animations resize every terminal at once; fitting them all in
    // one tick is a single >100ms stall right as the animation ends. Fits
    // must be staggered through the shared queue.
    expect(source).toContain("enqueueSettledFit");
  });

  it("only animates worktree FLIP during a committed reorder", () => {
    const source = read("src/acp/components/sidebar/DesktopProjectSection.svelte");
    const motionItemSource = read("src/acp/components/sidebar/ReorderMotionItem.svelte");

    // A conversation insertion changes a worktree's height. An unconditional
    // FLIP scales every row in that worktree and makes the sidebar jump.
    expect(source).toContain("const worktreeReorderMotion = new ReorderMotion(");
    expect(source).toContain("onReorder: handleWorktreeReorder");
    expect(source).toContain("active={worktreeReorderMotion.active}");
    expect(motionItemSource).toContain('active && motion === "transform"');
    expect(source).not.toContain("animate:flip");
  });
});
