<script lang="ts">
  import Icon from "@poolsideai/components/icon";
  import { CollapsibleTrigger } from "@poolsideai/components/collapsible";
  import { getToolContext } from "../../shared/ToolRoot.svelte";
  import { shortenDirectoryPathsInText } from "../../../shared/paths";

  interface Props {
    command: string;
    status?: string;
  }

  let { command, status }: Props = $props();

  const context = getToolContext();
  const displayCommand = $derived(
    shortenDirectoryPathsInText(
      command.replace(/^cd\s+(?:"[^"]*"|'[^']*'|\S+)\s*&&\s*/, ""),
      context.workspaceFolders,
      context.homeDirectory,
    ),
  );
</script>

<div
__POOL_SYNTHETIC_IMPORT_BASELINE__
>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <CollapsibleTrigger
    aria-label={context.open ? "Collapse shell command" : "Expand shell command"}
    appearance="plain"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if context.icon === "loading"}
      <Icon name="terminal-active" size={14} class="shrink-0" />
    {:else}
      <Icon name="terminal" size={14} class="shrink-0" />
    {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__

  <span class="text-auto flex min-w-0 items-baseline gap-1.5 text-current">
    <span class="shrink-0">Run Shell Command:</span>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
