<script lang="ts">
  import Icon from "../icon/Icon.svelte";
  import { isPreviewableImagePath } from "../assistant-ui/imagePreview.js";
  import ChipNode from "../prompt/editor/chip/ChipNode.svelte";
  import { defaultMarkdownHost, type MarkdownHostAdapter } from "./host.js";
  import { isAppleUser } from "../../utils/platform.js";
  import { get } from "svelte/store";

  interface Props {
    absolutePath: string;
    displayPath: string;
    line?: number;
    column?: number;
    host?: MarkdownHostAdapter;
  }

  let { absolutePath, displayPath, line, column, host = defaultMarkdownHost }: Props = $props();

  let hovered = $state(false);
  let previewStatus = $state<"idle" | "loading" | "loaded" | "unavailable">("idle");
  let previewSrc = $state<string | undefined>();
  let previewRequestId = 0;

  let supportsImagePreview = $derived(
    !!host.getImageFileData && isPreviewableImagePath(absolutePath),
  );
  let supportsFileContextMenu = $derived(
    !!host.showFileContextMenu && get(host.state).environment.assistantHost === "desktop",
  );

  function open(event: Event) {
    const mouseEvent = event instanceof MouseEvent ? event : undefined;
    void host.openFile?.(absolutePath, line, column, {
      preferredEditor: isExternalEditorClick(mouseEvent),
    });
    host.reportUserAction?.("file_link_open");
  }

  function isExternalEditorClick(event: MouseEvent | undefined) {
    if (!event) return false;
    return isAppleUser() ? event.metaKey : event.ctrlKey;
  }

  function showContextMenu(event: MouseEvent) {
    const showFileContextMenu = host.showFileContextMenu;
    if (!supportsFileContextMenu || !showFileContextMenu) return;

    event.preventDefault();
    event.stopPropagation();
    void showFileContextMenu({
      path: absolutePath,
      line,
      column,
      position: { x: event.clientX, y: event.clientY },
    });
  }

  function handleMouseenter() {
    hovered = true;
    loadPreview();
  }

  function loadPreview() {
    if (!supportsImagePreview || previewStatus === "loading" || previewStatus === "loaded") return;

    const requestId = ++previewRequestId;
    previewStatus = "loading";
    void host
      .getImageFileData?.(absolutePath)
      .then((image) => {
        if (requestId !== previewRequestId) return;
        if (!image) {
          previewStatus = "unavailable";
          return;
        }
        previewSrc = `data:${image.mimeType};base64,${image.data}`;
        previewStatus = "loaded";
      })
      .catch(() => {
        if (requestId !== previewRequestId) return;
        previewStatus = "unavailable";
      });
  }
</script>

<span
  class="inline-block align-baseline"
  role="presentation"
  onmouseenter={handleMouseenter}
  onmouseleave={() => (hovered = false)}
  oncontextmenu={showContextMenu}
>
  <ChipNode
    label={displayPath}
    tooltip={absolutePath}
    tooltipContent={supportsImagePreview ? imagePreviewTooltip : undefined}
    ariaLabel={`Open file ${displayPath}`}
    onActivate={open}
    icon={fileIcon}
  />
</span>

{#snippet fileIcon()}
  {@const iconProps = hovered
    ? ({ name: "file-go" } as const)
    : ({ type: "file", name: absolutePath } as const)}
  <span class="mr-0.5 inline-flex items-center align-middle" aria-hidden="true">
    <Icon {...iconProps} size={13} />
  </span>
{/snippet}

{#snippet imagePreviewTooltip()}
  <div
    class="image-tooltip box-border max-w-80 overflow-hidden p-1"
    role="tooltip"
    aria-label={`Image preview ${displayPath}`}
  >
    {#if previewStatus === "loaded" && previewSrc}
      <img
        class="block max-h-64 max-w-full rounded-[3px] object-contain"
        src={previewSrc}
        alt={`Preview of ${displayPath}`}
      />
      <p>{absolutePath}</p>
    {:else if previewStatus === "unavailable"}
      <p>Unable to preview image</p>
    {:else}
      <p>Loading image...</p>
    {/if}
  </div>
{/snippet}

<style lang="postcss">
  @reference "#tailwind.css";

  .image-tooltip p {
    @apply max-w-80 truncate px-1.5 py-1 text-xs leading-tight text-psx-tooltip-foreground;
    overflow-wrap: anywhere;
  }
</style>
