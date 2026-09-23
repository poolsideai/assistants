import { describe, expect, it } from "vitest";
import { buildVisualizationDocument, VISUALIZATION_CSP } from "./visualizationDocument.js";

describe("visualization isolation documents", () => {
  it("keeps hostile markup inside a second opaque frame with a parent-enforced policy", () => {
    const fragment = `"><script id="attack">location.replace('https://attacker.invalid')</script></iframe><meta http-equiv="refresh" content="0;url=https://attacker.invalid">`;
    const wrapper = new DOMParser().parseFromString(
      buildVisualizationDocument(fragment, 'black"><script id="color-attack">', "white"),
      "text/html",
    );
    expect(wrapper.querySelectorAll("iframe")).toHaveLength(1);
    expect(wrapper.querySelector("#attack, #color-attack, meta[http-equiv=refresh]")).toBeNull();
    expect(
      wrapper.querySelector("meta[http-equiv=Content-Security-Policy]")?.getAttribute("content"),
    ).toBe(VISUALIZATION_CSP);
    expect(VISUALIZATION_CSP).toContain("frame-src 'none'");
    const inner = wrapper.querySelector("iframe")!;
    expect(inner.getAttribute("sandbox")).toBe("allow-scripts");
    expect(inner.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(inner.srcdoc).toContain(fragment);
    const content = new DOMParser().parseFromString(inner.srcdoc, "text/html");
    expect(content.querySelector("#color-attack")).toBeNull();
    expect(
      content.querySelector("meta[http-equiv=Content-Security-Policy]")?.getAttribute("content"),
    ).toBe(VISUALIZATION_CSP);
  });
});
