<script lang="ts">
  import type { ACPAgentServersRepository } from "../../../features/src/acp/features/AgentServersRepository.svelte";
  import { _setACPAgentServersContextForTests } from "../../../features/src/acp/features/AgentServersRepository.svelte";
  import AssistantConfigErrorBanner from "./AssistantConfigErrorBanner.svelte";

  interface Props {
    agentServers: ACPAgentServersRepository;
  }

  let { agentServers }: Props = $props();

  // The harness installs one repository before rendering and is not rerendered.
  // svelte-ignore state_referenced_locally
  _setACPAgentServersContextForTests(agentServers);
</script>

<AssistantConfigErrorBanner />
