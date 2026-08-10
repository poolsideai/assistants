<script lang="ts">
  import type { Repositories } from "./Repositories.svelte";
  import { registerAttentionBadgeEffect } from "./registerAttentionBadgeEffect.svelte";

  interface Props {
    unread: boolean;
    onChange: (count: number) => void;
  }

  let { unread, onChange }: Props = $props();

  const repositories = {
    acpConversationRepo: {
      get sessions() {
        return [
          {
            id: "s-current",
            sessionId: "s-current",
            agentServer: "poolside",
            liveStatus: { working: false, waitingForUser: false, unread },
          },
        ];
      },
    },
  } as unknown as Repositories;

  registerAttentionBadgeEffect(repositories, onChange);
</script>
