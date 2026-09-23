import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import mermaid from "mermaid";
import { writable } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HighlightedCode from "./HighlightedCode.svelte";
import MarkdownBlock from "./MarkdownBlock.svelte";
import { flowchart } from "./__fixtures__/flowchart.js";
import { defaultMarkdownHostState, type MarkdownHostAdapter } from "./host.js";

vi.mock("mermaid", () => ({ default: { initialize: vi.fn(), render: vi.fn() } }));

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg"><text>Catalog definitions in forge</text></svg>';

beforeEach(() => {
  vi.mocked(mermaid.render).mockReset().mockResolvedValue({ svg, diagramType: "flowchart-v2" });
});

describe("Markdown Mermaid diagrams", () => {
  it.each(["", "mermaid", "flowchart"])(
    "renders a %s fence inline and copies its original source",
    async (language) => {
      const writeToClipboard = vi.fn();
      const host: MarkdownHostAdapter = {
        state: writable({
          ...defaultMarkdownHostState,
          environment: { capabilities: { hostClipboardWrite: true } },
        }),
        writeToClipboard,
      };
      const { container } = render(MarkdownBlock, {
        props: { content: `\`\`\`${language}\n${flowchart}\n\`\`\``, host },
      });

      const diagram = await screen.findByRole("img", { name: "Mermaid diagram" });
      expect(diagram).toHaveAccessibleDescription(flowchart.replace(/\s+/g, " "));
      expect(mermaid.render).toHaveBeenCalledWith(expect.any(String), flowchart);
      expect(container.querySelector("pre")).toBeNull();
      await fireEvent.click(screen.getByRole("button", { name: "copy to clipboard" }));
      expect(writeToClipboard).toHaveBeenCalledWith(flowchart);
    },
  );

  it("provides a distinct accessible description for each diagram", async () => {
    const secondSource = "flowchart LR\nClient -->|Request| Server";
    render(MarkdownBlock, {
      props: {
        content: `\`\`\`mermaid\n${flowchart}\n\`\`\`\n\n\`\`\`mermaid\n${secondSource}\n\`\`\``,
      },
    });

    await waitFor(() => {
      const diagrams = screen.getAllByRole("img", { name: "Mermaid diagram" });
      expect(diagrams).toHaveLength(2);
      expect(diagrams[0]).toHaveAccessibleDescription(flowchart.replace(/\s+/g, " "));
      expect(diagrams[1]).toHaveAccessibleDescription(
        /flowchart LR\s+Client -->\|Request\| Server/,
      );
    });
  });

  it("renders only after a streaming fence closes", async () => {
    const { container, rerender } = render(MarkdownBlock, {
      props: { content: `\`\`\`mermaid\n${flowchart}`, streaming: true },
    });
    await waitFor(() => expect(container.querySelector("code")?.textContent).toBe(flowchart));
    expect(mermaid.render).not.toHaveBeenCalled();
    await rerender({ content: `\`\`\`mermaid\n${flowchart}\n\`\`\`\n\nDone.`, streaming: true });
    await screen.findByRole("img", { name: "Mermaid diagram" });
  });

  it("keeps invalid diagram source visible", async () => {
    vi.mocked(mermaid.render).mockRejectedValueOnce(new Error("Parse error on line 2:"));
    const { container } = render(MarkdownBlock, {
      props: { content: "```mermaid\nflowchart TD\nA[\n```" },
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Syntax error on line 2");
    expect(container.querySelector("pre")).not.toBeNull();
    expect(screen.queryByRole("img", { name: "Mermaid diagram" })).toBeNull();
  });

  it("respects disabling and re-enabling diagrams", async () => {
    const state = writable({
      ...defaultMarkdownHostState,
      userSettings: { showMermaidDiagrams: false },
    });
    render(HighlightedCode, { props: { text: flowchart, lang: "mermaid", host: { state } } });
    expect(mermaid.render).not.toHaveBeenCalled();
    state.update((value) => ({ ...value, userSettings: { showMermaidDiagrams: true } }));
    await screen.findByRole("img", { name: "Mermaid diagram" });
    state.update((value) => ({ ...value, userSettings: { showMermaidDiagrams: false } }));
    await waitFor(() => expect(screen.queryByRole("img", { name: "Mermaid diagram" })).toBeNull());
    state.update((value) => ({ ...value, userSettings: { showMermaidDiagrams: true } }));
    await screen.findByRole("img", { name: "Mermaid diagram" });
  });

  it("discards an in-flight render when the source changes", async () => {
    let finishOld!: (value: { svg: string; diagramType: string }) => void;
    vi.mocked(mermaid.render).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishOld = resolve;
        }),
    );
    const { rerender } = render(HighlightedCode, {
      props: { text: "flowchart TD\nOld --> Diagram", lang: "mermaid" },
    });
    await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(1));
    await rerender({ text: flowchart, lang: "mermaid" });
    const diagram = await screen.findByRole("img", { name: "Mermaid diagram" });
    finishOld({ svg: "<svg><text>Old diagram</text></svg>", diagramType: "flowchart-v2" });
    await Promise.resolve();
    expect(diagram).toHaveTextContent("Catalog definitions in forge");
    expect(diagram).not.toHaveTextContent("Old diagram");
    expect(diagram).toHaveAccessibleDescription(flowchart.replace(/\s+/g, " "));
  });

  it("sanitizes diagrams before displaying them", async () => {
    vi.mocked(mermaid.render).mockResolvedValueOnce({
      svg: '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><foreignObject>Unsafe</foreignObject><text>Safe label</text></svg>',
      diagramType: "flowchart-v2",
    });
    render(HighlightedCode, {
      props: {
        text: flowchart,
        lang: "mermaid",
      },
    });
    const diagram = await screen.findByRole("img", { name: "Mermaid diagram" });
    expect(diagram.querySelector("script, foreignObject, [onload]")).toBeNull();
    expect(diagram).toHaveTextContent("Safe label");
  });
});
