<script lang="ts">
  import SearchField from "./SearchField.svelte";
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
  <SearchField bind:value {placeholder} class="flex-1" />
  <SidebarIconButton
    icon="history"
    label={archiveLabel}
    title={archiveTitle}
    onclick={() => onArchive()}
  />
</div>
