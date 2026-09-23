import { describe, expect, it } from "vitest";
import { sanitizeMermaidSvg } from "./mermaidSvg.js";

function parse(svg: string): Document {
  return new DOMParser().parseFromString(svg, "image/svg+xml");
}

describe("sanitizeMermaidSvg", () => {
  it("keeps the shapes, text and markers a diagram is made of", () => {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">` +
      `<defs><marker id="arrowhead"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>` +
      `<g class="node"><rect x="1" y="2" width="30" height="20"/>` +
      `<text><tspan>Start</tspan></text></g>` +
      `<path class="edge" d="M10,10 L90,10" marker-end="url(#arrowhead)"/>` +
      `</svg>`;

    const doc = parse(sanitizeMermaidSvg(svg));

    expect(doc.querySelector("rect")).not.toBeNull();
    expect(doc.querySelector("marker#arrowhead")).not.toBeNull();
    expect(doc.querySelector("text tspan")?.textContent).toBe("Start");
    expect(doc.querySelector("path.edge")?.getAttribute("marker-end")).toBe("url(#arrowhead)");
  });

  // A fragment-only ALLOWED_URI_REGEXP looks like the obvious way to block
  // external references, but DOMPurify applies that pattern to every attribute
  // value, so it silently deletes path geometry and leaves diagrams blank.
  it("preserves geometry and viewport attributes", () => {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="100" height="50">` +
      `<path d="M0,0 L10,10 Z" stroke-width="2"/>` +
      `<circle cx="5" cy="6" r="7"/></svg>`;

    const doc = parse(sanitizeMermaidSvg(svg));

    expect(doc.querySelector("path")?.getAttribute("d")).toBe("M0,0 L10,10 Z");
    expect(doc.querySelector("path")?.getAttribute("stroke-width")).toBe("2");
    expect(doc.querySelector("circle")?.getAttribute("cx")).toBe("5");
    expect(doc.documentElement.getAttribute("viewBox")).toBe("0 0 100 50");
  });

  it("removes href pointing at an external document but keeps fragment href", () => {
    const external = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><rect href="https://attacker.example/x"/></svg>`,
    );
    expect(external).not.toContain("attacker.example");

    const fragment = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><rect href="#local"/></svg>`,
    );
    expect(parse(fragment).querySelector("rect")?.getAttribute("href")).toBe("#local");
  });

  it("removes feImage, which fetches a remote document inside a filter", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><filter id="f">` +
        `<feImage href="https://attacker.example/leak.png"/></filter></svg>`,
    );

    expect(parse(result).querySelector("feImage")).toBeNull();
    expect(result).not.toContain("attacker.example");
  });

  it("removes script elements", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><script>globalThis.pwned = true</script><rect/></svg>`,
    );

    expect(result).not.toContain("pwned");
    expect(parse(result).querySelector("script")).toBeNull();
  });

  it("removes foreignObject, which smuggles HTML back into the SVG", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject>` +
        `<body xmlns="http://www.w3.org/1999/xhtml"><img src="x" onerror="alert(1)"/></body>` +
        `</foreignObject></svg>`,
    );

    const doc = parse(result);
    expect(doc.querySelector("foreignObject")).toBeNull();
    expect(doc.querySelector("img")).toBeNull();
    expect(result).not.toContain("onerror");
  });

  it("strips inline event handlers", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><rect onclick="alert(1)" onload="alert(2)"/></svg>`,
    );

    expect(result).not.toContain("onclick");
    expect(result).not.toContain("onload");
  });

  it("removes external images so diagrams cannot beacon out", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><image href="https://attacker.example/leak.png"/></svg>`,
    );

    expect(parse(result).querySelector("image")).toBeNull();
    expect(result).not.toContain("attacker.example");
  });

  it("drops links to external documents but keeps fragment references", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<defs><linearGradient id="g"/></defs>` +
        `<rect fill="url(#g)"/>` +
        `</svg>`,
    );

    expect(parse(result).querySelector("rect")?.getAttribute("fill")).toBe("url(#g)");
  });

  it("neutralises external url() in a style element", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<style>.node { fill: url(https://attacker.example/leak); }</style>` +
        `<rect class="node"/></svg>`,
    );

    expect(result).not.toContain("attacker.example");
  });

  it("neutralises external url() in a style attribute", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<rect style="fill: url('https://attacker.example/leak')"/></svg>`,
    );

    expect(result).not.toContain("attacker.example");
  });

  it("keeps fragment url() in a style element", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<style>.node { fill: url(#gradient); }</style><rect class="node"/></svg>`,
    );

    expect(result).toContain("url(#gradient)");
  });

  it("removes animation elements that can drive attribute values", () => {
    const result = sanitizeMermaidSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><rect><animate attributeName="x" to="10"/></rect></svg>`,
    );

    expect(parse(result).querySelector("animate")).toBeNull();
  });

  it("returns empty output for markup that is entirely disallowed", () => {
    expect(sanitizeMermaidSvg("<script>alert(1)</script>")).toBe("");
  });
});
