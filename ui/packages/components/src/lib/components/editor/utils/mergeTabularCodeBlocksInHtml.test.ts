import { mergeTabularCodeBlocksInHtml } from "./mergeTabularCodeBlocksInHtml.js";

describe("mergeTabularCodeBlocksInHtml", () => {
  it("returns null when there is no <table> with <pre> descendants", () => {
    expect(mergeTabularCodeBlocksInHtml("<p>hello</p>")).toBeNull();
    expect(mergeTabularCodeBlocksInHtml("<pre><code>single</code></pre>")).toBeNull();
    expect(mergeTabularCodeBlocksInHtml("<table><tr><td>no pre</td></tr></table>")).toBeNull();
  });

  it("returns null when a table has only a single <pre>", () => {
    const html = "<table><tbody><tr><td><pre><code>line</code></pre></td></tr></tbody></table>";
    expect(mergeTabularCodeBlocksInHtml(html)).toBeNull();
  });

  it("merges per-line <pre> tags inside a table into a single <pre>", () => {
    const html =
      '<table role="presentation"><tbody>' +
      '<tr><td class="lineNumber"><code>1</code></td><td class="codeContent"><pre><code>line 1</code></pre></td></tr>' +
      '<tr><td class="lineNumber"><code>2</code></td><td class="codeContent"><pre><code>line 2</code></pre></td></tr>' +
      "</tbody></table>";
    const result = mergeTabularCodeBlocksInHtml(html);
    expect(result).not.toBeNull();
    expect(result).toContain("<pre><code>line 1\nline 2</code></pre>");
    expect(result).not.toContain("<table");
  });

  it("preserves blank lines represented by empty per-line <pre> tags", () => {
    const html =
      "<table><tbody>" +
      '<tr><td class="codeContent"><pre><code>a</code></pre></td></tr>' +
      '<tr><td class="codeContent"><pre><code></code></pre></td></tr>' +
      '<tr><td class="codeContent"><pre><code>b</code></pre></td></tr>' +
      "</tbody></table>";
    const result = mergeTabularCodeBlocksInHtml(html);
    expect(result).toContain("<pre><code>a\n\nb</code></pre>");
  });

  it("keeps surrounding block content around the merged code block", () => {
    const html =
      "<p>task</p>" +
      "<table><tbody>" +
      '<tr><td class="codeContent"><pre><code>x</code></pre></td></tr>' +
      '<tr><td class="codeContent"><pre><code>y</code></pre></td></tr>' +
      "</tbody></table>" +
      "<p>solution</p>";
    const result = mergeTabularCodeBlocksInHtml(html)!;
    expect(result).toContain("<p>task</p>");
    expect(result).toContain("<pre><code>x\ny</code></pre>");
    expect(result).toContain("<p>solution</p>");
  });

  it("ignores line-number cells and only takes code cells", () => {
    const html =
      "<table><tbody>" +
      '<tr><td class="lineNumber"><code>1</code></td><td class="codeContent"><pre><code>real line 1</code></pre></td></tr>' +
      '<tr><td class="lineNumber"><code>2</code></td><td class="codeContent"><pre><code>real line 2</code></pre></td></tr>' +
      "</tbody></table>";
    const result = mergeTabularCodeBlocksInHtml(html)!;
    expect(result).toContain("<pre><code>real line 1\nreal line 2</code></pre>");
    expect(result).not.toContain("real line 1\n1");
  });

  it("skips header rows so they don't inject a blank first line", () => {
    const html =
      "<table>" +
      "<thead><tr><th>Line</th><th>Code</th></tr></thead>" +
      "<tbody>" +
      '<tr><td class="lineNumber"><code>1</code></td><td class="codeContent"><pre><code>first</code></pre></td></tr>' +
      '<tr><td class="lineNumber"><code>2</code></td><td class="codeContent"><pre><code>second</code></pre></td></tr>' +
      "</tbody></table>";
    const result = mergeTabularCodeBlocksInHtml(html)!;
    expect(result).toContain("<pre><code>first\nsecond</code></pre>");
    expect(result).not.toMatch(/<pre><code>\nfirst/);
  });

  it("leaves non-HighlightedCode tables (e.g. Pygments linenos/code split) alone", () => {
    const html =
      "<table>" +
      "<tr>" +
      '<td class="linenos"><pre>1\n2</pre></td>' +
      '<td class="code"><pre>line 1\nline 2</pre></td>' +
      "</tr></table>";
    expect(mergeTabularCodeBlocksInHtml(html)).toBeNull();
  });

  it("strips highlight spans and keeps the underlying code text", () => {
    const html =
      "<table><tbody>" +
      '<tr><td class="codeContent"><pre><code><span class="tok-k">const</span> <span class="tok-id">x</span> = 1;</code></pre></td></tr>' +
      '<tr><td class="codeContent"><pre><code><span class="tok-id">x</span>++;</code></pre></td></tr>' +
      "</tbody></table>";
    const result = mergeTabularCodeBlocksInHtml(html)!;
    expect(result).toContain("<pre><code>const x = 1;\nx++;</code></pre>");
  });
});
