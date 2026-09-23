export const ROW_EXIT_DURATION_MS = 180;

// Sidebar rows fly out only when the user removed them (archiving a
// conversation, deleting a worktree). A row that leaves because a search or a
// collapsed group stopped matching it must disappear instantly — animating
// those makes collapsing a group read as bulk deletion.
export function rowExitDurationMs(exiting: boolean): number {
  if (!exiting) return 0;
  return prefersReducedMotion() ? 0 : ROW_EXIT_DURATION_MS;
}

function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}
