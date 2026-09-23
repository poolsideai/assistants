<script lang="ts">
  import {
    _setACPProjectContextForTests,
    type ACPProjectRepository,
  } from "../features/ProjectRepository.svelte";
  import { _setACPConversationContextForTests } from "../features/ConversationRepository.svelte";
  import { _setACPWorktreeContextForTests } from "../features/WorktreeRepository";
  import ProjectSettingsView from "./ProjectSettingsView.svelte";

  interface Props {
    projects: ACPProjectRepository;
    projectPath?: string;
    projectName?: string;
  }

  let { projects, projectPath = "/tmp/project", projectName = "Project" }: Props = $props();

  _setACPProjectContextForTests(projects);
  _setACPConversationContextForTests({
    refresh: async () => {},
  } as never);
  _setACPWorktreeContextForTests({
    closeProject: async () => {},
  } as never);
</script>

<ProjectSettingsView {projectPath} {projectName} />
