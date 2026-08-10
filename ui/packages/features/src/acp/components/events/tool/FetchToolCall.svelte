<script lang="ts">
  import { CollapsibleContent } from "@poolsideai/components/collapsible";
  import type { WorkspaceFolder } from "@poolsideai/rpc";
  import type { ToolCall } from "../../../types";
  import ToolRoot from "../../shared/ToolRoot.svelte";
  import ToolBody from "../../shared/ToolBody.svelte";
  import ToolFooter from "../../shared/ToolFooter.svelte";
  import ToolCallContents from "../../shared/ToolCallContents.svelte";
  import FetchToolHeader from "./FetchToolHeader.svelte";
  import { getFetchUrl } from "./fetchTool";

  interface Props {
    event: ToolCall;
    workspaceFolders?: WorkspaceFolder[];
  }

  let { event, workspaceFolders = [] }: Props = $props();

  let url = $derived(getFetchUrl(event) ?? event.title);
  let hasContent = $derived(!!event.content?.length);
  let rawOutput = $derived(stringify(event.rawOutput));
  let status = $derived.by(() => {
    if (event.status === "in_progress") return "fetching";
    if (event.status === "failed") return "failed";
  });

  function stringify(value: unknown): string | undefined {
    if (value == null) return;
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }
</script>

<ToolRoot tool={event} {workspaceFolders}>
  <FetchToolHeader {url} {status} />

  <ToolBody>
    {#if hasContent}
      <ToolCallContents tool={event} {workspaceFolders} />
    {:else if rawOutput}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <div
__POOL_SYNTHETIC_IMPORT_BASELINE__
        >
          <pre class="whitespace-pre-wrap break-all">{rawOutput}</pre>
        </div>
      </CollapsibleContent>
    {/if}
  </ToolBody>

  <ToolFooter />
</ToolRoot>
