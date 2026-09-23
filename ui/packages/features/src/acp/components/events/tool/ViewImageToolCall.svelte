<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import Icon from "@poolsideai/components/icon";
  import Tooltip from "../../ui/Tooltip.svelte";
  import { rpc } from "../../../hostRpc";
  import ToolFooter from "../../shared/ToolFooter.svelte";
  import ToolRoot from "../../shared/ToolRoot.svelte";
  import { appState } from "../../../hostAdapter";
  import { getReadableFileInfo } from "../../../shared/paths";
  import type { ToolCall } from "../../../types";
  import { getViewImagePreview } from "./viewImageTool";
  import type { WorkspaceFolder } from "@poolsideai/rpc";

  interface Props {
    event: ToolCall;
    workspaceFolders?: WorkspaceFolder[];
  }

  let { event, workspaceFolders = [] }: Props = $props();

  let preview = $derived(getViewImagePreview(event));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let displayPath = $derived(
    path ? getReadableFileInfo(path, workspaceFolders, $appState.homeDirectory).filePath : path,
  );
  let fileName = $derived(path?.split(/[\\/]/).filter(Boolean).at(-1) ?? path ?? "image");
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

<ToolRoot tool={event}>
  <!-- self-start keeps the hover region at the header's width now that
       ToolRoot is w-full; without it the tooltip pops over the whole row. -->
  <Tooltip
    text={displayPath}
    placement="top"
    gutter={8}
    openDelay={200}
    hide={!path}
    class="min-w-0 max-w-full self-start"
  >
    <div
__POOL_SYNTHETIC_IMPORT_BASELINE__
    >
      <Icon name="file" size={14} class="shrink-0" />
      <span class="shrink-0">View image</span>
      <span class="min-w-0 truncate font-mono opacity-90">{fileName}</span>
    </div>
  </Tooltip>

  {#if preview}
    <div
      class="border-psx-border bg-psx-panel shadow-low dark:shadow-low-dark mt-1 w-fit max-w-full overflow-hidden rounded-md border"
    >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          data-cursor="link"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          <img
            class="max-h-80 max-w-full object-contain"
            {src}
            alt={`Viewed image ${fileName}`}
            data-poolside-image-path={path}
            data-poolside-image-name={fileName}
          />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    </div>
  {/if}

  <ToolFooter />
</ToolRoot>
