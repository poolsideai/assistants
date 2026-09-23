<script lang="ts">
  import { setACPChatSessionScope } from "../../features/ChatSessionScope.svelte";
  import {
    _setACPProjectContextForTests,
    type ACPProjectRepository,
  } from "../../features/ProjectRepository.svelte";
  import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
  import type { ACPNavProject } from "../../navTypes";
  import EmptyStateProjectSelector from "./EmptyStateProjectSelector.svelte";

  interface Props {
    repo: ACPSessionRepository;
    projects: ACPNavProject[];
    onAddProject?: () => void;
  }

  let { repo, projects, onAddProject }: Props = $props();

  setACPChatSessionScope(repo, () => "conversation:test");
  _setACPProjectContextForTests({ projects } as unknown as ACPProjectRepository);
</script>

<EmptyStateProjectSelector {onAddProject} />
