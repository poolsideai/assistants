import { escape } from "html-escaper";
import type { MarkedExtension } from "marked";

const PREFIX = ":codex-file-citation{";
const ATTRIBUTE = /[ \t]*([\w-]+)[ \t]*=[ \t]*(?:"([^"\r\n]*)"|'([^'\r\n]*)')/y;

/** File citations are inline references, including paths containing spaces. */
export const fileCitationExtension: MarkedExtension = {
  extensions: [
    {
      name: "fileCitation",
      level: "inline",
      start(src) {
        const index = src.indexOf(PREFIX);
        return index < 0 ? undefined : index;
      },
      tokenizer(src) {
        if (!src.startsWith(PREFIX) || this.lexer.state.inLink) return;

        const attributes = new Map<string, string>();
        let offset = PREFIX.length;
        // Bound attribute scanning, including malformed or unfinished streams.
        const input = src.slice(0, 8192);
        while (offset < input.length) {
          ATTRIBUTE.lastIndex = offset;
          const match = ATTRIBUTE.exec(input);
          if (!match || attributes.has(match[1])) return;
          attributes.set(match[1], match[2] ?? match[3]);
          offset = ATTRIBUTE.lastIndex;
          const closing = /^[ \t]*}/.exec(input.slice(offset));
          if (closing) {
            offset += closing[0].length;
            break;
          }
          if (!/^[ \t]/.test(input.slice(offset))) return;
        }
        if (input[offset - 1] !== "}") return;

        const path = attributes.get("path");
        if (
          !path ||
          path !== path.trim() ||
          /[\u0000-\u001f\u007f]/.test(path) ||
          /^[\\/]{2}/.test(path) ||
          (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^[a-z]:[\\/]/i.test(path))
        ) {
          return;
        }
        const label = path.split(/[\\/]/).at(-1);
        if (!label) return;
        return { type: "fileCitation", raw: src.slice(0, offset), path, label };
      },
      renderer(token) {
        // Citation paths are literal: neither percent escapes nor trailing
        // numbers are URL encoding or line/column suffixes.
        const target = encodeURIComponent(token.path);
        return `<a data-file-link-target="${target}" data-file-link-literal="true" title="${escape(token.path)}">${escape(token.label)}</a>`;
      },
    },
  ],
};
