<script lang="ts">
  import type { Snippet } from "svelte";
  import { setContextRepoContext } from "../src/context";
  import { setACPAgentRegistryContext } from "../src/acp/features/AgentRegistryRepository.svelte";
  import { setACPAgentServersContext } from "../src/acp/features/AgentServersRepository.svelte";
  import { setACPConversationContext } from "../src/acp/features/ConversationRepository.svelte";
  import { setACPGithubContext } from "../src/acp/features/GithubRepository.svelte";
  import { setACPLocalHistoryContext } from "../src/acp/features/LocalHistoryRepository.svelte";
  import { setACPProjectContext } from "../src/acp/features/ProjectRepository.svelte";
  import { setACPContext } from "../src/acp/features/SessionRepository.svelte";
  import { setACPWorktreeContext } from "../src/acp/features/WorktreeRepository";
  import { setAssistantTerminalContext } from "../src/acp/features/AssistantTerminalRepository.svelte";
  import { appState } from "../src/acp/hostAdapter";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  const repo = setACPContext();

  setACPProjectContext();
  setACPGithubContext();
  setACPConversationContext();
  setACPLocalHistoryContext();
  setACPAgentServersContext({ appState, sessionRepo: repo });
  setACPWorktreeContext();
  setACPAgentRegistryContext();
  setAssistantTerminalContext();
  setContextRepoContext();
</script>

{@render children?.()}
