import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { woff2KatexCss } from "../dist/katexFonts.js";

test("installed KaTeX retains every face and all layout declarations", () => {
  for (const name of ["katex.css", "katex.min.css"]) {
    const original = readFileSync(
      new URL(`../../../packages/components/node_modules/katex/dist/${name}`, import.meta.url),
      "utf8",
    );
    const updated = woff2KatexCss(original);
    const urls = (css: string) => [...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1]);
    assert.equal(urls(original).length, 20);
    assert.deepEqual(urls(updated), urls(original));
    assert.doesNotMatch(updated, /\.woff\b|\.ttf\b/);
    // Remove only src declarations to compare every other upstream byte.
    const withoutSources = (css: string) => css.replace(/\bsrc\s*:[^;}]+/g, "src:");
    assert.equal(withoutSources(updated), withoutSources(original));
  }
});

test("unrecognized source lists and non-KaTeX fonts remain intact", () => {
  for (const css of [
    '@font-face{src:url(fonts/Other.woff2) format("woff2"),url(fonts/Other.ttf) format("truetype")}',
    '@font-face{src:local("KaTeX_Main"),url(fonts/KaTeX_Main.ttf) format("truetype")}',
    '@font-face{src:url(fonts/KaTeX_Main.woff) format("woff")}',
    '@font-face{src:url(fonts/KaTeX_Main.woff2) format("woff2"),url(fonts/KaTeX_Other.ttf) format("truetype")}',
  ])
    assert.equal(woff2KatexCss(css), css);
});
