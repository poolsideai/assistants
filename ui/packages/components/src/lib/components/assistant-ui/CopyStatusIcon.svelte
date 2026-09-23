<script lang="ts">
  import Icon from "../icon/Icon.svelte";

  interface Props {
    copied?: boolean;
    size?: number;
  }

  let { copied = false, size = 14 }: Props = $props();
</script>

<span
  data-copy-status-icon
  data-copy-status={copied ? "copied" : "copy"}
  class="grid size-4 place-items-center"
>
  {#if copied}
    <Icon aria-hidden="true" name="copied" {size} />
  {:else}
    <Icon aria-hidden="true" name="copy" {size} />
  {/if}
</span>
