import { escape } from "html-escaper";

/**
 * Generates a minimal HTML representation of a code block suitable for rich
 * clipboard payloads. The `text` is plain source code (not highlighted).
 *
 * The resulting HTML uses a `<pre><code>` wrapper with inline styles so that
 * it renders as monospace/preformatted in rich-text paste targets (Mail,
 * Notes, Slack, etc.) without depending on external stylesheets.
 */
export function codeBlockHtml(text: string, lang?: string): string {
  const escaped = escape(text);
  const langAttr = lang ? ` class="language-${escape(lang)}"` : "";
  return `<pre style="font-family:monospace,monospace;white-space:pre-wrap;"><code${langAttr}>${escaped}</code></pre>`;
}

/**
 * Writes both plain text and HTML to the clipboard using the ClipboardItem
 * API (rich write). Returns true on success, false if the API is unavailable
 * or throws (e.g. in restricted webviews such as VS Code / WKWebView without
 * clipboard-write permission).
 */
export async function writeRichToClipboard(text: string, html: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || typeof navigator?.clipboard?.write !== "function") {
      return false;
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}
