import { escape } from "html-escaper";
import type { MarkedExtension } from "marked";

export interface VisualizationReference {
  path: string;
  title?: string;
  mode?: "wide";
}

export const MAX_VISUALIZATION_BYTES = 1_000_000;

/** Reject URL, UNC and device paths before any host filesystem access. */
export function isLocalVisualizationPath(path: string): boolean {
  return (
    !!path.trim() &&
    path === path.trim() &&
    /\.html?$/i.test(path) &&
    !/[\u0000-\u001f\u007f]/.test(path) &&
    !/^[\\/]{2}/.test(path) &&
    (!/^[a-z][a-z\d+.-]*:/i.test(path) || /^[a-z]:[\\/]/i.test(path))
  );
}

export function parseVisualizationReference(payload: string): VisualizationReference | undefined {
  if (payload.length > 8192) return;
  let value: unknown;
  try {
    value = JSON.parse(payload);
  } catch {
    // Some Codex replies omit the quotes around a lone filename. Accept that
    // narrow form without evaluating JavaScript or repairing arbitrary JSON.
    const match = /^\s*\{\s*"path"\s*:\s*([^"{},\s]+\.html?)\s*\}\s*$/i.exec(payload);
    if (!match) return;
    value = { path: match[1] };
  }
  if (!value || typeof value !== "object" || !("path" in value)) return;
  const { path } = value;
  if (typeof path !== "string" || !isLocalVisualizationPath(path)) return;
  return {
    path,
    ...("title" in value && typeof value.title === "string" && value.title.trim()
      ? { title: value.title.trim().slice(0, 250) }
      : {}),
    ...("mode" in value && value.mode === "wide" ? { mode: "wide" as const } : {}),
  };
}

/** Block syntax keeps quoted code examples and ordinary inline text literal. */
export const visualizationExtension = (
  register: (reference: VisualizationReference) => string,
): MarkedExtension => ({
  extensions: [
    {
      name: "visualization",
      level: "block",
      start(src) {
        const match = /^ {0,3}visualize/m.exec(src);
        return match?.index;
      },
      tokenizer(src) {
        const match = /^ {0,3}visualize([^\n]*?)[ \t]*(?:\n|$)/.exec(src);
        if (!match) return;
        const reference = parseVisualizationReference(match[1]);
        if (!reference) return;
        return { type: "visualization", raw: match[0], reference };
      },
      renderer(token) {
        const reference = token.reference as VisualizationReference;
        return `<div data-visualization="${escape(register(reference))}">${escape(reference.title ?? reference.path)}</div>`;
      },
    },
  ],
});
