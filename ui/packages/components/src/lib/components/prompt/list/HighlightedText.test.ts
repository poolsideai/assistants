import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { findMatchIndices, highlightSegments } from "../utils/highlightMatch.js";
import HighlightedText from "./HighlightedText.svelte";

/**
 * Item titles and subtitles carry repository-controlled values (filenames,
 * directories, workspace paths). A checkout can contain a file literally named
 * `<img src=x onerror=...>`, so these must reach the DOM as text.
 */
describe("HighlightedText", () => {
  it("wraps only matched segments in a highlight span", () => {
    const { container } = render(HighlightedText, {
      props: { segments: highlightSegments("readme.md", [0, 1, 2]) },
    });

    const marks = container.querySelectorAll('[data-state="matched"]');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe("rea");
    expect(container.textContent).toBe("readme.md");
  });

  it("renders a filename containing markup as text, creating no elements", () => {
    const filename = `<img src=x onerror="alert(1)">.ts`;
    const { container } = render(HighlightedText, {
      props: { segments: highlightSegments(filename, []) },
    });

    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe(filename);
  });

  it("renders a script-tag filename as text, creating no elements", () => {
    const filename = "<script>globalThis.pwned = true</script>.ts";
    const { container } = render(HighlightedText, {
      props: { segments: highlightSegments(filename, []) },
    });

    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toBe(filename);
    expect((globalThis as Record<string, unknown>).pwned).toBeUndefined();
  });

  it("renders markup as text even while the value is being highlighted", () => {
    const filename = `<img src=x onerror="alert(1)">.ts`;
    const { container } = render(HighlightedText, {
      props: { segments: highlightSegments(filename, findMatchIndices(filename, "img")) },
    });

    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe(filename);
    // The highlight itself still applies, to the literal characters.
    expect(container.querySelector('[data-state="matched"]')?.textContent).toBe("img");
  });

  it("does not treat an HTML entity in a filename as an escape", () => {
    const filename = "&lt;notatag&gt;.ts";
    const { container } = render(HighlightedText, {
      props: { segments: highlightSegments(filename, []) },
    });

    expect(container.textContent).toBe(filename);
  });
});
