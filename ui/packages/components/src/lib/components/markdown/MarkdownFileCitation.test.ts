import { render, screen, waitFor } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { readable } from "svelte/store";
import { describe, expect, it, vi } from "vitest";
import MarkdownBlock from "./MarkdownBlock.svelte";
import type { MarkdownHostAdapter } from "./host.js";

const path = "/Users/example/Library/Messages/Attachments/Option Agreement (Non-US) %2F.pdf";
const label = "Option Agreement (Non-US) %2F.pdf";
const citation = `:codex-file-citation{path="${path}" purpose="source"}`;

function createHost(exists = true): MarkdownHostAdapter {
  return {
    state: readable({
      userSettings: {},
      environment: { assistantHost: "desktop" },
      workspaces: [{ path: "/repo" }],
    }),
    checkFileExists: vi.fn(async (candidate: string) => exists && candidate === path),
    openFile: vi.fn(),
  };
}

describe("Markdown file citations", () => {
  it("opens an out-of-workspace document with its exact path", async () => {
    const host = createHost();
    const { container } = render(MarkdownBlock, { content: `See ${citation}.`, host });
    const chip = await screen.findByRole("button", { name: `Open file ${label}` });

    expect(container).toHaveTextContent(`See ${label}`);
    expect(container.textContent).not.toContain(":codex-file-citation");
    await userEvent.click(chip);
    expect(host.openFile).toHaveBeenCalledWith(path, undefined, undefined, {
      preferredEditor: false,
    });
  });

  it("keeps missing documents readable with the full path on hover", async () => {
    const host = createHost(false);
    const { container } = render(MarkdownBlock, { content: citation, host });
    await waitFor(() => expect(host.checkFileExists).toHaveBeenCalledWith(path));

    expect(container.querySelector("a")?.textContent).toBe(label);
    expect(container.querySelector("a")).toHaveAttribute("title", path);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("preserves citations inside link labels without changing the destination", async () => {
    const host = createHost();
    const { container } = render(MarkdownBlock, {
      content: `[${citation}](https://example.com)`,
      host,
    });
    const link = await screen.findByRole("link", { name: citation });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("[data-file-link-target]")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("preserves literal numeric filename suffixes instead of treating them as lines", async () => {
    const host = createHost();
    host.checkFileExists = vi.fn(async () => true);
    render(MarkdownBlock, {
      content: ':codex-file-citation{path="/tmp/report:2026" purpose="source"}',
      host,
    });
    const chip = await screen.findByRole("button", { name: "Open file report:2026" });
    await userEvent.click(chip);
    expect(host.openFile).toHaveBeenCalledWith("/tmp/report:2026", undefined, undefined, {
      preferredEditor: false,
    });
  });

  it("renders completed citations after streaming without interpreting unfinished ones", async () => {
    const host = createHost();
    const { container, rerender } = render(MarkdownBlock, {
      content: citation.slice(0, -1),
      streaming: true,
      host,
    });
    expect(container.querySelector("[data-file-link-target]")).toBeNull();

    await rerender({ content: citation, streaming: false, host });
    await screen.findByRole("button", { name: `Open file ${label}` });
  });

  it("leaves user messages and inline code examples literal", async () => {
    const host = createHost();
    const { container, rerender } = render(MarkdownBlock, {
      content: citation,
      isUser: true,
      host,
    });
    expect(container.textContent).toContain(citation);
    expect(container.querySelector("[data-file-link-target]")).toBeNull();

    await rerender({ content: `\`${citation}\``, isUser: false, host });
    expect(container.querySelector("code")?.textContent).toBe(citation);
    expect(container.querySelector("[data-file-link-target]")).toBeNull();
  });
});
