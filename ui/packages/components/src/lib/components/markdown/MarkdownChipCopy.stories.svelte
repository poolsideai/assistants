<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import { readable } from "svelte/store";
  import MarkdownBlock from "./MarkdownBlock.svelte";
  import type { MarkdownHostAdapter } from "./host.js";

  const { Story } = defineMeta({
    title: "Components/Markdown Chip Copy",
  });

  // A host that enables file-path linking (desktop) and resolves the example
  // files, so the real Markdown rendering pipeline turns the backticked paths into
  // FileChips — the same DOM a model response produces.
  const host: MarkdownHostAdapter = {
    state: readable({
      userSettings: {},
      environment: { assistantHost: "desktop" },
      workspaces: [{ path: "/repo" }],
    }),
    checkFileExists: async (path: string) =>
      path === "/repo/menu.ts" || path === "/repo/docs/INSTALL.md",
    openFile: () => {},
  };
</script>

<!--
  Real-pipeline reproduction of the chip-copy behaviour: a model response sentence containing
  file chips. Used to verify that selecting and copying the sentence keeps the
  chip label on a single line (no line breaks injected around the chip).
-->
<Story
  name="Response with file chips"
  play={async ({ canvas, step }) => {
    const prose = canvas.getByTestId("response-prose");

    await step("renders both file chips", async () => {
      await waitFor(() => expect(prose.querySelectorAll("[data-file-path]").length).toBe(2));
    });

    await step("copying the sentence keeps chip labels inline (no line breaks)", async () => {
      const chipHost = prose.querySelector<HTMLElement>("[data-file-path]");
      expect(chipHost).not.toBeNull();
      const block = chipHost!.closest("p") ?? prose.querySelector(".markdown");
      expect(block).not.toBeNull();

      const selection = window.getSelection();
      selection?.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(block!);
      selection?.addRange(range);

      const data = new DataTransfer();
      const event = new ClipboardEvent("copy", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      });
      chipHost!.dispatchEvent(event);

      const text = data.getData("text/plain");
      expect(event.defaultPrevented).toBe(true);
      expect(text).not.toContain("\n");
      expect(text).toBe("Changed menu.ts whatever, and see INSTALL.md for setup.");
    });
  }}
>
  <div data-testid="response-prose" class="p-4">
    <MarkdownBlock
      content={"Changed `menu.ts` whatever, and see `docs/INSTALL.md` for setup."}
      {host}
    />
  </div>
</Story>
