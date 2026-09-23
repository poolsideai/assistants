<script lang="ts">
  import { Collapsible } from "@poolsideai/components/collapsible";
  import { Diff } from "@poolsideai/components/diff";
  import {
    ClipboardProvider,
    DisplayProvider,
    EnvironmentProvider,
    LogProvider,
  } from "@poolsideai/components/providers";
  import type { ToolCall } from "../../types";
  import ToolCallContents from "./ToolCallContents.svelte";

  interface Props {
    tool: ToolCall;
  }

  let { tool }: Props = $props();

  // Mirror ToolRoot: the ambient Diff context is built from the first diff
  // block only, which is exactly the trap a multi-diff tool call must escape.
  const firstDiff = $derived(tool.content?.find((content) => content.type === "diff"));
</script>

<EnvironmentProvider name="test">
  <LogProvider onInfo={() => {}} onError={() => {}}>
    <ClipboardProvider onWrite={async () => {}}>
      <DisplayProvider>
        <Collapsible open>
          {#if firstDiff}
            <Diff oldContent={firstDiff.oldText ?? undefined} newContent={firstDiff.newText}>
              <ToolCallContents {tool} />
            </Diff>
          {:else}
            <ToolCallContents {tool} />
          {/if}
        </Collapsible>
      </DisplayProvider>
    </ClipboardProvider>
  </LogProvider>
</EnvironmentProvider>
