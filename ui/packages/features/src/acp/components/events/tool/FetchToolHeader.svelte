<script lang="ts">
  import Icon from "@poolsideai/components/icon";
  import { Spinner } from "@poolsideai/components/spinner";
  import { CollapsibleTrigger } from "@poolsideai/components/collapsible";
  import { getToolContext } from "../../shared/ToolRoot.svelte";
  import { formatFetchUrl } from "./fetchTool";

  interface Props {
    url: string;
    status?: string;
  }

  let { url, status }: Props = $props();

  const context = getToolContext();
  const displayUrl = $derived(formatFetchUrl(url));
</script>

<div
__POOL_SYNTHETIC_IMPORT_BASELINE__
>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <CollapsibleTrigger
    aria-label={context.open ? "Collapse fetch" : "Expand fetch"}
    appearance="plain"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if context.icon === "loading"}
      <Spinner aria-hidden size={12} class="shrink-0" />
    {:else}
      <Icon name="web" size={14} class="shrink-0" />
    {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__

  <span class="text-auto flex min-w-0 items-baseline gap-1.5 text-current">
    <span class="shrink-0">Fetch</span>
    <span
      class="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-mono opacity-90"
    >
      {displayUrl}
    </span>
__POOL_SYNTHETIC_IMPORT_BASELINE__

  {#if status}
    <span class="shrink-0 uppercase opacity-80">{status}</span>
  {/if}

__POOL_SYNTHETIC_IMPORT_BASELINE__
    <Icon
      name="chevron"
      class={[
        "shrink-0 transition-all",
        !context.open && "-rotate-90 opacity-0 group-hover:opacity-100",
      ]}
    />
__POOL_SYNTHETIC_IMPORT_BASELINE__
</div>
