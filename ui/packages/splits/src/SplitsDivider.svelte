<script lang="ts">
  import type { SplitsController } from "./controller.js";
  import { layoutBoxStyle, resolveLength, type LayoutBox } from "./internal/layout.js";
  import type { SplitID, SplitOrientation } from "./types.js";

  const dividerDragThreshold = 2;

  interface Props {
    controller: SplitsController;
    splitId: SplitID;
    orientation: SplitOrientation;
    box: LayoutBox;
    containerBox: LayoutBox;
    dragging: boolean;
    onDraggingChange: (dragging: boolean) => void;
  }

  let { controller, splitId, orientation, box, containerBox, dragging, onDraggingChange }: Props =
    $props();

  const style = $derived(layoutBoxStyle(box));

  // The split's own rect, resolved from the stage. Panes are flat children of
  // one stage now, so there is no intermediate element whose box could be
  // measured directly — the symbolic container box carries that geometry.
  function measureContainerRect(divider: HTMLElement) {
    const stage = divider.parentElement;
    if (!stage) return undefined;

    const stageRect = stage.getBoundingClientRect();
    // Same fallback as layout.ts emits into its calc(), so a missing custom
    // property resolves identically here and in CSS.
    const parsedGap = Number.parseFloat(
      getComputedStyle(stage).getPropertyValue("--splits-split-gap"),
    );
    const gapPx = Number.isFinite(parsedGap) ? parsedGap : 6;

    return {
      left: stageRect.left + resolveLength(containerBox.left, stageRect.width, gapPx),
      top: stageRect.top + resolveLength(containerBox.top, stageRect.height, gapPx),
      width: resolveLength(containerBox.width, stageRect.width, gapPx),
      height: resolveLength(containerBox.height, stageRect.height, gapPx),
    };
  }

  function dividerPointerDown(event: PointerEvent) {
    event.preventDefault();
    const rect = measureContainerRect(event.currentTarget as HTMLElement);
    if (!rect) return;

    const startClientX = event.clientX;
    const startClientY = event.clientY;
    let hasDragged = false;
    // Pointer events can outpace the frame rate (and each setDividerPosition
    // re-renders the layout); coalesce moves to one update per frame.
    let moveFrame: number | undefined;
    let pendingMove: PointerEvent | undefined;
    const minimum =
      orientation === "horizontal"
        ? controller.configuration.appearance.minimumPaneWidth
        : controller.configuration.appearance.minimumPaneHeight;

    function exceedsDragThreshold(pointerEvent: PointerEvent) {
      return (
        Math.abs(pointerEvent.clientX - startClientX) >= dividerDragThreshold ||
        Math.abs(pointerEvent.clientY - startClientY) >= dividerDragThreshold
      );
    }

    function setPosition(pointerEvent: PointerEvent, isDragging: boolean) {
      const size = orientation === "horizontal" ? rect!.width : rect!.height;
      if (size <= 0) {
        return;
      }

      const rawPosition =
        orientation === "horizontal"
          ? (pointerEvent.clientX - rect!.left) / size
          : (pointerEvent.clientY - rect!.top) / size;
      const minimumPosition = Math.min(0.45, minimum / size);
      const position = Math.min(Math.max(rawPosition, minimumPosition), 1 - minimumPosition);
      controller.setDividerPosition(position, splitId);

      if (isDragging) {
        controller.notifyGeometryChange(true);
      }
    }

    function applyPendingMove() {
      moveFrame = undefined;
      const pointerEvent = pendingMove;
      pendingMove = undefined;
      if (pointerEvent) {
        setPosition(pointerEvent, true);
      }
    }

    function cancelPendingMove() {
      if (moveFrame !== undefined) {
        cancelAnimationFrame(moveFrame);
        moveFrame = undefined;
      }
      pendingMove = undefined;
    }

    function pointerMove(pointerEvent: PointerEvent) {
      if (!hasDragged && !exceedsDragThreshold(pointerEvent)) {
        return;
      }

      hasDragged = true;
      onDraggingChange(true);
      pendingMove = pointerEvent;
      moveFrame ??= requestAnimationFrame(applyPendingMove);
    }

    function pointerUp(pointerEvent: PointerEvent) {
      cancelPendingMove();
      if (hasDragged || exceedsDragThreshold(pointerEvent)) {
        setPosition(pointerEvent, false);
        controller.notifyGeometryChange(false);
      }

      hasDragged = false;
      onDraggingChange(false);
      detach();
    }

    function pointerCancel() {
      cancelPendingMove();
      onDraggingChange(false);
      detach();
    }

    function detach() {
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerCancel);
    }

    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerCancel);
  }

  function dividerDoubleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    controller.setDividerPosition(0.5, splitId, { notify: true });
  }
</script>

<button
  type="button"
  class="splits-divider"
  class:splits-divider-horizontal={orientation === "horizontal"}
  class:splits-divider-vertical={orientation === "vertical"}
  class:splits-divider-dragging={dragging}
  data-split-id={splitId}
  aria-label="Resize split"
  {style}
  onpointerdown={dividerPointerDown}
  ondblclick={dividerDoubleClick}
></button>

<style>
  .splits-divider {
    --splits-divider-line-size: 1px;

    position: absolute;
    z-index: 3;
    border: 0;
    padding: 0;
    outline: none;
    background: transparent;
  }

  .splits-divider-horizontal {
    cursor: col-resize;
  }

  .splits-divider-vertical {
    cursor: row-resize;
  }

  .splits-divider::before {
    content: "";
    position: absolute;
    background: transparent;
    transition: background-color 100ms ease;
  }

  .splits-divider-horizontal::before {
    top: 8px;
    right: 0;
    bottom: 8px;
    width: var(--splits-divider-line-size);
    mask-image: linear-gradient(
      to bottom,
      transparent,
      #000 40px,
      #000 calc(100% - 40px),
      transparent
    );
  }

  .splits-divider-vertical::before {
    top: 0;
    right: 8px;
    left: 8px;
    height: var(--splits-divider-line-size);
    mask-image: linear-gradient(
      to right,
      transparent,
      #000 40px,
      #000 calc(100% - 40px),
      transparent
    );
  }

  .splits-divider:hover::before,
  .splits-divider-dragging::before,
  .splits-divider:focus-visible::before {
    background: var(--splits-accent);
  }
</style>
