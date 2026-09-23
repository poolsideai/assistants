<script lang="ts">
  import Icon from "@poolsideai/components/icon";
  import { CollapsibleTrigger } from "@poolsideai/components/collapsible";
  import { getToolContext } from "../../shared/ToolRoot.svelte";

  interface Props {
    sessionId?: string;
    status?: string;
  }

  let { sessionId, status }: Props = $props();

  const context = getToolContext();
</script>

<div
__POOL_SYNTHETIC_IMPORT_BASELINE__
>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <CollapsibleTrigger
    aria-label={context.open ? "Collapse shell response" : "Expand shell response"}
    appearance="plain"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <Icon
      name={context.icon === "loading" ? "terminal-active" : "terminal"}
      size={14}
      class="shrink-0"
    />
__POOL_SYNTHETIC_IMPORT_BASELINE__

  <span class="text-auto flex min-w-0 items-baseline gap-1.5 text-current">
    <span class="shrink-0">Receiving Shell Response</span>
    {#if sessionId}
      <span class="min-w-0 truncate font-mono opacity-90">{sessionId}</span>
    {/if}
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
