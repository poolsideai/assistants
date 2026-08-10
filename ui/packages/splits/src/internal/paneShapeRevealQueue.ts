type PaneShapeRevealTask = () => void;

let revealFrame: number | undefined;
const revealQueue: PaneShapeRevealTask[] = [];

export function enqueuePaneShapeReveal(reveal: PaneShapeRevealTask): () => void {
  revealQueue.push(reveal);
  revealFrame ??= requestAnimationFrame(flushNextReveal);

  return () => {
    const index = revealQueue.indexOf(reveal);
    if (index >= 0) revealQueue.splice(index, 1);
  };
}

function flushNextReveal() {
  revealFrame = undefined;
  // Reveal everything pending in one paint. The queue exists to put the reveal
  // a frame after the geometry write, not to stagger panes: a structural change
  // (split, tab drop, entry swap) re-measures every pane at once, and revealing
  // one per frame popped the shadows back in over N frames of visible settling.
  for (const reveal of revealQueue.splice(0)) reveal();
}
