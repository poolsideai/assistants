import { describe, expect, it } from "vitest";
import { canUseShikiWasmEngine, preferredShikiHighlighter } from "./shikiEngine.js";

describe("shikiEngine", () => {
  it("detects wasm support and maps it to pierre's highlighter option", () => {
    // Node (and every non-CSP-restricted webview) can compile WebAssembly,
    // so the probe resolves to the wasm engine here.
    expect(canUseShikiWasmEngine()).toBe(true);
    expect(preferredShikiHighlighter()).toBe("shiki-wasm");
    // Memoized: repeated calls stay consistent.
    expect(canUseShikiWasmEngine()).toBe(true);
  });
});
