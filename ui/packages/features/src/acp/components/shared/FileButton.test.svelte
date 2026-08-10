<script lang="ts">
  import FileButton from "./FileButton.svelte";

  interface Props {
    path: string;
    title?: string;
  }

  let { path, title }: Props = $props();
</script>

<FileButton {path} {title}>file.ts</FileButton>
