import type { PaneID, SplitID, SplitNode, SplitOrientation } from "../types.js";

// Flattens the split tree into absolutely positioned boxes so every pane is a
// direct child of one stage, keyed by pane id. Nesting panes inside flex
// wrappers meant restructuring the tree (splitting a pane, dropping a tab into
// a new split) moved a pane to a different depth, which Svelte can only express
// by destroying and recreating its subtree — rebuilding the tab bar and pane
// chrome for ~43ms. Flat, a restructure only changes coordinates.
//
// Lengths stay symbolic — a fraction of the stage plus a multiple of the gap
// variable — so they emit as calc() and the browser resolves them. Resizes and
// animated sidebar slides therefore reflow natively, with no JS per frame, and
// the gap remains themeable through --splits-split-gap.

/** `fraction` of the stage, plus `gap` times the split-gap custom property. */
export interface LayoutLength {
  fraction: number;
  gap: number;
}

export interface LayoutBox {
  left: LayoutLength;
  top: LayoutLength;
  width: LayoutLength;
  height: LayoutLength;
}

export interface FlatPaneLayout {
  paneId: PaneID;
  box: LayoutBox;
}

export interface FlatDividerLayout {
  splitId: SplitID;
  orientation: SplitOrientation;
  box: LayoutBox;
  /** The region this split divides, for resolving drag positions. */
  containerBox: LayoutBox;
}

export interface FlatLayout {
  panes: FlatPaneLayout[];
  dividers: FlatDividerLayout[];
}

const STAGE_BOX: LayoutBox = {
  left: { fraction: 0, gap: 0 },
  top: { fraction: 0, gap: 0 },
  width: { fraction: 1, gap: 0 },
  height: { fraction: 1, gap: 0 },
};

export function computeFlatLayout(node: SplitNode): FlatLayout {
  const layout: FlatLayout = { panes: [], dividers: [] };
  collect(node, STAGE_BOX, layout);
  return layout;
}

/** Resolves a symbolic length against a measured stage size and gap. */
export function resolveLength(length: LayoutLength, stageSize: number, gapPx: number): number {
  return length.fraction * stageSize + length.gap * gapPx;
}

/**
 * The smallest stage that still gives every pane its configured minimum.
 *
 * A minimum cannot live on the pane itself: each pane is positioned
 * independently, so growing one box does not push its neighbour and the two
 * would overlap. Constraining the stage instead keeps every pane's share
 * proportional — the stage outgrows the root and is clipped, which is how the
 * flex layout behaved when its children hit their minimums.
 *
 * A pane's size is `fraction x stage + gap x GAP`, so satisfying `>= minimum`
 * means `stage >= (minimum - gap x GAP) / fraction`. That is expressible in
 * CSS, so the browser still resolves it on resize with no JS per frame.
 */
export function stageMinimumStyle(
  layout: FlatLayout,
  minimumPaneWidth: number,
  minimumPaneHeight: number,
): string {
  const widths = layout.panes.map((pane) => pane.box.width);
  const heights = layout.panes.map((pane) => pane.box.height);
  return [
    `min-width: ${axisMinimumCss(widths, minimumPaneWidth)}`,
    `min-height: ${axisMinimumCss(heights, minimumPaneHeight)}`,
  ].join("; ");
}

function axisMinimumCss(sizes: LayoutLength[], minimumPx: number): string {
  if (minimumPx <= 0) return "0px";

  const terms = new Set<string>();
  for (const size of sizes) {
    // A zero fraction cannot be satisfied by any stage size; skip rather than
    // divide by zero. Divider positions are clamped away from 0 and 1, so this
    // only guards against a degenerate tree.
    if (size.fraction <= 0) continue;
    const gapCoefficient = round(-size.gap);
    const gapTerm =
      gapCoefficient === 0
        ? ""
        : ` ${gapCoefficient < 0 ? "-" : "+"} ${Math.abs(gapCoefficient)} * var(--splits-split-gap, 6px)`;
    terms.add(`calc((${minimumPx}px${gapTerm}) / ${round(size.fraction)})`);
  }

  if (terms.size === 0) return "0px";
  return terms.size === 1 ? [...terms][0]! : `max(${[...terms].join(", ")})`;
}

export function layoutBoxStyle(box: LayoutBox): string {
  return [
    `left: ${lengthCss(box.left)}`,
    `top: ${lengthCss(box.top)}`,
    // Sizes are clamped: gap deductions accumulate toward a whole gap while the
    // fraction shrinks geometrically, so a deeply nested lopsided split can
    // compute negative. CSS would clamp that to zero and silently drop the
    // pane; max() makes the floor explicit.
    `width: ${sizeCss(box.width)}`,
    `height: ${sizeCss(box.height)}`,
  ].join("; ");
}

function collect(node: SplitNode, box: LayoutBox, layout: FlatLayout): void {
  if (node.type === "pane") {
    layout.panes.push({ paneId: node.pane.id, box });
    return;
  }

  const { split } = node;
  const horizontal = split.orientation === "horizontal";
  const position = split.dividerPosition;
  // The divider sits centred on the split position and occupies one whole gap,
  // so each side gives up half a gap — matching the flex layout this replaces,
  // where the divider was a `flex: 0 0 var(--splits-split-gap)` sibling.
  const start = horizontal ? box.left : box.top;
  const size = horizontal ? box.width : box.height;
  const splitPoint = add(start, scale(size, position));

  const firstSize = addGap(scale(size, position), -0.5);
  const secondStart = addGap(splitPoint, 0.5);
  const secondSize = addGap(scale(size, 1 - position), -0.5);
  const dividerStart = addGap(splitPoint, -0.5);
  const dividerSize: LayoutLength = { fraction: 0, gap: 1 };

  layout.dividers.push({
    splitId: split.id,
    orientation: split.orientation,
    box: horizontal
      ? { ...box, left: dividerStart, width: dividerSize }
      : { ...box, top: dividerStart, height: dividerSize },
    containerBox: box,
  });

  collect(
    split.first,
    horizontal ? { ...box, width: firstSize } : { ...box, height: firstSize },
    layout,
  );
  collect(
    split.second,
    horizontal
      ? { ...box, left: secondStart, width: secondSize }
      : { ...box, top: secondStart, height: secondSize },
    layout,
  );
}

function scale(length: LayoutLength, factor: number): LayoutLength {
  return { fraction: length.fraction * factor, gap: length.gap * factor };
}

function add(a: LayoutLength, b: LayoutLength): LayoutLength {
  return { fraction: a.fraction + b.fraction, gap: a.gap + b.gap };
}

function addGap(length: LayoutLength, gaps: number): LayoutLength {
  return { fraction: length.fraction, gap: length.gap + gaps };
}

function sizeCss(length: LayoutLength): string {
  return length.gap === 0 ? lengthCss(length) : `max(0px, ${lengthCss(length)})`;
}

function lengthCss(length: LayoutLength): string {
  const percent = round(length.fraction * 100);
  const gap = round(length.gap);
  if (gap === 0) return `${percent}%`;
  const sign = gap < 0 ? "-" : "+";
  const magnitude = Math.abs(gap);
  const term =
    magnitude === 1
      ? "var(--splits-split-gap, 6px)"
      : `${magnitude} * var(--splits-split-gap, 6px)`;
  return `calc(${percent}% ${sign} ${term})`;
}

function round(value: number): number {
  // Four decimals keeps sub-pixel accuracy at any realistic stage size without
  // emitting float noise into the style attribute on every divider drag frame.
  return Math.round(value * 10000) / 10000;
}
