type PaneShapeRevealTask = () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function enqueuePaneShapeReveal(reveal: PaneShapeRevealTask): () => void {
  revealQueue.push(reveal);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const index = revealQueue.indexOf(reveal);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Reveal everything pending in one paint. The queue exists to put the reveal
  // a frame after the geometry write, not to stagger panes: a structural change
  // (split, tab drop, entry swap) re-measures every pane at once, and revealing
  // one per frame popped the shadows back in over N frames of visible settling.
  for (const reveal of revealQueue.splice(0)) reveal();
__POOL_SYNTHETIC_IMPORT_BASELINE__
