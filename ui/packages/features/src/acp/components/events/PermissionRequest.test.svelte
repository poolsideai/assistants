<script lang="ts">
  import {
    _setACPAgentRegistryContextForTests,
    type AcpAgentRegistryRepository,
  } from "../../features/AgentRegistryRepository.svelte";
  import {
    _setACPContextForTests,
    type ACPSessionRepository,
  } from "../../features/SessionRepository.svelte";
  import type { ACPPendingPermissionRequest } from "../../features/Session.svelte";
  import PermissionRequest from "./PermissionRequest.svelte";

  interface Props {
    request: ACPPendingPermissionRequest;
    selectPermissionOption: (requestId: string, optionId: string, overrideRules?: string[]) => void;
  }

  let { request, selectPermissionOption }: Props = $props();

  _setACPContextForTests({
    selectPermissionOption,
  } as unknown as ACPSessionRepository);
  _setACPAgentRegistryContextForTests({
    getAgent: () => undefined,
  } as unknown as AcpAgentRegistryRepository);
</script>

<PermissionRequest {request} />
