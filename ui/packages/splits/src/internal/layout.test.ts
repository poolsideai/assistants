import { describe, expect, it } from "vitest";
import type { SplitNode } from "../types.js";
import { computeFlatLayout, resolveLength, type LayoutLength } from "./layout.js";
import { createPane, createPaneNode } from "./tree.js";

// Panes render flat and absolutely positioned, so these boxes are the layout —
// there is no flex container left to correct a mistake. Lengths are symbolic
// (a fraction of the stage plus a multiple of the gap variable) so the browser
// resolves them natively on resize.

function pane(id: string): SplitNode {
  return createPaneNode(createPane([], id));
}

function split(
  id: string,
  orientation: "horizontal" | "vertical",
  dividerPosition: number,
  first: SplitNode,
  second: SplitNode,
): SplitNode {
  return { type: "split", split: { id, orientation, dividerPosition, first, second } };
}

/** first + gap + second must exactly reconstitute the parent, in both terms. */
function expectPartition(
  first: LayoutLength,
  second: LayoutLength,
  parent: LayoutLength,
  label: string,
) {
  expect(first.fraction + second.fraction, `${label} fraction`).toBeCloseTo(parent.fraction, 10);
  // The two halves each give up half a gap, and the divider occupies one.
  expect(first.gap + second.gap + 1, `${label} gap`).toBeCloseTo(parent.gap, 10);
}

describe("flat split layout", () => {
  it("gives a lone pane the whole stage", () => {
    const layout = computeFlatLayout(pane("only"));

    expect(layout.dividers).toEqual([]);
    expect(layout.panes).toHaveLength(1);
    expect(layout.panes[0]!.paneId).toBe("only");
    expect(layout.panes[0]!.box).toEqual({
      left: { fraction: 0, gap: 0 },
      top: { fraction: 0, gap: 0 },
      width: { fraction: 1, gap: 0 },
      height: { fraction: 1, gap: 0 },
    });
  });

  it("splits horizontally with each side giving up half a gap", () => {
    const layout = computeFlatLayout(split("s", "horizontal", 0.5, pane("a"), pane("b")));
    const [a, b] = layout.panes;

    expect(a!.paneId).toBe("a");
    expect(a!.box.left).toEqual({ fraction: 0, gap: 0 });
    expect(a!.box.width).toEqual({ fraction: 0.5, gap: -0.5 });
    expect(b!.box.left).toEqual({ fraction: 0.5, gap: 0.5 });
    expect(b!.box.width).toEqual({ fraction: 0.5, gap: -0.5 });
    // Cross axis is untouched by a horizontal split.
    expect(a!.box.height).toEqual({ fraction: 1, gap: 0 });
    expect(b!.box.top).toEqual({ fraction: 0, gap: 0 });

    expectPartition(a!.box.width, b!.box.width, { fraction: 1, gap: 0 }, "horizontal");
  });

  it("splits vertically on the cross axis", () => {
    const layout = computeFlatLayout(split("s", "vertical", 0.25, pane("a"), pane("b")));
    const [a, b] = layout.panes;

    expect(a!.box.height).toEqual({ fraction: 0.25, gap: -0.5 });
    expect(b!.box.top).toEqual({ fraction: 0.25, gap: 0.5 });
    expect(b!.box.height).toEqual({ fraction: 0.75, gap: -0.5 });
    expect(a!.box.width).toEqual({ fraction: 1, gap: 0 });
  });

  it("centres the divider on the split and spans one gap", () => {
    const layout = computeFlatLayout(split("s", "horizontal", 0.4, pane("a"), pane("b")));
    const divider = layout.dividers[0]!;

    expect(divider.splitId).toBe("s");
    expect(divider.orientation).toBe("horizontal");
    expect(divider.box.left).toEqual({ fraction: 0.4, gap: -0.5 });
    expect(divider.box.width).toEqual({ fraction: 0, gap: 1 });
    // It divides the whole stage, which is what drag positions resolve against.
    expect(divider.containerBox.width).toEqual({ fraction: 1, gap: 0 });
  });

  it("accumulates gap deductions through nested splits", () => {
    // Split the right half of a horizontal split again, vertically.
    const layout = computeFlatLayout(
      split(
        "outer",
        "horizontal",
        0.5,
        pane("a"),
        split("inner", "vertical", 0.5, pane("b"), pane("c")),
      ),
    );
    const byId = new Map(layout.panes.map((p) => [p.paneId, p.box]));
    const b = byId.get("b")!;
    const c = byId.get("c")!;
    const parentHeight: LayoutLength = { fraction: 1, gap: 0 };

    // Both inherit the outer split's horizontal geometry...
    expect(b.left).toEqual({ fraction: 0.5, gap: 0.5 });
    expect(b.width).toEqual({ fraction: 0.5, gap: -0.5 });
    expect(c.width).toEqual({ fraction: 0.5, gap: -0.5 });
    // ...and partition the height between themselves.
    expect(b.height).toEqual({ fraction: 0.5, gap: -0.5 });
    expect(c.top).toEqual({ fraction: 0.5, gap: 0.5 });
    expectPartition(b.height, c.height, parentHeight, "nested vertical");
    expect(layout.dividers).toHaveLength(2);
  });

  it("scales an inherited gap deduction by the child fraction", () => {
    // The inner split divides a region that is already short by half a gap, so
    // its own halves inherit a scaled share of that deduction.
    const layout = computeFlatLayout(
      split(
        "outer",
        "horizontal",
        0.5,
        pane("a"),
        split("inner", "horizontal", 0.5, pane("b"), pane("c")),
      ),
    );
    const byId = new Map(layout.panes.map((p) => [p.paneId, p.box]));

    // Right half is { 0.5, -0.5 }; halving gives { 0.25, -0.25 }, then each
    // side gives up another half gap.
    expect(byId.get("b")!.width).toEqual({ fraction: 0.25, gap: -0.75 });
    expect(byId.get("c")!.width).toEqual({ fraction: 0.25, gap: -0.75 });
    expectPartition(
      byId.get("b")!.width,
      byId.get("c")!.width,
      { fraction: 0.5, gap: -0.5 },
      "nested horizontal",
    );
  });

  it("represents a size that deep nesting drives negative", () => {
    // Gap deductions accumulate toward a whole gap while the fraction shrinks
    // geometrically, so enough nesting on the narrow side goes negative.
    let node: SplitNode = pane("deep");
    for (let depth = 0; depth < 8; depth++) {
      node = split(`s${depth}`, "horizontal", 0.9, pane(`wide${depth}`), node);
    }
    const deep = computeFlatLayout(node).panes.find((p) => p.paneId === "deep")!;
    const width = deep.box.width;

    expect(width.fraction * 100 + width.gap * 8, "negative at an 8px gap").toBeLessThan(0);
  });

  it("resolves symbolic lengths against a measured stage", () => {
    expect(resolveLength({ fraction: 0.5, gap: -0.5 }, 1000, 8)).toBe(496);
    expect(resolveLength({ fraction: 0, gap: 1 }, 1000, 8)).toBe(8);
    expect(resolveLength({ fraction: 1, gap: 0 }, 1000, 8)).toBe(1000);
  });
});
