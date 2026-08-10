/**
 * Collapses per-line <pre> tags inside a <table> (as rendered by HighlightedCode) into a single
 * <pre> per table, so a pasted code block ends up as one code_block instead of one per line.
 * Returns the transformed HTML, or null if no such table was found.
 */
export function mergeTabularCodeBlocksInHtml(html: string): string | null {
  const doc = new window.DOMParser().parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table");
  let modified = false;

  for (const table of tables) {
    // Only match HighlightedCode's specific shape: one <pre> per line inside a .codeContent cell.
    // Skipping rows without .codeContent avoids header rows (which would add a blank first line)
    // and unrelated tables like Pygments' linenos/code split (which would otherwise be corrupted
    // by picking up a line-number <pre>).
    const rows = table.querySelectorAll("tr");
    const lines: string[] = [];
    for (const row of rows) {
      const codeCell = row.querySelector("td.codeContent pre, .codeContent pre");
      if (!codeCell) continue;
      lines.push(codeCell.textContent ?? "");
    }

    if (lines.length < 2) continue;

    const pre = doc.createElement("pre");
    const code = doc.createElement("code");
    code.textContent = lines.join("\n");
    pre.appendChild(code);
    table.replaceWith(pre);
    modified = true;
  }

  return modified ? doc.body.innerHTML : null;
}
