// Shared queue that runs at most one terminal fit per animation frame.
//
// Panel/sidebar animations resize every visible terminal container at once,
// so each AssistantTerminalView's settle debounce expires in the same tick.
// An xterm fit is a full glyph re-measure (plus a PTY resize RPC); running
// several back-to-back in one task is a single >100ms main-thread stall right
// as an animation finishes. Spreading them one per frame keeps every frame
// within budget while the terminals still settle within a few frames.

type FitTask = () => void;

const queue: FitTask[] = [];
let draining = false;

/**
 * Enqueue a fit to run on its own animation frame. Tasks run in FIFO order,
 * one per frame. Errors in one task do not block the rest of the queue.
 */
export function enqueueSettledFit(task: FitTask): void {
  queue.push(task);
  if (!draining) {
    draining = true;
    scheduleNext();
  }
}

function scheduleNext(): void {
  requestAnimationFrame(() => {
    const task = queue.shift();
    try {
      task?.();
    } finally {
      if (queue.length > 0) {
        scheduleNext();
      } else {
        draining = false;
      }
    }
  });
}
