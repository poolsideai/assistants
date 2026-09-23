import type { Plugin } from "vite";

/** Keep the original WOFF2 face; all supported hosts can decode this format. */
export function woff2KatexCss(css: string): string {
  return css.replace(/@font-face\s*\{[^{}]*\}/g, (face) =>
    face.replace(/(\bsrc\s*:\s*)([^;}]+)/g, (declaration, prefix: string, value: string) => {
      const sources = value.split(",").map((source) => source.trim());
      const matches = sources.map((source) =>
        /^url\(["']?(fonts\/KaTeX_[\w-]+)\.(woff2|woff|ttf)["']?\)\s+format\(["'](woff2|woff|truetype)["']\)$/.exec(
          source,
        ),
      );
      // Unknown upstream syntax keeps its fallbacks; never discard a face or
      // change its family, weight, style, metrics, glyphs or non-font CSS.
      if (matches.some((match) => !match || match[1] !== matches[0]?.[1])) return declaration;
      const retained = sources.filter((_, i) => matches[i]?.[2] === "woff2");
      return retained.length === 1 ? prefix + retained[0] : declaration;
    }),
  );
}

export function katexFonts(): Plugin {
  return {
    name: "katex-woff2-fonts",
    enforce: "pre",
    transform(css, id) {
      if (!/\/katex\/dist\/katex(?:\.min)?\.css(?:\?|$)/.test(id)) return;
      return { code: woff2KatexCss(css), map: null };
    },
  };
}
