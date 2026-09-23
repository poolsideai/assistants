<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import Icon from "@poolsideai/components/icon";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    buildDesktopImageContextMenuItems,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    performDesktopImageContextMenuAction,
    requestDesktopImageAttachment,
    showDesktopContextMenu,
    type DesktopImageContextMenuRPC,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { getUnknownErrorMessage } from "@poolsideai/lib/errors";
__POOL_SYNTHETIC_IMPORT_BASELINE__

  import {
    DESKTOP_SETTINGS_CHANGED_EVENT,
    getDesktopSettings,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    openPathWithOpener,
    readTextFile,
    revealPathInFinder,
    writeImageDataToPasteboard,
    writeImageToPasteboard,
    writeToClipboard,
    type DesktopFileOpener,
    type DesktopSettings,
  } from "./rpc/host";

  let {
    path,
    cwd,
    line,
    openToken,
    focusToken,
    initialCodeFontFamily,
    initialCodeFontSize,
    onFileContextChange,
  }: DesktopFileViewerPanelProps = $props();

  type LoadState = "idle" | "loading" | "ready" | "error";
__POOL_SYNTHETIC_IMPORT_BASELINE__

  const DEFAULT_CODE_FONT_FAMILY = "Menlo";
  const DEFAULT_CODE_FONT_SIZE = 13;

