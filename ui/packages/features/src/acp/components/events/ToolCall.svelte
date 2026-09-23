<script lang="ts">
  import ToolCallContents from "../shared/ToolCallContents.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import ToolRoot from "../shared/ToolRoot.svelte";
  import ToolHeader from "../shared/ToolHeader.svelte";
  import ToolBody from "../shared/ToolBody.svelte";
  import ToolFooter from "../shared/ToolFooter.svelte";
  import { Boundary } from "@poolsideai/components/boundary";
  import { HighlightedShellCommand } from "@poolsideai/components/assistant-ui";
  import { CollapsibleContent } from "@poolsideai/components/collapsible";
  import {
    getPermissionDeniedObservation,
    getToolCommand,
    getToolDescription,
    isPermissionDeniedToolCall,
  } from "../shared/toolStatus";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { findToolOverride } from "./tool/toolOverrides";
  import type { ToolCall } from "../../types";
  import type { WorkspaceFolder } from "@poolsideai/rpc";

  interface Props {
    event: ToolCall;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    workspaceFolders?: WorkspaceFolder[];
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__

  function stringify(value: unknown): string | undefined {
    if (value == null) return;
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }

  let hasContent = $derived(!!event.content?.length);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let rawInput = $derived(stringify(event.rawInput));
  let rawOutput = $derived(stringify(event.rawOutput));
  let isPermissionDenied = $derived(isPermissionDeniedToolCall(event));
  let deniedObservation = $derived(getPermissionDeniedObservation(event));
  let command = $derived(getToolCommand(event));
  let description = $derived(getToolDescription(event));
  let toolOverride = $derived(findToolOverride(event));
  let ToolOverrideComponent = $derived(toolOverride?.component);
</script>

{#snippet genericToolCall()}
  <ToolRoot tool={event} {workspaceFolders}>
__POOL_SYNTHETIC_IMPORT_BASELINE__

    <ToolBody>
      {#if isPermissionDenied}
        <CollapsibleContent class="relative flex flex-col">
          {#if deniedObservation}
            <div class="border-psx-border text-psx-foreground-secondary border-b px-2.5 py-2">
              {deniedObservation}
            </div>
          {/if}

          {#if description || command}
            <div class="flex flex-col">
              {#if description}
                <div class="text-psx-foreground-secondary px-2.5 pt-2 text-xs italic">
                  {description}
                </div>
              {/if}
              {#if command}
                <div
                  class="font-(family-name:--editor-font-size) block min-h-4 overflow-auto px-2.5 py-2 text-sm"
                >
                  <pre class="whitespace-pre-wrap"><span class="select-none"
                      >$ </span><HighlightedShellCommand {command} /></pre>
                </div>
              {/if}
            </div>
          {/if}
        </CollapsibleContent>
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <CollapsibleContent class="relative flex flex-col gap-2" animated={false}>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {:else if hasContent}
        <ToolCallContents tool={event} {workspaceFolders} />
      {:else if rawInput || rawOutput}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        </CollapsibleContent>
      {/if}
    </ToolBody>

    <ToolFooter />
  </ToolRoot>
{/snippet}

{#if ToolOverrideComponent}
  <Boundary name={`ACPToolOverride:${toolOverride?.id ?? event.title}`}>
    {#snippet failed(_error, _reset)}
      {@render genericToolCall()}
    {/snippet}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  </Boundary>
{:else}
  {@render genericToolCall()}
{/if}
