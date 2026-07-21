<script lang="ts">
  import { setACPGithubContext } from "../../features/GithubRepository.svelte";
  import DesktopGitHubPanel from "./DesktopGitHubPanel.svelte";

  interface Props {
    worktreePath: string;
  }

  let { worktreePath }: Props = $props();
  let titles = $state<string[]>([]);

  setACPGithubContext();
</script>

<div data-testid="title-count">{titles.length}</div>
<DesktopGitHubPanel
  {worktreePath}
  onTitleChange={(title) => {
    titles = [...titles, title];
  }}
/>
