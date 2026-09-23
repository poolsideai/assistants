<script lang="ts">
  import {
    _setACPAgentRegistryContextForTests,
    type AcpAgentRegistryRepository,
  } from "../../features/AgentRegistryRepository.svelte";
  import { setACPChatSessionScope } from "../../features/ChatSessionScope.svelte";
  import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
  import ConversationHeader from "./ConversationHeader.svelte";

  interface Props {
    repo: ACPSessionRepository;
    onViewTrajectory?: () => void;
    onSaveTrajectory?: () => void;
  }

  let { repo, onViewTrajectory, onSaveTrajectory }: Props = $props();

  setACPChatSessionScope(repo, () => "conversation:test");
  _setACPAgentRegistryContextForTests({
    getAgent: () => undefined,
  } as unknown as AcpAgentRegistryRepository);
</script>

<ConversationHeader {onViewTrajectory} {onSaveTrajectory} />
