<script lang="ts">
  import { setACPChatSessionScope } from "../../features/ChatSessionScope.svelte";
  import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
  import TextBlock from "./TextBlock.svelte";

  let { cwd, text }: { cwd: string; text: string } = $props();

  const session = {
    get sessionInfo() {
      return { cwd };
    },
    availableCommands: [],
  };
  setACPChatSessionScope(
    { getSessionByConversationId: () => session } as unknown as ACPSessionRepository,
    () => "conversation:test",
  );
</script>

<TextBlock {text} allowVisualizations />
