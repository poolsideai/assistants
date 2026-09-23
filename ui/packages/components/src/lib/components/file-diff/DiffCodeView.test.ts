import { render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DiffCodeView, { OVERSCROLL_SIZE, type DiffCodeViewItem } from "./DiffCodeView.svelte";

const pierreMocks = vi.hoisted(() => ({
  setup: vi.fn(),
  setOptions: vi.fn(),
  setItems: vi.fn(),
  addItems: vi.fn(),
  updateItem: vi.fn(),
  scrollTo: vi.fn(),
  cleanUp: vi.fn(),
  workerPool: vi.fn(),
  instances: [] as { config: { overscrollSize: number } }[],
}));

// jsdom cannot construct @pierre/diffs' Shadow DOM custom element, so stub
// CodeView; real rendering is exercised in the running app.
vi.mock("@pierre/diffs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pierre/diffs")>();
  return {
    ...actual,
    CodeView: class {
      // Mirrors the real class's mutable virtualizer config, which the
      // component widens before setup (see OVERSCROLL_SIZE).
      config = { overscrollSize: 200, intersectionObserverMargin: 0, resizeDebugging: false };
      constructor(_options: unknown, workerManager: unknown) {
        pierreMocks.workerPool(workerManager);
        pierreMocks.instances.push(this);
      }
      setup(root: HTMLElement): void {
        pierreMocks.setup(root);
      }
      setOptions(options: unknown): void {
        pierreMocks.setOptions(options);
      }
      setItems(items: unknown): void {
        pierreMocks.setItems(items);
      }
      addItems(items: unknown): void {
        pierreMocks.addItems(items);
      }
      updateItem(item: unknown): void {
        pierreMocks.updateItem(item);
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

function patchFor(path: string, marker = "one"): string {
  return `diff --git a/${path} b/${path}
index 1111111..2222222 100644
--- a/${path}
+++ b/${path}
@@ -1,2 +1,2 @@
 context line
-old ${marker}
+new ${marker}
`;
}

function item(id: string, overrides: Partial<DiffCodeViewItem> = {}): DiffCodeViewItem {
  return { id, patch: patchFor(id), version: 1, ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  pierreMocks.instances.length = 0;
});

describe("DiffCodeView", () => {
  it("sets up a CodeView and seeds it with parsed diff items", async () => {
    render(DiffCodeView, { props: { items: [item("a.ts"), item("b.ts")] } });

    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalled());
    expect(pierreMocks.setup).toHaveBeenCalledOnce();
    const records = pierreMocks.setItems.mock.lastCall?.[0] as {
      id: string;
      type: string;
      fileDiff: { name: string; cacheKey?: string };
      version: number;
    }[];
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({ id: "a.ts", type: "diff", version: 1 });
    expect(records[0].fileDiff.name).toBe("a.ts");
    // Content-derived cache key feeds pierre's highlight/worker AST caches.
    expect(records[0].fileDiff.cacheKey).toContain("a.ts#1");
    expect(records[1]).toMatchObject({ id: "b.ts", type: "diff" });
  });

  it("widens the virtualizer's render window before setup", async () => {
    render(DiffCodeView, { props: { items: [item("a.ts")] } });

    await waitFor(() => expect(pierreMocks.setup).toHaveBeenCalledOnce());
    // Pierre's 200px default is outrun by WebKit's compositor-thread
    // scrolling, blanking items mid-fling; see OVERSCROLL_SIZE.
    expect(pierreMocks.instances).toHaveLength(1);
    expect(pierreMocks.instances[0].config.overscrollSize).toBe(OVERSCROLL_SIZE);
  });

  it("passes app options through to the viewer", async () => {
    render(DiffCodeView, {
      props: { items: [item("a.ts")], layout: "split", wrap: true, theme: "dark" },
    });

    await waitFor(() => expect(pierreMocks.setOptions).toHaveBeenCalled());
    expect(pierreMocks.setOptions).toHaveBeenLastCalledWith(
      expect.objectContaining({
        diffStyle: "split",
        overflow: "wrap",
        themeType: "dark",
        stickyHeaders: true,
        hunkSeparators: "line-info",
        lineDiffType: "word-alt",
        layout: { paddingTop: 12, paddingBottom: 12, gap: 12 },
        itemMetrics: expect.objectContaining({ hunkSeparatorHeight: 22 }),
      }),
    );
  });

  it("reports the custom header height to the virtualizer only when needed", async () => {
    const { rerender } = render(DiffCodeView, {
      props: { items: [item("a.ts")], renderCustomHeader: () => undefined },
    });

    await waitFor(() => expect(pierreMocks.setOptions).toHaveBeenCalled());
    let options = pierreMocks.setOptions.mock.lastCall?.[0] as {
      itemMetrics: { diffHeaderHeight?: number };
    };
    expect(options.itemMetrics.diffHeaderHeight).toBe(38);

    // Without a custom header, Pierre's default estimate stays untouched.
    await rerender({ items: [item("a.ts")], renderCustomHeader: undefined });
    options = pierreMocks.setOptions.mock.lastCall?.[0] as typeof options;
    expect(options.itemMetrics.diffHeaderHeight).toBeUndefined();
  });

  it("appends new trailing items without resetting existing ones", async () => {
    const { rerender } = render(DiffCodeView, { props: { items: [item("a.ts")] } });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledOnce());
    const optionCalls = pierreMocks.setOptions.mock.calls.length;

    await rerender({ items: [item("a.ts"), item("b.ts")] });

    await waitFor(() => expect(pierreMocks.addItems).toHaveBeenCalledOnce());
    const added = pierreMocks.addItems.mock.lastCall?.[0] as { id: string }[];
    expect(added).toHaveLength(1);
    expect(added[0].id).toBe("b.ts");
    // No wholesale reset for an append.
    expect(pierreMocks.setItems).toHaveBeenCalledOnce();
    // Item changes alone must not reconfigure the viewer.
    expect(pierreMocks.setOptions).toHaveBeenCalledTimes(optionCalls);
  });

  it("updates an item in place when its version bumps", async () => {
    const { rerender } = render(DiffCodeView, { props: { items: [item("a.ts")] } });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledOnce());

    await rerender({
      items: [{ ...item("a.ts", { patch: patchFor("a.ts", "two") }), version: 2 }],
    });

    await waitFor(() => expect(pierreMocks.updateItem).toHaveBeenCalledOnce());
    expect(pierreMocks.updateItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "a.ts", version: 2 }),
    );
    expect(pierreMocks.setItems).toHaveBeenCalledOnce();
  });

  it("reuses the worker cache key for presentation-only version bumps", async () => {
    const { rerender } = render(DiffCodeView, {
      props: { items: [item("a.ts", { contentVersion: 1 })] },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledOnce());
    const firstRecords = pierreMocks.setItems.mock.lastCall?.[0] as {
      fileDiff: { cacheKey?: string };
    }[];

    await rerender({
      items: [item("a.ts", { collapsed: true, contentVersion: 1, version: 2 })],
    });
    await waitFor(() => expect(pierreMocks.updateItem).toHaveBeenCalledOnce());
    const updated = pierreMocks.updateItem.mock.lastCall?.[0] as {
      fileDiff: { cacheKey?: string };
    };

    expect(updated.fileDiff.cacheKey).toBe(firstRecords[0].fileDiff.cacheKey);
  });

  it("does not update items whose version is unchanged", async () => {
    const { rerender } = render(DiffCodeView, {
      props: { items: [item("a.ts"), item("b.ts")] },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledOnce());

    await rerender({ items: [item("a.ts"), item("b.ts"), item("c.ts")] });

    await waitFor(() => expect(pierreMocks.addItems).toHaveBeenCalledOnce());
    expect(pierreMocks.updateItem).not.toHaveBeenCalled();
  });

  it("resets the list when items are removed or reordered", async () => {
    const { rerender } = render(DiffCodeView, {
      props: { items: [item("a.ts"), item("b.ts")] },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledOnce());

    await rerender({ items: [item("b.ts"), item("a.ts")] });

    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledTimes(2));
    const records = pierreMocks.setItems.mock.lastCall?.[0] as { id: string }[];
    expect(records.map((record) => record.id)).toEqual(["b.ts", "a.ts"]);
  });

  it("does not reuse a worker cache key when a path is removed and recreated", async () => {
    const { rerender } = render(DiffCodeView, {
      props: { items: [item("a.ts", { patch: patchFor("a.ts", "first") })] },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledOnce());
    const firstRecords = pierreMocks.setItems.mock.lastCall?.[0] as {
      fileDiff: { cacheKey?: string };
    }[];
    const firstCacheKey = firstRecords[0].fileDiff.cacheKey;

    await rerender({ items: [] });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledTimes(2));
    await rerender({
      items: [item("a.ts", { patch: patchFor("a.ts", "recreated") })],
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledTimes(3));
    const recreatedRecords = pierreMocks.setItems.mock.lastCall?.[0] as {
      fileDiff: { cacheKey?: string };
    }[];

    expect(firstCacheKey).toBeTruthy();
    expect(recreatedRecords[0].fileDiff.cacheKey).not.toBe(firstCacheKey);
  });

  it("does not reuse worker cache keys across mounted viewers", async () => {
    const first = render(DiffCodeView, {
      props: { items: [item("a.ts", { patch: patchFor("a.ts", "first") })] },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledOnce());
    const firstRecords = pierreMocks.setItems.mock.lastCall?.[0] as {
      fileDiff: { cacheKey?: string };
    }[];
    const firstCacheKey = firstRecords[0].fileDiff.cacheKey;
    first.unmount();

    render(DiffCodeView, {
      props: { items: [item("a.ts", { patch: patchFor("a.ts", "second") })] },
    });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalledTimes(2));
    const secondRecords = pierreMocks.setItems.mock.lastCall?.[0] as {
      fileDiff: { cacheKey?: string };
    }[];

    expect(firstCacheKey).toBeTruthy();
    expect(secondRecords[0].fileDiff.cacheKey).not.toBe(firstCacheKey);
  });

  it("marks collapsed items for the viewer", async () => {
    render(DiffCodeView, { props: { items: [item("a.ts", { collapsed: true })] } });

    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalled());
    const records = pierreMocks.setItems.mock.lastCall?.[0] as { collapsed: boolean }[];
    expect(records[0].collapsed).toBe(true);
  });

  it("skips items whose patch cannot be parsed", async () => {
    render(DiffCodeView, {
      props: { items: [item("a.ts"), item("broken.ts", { patch: "not a diff" })] },
    });

    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalled());
    const records = pierreMocks.setItems.mock.lastCall?.[0] as { id: string }[];
    expect(records.map((record) => record.id)).toEqual(["a.ts"]);
  });

  it("scrolls to items through the public API", async () => {
    const { component } = render(DiffCodeView, { props: { items: [item("a.ts")] } });
    await waitFor(() => expect(pierreMocks.setItems).toHaveBeenCalled());

    component.scrollToItem("a.ts");
    expect(pierreMocks.scrollTo).toHaveBeenLastCalledWith({
      type: "item",
      id: "a.ts",
      align: "start",
      // Backs the target off by the document inset so the card lands at
      // the pinned-header position rather than the viewport edge.
      offset: 12,
      behavior: "instant",
    });

    component.scrollToTop();
    expect(pierreMocks.scrollTo).toHaveBeenLastCalledWith({ type: "position", position: 0 });
  });

  it("cleans up the viewer on unmount", async () => {
    const { unmount } = render(DiffCodeView, { props: { items: [item("a.ts")] } });
    await waitFor(() => expect(pierreMocks.setup).toHaveBeenCalled());

    unmount();
    expect(pierreMocks.cleanUp).toHaveBeenCalled();
  });
});
