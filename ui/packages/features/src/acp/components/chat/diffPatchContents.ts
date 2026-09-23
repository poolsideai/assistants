const HUNK_HEADER_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

/**
 * Verifies that a unified patch is consistent with full before/after file
 * contents: every context and deletion line matches the old side and every
 * context and addition line matches the new side, at the line numbers the
 * hunk headers claim.
 *
 * The diff document fetches contents separately from the (snapshotted, maybe
 * minutes-old) patch chunks, so the two can drift apart when the worktree
 * changes between the reads. Enriching a patch with mismatched contents would
 * render wrong lines when collapsed context is expanded — callers must skip
 * enrichment unless this check passes.
 */
export function patchMatchesContents(
  patch: string,
  oldContent: string,
  newContent: string,
): boolean {
  const oldLines = splitContentLines(oldContent);
  const newLines = splitContentLines(newContent);
  let oldLine = 0;
  let newLine = 0;
  let inHunk = false;
  for (const line of patch.split("\n")) {
    const header = HUNK_HEADER_RE.exec(line);
    if (header) {
      inHunk = true;
      oldLine = Number.parseInt(header[1] ?? "0", 10);
      newLine = Number.parseInt(header[3] ?? "0", 10);
      continue;
    }
    if (!inHunk || line === "") continue;
    const text = line.slice(1);
    switch (line[0]) {
      case " ":
        if (oldLines[oldLine - 1] !== text || newLines[newLine - 1] !== text) return false;
        oldLine++;
        newLine++;
        break;
      case "-":
        if (oldLines[oldLine - 1] !== text) return false;
        oldLine++;
        break;
      case "+":
        if (newLines[newLine - 1] !== text) return false;
        newLine++;
        break;
      case "\\":
        // "\ No newline at end of file" — no content to compare.
        break;
      default:
        // Anything else inside a hunk means the patch shape is off (e.g. a
        // truncated oversized line); refuse enrichment.
        return false;
    }
  }
  return true;
}

function splitContentLines(content: string): string[] {
  const lines = content.split("\n");
  // A trailing newline produces a phantom empty final element that no patch
  // line refers to; without it the last element is a real unterminated line.
  if (lines.at(-1) === "") lines.pop();
  return lines;
}
