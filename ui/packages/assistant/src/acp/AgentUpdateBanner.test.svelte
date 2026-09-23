<script lang="ts">
  import type { ACPSessionRepository } from "../../../features/src/acp/features/SessionRepository.svelte";
  import {
    _setACPAgentUpdateContextForTests,
    type ACPAgentUpdateRepository,
  } from "../../../features/src/acp/features/AgentUpdateRepository.svelte";
  import { setACPChatSessionScope } from "../../../features/src/acp/features/ChatSessionScope.svelte";
  import AgentUpdateBanner from "./AgentUpdateBanner.svelte";

  interface Props {
    updates: ACPAgentUpdateRepository;
  }

  let { updates }: Props = $props();

  // The harness installs one repository before rendering and is not rerendered.
  // svelte-ignore state_referenced_locally
  _setACPAgentUpdateContextForTests(updates);
  setACPChatSessionScope({
    getSessionByConversationId: () => null,
    agents: {
      defaultAgentServer: "poolside",
    },
  } as unknown as ACPSessionRepository);
</script>

<AgentUpdateBanner />
