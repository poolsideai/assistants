<script lang="ts">
  import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
  import { setACPChatSessionScope } from "../../features/ChatSessionScope.svelte";
  import GoalIndicator from "./GoalIndicator.svelte";

  interface Props {
    repo: ACPSessionRepository;
  }

  let { repo }: Props = $props();

  setACPChatSessionScope(repo, () => "conversation:test");
</script>

<GoalIndicator />
