<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import SidebarIconButton from "./SidebarIconButton.svelte";

  interface Props {
    value: string;
    placeholder: string;
    archiveLabel: string;
    archiveTitle?: string;
    onArchive: () => void | Promise<void>;
  }

  let {
    value = $bindable(),
    placeholder,
    archiveLabel,
    archiveTitle = "Archived conversations",
    onArchive,
  }: Props = $props();
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <SidebarIconButton
__POOL_SYNTHETIC_IMPORT_BASELINE__
    label={archiveLabel}
    title={archiveTitle}
    onclick={() => onArchive()}
  />
</div>
