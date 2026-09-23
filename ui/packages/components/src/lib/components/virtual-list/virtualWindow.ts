/**
 * Computes which contiguous slice of a list to render (the "window"),
 * plus the spacer padding heights needed to maintain correct scroll geometry
 * for the items outside the window.
 *
 * This is pure layout logic with no DOM or framework dependencies.
 */

export interface VirtualWindowInput {
  /** Total number of items in the list. */
  count: number;
  /** Per-item height (measured or estimated). Must be > 0. */
  heightFor: (index: number) => number;
  /** Current scroll offset of the container in pixels. */
  scrollTop: number;
  /** Visible height of the scroll container in pixels. */
  viewportHeight: number;
  /** Extra pixels rendered above and below the viewport ("overscan"). */
  overscanPx: number;
  /**
   * When `true`, force `end` to `count - 1` so that the live tail
   * is never unmounted while the user is stuck to the bottom.
   */
  pinEnd: boolean;
}

export interface VirtualWindow {
  /** First rendered index (inclusive). */
  start: number;
  /** Last rendered index (inclusive). -1 when count === 0. */
  end: number;
  /** Sum of heights for items [0 .. start-1]. */
  topPad: number;
  /** Sum of heights for items [end+1 .. count-1]. */
  bottomPad: number;
}

/**
 * Compute the window from the given scroll geometry.
 *
 * Runs a single forward pass over all items — O(count) worst case — so it is
 * suitable for use in render loops even on large lists.
 */
export function computeVirtualWindow(input: VirtualWindowInput): VirtualWindow {
  const { count, heightFor, scrollTop, viewportHeight, overscanPx, pinEnd } = input;

  if (count === 0) {
    return { start: 0, end: -1, topPad: 0, bottomPad: 0 };
  }

  const renderTop = scrollTop - overscanPx;
  const renderBottom = scrollTop + viewportHeight + overscanPx;

  let start = -1;
  let end = -1;
  let offset = 0;
  let topPad = 0;
  // Bottom edge (cumulative offset) of the last item currently in the window.
  // Tracked alongside `end` so we never need a second pass to size the window.
  let windowBottom = 0;

  for (let i = 0; i < count; i++) {
    const h = heightFor(i);
    const itemTop = offset;
    const itemBottom = offset + h;

    if (start === -1 && itemBottom > renderTop) {
      // First item whose bottom edge falls inside the render zone.
      start = i;
      topPad = offset;
    }

    if (itemTop < renderBottom) {
      // Still inside the render zone.
      end = i;
      windowBottom = itemBottom;
    }

    offset = itemBottom;
  }

  // The single pass above already summed every height into `offset`.
  const totalHeight = offset;

  // Guard: if nothing matched (e.g. scrollTop is far below all content), snap
  // start/end to the last item so we always render something when count > 0.
  if (start === -1) {
    start = count - 1;
    end = count - 1;
    topPad = totalHeight - heightFor(count - 1);
    windowBottom = totalHeight;
  } else if (end === -1 || end < start) {
    end = start;
    windowBottom = topPad + heightFor(start);
  }

  // Clamp to valid range.
  start = Math.max(0, Math.min(start, count - 1));
  end = Math.max(start, Math.min(end, count - 1));

  // When pinned to the bottom, extend end to include every item through the
  // last, but keep the computed start so that off-screen items above are still
  // unmounted.
  if (pinEnd) {
    end = count - 1;
    windowBottom = totalHeight;
  }

  // topPad + window + bottomPad == totalHeight. Both pads come straight from the
  // cumulative offsets captured in the single pass above — no second scan.
  const bottomPad = totalHeight - windowBottom;

  return { start, end, topPad, bottomPad };
}
