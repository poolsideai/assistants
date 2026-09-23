<script lang="ts">
  import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
  import { setACPChatSessionScope } from "../../features/ChatSessionScope.svelte";
  import PlanModeIndicator from "./PlanModeIndicator.svelte";

  interface Props {
    repo: ACPSessionRepository;
  }

  let { repo }: Props = $props();

  setACPChatSessionScope(repo, () => "conversation:test");
</script>

<PlanModeIndicator />
