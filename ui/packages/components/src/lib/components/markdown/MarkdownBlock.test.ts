__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { beforeAll, describe, expect, it, vi } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  );
});
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("inserts ordinary Markdown before the initial Svelte flush can paint", () => {
    const { container } = render(MarkdownBlock, {
      props: { content: "Rendered without an empty intermediate frame." },
    });

    expect(container.querySelector("p")?.textContent).toBe(
      "Rendered without an empty intermediate frame.",
    );
  });

  it("preserves settled block DOM while only the streaming tail changes", async () => {
    const { container, rerender } = render(MarkdownBlock, {
      props: { content: "First paragraph", streaming: true },
    });

    await waitFor(() => expect(container.querySelector("p")?.textContent).toBe("First paragraph"));
    const firstSegment = container.querySelector(":scope > .markdown > .markdown");
    expect(firstSegment).not.toBeNull();

    await rerender({ content: "First paragraph\n\nSecond", streaming: true });
    const afterSettlement = await waitFor(() => {
      const elements = container.querySelectorAll(":scope > .markdown > .markdown");
      expect(elements).toHaveLength(2);
      return elements;
    });
    expect(afterSettlement).toHaveLength(2);
    expect(afterSettlement[0]).toBe(firstSegment);
    const liveSegment = afterSettlement[1];

    await rerender({ content: "First paragraph\n\nSecond grows", streaming: true });
    const afterTailGrowth = await waitFor(() => {
      const elements = container.querySelectorAll(":scope > .markdown > .markdown");
      expect(elements[1]?.textContent).toContain("Second grows");
      return elements;
    });
    expect(afterTailGrowth[0]).toBe(firstSegment);
    expect(afterTailGrowth[1]).toBe(liveSegment);
    expect(afterTailGrowth[1]?.textContent).toContain("Second grows");
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("renders quoted file paths in prose as file chips, swallowing the quotes", async () => {
    const openFile = vi.fn();
    const checkFileExists = vi.fn(async (path: string) => path === "/repo/src/main.ts");
    const host: MarkdownHostAdapter = {
      state: readable({
        userSettings: {},
        environment: { assistantHost: "desktop" },
        workspaces: [{ path: "/repo" }],
      }),
      checkFileExists,
      openFile,
    };

    const { container } = render(MarkdownBlock, {
      props: {
        content: 'The entry point is "src/main.ts", open it.',
        host,
      },
    });

    const chip = await screen.findByRole("button", { name: "Open file main.ts" });
    expect(container.textContent).not.toContain('"');
    expect(container.textContent).toContain("The entry point is ");
    expect(container.textContent).toContain(", open it.");

    await userEvent.click(chip);
    expect(openFile).toHaveBeenCalledWith("/repo/src/main.ts", undefined, undefined, {
      preferredEditor: false,
    });
  });

  it("renders a quoted path inside inline code as a file chip", async () => {
    const checkFileExists = vi.fn(async (path: string) => path === "/repo/src/main.ts");
    const host: MarkdownHostAdapter = {
      state: readable({
        userSettings: {},
        environment: { assistantHost: "desktop" },
        workspaces: [{ path: "/repo" }],
      }),
      checkFileExists,
      openFile: vi.fn(),
    };

    const { container } = render(MarkdownBlock, {
      props: {
        content: 'See `"src/main.ts"` for details',
        host,
      },
    });

    await screen.findByRole("button", { name: "Open file main.ts" });
    expect(container.textContent).not.toContain('"');
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      getSlashCommands: () => ({ commands: ["plan", "goal"], skills: ["$uv"] }),
      getSlashCommandIcon: (commandName) => (commandName === "goal" ? "target" : undefined),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      props: { content: "try $uv then /plan and /goal now", isUser: true, host },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const goalChip = container.querySelector('[data-command="goal"]');
    expect(goalChip).toBeTruthy();
    expect(goalChip?.querySelector("svg")?.getAttribute("overflow")).toBe("visible");
    const goalIconPaths = Array.from(goalChip?.querySelectorAll("path") ?? [], (path) =>
      path.getAttribute("d"),
    ).join(" ");
    expect(goalIconPaths).toContain("M9.2 6.8L6.5 9.5");
    expect(goalIconPaths).toContain(
      "M11.3 2.3L8.75 4.85V6.35L9.65 7.25H11.15L13.7 4.7L10.588 5.412L11.3 2.3Z",
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("retokenizes settled markdown when the known skill list loads", async () => {
    const state = readable({
      userSettings: {},
      environment: { assistantHost: "desktop" },
      workspaces: [],
    });
    const initialHost: MarkdownHostAdapter = {
      state,
      getSlashCommands: () => ({ commands: [], skills: [] }),
    };
    const loadedHost: MarkdownHostAdapter = {
      state,
      getSlashCommands: () => ({ commands: [], skills: ["$helper-only"] }),
    };

    const { container, rerender } = render(MarkdownBlock, {
      props: {
        content: "$helper-only please",
        isUser: true,
        host: initialHost,
      },
    });

    expect(container.querySelector("[data-skill]")).toBeNull();
    await rerender({
      content: "$helper-only please",
      isUser: true,
      host: loadedHost,
    });

    await waitFor(() =>
      expect(container.querySelector("[data-skill]")?.textContent?.trim()).toBe("helper-only"),
    );
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(preview).toHaveClass("block", "max-w-full");
    expect(preview.parentElement).toHaveClass("box-border", "max-w-80", "overflow-hidden");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      "/Users/poolie/Library/Application Support/poolside/worktrees/pale-porthole/ui/packages/components/src/lib/components/markdown/RenderedMarkdown.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        content: `[RenderedMarkdown.svelte](${encodedTarget}:299)`,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const link = await screen.findByRole("button", { name: "Open file RenderedMarkdown.svelte" });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("preserves a settled code block while the streaming tail changes", async () => {
    const { container, rerender } = render(MarkdownBlock, {
      props: { content: "```js\nconst x = 1;\n```\n\nTail", streaming: true },
    });

    const firstHost = await waitFor(() => {
      const el = container.querySelector("[data-code]");
      if (!el) throw new Error("code-host not found");
      return el;
    });

    await rerender({ content: "```js\nconst x = 1;\n```\n\nTail grows", streaming: true });

    await waitFor(() => {
      const host = container.querySelector("[data-code]");
      expect(host).not.toBeNull();
      expect(host).toBe(firstHost);
    });
  });

  it("appends an open streaming fence without replacing its text node", async () => {
    const { container, rerender } = render(MarkdownBlock, {
      props: { content: "```ts\nconst value = 1", streaming: true },
    });

    const code = await waitFor(() => {
      const element = container.querySelector<HTMLElement>(
        '[data-streaming-render-mode="code"] code',
      );
      expect(element?.textContent).toBe("const value = 1");
      return element;
    });
    const textNode = code?.firstChild;

    await rerender({ content: "```ts\nconst value = 123456", streaming: true });
    await waitFor(() => expect(code?.textContent).toBe("const value = 123456"));

    expect(container.querySelector('[data-streaming-render-mode="code"] code')).toBe(code);
    expect(code?.firstChild).toBe(textNode);
  });

  it("preserves live paragraph DOM while coalescing rapid updates", async () => {
    const { container, rerender } = render(MarkdownBlock, {
      props: { content: "Initial", streaming: true },
    });
    const paragraph = await waitFor(() => {
      const element = container.querySelector("p");
      expect(element?.textContent).toBe("Initial");
      return element;
    });
    const textNode = paragraph?.firstChild;
    let characterDataMutations = 0;
    const observer = new MutationObserver((records) => {
      characterDataMutations += records.filter((record) => record.type === "characterData").length;
    });
    if (textNode) observer.observe(textNode, { characterData: true });

    for (let index = 1; index <= 12; index += 1) {
      await rerender({ content: `Initial ${index}`, streaming: true });
    }
    await waitFor(() => expect(paragraph?.textContent).toBe("Initial 12"));
    await Promise.resolve();
    observer.disconnect();

    expect(container.querySelector("p")).toBe(paragraph);
    expect(paragraph?.firstChild).toBe(textNode);
    expect(characterDataMutations).toBeLessThan(12);
  });

  it("switches oversized unresolved Markdown to the append-only fallback", async () => {
    const prefix = `**unfinished ${"x".repeat(32 * 1024)}`;
    const { container, rerender } = render(MarkdownBlock, {
      props: { content: prefix, streaming: true },
    });

    const fallback = await waitFor(() => {
      const element = container.querySelector<HTMLElement>('[data-streaming-render-mode="plain"]');
      expect(element?.textContent).toBe(prefix);
      return element;
    });
    const textNode = fallback?.firstChild;

    await rerender({ content: `${prefix}tail`, streaming: true });
    await waitFor(() => expect(fallback?.textContent).toBe(`${prefix}tail`));

    expect(container.querySelector('[data-streaming-render-mode="plain"]')).toBe(fallback);
    expect(fallback?.firstChild).toBe(textNode);
  });

  it("windows independently renderable chunks in a large settled assistant reply", async () => {
    const source = Array.from(
      { length: 20 },
      (_, index) =>
        `## Section ${index}\n\n${"prose ".repeat(350)}\n\n\`\`\`text\ncode ${index}\n\`\`\`\n\n`,
    ).join("");
    const scrollElement = document.createElement("div");
    const { container } = render(MarkdownBlock, {
      props: { content: source, scrollElement },
    });

    await waitFor(() => {
      expect(container.querySelector("[data-virtualized-markdown]")).not.toBeNull();
      expect(container.querySelector(".virtual-list--windowed")).not.toBeNull();
    });
    const mountedCodeBlocks = container.querySelectorAll("[data-code]").length;
    expect(mountedCodeBlocks).toBeGreaterThan(0);
    expect(mountedCodeBlocks).toBeLessThan(20);
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
