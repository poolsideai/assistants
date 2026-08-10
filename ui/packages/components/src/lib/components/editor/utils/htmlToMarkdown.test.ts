import { htmlToMarkdown } from "./htmlToMarkdown.js";

describe("htmlToMarkdown", () => {
  it("converts common rich text elements to markdown", () => {
    expect(
      htmlToMarkdown(`
        <h2>Release notes</h2>
        <p><strong>Ship</strong> the <em>prompt</em> paste fix with
        <a href="https://example.com/docs">docs</a>.</p>
        <blockquote><p>Keep the ACP text block readable.</p></blockquote>
      `),
    ).toBe(
      [
        "## Release notes",
        "**Ship** the *prompt* paste fix with [docs](https://example.com/docs).",
        "> Keep the ACP text block readable.",
      ].join("\n\n"),
    );
  });

  it("converts ordered, unordered, and nested lists", () => {
    expect(
      htmlToMarkdown(`
        <ol>
          <li>Convert HTML</li>
          <li>Preserve lists
            <ul>
              <li>Nested item</li>
            </ul>
          </li>
        </ol>
      `),
    ).toBe(["1. Convert HTML", "2. Preserve lists", "     - Nested item"].join("\n"));
  });

  it("converts code blocks and inline code", () => {
    expect(
      htmlToMarkdown(`
        <p>Run <code>pnpm test</code>.</p>
        <pre><code class="language-ts">const value = 1;</code></pre>
      `),
    ).toBe(["Run `pnpm test`.", "", "```ts", "const value = 1;", "```"].join("\n"));
  });

  it("preserves whitespace inside inline code and code blocks", () => {
    expect(
      htmlToMarkdown(
        [
          "<p>Compare <code>a   b</code> exactly.</p>",
          "<pre><code>first   line\n\n\nlast   line  </code></pre>",
        ].join(""),
      ),
    ).toBe(
      ["Compare `a   b` exactly.", "", "```", "first   line", "", "", "last   line  ", "```"].join(
        "\n",
      ),
    );
  });

  it("converts simple tables to GitHub-flavored markdown tables", () => {
    expect(
      htmlToMarkdown(`
        <table>
          <tr><th>Name</th><th>Status</th></tr>
          <tr><td>Plain text</td><td>Supported</td></tr>
          <tr><td>Tables</td><td>Markdown</td></tr>
        </table>
      `),
    ).toBe(
      [
        "| Name | Status |",
        "| --- | --- |",
        "| Plain text | Supported |",
        "| Tables | Markdown |",
      ].join("\n"),
    );
  });

  it("ignores unsafe tags and URLs", () => {
    expect(
      htmlToMarkdown(`
        <p>Hello<script>alert("x")</script>
        <a href="javascript:alert('x')">bad link</a>
        <img src="data:image/png;base64,abc" alt="pasted image"></p>
      `),
    ).toBe("Hello bad link pasted image");
  });

  it("escapes markdown link URLs that contain spaces or parentheses", () => {
    expect(
      htmlToMarkdown('<p><a href="https://example.com/release notes(1)">Release notes</a></p>'),
    ).toBe("[Release notes](https://example.com/release%20notes%281%29)");
  });

  it("does not escape ordinary punctuation in prose", () => {
    expect(htmlToMarkdown("<p>Use state-of-the-art prompts. Keep #tags readable.</p>")).toBe(
      "Use state-of-the-art prompts. Keep #tags readable.",
    );
  });

  it("preserves br tags as line breaks", () => {
    expect(htmlToMarkdown("<p>First line<br>Second line <br> Third line</p>")).toBe(
      ["First line", "Second line", "Third line"].join("\n"),
    );
  });

  it("converts GitHub review clipboard HTML to markdown", () => {
    expect(
      htmlToMarkdown(`
        <meta charset="utf-8">
        <h2 dir="auto" style="font-weight: 600;">Pull request overview</h2>
        <p dir="auto">
          This PR adds a self-contained<span>&nbsp;</span>
          <code class="notranslate">htmlToMarkdown</code><span>&nbsp;</span>
          utility and wires it into the existing<span>&nbsp;</span>
          <code class="notranslate">handlePaste</code><span>&nbsp;</span>plugin.
        </p>
        <p dir="auto"><strong style="font-weight: 600;">Changes:</strong></p>
        <ul dir="auto">
          <li>Adds<span>&nbsp;</span><code class="notranslate">htmlToMarkdown.ts</code>, a DOM-based converter.</li>
          <li>Extends<span>&nbsp;</span><code class="notranslate">code.ts</code><span>&nbsp;</span><code class="notranslate">handlePaste</code>.</li>
        </ul>
      `),
    ).toBe(
      [
        "## Pull request overview",
        "This PR adds a self-contained `htmlToMarkdown` utility and wires it into the existing `handlePaste` plugin.",
        "**Changes:**",
        [
          "- Adds `htmlToMarkdown.ts`, a DOM-based converter.",
          "- Extends `code.ts` `handlePaste`.",
        ].join("\n"),
      ].join("\n\n"),
    );
  });
});
