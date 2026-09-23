import { describe, expect, it, vi } from "vitest";
import { codeBlockHtml, writeRichToClipboard } from "./codeClipboard.js";

describe("codeBlockHtml", () => {
  it("wraps plain code in pre/code elements", () => {
    const html = codeBlockHtml("hello world");
    expect(html).toContain("<pre ");
    expect(html).toContain("<code>");
    expect(html).toContain("hello world");
    expect(html).toContain("</code></pre>");
  });

  it("includes language class when lang is provided", () => {
    const html = codeBlockHtml("const x = 1;", "typescript");
    expect(html).toContain('class="language-typescript"');
  });

  it("omits language class when lang is undefined", () => {
    const html = codeBlockHtml("echo hi");
    expect(html).not.toContain("class=");
  });

  it("HTML-escapes special characters in code", () => {
    const code = "<script>alert(\"xss\")</script>\n& 'quotes'";
    const html = codeBlockHtml(code);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    // Quotes inside code don't need escaping inside a pre/code element, but
    // the escaper may or may not encode them — either way <script> must be gone.
    expect(html).not.toContain("</script>");
  });

  it("preserves newlines in the escaped output", () => {
    const code = "line1\nline2\nline3";
    const html = codeBlockHtml(code);
    expect(html).toContain("line1\nline2\nline3");
  });

  it("escapes lang attribute to prevent attribute injection", () => {
    const html = codeBlockHtml("code", 'x" onclick="evil()');
    expect(html).not.toContain('onclick="evil()"');
    expect(html).toContain("&quot;");
  });
});

describe("writeRichToClipboard", () => {
  it("returns false when ClipboardItem is undefined", async () => {
    const original = globalThis.ClipboardItem;
    // @ts-expect-error — intentionally clearing the global for this test
    globalThis.ClipboardItem = undefined;
    try {
      const result = await writeRichToClipboard("text", "<b>text</b>");
      expect(result).toBe(false);
    } finally {
      globalThis.ClipboardItem = original;
    }
  });

  it("returns false when navigator.clipboard.write is unavailable", async () => {
    const originalClipboard = navigator.clipboard;
    // @ts-expect-error — patching read-only property for test purposes
    navigator.clipboard = undefined;
    try {
      const result = await writeRichToClipboard("text", "<b>text</b>");
      expect(result).toBe(false);
    } finally {
      // @ts-expect-error — restoring
      navigator.clipboard = originalClipboard;
    }
  });

  it("accepts a plain HTML string and passes it to ClipboardItem", async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    const ClipboardItemSpy = vi.fn().mockImplementation((items: unknown) => items);

    const originalClipboardItem = globalThis.ClipboardItem;
    const originalWrite = navigator.clipboard?.write;

    // @ts-expect-error — replacing with spy
    globalThis.ClipboardItem = ClipboardItemSpy;
    // @ts-expect-error — replacing with mock
    navigator.clipboard = { write: writeMock };

    try {
      const result = await writeRichToClipboard("hello", "<pre>hello</pre>");
      expect(result).toBe(true);
      expect(writeMock).toHaveBeenCalledOnce();
      // Verify ClipboardItem was constructed with text/html
      expect(ClipboardItemSpy).toHaveBeenCalledWith(
        expect.objectContaining({ "text/html": expect.any(Blob) }),
      );
    } finally {
      globalThis.ClipboardItem = originalClipboardItem;
      // @ts-expect-error — restoring
      navigator.clipboard = { write: originalWrite };
    }
  });
});
