/**
 * "Changed files only" filtering for the desktop file tree.
 *
 * Git status paths are repo-relative file paths (directories only appear for
 * wholly-untracked or ignored directories, with a trailing "/"), while the
 * loaded tree entries may stop at deferred (unexpanded) directories. So
 * visibility must flow upwards: a changed path makes every ancestor directory
 * visible, which is what keeps deferred directories like `ui/` on screen when
 * the only changes live deep inside them.
 */

export interface ChangedFilterTreeEntry {
  /** Repo-relative path; directories carry a trailing "/". */
  relativePath: string;
}

export interface ChangedFilterGitStatusEntry<TStatus extends string = string> {
  /** Repo-relative path; directory statuses carry a trailing "/". */
  path: string;
  status: TStatus;
}

/**
 * Returns the tree entry paths to show with the changed-only filter active:
 * changed files, changed directories (e.g. untracked directories reported as
 * one `dir/` record), everything inside a changed directory, and all ancestor
 * directories of the above. Preserves the order of `entries`.
 *
 * O(statuses × depth + entries × changedDirectories).
 */
export function visibleChangedTreePaths<TStatus extends string>(
  entries: readonly ChangedFilterTreeEntry[],
  gitStatus: readonly ChangedFilterGitStatusEntry<TStatus>[],
  changedStatuses: ReadonlySet<TStatus>,
): string[] {
  const visible = new Set<string>();
  const changedDirectoryPrefixes: string[] = [];

  for (const entry of gitStatus) {
    if (!changedStatuses.has(entry.status)) continue;
    visible.add(entry.path);
    if (entry.path.endsWith("/")) {
      changedDirectoryPrefixes.push(entry.path);
    }
    let parentPath = parentDirectoryPath(entry.path);
    while (parentPath && !visible.has(parentPath)) {
      visible.add(parentPath);
      parentPath = parentDirectoryPath(parentPath);
    }
  }

  if (visible.size === 0) return [];

  return entries
    .map((entry) => entry.relativePath)
    .filter(
      (relativePath) =>
        visible.has(relativePath) ||
        (changedDirectoryPrefixes.length > 0 &&
          changedDirectoryPrefixes.some((prefix) => relativePath.startsWith(prefix))),
    );
}

/** Parent directory path with a trailing "/", or "" at the root. */
function parentDirectoryPath(path: string): string {
  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
  const index = trimmed.lastIndexOf("/");
  return index === -1 ? "" : trimmed.slice(0, index + 1);
}
