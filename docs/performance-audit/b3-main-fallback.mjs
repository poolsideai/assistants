/** Compare the original/patched Pierre no-worker path. Pass both package dist directories. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const directories = process.argv.slice(2);
assert.equal(directories.length, 2, "Pass original and patched @pierre/diffs/dist directories");
const results = [];
for (const directory of directories) {
  const load = (file) => import(pathToFileURL(resolve(directory, file)).href);
  const { getSharedHighlighter, disposeHighlighter } = await load(
    "highlighter/shared_highlighter.js",
  );
  const { renderFileWithHighlighter } = await load("utils/renderFileWithHighlighter.js");
  const { registerCustomTheme } = await load("highlighter/themes/registerCustomTheme.js");
  registerCustomTheme("audit-custom", async () => ({
    name: "audit-custom",
    type: "dark",
    colors: { "editor.background": "#111111", "editor.foreground": "#eeeeee" },
    tokenColors: [{ scope: "keyword", settings: { foreground: "#abcdef" } }],
  }));
  const records = [];
  for (const preferredHighlighter of ["shiki-wasm", "shiki-js"]) {
    const langs = [
      "typescript",
      "tsx",
      "python",
      "bash",
      "cpp",
      "emacs-lisp",
      "ruby",
      "json",
      "vue",
      "svelte",
      "text",
    ];
    const themes = ["pierre-light", "pierre-dark", "github-light", "github-dark", "audit-custom"];
    const highlighter = await getSharedHighlighter({ themes, langs, preferredHighlighter });
    for (const lang of langs)
      for (const theme of themes) {
        const result = renderFileWithHighlighter(
          {
            name: "example",
            lang,
            contents: 'const answer = 42; // comment\nprint("<safe>&value");',
          },
          highlighter,
          { theme },
        );
        records.push({
          engine: preferredHighlighter,
          lang,
          theme,
          hash: createHash("sha256").update(JSON.stringify(result)).digest("hex"),
        });
      }
    await disposeHighlighter();
  }
  results.push(records);
}
assert.deepEqual(results[1], results[0]);
console.log(
  JSON.stringify({ cases: results[0].length, identical: true, results: results[0] }, null, 2),
);
