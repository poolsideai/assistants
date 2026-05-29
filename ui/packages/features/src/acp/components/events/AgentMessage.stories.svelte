<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { SessionEvent } from "../../types";
  import AgentMessage from "./AgentMessage.svelte";

  const agentMessageWithContext: SessionEvent & { eventKind: "agent_message" } = {
    eventKind: "agent_message",
    messageId: "a-1",
    content: [
      {
        type: "text",
        text: "I checked the files you attached and found the relevant patterns.",
      },
    ],
  };

  const pairedTurn: SessionEvent[] = [
    {
      eventKind: "user_message",
      messageId: "u-1",
      content: [
        { type: "text", text: "Take a look at these files and this article." },
        {
          type: "resource_link",
          uri: "file:///workspace/src/lib/Editor.svelte",
          name: "Editor.svelte",
        },
        {
          type: "resource_link",
          uri: "file:///workspace/src/lib/Toolbar.svelte",
          name: "Toolbar.svelte",
        },
        {
          type: "resource_link",
          uri: "https://example.com/svelte-runes",
          name: "Svelte runes overview",
        },
      ],
    },
    agentMessageWithContext,
  ];

  const { Story } = defineMeta({
    component: AgentMessage,
    args: {
      event: {
        eventKind: "agent_message",
        messageId: null,
        content: [
          {
            text: "I checked the project and found the relevant files.",
            type: "text",
          },
        ],
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="With user context"
  args={{ event: agentMessageWithContext }}
  parameters={{ acp: { events: pairedTurn } }}
/>
