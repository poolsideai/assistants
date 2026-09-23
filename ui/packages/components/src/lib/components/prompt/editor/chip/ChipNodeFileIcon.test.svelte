<script lang="ts">
  import { IconProvider } from "../../../icon/index.js";
  import ChipNode from "./ChipNode.svelte";

  async function getFileIcon(path: string) {
    return `<svg data-testid="theme-file-icon" data-path="${path}" viewBox="0 0 16 16"></svg>`;
  }
</script>

<IconProvider {getFileIcon}>
  <ChipNode label="app.ts" icon="file" fileIconPath="/repo/src/app.ts" />
</IconProvider>
