export type ReorderAxis = "vertical" | "horizontal";

export type ReorderEdge = "before" | "after";

/**
 * The projected landing spot of the dragged item, expressed relative to the
 * item the pointer is currently over. Indices are positions in the *current*
 * item order (the dragged item stays in place during the drag).
 */
export interface ReorderDropTarget {
  index: number;
  edge: ReorderEdge;
}

export interface ReorderItemRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface ReorderDragMoveDetail {
  from: number;
  clientX: number;
  clientY: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
  itemRect: ReorderItemRect;
  itemRects: ReorderItemRect[];
}

export interface ReorderableConfig {
  /** Layout direction of the list. Defaults to `"vertical"`. */
  axis?: ReorderAxis;
  /**
   * Selector for the element inside an item that initiates a drag. When set,
   * only that element starts a drag (the rest of the item stays clickable).
   * When omitted, the whole item is draggable.
   */
  handleSelector?: string;
  /** Selector identifying reorderable items within the zone. Defaults to `[data-reorderable-item]`. */
  itemSelector?: string;
  /** When true, dragging is disabled. */
  disabled?: boolean;
  /**
   * Distance in pixels from the scroll container edge at which auto-scroll
   * kicks in while dragging. Defaults to `32`; set to `0` to disable.
   */
  autoScrollThreshold?: number;
  /**
   * Resolves the scrollable element used for auto-scroll. Defaults to the
   * nearest scrollable ancestor of the zone.
   */
  getScrollContainer?: (zone: HTMLElement) => HTMLElement | null;
  /**
   * Called when a reorder is committed. `from` and `to` are array indices with
   * "move" semantics: `array.splice(from, 1)` then `array.splice(to, 0, item)`.
   * Use the exported {@link moveItem} helper to apply it.
   */
  onReorder: (from: number, to: number) => void;
  /** Called when a drag starts, with the dragged item's index. */
  onDragStart?: (from: number) => void;
  /** Called while dragging with pointer coordinates and the initial item geometry. */
  onDragMove?: (detail: ReorderDragMoveDetail) => void;
  /** Called when a drag ends (committed, cancelled, or dropped outside). */
  onDragEnd?: () => void;
  /**
   * Called whenever the projected drop target changes (null when there is no
   * valid target, e.g. hovering the item's own slot). Use it to render a drop
   * indicator. The zone also reflects this via `data-reorderable-over` on the
   * targeted item, so pure-CSS indicators are possible too.
   */
  onTargetChange?: (target: ReorderDropTarget | null) => void;
}

export interface ReorderableHandle {
  update(config: ReorderableConfig): void;
  destroy(): void;
}
