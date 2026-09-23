<script lang="ts">
  import {
    _setACPAgentRegistryContextForTests,
    type AcpAgentRegistryRepository,
  } from "../../features/AgentRegistryRepository.svelte";
  import {
    _setACPConversationContextForTests,
    type ACPConversationRepository,
  } from "../../features/ConversationRepository.svelte";
  import {
    _setACPContextForTests,
    type ACPSessionRepository,
  } from "../../features/SessionRepository.svelte";
  import type { ACPConversationSummary } from "../../navTypes";
  import { AcpSidebarController } from "./SidebarController.svelte";

  interface Props {
    repo: ACPSessionRepository;
    summary: ACPConversationSummary;
  }

  let { repo, summary }: Props = $props();

  _setACPContextForTests(repo);
  _setACPConversationContextForTests({} as ACPConversationRepository);
  _setACPAgentRegistryContextForTests({
    getAgent: () => undefined,
  } as unknown as AcpAgentRegistryRepository);

  const sidebar = new AcpSidebarController({
    onShowChat: () => {},
    onNewConversation: () => {},
    getActiveConversationId: () => summary.id,
  });
</script>

{#if summary}
  {@const row = sidebar.rowState(summary)}
  <span data-testid="sidebar-agent">{row.agentServer}</span>
{/if}
