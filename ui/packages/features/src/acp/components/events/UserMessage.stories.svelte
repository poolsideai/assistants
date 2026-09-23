<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { ComponentProps } from "svelte";
  import UserMessage from "./UserMessage.svelte";

  const { Story } = defineMeta({
    component: UserMessage,
    render: template,
    args: {
      event: {
        eventKind: "user_message",
        messageId: null,
        content: [
          {
            type: "text",
            text: "What's the weather like today?",
          },
        ],
      },
    },
  });
</script>

{#snippet template(args: ComponentProps<typeof UserMessage>)}
  <div class="mx-auto max-w-2xl p-8">
    <UserMessage event={args.event} />
  </div>
{/snippet}

<Story name="Default" />

<Story
  name="Steered"
  args={{
    event: {
      eventKind: "user_message",
      messageId: "steer-1",
      content: [
        {
          type: "text",
          text: "Focus on the failing test first, then continue with the implementation.",
        },
      ],
      steer: true,
    },
  }}
/>
