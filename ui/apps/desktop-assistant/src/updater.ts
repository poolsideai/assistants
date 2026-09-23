__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  checkAndStageDesktopUpdate,
  desktopBundleReplaced,
  installStagedDesktopUpdate,
  type DesktopUpdateInfo,
} from "./rpc/host";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// verification, and the download. A single invocation checks once and downloads
// that exact Update value, so a feed or preference change cannot turn a
// confirmed version into a different installed version.
//
// Downloads are staged, never installed in the background: installing replaces
// the running .app in place, and a process running from an unlinked bundle is
// killed by the next native file panel it opens (see bundle_guard.rs). The
// install happens under the Update button, immediately before the relaunch.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Something outside our updater swapped the bundle on disk. There is nothing
  // to install — only this process is stale — so applying just relaunches.
  | { kind: "replaced" }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Trim feed release notes down to what users should see: the workflow appends
 * a `Release source: <tag>@<sha>` provenance trailer to the CrabNebula notes
 * for resume validation, which is meaningless in the What's new popover.
 */
export function userFacingUpdateNotes(notes: string | null | undefined): string | undefined {
  if (!notes) return undefined;
  const stripped = notes
    .split("\n")
    .filter((line) => !line.trim().startsWith("Release source: "))
    .join("\n")
    .trim();
  return stripped || undefined;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/** Statuses that only a restart can clear. */
function awaitingRestart(status: UpdaterStatus): boolean {
  return status.kind === "downloaded" || status.kind === "replaced";
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if (awaitingRestart(get(updaterStatus))) return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (update) {
      updaterStatus.set({
        kind: "downloaded",
        version: update.version,
        notes: userFacingUpdateNotes(update.notes),
      });
    } else {
      updaterStatus.update((status) => (awaitingRestart(status) ? status : { kind: "idle" }));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (awaitingRestart(status)) return status;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (silent) console.debug("update check/download failed", error);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Install the staged download and restart into it.
 *
 * Installing unlinks the running bundle, so it happens here — at the point of
 * restart — rather than in the background. `installStagedDesktopUpdate` does not
 * return on success; the process restarts. When the bundle was replaced by
 * something else there is nothing to install and we only relaunch.
 */
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Nothing is ever staged in dev (the Rust command no-ops on unstamped local
  // builds), so the mocked pill below just restarts, as it always has.
  if (get(updaterStatus).kind === "replaced" || import.meta.env.DEV) {
    await relaunch();
    return;
  }
  await installStagedDesktopUpdate();
}

/**
 * Notice a bundle swap performed by anything other than our own updater — a DMG
 * dragged over the top, a CI copy, a second instance. Only a restart fixes it,
 * so surface the same Update affordance.
 */
export async function refreshBundleReplacedStatus(): Promise<boolean> {
  let replaced = false;
  try {
    replaced = await desktopBundleReplaced();
  } catch (error) {
    console.debug("bundle replacement check failed", error);
    return false;
  }
  if (replaced) {
    updaterStatus.update((status) =>
      status.kind === "downloaded" ? status : { kind: "replaced" },
    );
  }
  return replaced;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * bundle replaced out from under us on the same cadence. Concurrent manual and
 * scheduled checks join the same promise.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (awaitingRestart(get(updaterStatus))) return;
    // A stale process cannot usefully install anything, so this comes first.
    if (await refreshBundleReplacedStatus()) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if (awaitingRestart(current)) {
    // The sidebar Update button already shows the pending restart.
    return;
  }
  if (await refreshBundleReplacedStatus()) {
    host.showInfoMessage("Poolside has already been updated on disk — restart to finish updating.");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