__POOL_SYNTHETIC_IMPORT_BASELINE__
  let loadState = $state<LoadState>("idle");
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let errorMessage = $state("");
  let externalOpenError = $state("");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let fileOpeners = $state<DesktopFileOpener[]>([]);
  let codeFontFamily = $state(normalizeCodeFontFamily(initialCodeFontFamily));
  let codeFontSize = $state(normalizeCodeFontSize(initialCodeFontSize));
  let loadVersion = 0;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let previousFocusToken = 0;
  let previousOpenToken = 0;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const displayPath = $derived(relativePathFromCwd(path, cwd));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const imageContextMenuRpc: DesktopImageContextMenuRPC = {
    getImageFileData,
    openPathWithOpener,
    revealPathInFinder,
    writeImageDataToPasteboard,
    writeImageToPasteboard,
    writeToClipboard,
  };

  onMount(() => {
    void getDesktopSettings()
      .then(applyDesktopSettings)
      .catch((error) => console.debug("Unable to load desktop editor settings", error));

    const onSettingsChanged = (event: Event) => {
      applyDesktopSettings((event as CustomEvent<DesktopSettings>).detail);
    };
    window.addEventListener(DESKTOP_SETTINGS_CHANGED_EVENT, onSettingsChanged);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  $effect(() => {
    const nextPath = path;
    untrack(() => void loadFile(nextPath));
  });

  $effect(() => {
    const token = openToken;
    if (token === previousOpenToken) return;
    previousOpenToken = token;
    void tick().then(jumpToLocation);
  });

  $effect(() => {
    const token = focusToken;
    if (!token || token === previousFocusToken) return;
    previousFocusToken = token;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

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

  async function loadFile(nextPath: string) {
    const version = ++loadVersion;
    loadState = "loading";
    errorMessage = "";
    externalOpenError = "";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onFileContextChange?.({ path: nextPath });

    try {
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
      const file = await readTextFile(nextPath);
      if (version !== loadVersion) return;

      onFileContextChange?.({ path: nextPath, content: file.contents });
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
      loadState = "ready";
      await tick();
      jumpToLocation();
    } catch (error) {
      if (version !== loadVersion) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      loadState = "error";
      errorMessage = getUnknownErrorMessage(error);
    }
  }

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
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  async function openInExternalEditor() {
    externalOpenError = "";
    try {
      await openPathWithOpener(path, "default");
    } catch (error) {
      externalOpenError = getUnknownErrorMessage(error);
    }
  }

  async function openImageContextMenu(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const action = await showDesktopContextMenu(
      buildDesktopImageContextMenuItems({
        currentOpenerId: imageViewerOpenerId(),
        fileOpeners: fileOpeners.map(({ id, label }) => ({ id, label })),
      }),
      { x: event.clientX, y: event.clientY },
    );
    if (!action) return;

    externalOpenError = "";
    try {
      await performDesktopImageContextMenuAction({
        actionId: action,
        path,
        relativePath: displayPath,
        rpc: imageContextMenuRpc,
        attachImage: requestDesktopImageAttachment,
      });
    } catch (error) {
      externalOpenError = getUnknownErrorMessage(error);
    }
  }

  function imageViewerOpenerId(): string {
    return fileOpeners.find((opener) => opener.kind === "inApp")?.id ?? "poolside";
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function applyDesktopSettings(settings: DesktopSettings) {
    fileOpeners = settings.fileOpeners;
    codeFontFamily = normalizeCodeFontFamily(settings.codeFontFamily);
    codeFontSize = normalizeCodeFontSize(settings.codeFontSize);
  }

  function normalizeCodeFontFamily(value: string | undefined): string {
    const trimmed = value?.trim() ?? "";
    return trimmed || DEFAULT_CODE_FONT_FAMILY;
  }

  function normalizeCodeFontSize(value: number | undefined): number {
    const fontSize = Math.round(Number(value));
    if (!Number.isFinite(fontSize)) return DEFAULT_CODE_FONT_SIZE;
    return Math.min(24, Math.max(8, fontSize));
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function relativePathFromCwd(nextPath: string, nextCwd: string | undefined): string {
    const trimmedCwd = nextCwd?.trim();
    if (!trimmedCwd) return nextPath;

    const normalizedPath = normalizePathForDisplay(nextPath);
    const normalizedCwd = normalizePathForDisplay(trimmedCwd);
    const prefix = normalizedCwd.endsWith("/") ? normalizedCwd : `${normalizedCwd}/`;

__POOL_SYNTHETIC_IMPORT_BASELINE__
      return normalizedPath.split("/").pop() || normalizedPath;
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return normalizedPath.slice(prefix.length);
    }

    return nextPath;
  }

  function normalizePathForDisplay(value: string): string {
    const normalized = value.replace(/\\/g, "/");
    return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
  }
</script>

<div class="desktop-file-viewer">
  <div class="desktop-file-viewer-toolbar">
    <div class="desktop-file-viewer-title" title={path}>
      <Icon type="file" name={path} fallback="file" size={16} aria-hidden="true" />
      <span>{displayPath}</span>
    </div>
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
  </div>

  <div class="desktop-file-viewer-body">
    <div
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
        <img src={imageSrc} alt={displayPath} oncontextmenu={openImageContextMenu} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if loadState === "loading"}
      <div class="desktop-file-viewer-message">Loading file...</div>
    {:else if loadState === "error"}
      <div class="desktop-file-viewer-message desktop-file-viewer-message--error">
        {errorMessage || "Unable to open file."}
      </div>
    {/if}
  </div>

  {#if externalOpenError}
    <div class="desktop-file-viewer-error">{externalOpenError}</div>
  {/if}
</div>

<style lang="postcss">
  .desktop-file-viewer {
    display: flex;
    height: 100%;
    min-height: 0;
    min-width: 0;
    flex-direction: column;
    overflow: hidden;
    background: var(--psx-editor-background);
    color: var(--psx-foreground-primary);
  }

  .desktop-file-viewer-toolbar {
    display: flex;
    min-height: 34px;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--psx-border);
    padding: 0 8px;
  }

  .desktop-file-viewer-title {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    gap: 6px;
    color: var(--psx-foreground-secondary);
    font-size: 12px;
  }

  .desktop-file-viewer-title span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .desktop-file-viewer-action {
    display: inline-flex;
    height: 24px;
    width: 24px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--psx-foreground-secondary);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    background: var(--psx-menu-hover-background);
    color: var(--psx-foreground-primary);
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .desktop-file-viewer-action:focus-visible {
    outline: 2px solid var(--psx-focus);
    outline-offset: 1px;
  }

  .desktop-file-viewer-body {
    position: relative;
    min-height: 0;
    min-width: 0;
    flex: 1;
  }

  .desktop-file-viewer-editor {
    height: 100%;
    min-height: 0;
    min-width: 0;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .desktop-file-viewer-editor--hidden {
    visibility: hidden;
  }

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
  .desktop-file-viewer-message {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: var(--psx-foreground-secondary);
    font-size: 13px;
    text-align: center;
  }

  .desktop-file-viewer-message--error {
    color: var(--psx-error-foreground);
  }

  .desktop-file-viewer-error {
    border-top: 1px solid var(--psx-border);
    padding: 6px 10px;
    color: var(--psx-error-foreground);
    font-size: 12px;
  }
</style>
