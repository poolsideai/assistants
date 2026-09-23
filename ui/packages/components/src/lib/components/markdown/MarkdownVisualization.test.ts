import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { readable } from "svelte/store";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarkdownBlock from "./MarkdownBlock.svelte";
import { defaultMarkdownHostState, type MarkdownHostAdapter } from "./host.js";

function makeHost(
  read = vi.fn(
    async (): Promise<string | undefined> =>
      '<button id="chart">Interactive chart</button><script>document.title="chart"</script>',
  ),
) {
  const host: MarkdownHostAdapter = {
    state: readable({ ...defaultMarkdownHostState, workspaces: [{ path: "/repo" }] }),
    readVisualizationFile: read,
    openFile: vi.fn(),
  };
  return host;
}
const marker = 'visualize{"path":geneb-multiple-comparisons.html }';

describe("Markdown visualizations", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(["settled", "streaming", "virtualized"])(
    "uses the conversation directory for %s previews and their file links",
    async (mode) => {
      vi.stubGlobal(
        "ResizeObserver",
        class {
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      );
      const host = makeHost();
      const { container } = render(MarkdownBlock, {
        content: `${marker}\n\n${"Following paragraph.\n\n".repeat(mode === "virtualized" ? 2000 : 1)}`,
        host,
        allowVisualizations: true,
        visualizationBasePath: "/repo/worktree",
        streaming: mode === "streaming",
        scrollElement: mode === "virtualized" ? document.createElement("div") : undefined,
      });
      await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
      if (mode === "virtualized")
        expect(container.querySelector("[data-virtualized-markdown]")).not.toBeNull();
      expect(host.readVisualizationFile).toHaveBeenCalledWith(
        "/repo/worktree/geneb-multiple-comparisons.html",
      );
      await fireEvent.click(
        screen.getByRole("button", { name: "Open file geneb-multiple-comparisons.html" }),
      );
      expect(host.openFile).toHaveBeenCalledWith(
        "/repo/worktree/geneb-multiple-comparisons.html",
        undefined,
        undefined,
        { preferredEditor: false },
      );
    },
  );

  it("preserves absolute references when a conversation directory is provided", async () => {
    const host = makeHost();
    render(MarkdownBlock, {
      content: 'visualize{"path":"/tmp/chart.html"}',
      host,
      allowVisualizations: true,
      visualizationBasePath: "/repo/worktree",
    });
    await waitFor(() => expect(host.readVisualizationFile).toHaveBeenCalledWith("/tmp/chart.html"));
  });

  it("rejects a network path supplied as the conversation directory", async () => {
    const host = makeHost();
    render(MarkdownBlock, {
      content: marker,
      host,
      allowVisualizations: true,
      visualizationBasePath: "//server/share",
    });
    await screen.findByText("Invalid visualization file path.");
    expect(host.readVisualizationFile).not.toHaveBeenCalled();
  });

  it("requires explicit opt-in and does not share executable cache entries with generic Markdown", async () => {
    const host = makeHost();
    const { container, rerender } = render(MarkdownBlock, { content: marker, host });
    await waitFor(() => expect(container.textContent).toContain("visualize"));
    expect(host.readVisualizationFile).not.toHaveBeenCalled();
    await rerender({ content: marker, host, allowVisualizations: true });
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
    await rerender({ content: marker, host, allowVisualizations: false });
    await waitFor(() => expect(container.textContent).toContain("visualize"));
    expect(container.querySelector("iframe")).toBeNull();
    expect(host.readVisualizationFile).toHaveBeenCalledTimes(1);
  });

  it("does not load references forged in raw HTML data attributes", async () => {
    const host = makeHost();
    const payload = encodeURIComponent(JSON.stringify({ path: "forged.html" }));
    const { container } = render(MarkdownBlock, {
      content: `<div data-visualization="${payload}">Forged</div>\n\n${marker}`,
      host,
      allowVisualizations: true,
    });
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
    expect(host.readVisualizationFile).toHaveBeenCalledTimes(1);
    expect(host.readVisualizationFile).toHaveBeenCalledWith(
      "/repo/geneb-multiple-comparisons.html",
    );
    expect(container.textContent).toContain("Forged");
  });

  it("rejects a network path produced by workspace resolution before reading", async () => {
    const host = makeHost();
    host.state = readable({
      ...defaultMarkdownHostState,
      workspaces: [{ path: "//server/share" }],
    });
    const { container } = render(MarkdownBlock, {
      content: marker,
      host,
      allowVisualizations: true,
    });
    await screen.findByText("Invalid visualization file path.");
    expect(host.readVisualizationFile).not.toHaveBeenCalled();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("loads the reported marker in an isolated frame, preserving surrounding Markdown", async () => {
    const host = makeHost();
    const { container } = render(MarkdownBlock, {
      content: `Before\n\n${marker}\n\n**After**`,
      host,
      allowVisualizations: true,
    });
    const frame = await waitFor(() => {
      const element = container.querySelector("iframe");
      expect(element).not.toBeNull();
      return element!;
    });
    expect(host.readVisualizationFile).toHaveBeenCalledWith(
      "/repo/geneb-multiple-comparisons.html",
    );
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(frame.srcdoc).toContain("connect-src &#39;none&#39;");
    const wrapper = new DOMParser().parseFromString(frame.srcdoc, "text/html");
    const inner = wrapper.querySelector("iframe")!;
    expect(inner.getAttribute("sandbox")).toBe("allow-scripts");
    expect(wrapper.querySelector("#chart")).toBeNull();
    expect(inner.srcdoc.indexOf("Content-Security-Policy")).toBeLessThan(
      inner.srcdoc.indexOf('id="chart"'),
    );
    expect(container.querySelector("#chart")).toBeNull();
    expect(container.textContent).toContain("Before");
    expect(container.querySelector("strong")?.textContent).toBe("After");
    await fireEvent.click(
      screen.getByRole("button", { name: "Open file geneb-multiple-comparisons.html" }),
    );
    expect(host.openFile).toHaveBeenCalledWith(
      "/repo/geneb-multiple-comparisons.html",
      undefined,
      undefined,
      { preferredEditor: false },
    );
  });

  it.each([
    `\`${marker}\``,
    `\`\`\`text\n${marker}\n\`\`\``,
    'visualize{"path":"https://example.com/chart.html"}',
  ])("does not load code examples or remote references", async (content) => {
    const host = makeHost();
    const { container } = render(MarkdownBlock, { content, host, allowVisualizations: true });
    await waitFor(() => expect(container.textContent).toContain("visualize"));
    expect(host.readVisualizationFile).not.toHaveBeenCalled();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("does not execute user messages", async () => {
    const host = makeHost();
    const { container } = render(MarkdownBlock, {
      content: marker,
      isUser: true,
      host,
      allowVisualizations: true,
    });
    await waitFor(() => expect(container.textContent).toContain("visualize"));
    expect(host.readVisualizationFile).not.toHaveBeenCalled();
  });

  it("waits for a settled reference before reading the file", async () => {
    const host = makeHost();
    const { container, rerender } = render(MarkdownBlock, {
      content: marker.slice(0, -1),
      streaming: true,
      host,
      allowVisualizations: true,
    });
    expect(host.readVisualizationFile).not.toHaveBeenCalled();
    await rerender({ content: marker, streaming: false, host, allowVisualizations: true });
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
    expect(host.readVisualizationFile).toHaveBeenCalledTimes(1);
  });

  it("shows missing-file errors and retries", async () => {
    const read = vi
      .fn<() => Promise<string | undefined>>()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce("<p>Found</p>");
    const host = makeHost(read);
    const { container } = render(MarkdownBlock, {
      content: marker,
      host,
      allowVisualizations: true,
    });
    await screen.findByText("The visualization file could not be found.");
    await fireEvent.click(screen.getByRole("button", { name: "Retry preview" }));
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull());
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("rejects oversized UTF-8 fragments", async () => {
    const host = makeHost(vi.fn(async () => "€".repeat(340_000)));
    const { container } = render(MarkdownBlock, {
      content: marker,
      host,
      allowVisualizations: true,
    });
    await screen.findByText("The visualization exceeds the 1 MB preview limit.");
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("offers a file link when the host cannot read previews", async () => {
    const host = makeHost();
    delete host.readVisualizationFile;
    render(MarkdownBlock, { content: marker, host, allowVisualizations: true });
    await screen.findByText("Visualization previews are unavailable in this host.");
    expect(
      screen.getByRole("button", { name: "Open file geneb-multiple-comparisons.html" }),
    ).toBeTruthy();
  });
});
