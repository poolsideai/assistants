<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import AgentThought from "./AgentThought.svelte";

  const longThoughtText = Array.from(
    { length: 18 },
    (_, index) =>
      `### Step ${index + 1}\n\nInspect the next constraint, compare it with the current hypothesis, and record why this branch ${index % 3 === 0 ? "remains viable" : "can be narrowed further"}.`,
  ).join("\n\n");

  const { Story } = defineMeta({
    component: AgentThought,
    args: {
      event: {
        eventKind: "agent_thought",
        messageId: "thought-1",
        content: [
          {
            type: "text",
            text: "Let me inspect the relevant files and compare the previous implementation.",
          },
        ],
      },
      complete: false,
    },
  });

  const truncatedEvent = {
    eventKind: "agent_thought" as const,
    messageId: "thought-truncated",
    truncated: true,
    content: [
      {
        type: "text" as const,
        text: longThoughtText,
      },
    ],
  };

  const longStreamingEvent = {
    eventKind: "agent_thought" as const,
    messageId: "thought-streaming-long",
    content: [{ type: "text" as const, text: longThoughtText }],
  };

  // NBSP-joined so the sentence has no soft-wrap opportunities, like model
  // output that streams a long run without breakable spaces (PE-2431).
  const unwrappableSentence = Array.from({ length: 60 }, (_, index) => `unbroken${index}`).join(
    "\u00a0",
  );

  const unwrappableEvent = {
    eventKind: "agent_thought" as const,
    messageId: "thought-unwrappable",
    content: [{ type: "text" as const, text: unwrappableSentence }],
  };
</script>

<Story name="Streaming - Collapsed" />

<Story
  name="Streaming - Expanded at bottom"
  args={{ event: longStreamingEvent }}
  play={async ({ canvas, userEvent }) => {
    const disclosure = canvas.getByRole("button", { name: /think/i });
    await userEvent.click(disclosure);
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  }}
/>

<Story
  name="Streaming - Expanded, scrolled up"
  args={{ event: longStreamingEvent }}
  play={async ({ canvas, canvasElement, userEvent }) => {
    const disclosure = canvas.getByRole("button", { name: /think/i });
    await userEvent.click(disclosure);
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");

    const scroller = canvasElement.querySelector<HTMLDivElement>(".thinking-container");
    if (!scroller) throw new Error("Think block scroller was not rendered");
    scroller.scrollTop = 0;
    scroller.dispatchEvent(new Event("scroll"));
  }}
/>

<Story
  name="Streaming - Expanded, unwrappable sentence"
  args={{ event: unwrappableEvent }}
  play={async ({ canvas, canvasElement, userEvent }) => {
    const disclosure = canvas.getByRole("button", { name: /think/i });
    await userEvent.click(disclosure);
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");

    const block = canvasElement.querySelector<HTMLDivElement>("[data-chat-progress]");
    if (!block) throw new Error("Think block was not rendered");
    const scroller = canvasElement.querySelector<HTMLDivElement>(".thinking-container");
    if (!scroller) throw new Error("Think block scroller was not rendered");

    // A sentence with no soft-wrap opportunities must wrap inside the block
    // instead of widening it past its column (PE-2431).
    await expect(block.getBoundingClientRect().width).toBeLessThanOrEqual(
      canvasElement.getBoundingClientRect().width,
    );
    await expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth);
  }}
/>

<Story name="Complete - Collapsed" args={{ complete: true }} />

<Story
  name="Complete - Expanded at top"
  args={{ complete: true, event: longStreamingEvent }}
  play={async ({ canvas, userEvent }) => {
    const disclosure = canvas.getByRole("button", { name: /thought/i });
    await userEvent.click(disclosure);
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  }}
/>

<Story
  name="Truncated - Expanded"
  args={{ complete: true, event: truncatedEvent }}
  play={async ({ canvas, userEvent }) => {
    const disclosure = canvas.getByRole("button", { name: /thought/i });
    await userEvent.click(disclosure);
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
    // The expand slide-in starts at opacity 0; wait for it to become visible.
    await waitFor(() => expect(canvas.getByText("Truncated:")).toBeVisible());
  }}
/>
