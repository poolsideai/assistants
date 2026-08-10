<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
