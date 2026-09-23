<script lang="ts">
  // Test harness: provides the contexts HandoffConfirmationProvider reads and
  // exposes the confirmation controller it sets for its children.
  import { _setACPAgentRegistryContextForTests } from "../features/AgentRegistryRepository.svelte";
  import { _setACPAgentServersContextForTests } from "../features/AgentServersRepository.svelte";
  import type { ACPHandoffConfirmationController } from "../features/HandoffConfirmationContext";
  import {
    _setACPContextForTests,
    type ACPSessionRepository,
  } from "../features/SessionRepository.svelte";
  import HandoffConfirmationProbe from "./HandoffConfirmationProbe.test.svelte";
  import HandoffConfirmationProvider from "./HandoffConfirmationProvider.svelte";

  interface Props {
    repo: unknown;
    agentServers: unknown;
    registry?: unknown;
    onController: (controller: ACPHandoffConfirmationController) => void;
  }

  let {
    repo,
    agentServers,
    registry = { getAgent: () => undefined },
    onController,
  }: Props = $props();

  _setACPContextForTests(repo as ACPSessionRepository);
  _setACPAgentRegistryContextForTests(registry as never);
  _setACPAgentServersContextForTests(agentServers as never);
</script>

<HandoffConfirmationProvider>
  <HandoffConfirmationProbe {onController} />
</HandoffConfirmationProvider>
