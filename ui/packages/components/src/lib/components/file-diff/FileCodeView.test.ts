import { render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FileCodeView from "./FileCodeView.svelte";

const pierreMocks = vi.hoisted(() => ({
  cleanUp: vi.fn(),
  options: vi.fn(),
  scrollTo: vi.fn(),
  setItems: vi.fn(),
  setup: vi.fn(),
  renderedHost: undefined as HTMLElement | undefined,
}));

vi.mock("@pierre/diffs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pierre/diffs")>();
  return {
    ...actual,
    CodeView: class {
      private options?: { onPostRender?: (...args: unknown[]) => void };

      setup(root: HTMLElement): void {
        pierreMocks.setup(root);
      }

      setOptions(options: { onPostRender?: (...args: unknown[]) => void }): void {
        this.options = options;
        pierreMocks.options(options);
      }

      setItems(items: unknown): void {
        pierreMocks.setItems(items);
        const host = document.createElement("div");
        const shadow = host.attachShadow({ mode: "open" });
        shadow.innerHTML = `
          <div data-file>
            <div data-column-number="1" data-line-index="0">
              <span data-line-number-content>1</span>
            </div>
            <div data-column-number="2" data-line-index="1">
              <span data-line-number-content>2</span>
            </div>
            <div data-column-number="3" data-line-index="2">
              <span data-line-number-content>3</span>
            </div>
          </div>
        `;
        pierreMocks.renderedHost = host;
        this.options?.onPostRender?.(host, undefined, "mount", undefined);
      }

      scrollTo(target: unknown): void {
        pierreMocks.scrollTo(target);
      }

      cleanUp(): void {
        pierreMocks.cleanUp();
      }
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  pierreMocks.renderedHost = undefined;
});

describe("FileCodeView", () => {
  it("sets up a Pierre CodeView with a virtualized file item", async () => {
    render(FileCodeView, {
      props: { content: "const answer = 42;", filename: "answer.ts" },
    });

    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalled());
    expect(pierreMocks.setup).toHaveBeenCalledOnce();
    expect(pierreMocks.setItems).toHaveBeenLastCalledWith([
      expect.objectContaining({
        id: "file",
        type: "file",
        file: {
          name: "answer.ts",
          contents: "const answer = 42;",
          cacheKey: expect.any(String),
        },
      }),
    ]);
    expect(pierreMocks.options).toHaveBeenLastCalledWith(
      expect.objectContaining({
        layout: { paddingTop: 0, paddingBottom: 12, gap: 0 },
      }),
    );
    expect(
      pierreMocks.renderedHost?.shadowRoot?.querySelector<HTMLElement>("[data-column-number]")
        ?.dataset.lineType,
    ).toBe("context");
  });

  it("keeps the worker cache key across option-only re-renders and advances it on content changes", async () => {
    const lastCacheKey = () => {
      const [items] = pierreMocks.setItems.mock.lastCall as [{ file: { cacheKey?: string } }[]];
      return items[0].file.cacheKey;
    };
    const { rerender } = render(FileCodeView, {
      props: { content: "const answer = 42;", filename: "answer.ts" },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalled());
    const initialKey = lastCacheKey();
    expect(initialKey).toBeDefined();
    const initialCalls = pierreMocks.setItems.mock.calls.length;

    // A presentation-only change re-renders with the same content; pierre's
    // worker cache must be able to reuse the highlighted AST.
    await rerender({
      gitDecorations: { added: [{ start: 1, end: 1 }], modified: [], deletedAfter: [] },
    });
    await waitFor(() =>
      expect(pierreMocks.setItems.mock.calls.length).toBeGreaterThan(initialCalls),
    );
    expect(lastCacheKey()).toBe(initialKey);

    // Pierre trusts equal cache keys as equal content, so a content change
    // must produce a different key.
    await rerender({ content: "const answer = 43;" });
    await waitFor(() => expect(lastCacheKey()).not.toBe(initialKey));
  });

  it("offsets displayed line numbers and applies Pierre bar indicators", async () => {
    render(FileCodeView, {
      props: {
        content: "first\nsecond",
        filename: "answer.ts",
        startLine: 40,
        gitDecorations: {
          added: [{ start: 1, end: 1 }],
          modified: [{ start: 2, end: 2 }],
          deletedAfter: [3],
        },
      },
    });

    await waitFor(() => expect(pierreMocks.renderedHost).toBeDefined());
    const gutters =
      pierreMocks.renderedHost?.shadowRoot?.querySelectorAll<HTMLElement>("[data-column-number]");
    expect(
      pierreMocks.renderedHost?.shadowRoot?.querySelector<HTMLElement>("[data-file]")?.dataset
        .indicators,
    ).toBe("bars");
    expect(gutters?.[0].textContent?.trim()).toBe("40");
    expect(gutters?.[0].dataset.lineType).toBe("change-addition");
    expect(gutters?.[0].hasAttribute("data-git-modified")).toBe(false);
    expect(gutters?.[1].textContent?.trim()).toBe("41");
    expect(gutters?.[1].dataset.lineType).toBe("change-addition");
    expect(gutters?.[1].hasAttribute("data-git-modified")).toBe(true);
    expect(gutters?.[2].textContent?.trim()).toBe("42");
    expect(gutters?.[2].dataset.lineType).toBe("change-deletion");
    expect(gutters?.[2].hasAttribute("data-git-modified")).toBe(false);
  });

  it("scrolls to a requested displayed line", async () => {
    const { component } = render(FileCodeView, {
      props: { content: "first\nsecond", filename: "answer.ts", startLine: 40 },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalled());

    component.revealLine(41);

    expect(pierreMocks.scrollTo).toHaveBeenLastCalledWith({
      type: "line",
      id: "file",
      lineNumber: 2,
      align: "center",
      behavior: "instant",
    });
  });
});
