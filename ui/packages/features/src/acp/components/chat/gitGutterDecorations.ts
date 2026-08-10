/**
 * Parses a unified diff (HEAD vs worktree) into per-line gutter decorations
 * for the file viewer: added line ranges, modified line ranges, and the
 * positions where deletions happened. Line numbers refer to the new
 * (worktree) side, 1-based.
 */

export interface GitGutterRange {
  /** First line of the range (1-based, inclusive). */
  start: number;
  /** Last line of the range (1-based, inclusive). */
  end: number;
}

export interface GitGutterDecorations {
  added: GitGutterRange[];
  modified: GitGutterRange[];
  /**
   * New-side line numbers *after which* lines were deleted. 0 means lines
   * were deleted before the first line of the file.
   */
  deletedAfter: number[];
}

const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

/**
 * Classifies each new-side line touched by the patch. Within a hunk, a run
 * of removed lines followed by added lines pairs up as "modified" (one for
 * one); surplus added lines are "added"; surplus removed lines leave a
 * deletion marker at the boundary.
 */
export function parseGitGutterDecorations(patch: string): GitGutterDecorations {
  const added: GitGutterRange[] = [];
  const modified: GitGutterRange[] = [];
  const deletedAfter: number[] = [];

  const pushLine = (ranges: GitGutterRange[], line: number) => {
    const last = ranges[ranges.length - 1];
    if (last && last.end === line - 1) {
      last.end = line;
    } else {
      ranges.push({ start: line, end: line });
    }
  };

  let newLine = 0;
  let inHunk = false;
  let pendingDeletes = 0;

  const flushDeletes = () => {
    if (pendingDeletes > 0) {
      deletedAfter.push(newLine - 1 < 0 ? 0 : newLine - 1);
      pendingDeletes = 0;
    }
  };

  for (const line of patch.split("\n")) {
    const hunk = HUNK_HEADER.exec(line);
    if (hunk) {
      flushDeletes();
      newLine = Number(hunk[1]);
      // A zero-length new side (pure deletion hunk) anchors after newStart.
      if (hunk[2] === "0") newLine += 1;
      inHunk = true;
      continue;
    }
    if (!inHunk) continue;

    if (line.startsWith("-")) {
      pendingDeletes += 1;
    } else if (line.startsWith("+")) {
      if (pendingDeletes > 0) {
        pendingDeletes -= 1;
        pushLine(modified, newLine);
      } else {
        pushLine(added, newLine);
      }
      newLine += 1;
    } else if (line.startsWith(" ")) {
      flushDeletes();
      newLine += 1;
    } else if (line.startsWith("\\")) {
      // "\ No newline at end of file" — not a content line.
    } else {
      // File header between hunks (diff --git, index, ---, +++) ends the hunk.
      flushDeletes();
      inHunk = false;
    }
  }
  flushDeletes();

  return { added, modified, deletedAfter };
}
