<script lang="ts">
  import {
    _setACPAgentRegistryContextForTests,
    type AcpAgentRegistryRepository,
  } from "../features/AgentRegistryRepository.svelte";
  import {
    _setACPConversationContextForTests,
    type ACPConversationRepository,
  } from "../features/ConversationRepository.svelte";
  import { setACPGithubContext } from "../features/GithubRepository.svelte";
  import {
    _setACPProjectContextForTests,
    type ACPProjectRepository,
  } from "../features/ProjectRepository.svelte";
  import {
    _setACPContextForTests,
    type ACPSessionRepository,
  } from "../features/SessionRepository.svelte";
  import {
    _setACPWorktreeContextForTests,
    type ACPWorktreeRepository,
  } from "../features/WorktreeRepository";
  import type { ACPConversationSummary, ACPNavProject } from "../navTypes";
  import MobileSideBar from "./MobileSideBar.svelte";

  interface Props {
    projects: ACPNavProject[];
    sessions: ACPConversationSummary[];
  }

  let { projects, sessions }: Props = $props();

  _setACPProjectContextForTests({
    projects,
    refreshState: { status: "success", value: projects },
    refresh: async () => {},
    setProjectCollapsed: async () => {},
  } as unknown as ACPProjectRepository);
  _setACPConversationContextForTests({
    sessions,
    refreshState: { status: "success", value: sessions },
    refresh: async () => {},
  } as unknown as ACPConversationRepository);
  _setACPWorktreeContextForTests({
    closeProject: async () => {},
  } as unknown as ACPWorktreeRepository);
  _setACPContextForTests({
    getSessionByConversationId: () => null,
    getConversationStatus: () => ({ working: false, waitingForUser: false, unread: false }),
    agents: {
      getInitializeResponse: () => undefined,
    },
  } as unknown as ACPSessionRepository);
  _setACPAgentRegistryContextForTests({
    getAgent: () => undefined,
  } as unknown as AcpAgentRegistryRepository);
  setACPGithubContext();

  function noop() {}
  async function noopAsync() {}
</script>

<MobileSideBar
  activeConversationId={null}
  onShowChat={noop}
  onNewConversation={noopAsync}
  onOpenConversation={noopAsync}
  onActiveConversationIdChange={noop}
/>
