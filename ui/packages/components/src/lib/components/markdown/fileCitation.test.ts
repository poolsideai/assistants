import { Marked } from "marked";
import { describe, expect, it } from "vitest";
import { fileCitationExtension } from "./fileCitation.js";

const md = new Marked(fileCitationExtension);
const path = "/Users/example/Attachments/Option Agreement (Non-US).pdf";
const citation = `:codex-file-citation{path="${path}" purpose="source"}`;

describe("Codex file citations", () => {
  it("renders inline and standalone citations as file references", () => {
    const html = md.parse(`See ${citation}.\n\n${citation}`) as string;
    expect(html.match(/data-file-link-target=/g)).toHaveLength(2);
    expect(html).toContain(`title="${path}">Option Agreement (Non-US).pdf</a>`);
    expect(html).not.toContain("purpose=");
    expect(html).not.toContain(":codex-file-citation");
  });

  it("accepts reordered attributes, single quotes, and relative paths", () => {
    expect(
      md.parse(":codex-file-citation{ purpose = 'source' path = 'docs/Option Agreement.pdf' }"),
    ).toContain(">Option Agreement.pdf</a>");
  });

  it("preserves literal percent escapes and escapes HTML in filenames", () => {
    const path = "/tmp/a%2Fb & <report>.pdf";
    const html = md.parse(`:codex-file-citation{path="${path}"}`) as string;
    const target = /data-file-link-target="([^"]+)"/.exec(html)?.[1];
    expect(target).toBeDefined();
    expect(decodeURIComponent(target!)).toBe(path);
    expect(html).toContain('data-file-link-literal="true"');
    expect(html).toContain("a%2Fb &amp; &lt;report&gt;.pdf</a>");
    expect(html).not.toContain("<report>");
  });

  it.each([
    `\`${citation}\``,
    `\`\`\`text\n${citation}\n\`\`\``,
    `    ${citation}`,
    `\\${citation}`,
    `[${citation}](https://example.com)`,
  ])("keeps code examples, escaped directives, and link labels literal: %s", (source) => {
    expect(md.parse(source)).not.toContain("data-file-link-target");
  });

  it.each([
    ':codex-file-citation{purpose="source"}',
    ':codex-file-citation{path=""}',
    ':codex-file-citation{path="/tmp/a.pdf" path="/tmp/b.pdf"}',
    ':codex-file-citation{path="/tmp/a.pdf"purpose="source"}',
    ':codex-file-citation{path="/tmp/a.pdf"',
    ":codex-file-citation{path=/tmp/a.pdf}",
    ':codex-file-citation{path="https://example.com/a.pdf"}',
    ':codex-file-citation{path="javascript:alert(1)"}',
    ':codex-file-citation{path="//server/a.pdf"}',
    ':codex-file-citation{path="/tmp/a\u0000.pdf"}',
  ])("leaves malformed, incomplete, and nonlocal citations literal: %s", (source) => {
    expect(md.parse(source)).not.toContain("data-file-link-target");
  });
});
