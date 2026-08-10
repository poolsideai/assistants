<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import DesktopGitHubPanel from "./DesktopGitHubPanel.svelte";

  interface Props {
    worktreePath: string;
    onTitleChange?: (title: string) => void;
  }

  let { worktreePath, onTitleChange }: Props = $props();

  // The real repository is wired here; its prDetail() call goes through the
  // mocked @poolsideai/helperapi binding in the test.
  setACPGithubContext();
</script>

<DesktopGitHubPanel {worktreePath} {onTitleChange} />
