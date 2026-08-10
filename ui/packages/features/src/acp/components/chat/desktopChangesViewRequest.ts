/**
 * Bridge for switching the files sidebar (DesktopFilesTree) into its changes
 * (review) view from elsewhere in the app — e.g. the conversation footer's
 * "Stage and Commit..." button.
 *
 * The files tab may not be mounted yet when the request is made (the splits
 * pane may have to create it first), so the request is kept in a pending slot
 * with take semantics in addition to being broadcast as a window event for
 * already-mounted trees. Same pattern as desktopChangesFileSelection.
 */

import { DESKTOP_OPEN_CHANGES_VIEW_EVENT } from "./desktopCommandPicker";

export interface DesktopOpenChangesViewEventDetail {
  /** When set, only trees rooted at this worktree should flip. */
  worktreePath?: string;
}

let pendingChangesViewRequest = false;
let pendingWorktreePath: string | undefined;
let pendingSince = 0;

/**
 * A pending request is only honored briefly — if no files tree mounts to
 * consume it (e.g. the target pane stayed hidden), a tree opened minutes
 * later for an unrelated reason must not surprise-flip into changes view.
 */
const PENDING_TTL_MS = 15_000;

function normalize(path: string | undefined): string | undefined {
  if (!path) return undefined;
  const trimmed = path.replace(/[/\\]+$/, "");
  return trimmed || path;
}

/** True when a request scoped to `requestPath` applies to a tree at `rootPath`. */
export function changesViewRequestMatches(
  requestPath: string | undefined,
  rootPath: string,
): boolean {
  return requestPath === undefined || normalize(requestPath) === normalize(rootPath);
}

/**
 * Asks a files tree (mounted now or later) to switch to the changes view.
 * Pass the worktree path when known so only trees for that worktree flip —
 * without it, every mounted files tree switches.
 */
export function requestDesktopChangesView(worktreePath?: string): void {
  pendingChangesViewRequest = true;
  pendingWorktreePath = worktreePath;
  pendingSince = Date.now();
  window.dispatchEvent(
    new CustomEvent<DesktopOpenChangesViewEventDetail>(DESKTOP_OPEN_CHANGES_VIEW_EVENT, {
      detail: { worktreePath },
    }),
  );
}

/** Consumes the pending request if it applies to `rootPath` (single-take). */
export function takePendingDesktopChangesViewRequest(rootPath: string): boolean {
  if (!pendingChangesViewRequest) return false;
  if (!changesViewRequestMatches(pendingWorktreePath, rootPath)) return false;
  pendingChangesViewRequest = false;
  pendingWorktreePath = undefined;
  return Date.now() - pendingSince <= PENDING_TTL_MS;
}
