import katex from "katex";
import type { RendererExtension, TokenizerExtension, Tokens } from "marked";

interface KatexOptions extends katex.KatexOptions {
  useExtraRules?: boolean;
}

interface KatexToken extends Tokens.Generic {
  type: string;
  raw: string;
  text: string;
  displayMode: boolean;
}

const inlineRule =
  /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n\$]))\1(?=[\s?!\.,:;？！。，：；\-\)\]]|$)/;
const blockRule = /^(\${1,2})\n((?:\\[^]|[^\\])+?)\n\1(?:\n|$)/;
const inlineExtraRule = /^\\\(((?:\\.|[^\\])*?)\\\)/;
const blockExtraRule = /^\\\[((?:\\.|[^\\])*?)\\\]/;

export function markedKatex(options: KatexOptions = {}) {
  const renderer = (token: Tokens.Generic) => {
    const { text, displayMode } = token as KatexToken;
    return katex.renderToString(text, { ...options, displayMode });
  };

  const extensions = [
    createExtension("inlineKatex", "inline", options, renderer, inlineRule),
    createExtension("blockKatex", "block", options, renderer, blockRule),
  ];

  if (options.useExtraRules) {
    extensions.push(
      createExtension("inlineKatexExtra", "inline", options, renderer, inlineExtraRule, "\\("),
      createExtension("blockKatexExtra", "block", options, renderer, blockExtraRule, "\\["),
    );
  }

  return { extensions };
}

function createExtension(
  name: string,
  level: "inline" | "block",
  options: KatexOptions,
  renderer: (token: Tokens.Generic) => string,
  rule: RegExp,
  startDelimiter?: string,
): TokenizerExtension & RendererExtension {
  const extension: TokenizerExtension & RendererExtension = {
    name,
    level,
    renderer,
    tokenizer(src: string) {
      const match = src.match(rule);
      if (!match) return;

      const isExtra = name.includes("Extra");
      const text = (isExtra ? match[1] : match[2]).trim();
      const displayMode = isExtra ? name.includes("block") : match[1].length === 2;

      return {
        type: name,
        raw: match[0],
        text,
        displayMode,
      };
    },
  };

  if (level === "inline" || startDelimiter) {
    extension.start = (src: string) => {
      if (startDelimiter) {
        return src.indexOf(startDelimiter);
      }

      let index;
      let indexSrc = src;

      while (indexSrc) {
        index = indexSrc.indexOf("$");
        if (index === -1) {
          return;
        }

        const isStartOfToken =
          index === 0 || indexSrc.charAt(index - 1) === " " || indexSrc.charAt(index - 1) === "\n";

        if (isStartOfToken) {
          const possibleKatex = indexSrc.substring(index);

          if (possibleKatex.match(rule)) {
            return index;
          }
        }

        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, "");
      }
    };
  }

  return extension;
}
