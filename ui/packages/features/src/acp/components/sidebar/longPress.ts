// Svelte action for touch-first long-press menus. Fires the callback after the
// pointer stays down for LONG_PRESS_MS without drifting more than
// MOVE_TOLERANCE_PX (so vertical scrolling never triggers it), and also on the
// native contextmenu event so desktop right-click shares the same path. After a
// long press fires, the click the browser synthesizes on release is swallowed
// window-wide — the press usually opens an overlay, and that click would
// otherwise land on (and dismiss) it.

const LONG_PRESS_MS = 450;
const MOVE_TOLERANCE_PX = 10;

export function longPress(node: HTMLElement, onLongPress: () => void) {
  let callback = onLongPress;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;

  function clear() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function fire() {
    clear();
    suppressNextClick();
    navigator.vibrate?.(10);
    callback();
  }

  function handlePointerDown(event: PointerEvent) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    startX = event.clientX;
    startY = event.clientY;
    clear();
    timer = setTimeout(fire, LONG_PRESS_MS);
  }

  function handlePointerMove(event: PointerEvent) {
    if (timer === null || !event.isPrimary) return;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > MOVE_TOLERANCE_PX) {
      clear();
    }
  }

  function handlePointerEnd() {
    clear();
  }

  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    fire();
  }

  node.addEventListener("pointerdown", handlePointerDown);
  node.addEventListener("pointermove", handlePointerMove);
  node.addEventListener("pointerup", handlePointerEnd);
  node.addEventListener("pointercancel", handlePointerEnd);
  node.addEventListener("contextmenu", handleContextMenu);

  return {
    update(next: () => void) {
      callback = next;
    },
    destroy() {
      clear();
      node.removeEventListener("pointerdown", handlePointerDown);
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerup", handlePointerEnd);
      node.removeEventListener("pointercancel", handlePointerEnd);
      node.removeEventListener("contextmenu", handleContextMenu);
    },
  };
}

function suppressNextClick() {
  const handler = (event: MouseEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.removeEventListener("click", handler, true);
  };
  window.addEventListener("click", handler, true);
  // Drop the guard if no click ever arrives (e.g. the gesture was cancelled).
  setTimeout(() => window.removeEventListener("click", handler, true), 500);
}
