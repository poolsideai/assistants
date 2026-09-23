<script lang="ts" module>
  import type {
    FileTree as CachedFileTree,
    FileTreeIconConfig as CachedFileTreeIconConfig,
    GitStatusEntry as CachedGitStatusEntry,
  } from "@pierre/trees";

  interface DesktopFileTree {
    rootPath: string;
    entries: DesktopFileTreeEntry[];
    deferredDirectories: string[];
    gitStatus: CachedGitStatusEntry[];
  }

  interface DesktopFileTreeEntry {
    path: string;
    relativePath: string;
    kind: "directory" | "file";
    gitIgnored: boolean;
  }

  interface DesktopFileTreeChangedPayload {
    changes: DesktopFileTreeChange[];
  }

  interface DesktopFileTreeChange {
    path: string;
    type: number;
    kind?: DesktopFileTreeEntry["kind"];
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  interface CachedDesktopFileTreeState {
    rootPath: string;
    showGitIgnored: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    loadState: "idle" | "loading" | "ready" | "error";
    errorMessage: string | null;
    fileTree: DesktopFileTree | null;
    latestFileTree: DesktopFileTree | null;
    latestFileIconConfig: CachedFileTreeIconConfig | undefined;
    latestFileIconConfigSignature: string;
    entriesByRelativePath: Map<string, DesktopFileTreeEntry>;
    deferredDirectoryPaths: Set<string>;
    loadingDirectoryPaths: Set<string>;
    expandedDirectoryPaths: Set<string>;
    fileTreeModel: CachedFileTree | undefined;
    iconConfigVersion: number;
    disposeTimer: ReturnType<typeof setTimeout> | undefined;
  }

  const DESKTOP_FILE_TREE_CACHE_DISPOSE_MS = 30_000;
  const DESKTOP_FILE_TREE_CACHE_MAX_SIZE = 20;
  const desktopFileTreeStateCache = new Map<string, CachedDesktopFileTreeState>();

  function takeCachedDesktopFileTreeState(
    cacheKey: string | undefined,
    rootPath: string,
  ): CachedDesktopFileTreeState | undefined {
    if (!cacheKey) return undefined;

    const cached = desktopFileTreeStateCache.get(cacheKey);
    if (!cached) return undefined;

    if (cached.rootPath !== rootPath) {
      desktopFileTreeStateCache.delete(cacheKey);
      disposeCachedDesktopFileTreeState(cached);
      return undefined;
    }

    if (cached.disposeTimer) {
      clearTimeout(cached.disposeTimer);
      cached.disposeTimer = undefined;
    }
    desktopFileTreeStateCache.delete(cacheKey);
    return cached;
  }

  function storeCachedDesktopFileTreeState(
    cacheKey: string | undefined,
    state: CachedDesktopFileTreeState,
  ) {
    if (!cacheKey) {
      disposeCachedDesktopFileTreeState(state);
      return;
    }

    const existing = desktopFileTreeStateCache.get(cacheKey);
    if (existing && existing !== state) {
      disposeCachedDesktopFileTreeState(existing);
    }
    desktopFileTreeStateCache.set(cacheKey, state);

    while (desktopFileTreeStateCache.size > DESKTOP_FILE_TREE_CACHE_MAX_SIZE) {
      const oldestKey = desktopFileTreeStateCache.keys().next().value;
      if (!oldestKey) break;
      const oldest = desktopFileTreeStateCache.get(oldestKey);
      desktopFileTreeStateCache.delete(oldestKey);
      if (oldest) {
        disposeCachedDesktopFileTreeState(oldest);
      }
    }
  }

  function scheduleCachedDesktopFileTreeDisposal(cacheKey: string | undefined) {
    if (!cacheKey) return;

    const cached = desktopFileTreeStateCache.get(cacheKey);
    if (!cached) return;

    if (cached.disposeTimer) {
      clearTimeout(cached.disposeTimer);
    }
    cached.disposeTimer = setTimeout(() => {
      if (desktopFileTreeStateCache.get(cacheKey) !== cached) return;

      desktopFileTreeStateCache.delete(cacheKey);
      disposeCachedDesktopFileTreeState(cached);
    }, DESKTOP_FILE_TREE_CACHE_DISPOSE_MS);
  }

  function disposeCachedDesktopFileTreeState(state: CachedDesktopFileTreeState) {
    if (state.disposeTimer) {
      clearTimeout(state.disposeTimer);
      state.disposeTimer = undefined;
    }
    state.fileTreeModel?.cleanUp();
    state.fileTreeModel = undefined;
  }
</script>

<script lang="ts">
  import {
    FileTree,
    type FileTreeBatchOperation,
    type FileTreeIconConfig,
    type RemappedIcon,
  } from "@pierre/trees";
  import {
    getLanguages,
    getThemeContext,
    type FileIconTheme,
  } from "@poolsideai/components/providers";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { getUnknownErrorMessage } from "@poolsideai/lib/errors";
  import { basename, dirname, normalize, relative } from "@poolsideai/lib/path";
  import { InfoMessageType } from "@poolsideai/rpc";
  import { appState } from "../../hostAdapter";
  import { rpc, type RPCClient } from "../../hostRpc";
  import {
    performDesktopFilesTreeAction,
    type DesktopFileTreeContextMenuActionPayload,
    type DesktopFilesTreeActionRPC,
  } from "./desktopFilesTreeActions";
  import type {
    DesktopFileTreeContextMenuOpener,
    DesktopFileTreeContextMenuRequest,
  } from "./desktopFilesTreeContextMenu";
  import { requestDesktopFilePromptChip } from "./desktopFilePromptChip";
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

  interface DesktopSettings {
    fileOpenerId: string;
    fileOpeners: DesktopFileOpener[];
    desktopOpeners: DesktopFileOpener[];
  }

  interface DesktopFileOpener {
    id: string;
    label: string;
    kind: "inApp" | "default" | "editorEnv" | "application" | "terminal";
    appPath?: string;
    bundleId?: string;
    iconDataUri?: string;
  }

  type DesktopFilesRPC = RPCClient & {
    getDesktopSettings(): Promise<DesktopSettings>;
    listDirectoryTree(path: string, includeGitIgnored?: boolean): Promise<DesktopFileTree>;
    listDirectorySubtree(
      rootPath: string,
      relativePath: string,
      includeGitIgnored?: boolean,
    ): Promise<DesktopFileTree>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    showDesktopFileTreeContextMenu(request: DesktopFileTreeContextMenuRequest): Promise<void>;
    revealPathInFinder(path: string): Promise<void>;
    writeFileUrlToPasteboard(path: string, operation: "copy" | "cut"): Promise<void>;
    pasteFilesIntoDirectory(destination: string): Promise<unknown>;
    trashPath(path: string): Promise<void>;
  } & DesktopFilesTreeActionRPC;

  interface Props {
    rootPath: string;
    cacheKey?: string;
    openTerminal: (cwd: string) => void | Promise<void>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__

  const desktopRpc = rpc as DesktopFilesRPC;
  const languages = getLanguages();
  const theme = getThemeContext();
  const DESKTOP_SETTINGS_CHANGED_EVENT = "poolside:desktop-settings-changed";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const DESKTOP_FILE_TREE_CONTEXT_MENU_ACTION_EVENT =
    "poolside:desktop-file-tree-context-menu-action";
  const FILE_CHANGE_CREATED = 1;
  const FILE_CHANGE_CHANGED = 2;
  const FILE_CHANGE_DELETED = 3;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type DesktopFileTreeGitStatusEntry = DesktopFileTree["gitStatus"][number];
  type DesktopFileTreeGitStatus = DesktopFileTreeGitStatusEntry["status"];
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const treeUnsafeCss = `
    :host {
      --trees-bg-override: transparent;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      --trees-fg-override: var(--psx-foreground-primary);
      --trees-fg-muted-override: var(--psx-foreground-secondary);
      --trees-border-color-override: var(--psx-border);
      --trees-selected-bg-override: var(--psx-menu-hover-background);
      --trees-selected-fg-override: var(--psx-foreground-primary);
      --trees-focus-ring-color-override: var(--psx-focus);
      --trees-font-family-override: inherit;
      --trees-font-size-override: 12px;
      --trees-row-height: 26px;
      --trees-icon-width-override: 16px;
      --trees-item-margin-x-override: 4px;
      --trees-padding-inline-override: 4px;
    }

    [data-item-section='icon'] {
      position: relative;
      display: inline-flex;
      width: 16px;
      height: 16px;
      align-items: center;
      justify-content: center;
      color: var(--trees-fg-muted);
    }

    [data-item-section='icon'] > svg {
      display: block;
      width: 16px;
      height: 16px;
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
    [data-poolside-loading='true'] > [data-item-section='icon']::after {
      position: absolute;
      inset: 4px;
      border: 1px solid currentColor;
      border-right-color: transparent;
      border-radius: 999px;
      content: "";
      opacity: 0.7;
      animation: poolside-file-tree-spin 0.7s linear infinite;
    }

    [data-poolside-loading='true'] > [data-item-section='icon'] > svg {
      opacity: 0.25;
    }

    @keyframes poolside-file-tree-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  let mountElement = $state<HTMLDivElement>();
  let loadState = $state<"idle" | "loading" | "ready" | "error">("idle");
  let errorMessage = $state<string | null>(null);
  let fileTree = $state<DesktopFileTree | null>(null);
  let showGitIgnored = $state(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let desktopFileOpenerId = $state(
    typeof $appState.environment.desktopFileOpenerId === "string"
      ? $appState.environment.desktopFileOpenerId
      : "default",
  );
  let desktopFileContextMenuOpeners = $state<DesktopFileTreeContextMenuOpener[]>([]);
  let desktopContextMenuOpeners = $state<DesktopFileTreeContextMenuOpener[]>([]);
  let loadVersion = 0;
  let iconConfigVersion = 0;
  let expandedDirectoryPaths = $state(new Set<string>());
  let deferredDirectoryPaths = new Set<string>();
  let loadingDirectoryPaths = new Set<string>();
  let fileTreeModel: FileTree | undefined;
  let fileTreeModelMount: HTMLElement | undefined;
  let removeFileTreeEventListeners: (() => void) | undefined;
  let latestFileTree: DesktopFileTree | null = null;
  let latestFileIconConfig: FileTreeIconConfig | undefined = undefined;
  let latestFileIconConfigSignature = "";
  let latestFileIconTheme: FileIconTheme | undefined;
  let entriesByRelativePath = new Map<string, DesktopFileTreeEntry>();
  const pendingContextMenuEntries = new Map<string, DesktopFileTreeEntry>();
  const cachedState = takeCachedDesktopFileTreeState(cacheKey, rootPath);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  if (cachedState) {
    loadState = cachedState.loadState;
    errorMessage = cachedState.errorMessage;
    fileTree = cachedState.fileTree;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    latestFileTree = cachedState.latestFileTree;
    latestFileIconConfig = cachedState.latestFileIconConfig;
    latestFileIconConfigSignature = cachedState.latestFileIconConfigSignature;
    entriesByRelativePath = new Map(cachedState.entriesByRelativePath);
    deferredDirectoryPaths = new Set(cachedState.deferredDirectoryPaths);
    loadingDirectoryPaths = new Set(cachedState.loadingDirectoryPaths);
    expandedDirectoryPaths = new Set(cachedState.expandedDirectoryPaths);
    fileTreeModel = cachedState.fileTreeModel;
    iconConfigVersion = cachedState.iconConfigVersion;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let loadedRootPath = cachedState?.latestFileTree ? cachedState.rootPath : undefined;
  let loadedShowGitIgnored = cachedState?.latestFileTree ? cachedState.showGitIgnored : undefined;

  let canLoad = $derived(rootPath.length > 0);
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

  onMount(() => {
    void desktopRpc
      .getDesktopSettings()
      .then(applyDesktopSettings)
      .catch((error) => console.debug("Unable to load desktop settings", error));

    const onSettingsChanged = (event: Event) => {
      applyDesktopSettings((event as CustomEvent<DesktopSettings>).detail);
    };
    const onContextMenuAction = (event: Event) => {
      const payload = (event as CustomEvent<DesktopFileTreeContextMenuActionPayload>).detail;
      const entry = pendingContextMenuEntries.get(payload.requestId);
      pendingContextMenuEntries.delete(payload.requestId);
      if (!entry) return;

      void performDesktopFilesTreeAction({
        payload,
        entry,
        currentFileOpenerId: desktopFileOpenerId,
        rpc: desktopRpc,
        openTerminal,
        insertFileChip: requestDesktopFilePromptChip,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      });
    };
    const onFileTreeChanged = (event: Event) => {
      const payload = (event as CustomEvent<DesktopFileTreeChangedPayload>).detail;
      if (!fileTreeChangeAffectsRoot(payload, rootPath)) return;

      if (!applyFileTreeChanges(payload)) {
        void reloadTree();
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
    };
    window.addEventListener(DESKTOP_SETTINGS_CHANGED_EVENT, onSettingsChanged);
    window.addEventListener(DESKTOP_FILE_TREE_CONTEXT_MENU_ACTION_EVENT, onContextMenuAction);
    window.addEventListener(DESKTOP_FILE_TREE_CHANGED_EVENT, onFileTreeChanged);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return () => {
      window.removeEventListener(DESKTOP_SETTINGS_CHANGED_EVENT, onSettingsChanged);
      window.removeEventListener(DESKTOP_FILE_TREE_CONTEXT_MENU_ACTION_EVENT, onContextMenuAction);
      window.removeEventListener(DESKTOP_FILE_TREE_CHANGED_EVENT, onFileTreeChanged);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
  });

  $effect(() => {
    const nextRootPath = rootPath;
    const nextShowGitIgnored = showGitIgnored;

    untrack(() => {
      if (
        latestFileTree &&
        latestFileTree.rootPath === nextRootPath &&
        loadedRootPath === nextRootPath &&
        loadedShowGitIgnored === nextShowGitIgnored
      ) {
        return;
      }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      loadedRootPath = nextRootPath;
      loadedShowGitIgnored = nextShowGitIgnored;
      void reloadTree({
        includeGitIgnored: nextShowGitIgnored,
        path: nextRootPath,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      });
    });
  });

  $effect(() => {
    const mount = mountElement;
    if (!mount) return;

    untrack(() => renderFileTreeModel(mount));
    return () => {
      cacheFileTreeState();
    };
  });

  $effect(() => {
    const tree = fileTree;
    theme.fileIconTheme;
    refreshFileTreeIcons(tree?.entries ?? []);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
    } catch (error) {
      console.debug("Unable to open file", error);
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async function reloadTree(
    options: { includeGitIgnored?: boolean; path?: string; resetExpansion?: boolean } = {},
  ) {
    const path = options.path ?? rootPath;
    const includeGitIgnored = options.includeGitIgnored ?? showGitIgnored;
    const version = ++loadVersion;
    errorMessage = null;

    if (!path) {
      clearFileTreeState({ resetExpansion: true });
      loadState = "idle";
      return;
    }

    const expandedPaths = options.resetExpansion
      ? new Set<string>()
      : captureExpandedDirectoryPaths();
    if (options.resetExpansion) {
      clearFileTreeState({ resetExpansion: true });
    }
    if (options.resetExpansion || !latestFileTree) {
      loadState = "loading";
    }

    try {
      let tree = await desktopRpc.listDirectoryTree(path, includeGitIgnored);
      if (version !== loadVersion) return;
      if (!options.resetExpansion && expandedPaths.size > 0) {
        const hydratedTree = await hydrateExpandedDirectories(
          tree,
          expandedPaths,
          path,
          includeGitIgnored,
          version,
        );
        if (!hydratedTree) return;
        tree = hydratedTree;
      }
      applyFileTreeSnapshot(tree, {
        clearLoading: true,
        resetExpansion: options.resetExpansion,
      });
    } catch (error) {
      if (version !== loadVersion) return;
      const message = getUnknownErrorMessage(error);
      if (!options.resetExpansion && latestFileTree) {
        desktopRpc.showInfoMessage(`Unable to refresh files: ${message}`, InfoMessageType.error);
        return;
      }
      errorMessage = message;
      loadState = "error";
    }
  }

  function renderFileTreeModel(mount: HTMLElement) {
    const tree = latestFileTree;
    if (!tree || tree.entries.length === 0) return;

    if (fileTreeModel && fileTreeModelMount === mount) {
      applyFileTreeModelSnapshot(tree);
      return;
    }

    if (fileTreeModel) {
      const model = fileTreeModel;
      detachFileTreeModel();
      model.render({ containerWrapper: mount });
      fileTreeModel = model;
      fileTreeModelMount = mount;
      attachFileTreeEventListeners(model);
      return;
    }

    destroyFileTreeModel();
    const model = new FileTree({
      flattenEmptyDirectories: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      icons: latestFileIconConfig ?? "minimal",
      initialExpansion: "closed",
      initialExpandedPaths: Array.from(expandedDirectoryPaths),
      itemHeight: 26,
      overscan: 24,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      stickyFolders: true,
      unsafeCSS: treeUnsafeCss,
    });

    model.render({ containerWrapper: mount });
    fileTreeModel = model;
    fileTreeModelMount = mount;
    attachFileTreeEventListeners(model);
  }

  function detachFileTreeModel(mount: HTMLElement | undefined = fileTreeModelMount) {
    removeFileTreeEventListeners?.();
    removeFileTreeEventListeners = undefined;
    const model = fileTreeModel;
    fileTreeModel = undefined;
    fileTreeModelMount = undefined;
    model?.unmount();
    mount?.replaceChildren();
  }

  function destroyFileTreeModel(mount: HTMLElement | undefined = fileTreeModelMount) {
    removeFileTreeEventListeners?.();
    removeFileTreeEventListeners = undefined;
    const model = fileTreeModel;
    fileTreeModel = undefined;
    fileTreeModelMount = undefined;
    model?.cleanUp();
    mount?.replaceChildren();
  }

  function cacheFileTreeState() {
    const model = fileTreeModel;
    const currentExpandedDirectoryPaths = captureExpandedDirectoryPaths();
    detachFileTreeModel();

    const state: CachedDesktopFileTreeState = {
      rootPath,
      showGitIgnored,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      loadState,
      errorMessage,
      fileTree,
      latestFileTree,
      latestFileIconConfig,
      latestFileIconConfigSignature,
      entriesByRelativePath: new Map(entriesByRelativePath),
      deferredDirectoryPaths: new Set(deferredDirectoryPaths),
      loadingDirectoryPaths: new Set(loadingDirectoryPaths),
      expandedDirectoryPaths: currentExpandedDirectoryPaths,
      fileTreeModel: model,
      iconConfigVersion,
      disposeTimer: undefined,
    };
    storeCachedDesktopFileTreeState(cacheKey, state);
    scheduleCachedDesktopFileTreeDisposal(cacheKey);
  }

  function attachFileTreeEventListeners(model: FileTree) {
    const shadowRoot = model.getFileTreeContainer()?.shadowRoot;
    if (!shadowRoot) return;

    const onClick = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      const row = target?.closest("[data-type='item']");
      if (!(row instanceof HTMLElement)) return;

      const path = row.dataset.itemPath ?? "";
      const entry = entriesByRelativePath.get(path);
      if (!entry) return;

      if (row.dataset.itemType === "file") {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        return;
      }

      if (row.dataset.itemType === "folder") {
        queueMicrotask(() => syncExpandedDirectory(model, path));
        if (deferredDirectoryPaths.has(path)) {
          void loadDeferredDirectory(path, row);
        }
      }
    };
    const onContextMenu = (event: Event) => {
      if (!(event instanceof MouseEvent)) return;
      const target = event.target instanceof Element ? event.target : null;
      const row = target?.closest("[data-type='item']");
      if (!(row instanceof HTMLElement)) return;

      const path = row.dataset.itemPath ?? "";
      const entry = entriesByRelativePath.get(path);
      if (!entry) return;

      event.preventDefault();
      event.stopPropagation();
      void showContextMenu(entry, event);
    };

    shadowRoot.addEventListener("click", onClick);
    shadowRoot.addEventListener("contextmenu", onContextMenu);
    removeFileTreeEventListeners = () => {
      shadowRoot.removeEventListener("click", onClick);
      shadowRoot.removeEventListener("contextmenu", onContextMenu);
    };
  }

  function applyFileTreeSnapshot(
    tree: DesktopFileTree,
    options: { clearLoading?: boolean; resetExpansion?: boolean; updateModel?: boolean } = {},
  ) {
    if (options.resetExpansion) {
      expandedDirectoryPaths = new Set();
    } else {
      captureExpandedDirectoryPaths();
    }

    latestFileTree = tree;
    entriesByRelativePath = new Map(tree.entries.map((entry) => [entry.relativePath, entry]));
    deferredDirectoryPaths = new Set(tree.deferredDirectories);
    if (options.clearLoading) {
      loadingDirectoryPaths = new Set();
    }
    if (!options.resetExpansion) {
      pruneExpandedDirectoryPaths(tree.entries);
    }

    fileTree = tree;
    loadState = "ready";
    if (options.updateModel !== false) {
      applyFileTreeModelSnapshot(tree);
    }
  }

  function applyFileTreeModelSnapshot(tree: DesktopFileTree) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const model = fileTreeModel;
    if (!model) {
      const mount = mountElement;
      if (mount && tree.entries.length > 0) {
        renderFileTreeModel(mount);
      }
      return;
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
    );
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

  function clearFileTreeState(options: { resetExpansion?: boolean } = {}) {
    latestFileTree = null;
    entriesByRelativePath = new Map();
    fileTree = null;
    deferredDirectoryPaths = new Set();
    loadingDirectoryPaths = new Set();
    iconConfigVersion += 1;
    latestFileIconConfigSignature = "";
    latestFileIconTheme = undefined;
    applyFileIconConfig(undefined);
    if (options.resetExpansion) {
      expandedDirectoryPaths = new Set();
    }
    destroyFileTreeModel();
  }

  function applyFileIconConfig(config: FileTreeIconConfig | undefined) {
    latestFileIconConfig = config;
    fileTreeModel?.setIcons(config ?? "minimal");
  }

  function captureExpandedDirectoryPaths() {
    const model = fileTreeModel;
    if (!model) return expandedDirectoryPaths;

    const nextExpandedDirectoryPaths = new Set(expandedDirectoryPaths);
    for (const entry of entriesByRelativePath.values()) {
      if (entry.kind !== "directory") continue;
      const item = model.getItem(entry.relativePath);
      if (!item || !("isExpanded" in item)) continue;
      if (item.isExpanded()) {
        nextExpandedDirectoryPaths.add(entry.relativePath);
      } else {
        nextExpandedDirectoryPaths.delete(entry.relativePath);
      }
    }
    expandedDirectoryPaths = nextExpandedDirectoryPaths;
    return nextExpandedDirectoryPaths;
  }

  function pruneExpandedDirectoryPaths(entries: DesktopFileTreeEntry[]) {
    if (expandedDirectoryPaths.size === 0) return;

    const directoryPaths = new Set(
      entries.filter((entry) => entry.kind === "directory").map((entry) => entry.relativePath),
    );
    expandedDirectoryPaths = new Set(
      Array.from(expandedDirectoryPaths).filter((path) => directoryPaths.has(path)),
    );
  }

  function fileTreeChangeAffectsRoot(
    payload: DesktopFileTreeChangedPayload | undefined,
    root: string,
  ) {
    if (!root || !payload?.changes) return false;
    return payload.changes.some((change) => pathIsInsideRoot(change.path, root));
  }

  function pathIsInsideRoot(path: string, root: string) {
    const normalizedPath = normalizeDesktopPath(path);
    const normalizedRoot = normalizeDesktopPath(root);
    if (normalizedRoot === "/") {
      return normalizedPath.startsWith("/");
    }

    return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`);
  }

  function normalizeDesktopPath(path: string) {
    const normalized = path.replaceAll("\\", "/");
    return normalized === "/" ? normalized : normalized.replace(/\/+$/, "");
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
  function applyFileTreeChanges(payload: DesktopFileTreeChangedPayload | undefined) {
    const currentTree = latestFileTree;
    if (!currentTree || !payload?.changes) return false;

    const model = fileTreeModel;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const mutationOperations: FileTreeBatchOperation[] = [];
    let changed = false;

    for (const change of payload.changes) {
      if (!pathIsInsideRoot(change.path, currentTree.rootPath)) continue;

      if (change.type === FILE_CHANGE_CREATED) {
        const result = applyCreatedFileTreeChange(
          change,
          currentTree.rootPath,
__POOL_SYNTHETIC_IMPORT_BASELINE__
          nextDeferredDirectoryPaths,
          mutationOperations,
        );
        if (result === "changed") changed = true;
        continue;
      }

      if (change.type === FILE_CHANGE_CHANGED) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        if (result === "changed") changed = true;
        continue;
      }

      if (change.type === FILE_CHANGE_DELETED) {
        const result = applyDeletedFileTreeChange(
          change,
          currentTree.rootPath,
__POOL_SYNTHETIC_IMPORT_BASELINE__
          nextDeferredDirectoryPaths,
          nextLoadingDirectoryPaths,
          nextExpandedDirectoryPaths,
          mutationOperations,
        );
        if (result === "changed") changed = true;
      }
    }

    if (!changed) return true;

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
    const nextTree = {
      ...currentTree,
      entries: nextEntries,
      deferredDirectories: Array.from(nextDeferredDirectoryPaths),
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
    deferredDirectoryPaths = nextDeferredDirectoryPaths;
    loadingDirectoryPaths = nextLoadingDirectoryPaths;
    expandedDirectoryPaths = nextExpandedDirectoryPaths;
    latestFileTree = nextTree;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    fileTree = nextTree;
    loadState = "ready";
    if (model) {
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
    } else if (mountElement && nextEntries.length > 0) {
      renderFileTreeModel(mountElement);
    }
    return true;
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
  function applyCreatedFileTreeChange(
    change: DesktopFileTreeChange,
    root: string,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    nextDeferredDirectoryPaths: Set<string>,
    mutationOperations: FileTreeBatchOperation[],
  ): "changed" | "unchanged" {
    const relativePath = fileTreeRelativePathForCreatedChange(change, root);
    if (!relativePath) return "unchanged";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
    const parentPath = fileTreeParentDirectory(relativePath);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return "unchanged";
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (existingEntry) {
      return statusChanged ? "changed" : "unchanged";
    }
    if (!parentLoaded) {
      return statusChanged ? "changed" : "unchanged";
    }

    const kind = change.kind ?? "file";
    const entry = {
      path: change.path,
      relativePath,
      kind,
      gitIgnored: false,
    };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (kind === "directory") {
      nextDeferredDirectoryPaths.add(relativePath);
    }
    mutationOperations.push({ path: relativePath, type: "add" });
    return "changed";
  }

  function applyChangedFileTreeChange(
    change: DesktopFileTreeChange,
    root: string,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ): "changed" | "unchanged" {
    const relativePath = fileTreeRelativePath(change.path, root);
    if (!relativePath) return "unchanged";

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (entry?.gitIgnored) return "unchanged";

    const statusPath =
      entry?.kind === "directory" ? ensureDirectoryPath(relativePath) : relativePath;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return "unchanged";
    }
    if (existingStatus && existingStatus !== "modified") {
      return "unchanged";
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  function applyDeletedFileTreeChange(
    change: DesktopFileTreeChange,
    root: string,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    nextDeferredDirectoryPaths: Set<string>,
    nextLoadingDirectoryPaths: Set<string>,
    nextExpandedDirectoryPaths: Set<string>,
    mutationOperations: FileTreeBatchOperation[],
  ): "changed" | "unchanged" {
    const directRelativePath = fileTreeRelativePath(change.path, root);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!directRelativePath && !relativePath) return "unchanged";

    const deletedPath = relativePath ?? directRelativePath;
    if (!deletedPath) return "unchanged";

__POOL_SYNTHETIC_IMPORT_BASELINE__
    const removeDirectory =
      removedEntry?.kind === "directory" ||
      deletedPath.endsWith("/") ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const statusChanged = applyDeletedFileTreeGitStatusChange(
__POOL_SYNTHETIC_IMPORT_BASELINE__
      deletedPath,
      removeDirectory,
      removedEntry,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
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
      return statusChanged ? "changed" : "unchanged";
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (removeDirectory) {
      const directoryPath = ensureDirectoryPath(deletedPath);
      nextDeferredDirectoryPaths.delete(directoryPath);
      nextLoadingDirectoryPaths.delete(directoryPath);
      nextExpandedDirectoryPaths.delete(directoryPath);
    }
    mutationOperations.push({ path: deletedPath, recursive: removeDirectory, type: "remove" });
    return "changed";
  }

  function applyDeletedFileTreeGitStatusChange(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    relativePath: string,
    removeDirectory: boolean,
    removedEntry: DesktopFileTreeEntry | undefined,
    hasVisibleAncestor: boolean,
  ) {
    const statusPath = removeDirectory ? ensureDirectoryPath(relativePath) : relativePath;
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

    if (
      existingStatus === "untracked" ||
      existingStatus === "ignored" ||
      removedEntry?.gitIgnored ||
      removedOnlyUntrackedOrIgnored
    ) {
      return changed;
    }

    if (!existingStatus && !removedEntry && !hasVisibleAncestor) {
      return changed;
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    return changed;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    path: string,
    status: DesktopFileTreeGitStatus,
  ) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return true;
  }

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
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    change: DesktopFileTreeChange,
    root: string,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ): string | null {
    const relativePath = fileTreeRelativePath(change.path, root);
    if (!relativePath) return null;
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
    change: DesktopFileTreeChange,
    root: string,
  ): string | null {
    const relativePath = fileTreeRelativePath(change.path, root);
    if (!relativePath) return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  function fileTreeRelativePath(path: string, root: string): string | null {
    const relativePath = normalize(relative(root, path));
    if (
      !relativePath ||
      relativePath === "." ||
      relativePath === ".." ||
      relativePath.startsWith("../")
    ) {
      return null;
    }
    return relativePath;
  }

  function fileTreeParentDirectory(relativePath: string) {
    const trimmedPath = relativePath.endsWith("/") ? relativePath.slice(0, -1) : relativePath;
    const parent = dirname(trimmedPath);
    return parent === "." ? "" : ensureDirectoryPath(parent);
  }

  function ensureDirectoryPath(path: string) {
    return path.endsWith("/") ? path : `${path}/`;
  }

  function refreshFileTreeIcons(entries: DesktopFileTreeEntry[]) {
    const fileIconTheme = theme.fileIconTheme;
    const signature = fileIconTheme ? fileTreeIconConfigSignature(entries, fileIconTheme) : "";
    if (fileIconTheme === latestFileIconTheme && signature === latestFileIconConfigSignature) {
      return;
    }
    latestFileIconTheme = fileIconTheme;
    latestFileIconConfigSignature = signature;
    const version = ++iconConfigVersion;

    if (entries.length === 0 || !fileIconTheme) {
      applyFileIconConfig(undefined);
      return;
    }

    void createFileTreeIconConfig(entries, fileIconTheme)
      .then((config) => {
        if (version !== iconConfigVersion) return;
        applyFileIconConfig(config);
      })
      .catch((error) => {
        console.debug("Unable to load file tree icons", error);
      });
  }

  async function hydrateExpandedDirectories(
    tree: DesktopFileTree,
    expandedPaths: Set<string>,
    root: string,
    includeGitIgnored: boolean,
    version: number,
  ): Promise<DesktopFileTree | null> {
    let nextTree = tree;
    const paths = Array.from(expandedPaths).sort(compareDirectoryPathsByDepth);

    for (const relativePath of paths) {
      if (version !== loadVersion) return null;
      const entry = nextTree.entries.find(
        (candidate) => candidate.kind === "directory" && candidate.relativePath === relativePath,
      );
      if (!entry) continue;

      try {
        const subtree = await desktopRpc.listDirectorySubtree(
          root,
          relativePath,
          includeGitIgnored,
        );
        if (version !== loadVersion) return null;
        nextTree = mergeFileTreeSubtree(nextTree, subtree, relativePath);
      } catch (error) {
        console.debug("Unable to refresh expanded file tree directory", error);
      }
    }

    return nextTree;
  }

  function compareDirectoryPathsByDepth(left: string, right: string) {
    return directoryPathDepth(left) - directoryPathDepth(right) || left.localeCompare(right);
  }

  function directoryPathDepth(path: string) {
    return path.split("/").filter(Boolean).length;
  }

  function mergeFileTreeSubtree(
    currentTree: DesktopFileTree,
    subtree: DesktopFileTree,
    loadedDirectoryPath: string,
  ): DesktopFileTree {
    if (currentTree.rootPath !== subtree.rootPath) return currentTree;

    const nextEntries = [...currentTree.entries];
    const nextLoadedTreePaths = new Set(currentTree.entries.map((entry) => entry.relativePath));
    for (const entry of subtree.entries) {
      if (nextLoadedTreePaths.has(entry.relativePath)) continue;
      nextLoadedTreePaths.add(entry.relativePath);
      nextEntries.push(entry);
    }

    const nextDeferredDirectoryPaths = new Set(currentTree.deferredDirectories);
    nextDeferredDirectoryPaths.delete(loadedDirectoryPath);
    for (const path of subtree.deferredDirectories) {
      nextDeferredDirectoryPaths.add(path);
    }

    const nextGitStatusByPath = new Map(currentTree.gitStatus.map((entry) => [entry.path, entry]));
    for (const entry of subtree.gitStatus) {
      nextGitStatusByPath.set(entry.path, entry);
    }

    return {
      rootPath: currentTree.rootPath,
      entries: nextEntries,
      deferredDirectories: Array.from(nextDeferredDirectoryPaths),
      gitStatus: Array.from(nextGitStatusByPath.values()),
    };
  }

  async function showContextMenu(entry: DesktopFileTreeEntry, event: MouseEvent) {
    const requestId = crypto.randomUUID();
    pendingContextMenuEntries.set(requestId, entry);
    window.setTimeout(() => pendingContextMenuEntries.delete(requestId), 30_000);

    try {
      await desktopRpc.showDesktopFileTreeContextMenu({
        requestId,
        item: {
          kind: entry.kind,
__POOL_SYNTHETIC_IMPORT_BASELINE__
        },
        position: {
          x: event.clientX,
          y: event.clientY,
        },
        currentOpenerId: desktopFileOpenerId,
        fileOpeners: desktopFileContextMenuOpeners,
        desktopOpeners: desktopContextMenuOpeners,
      });
    } catch (error) {
      pendingContextMenuEntries.delete(requestId);
      desktopRpc.showInfoMessage(
        `Unable to show file menu: ${getUnknownErrorMessage(error)}`,
        InfoMessageType.error,
      );
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
  function syncExpandedDirectory(model: FileTree, path: string) {
    const item = model.getItem(path);
    if (!item || !("isExpanded" in item)) return;

    const nextExpandedDirectoryPaths = new Set(expandedDirectoryPaths);
    if (item.isExpanded()) {
      nextExpandedDirectoryPaths.add(path);
    } else {
      nextExpandedDirectoryPaths.delete(path);
    }
    expandedDirectoryPaths = nextExpandedDirectoryPaths;
  }

  async function loadDeferredDirectory(relativePath: string, row: HTMLElement) {
    if (loadingDirectoryPaths.has(relativePath)) return;

    const version = loadVersion;
    const includeGitIgnored = showGitIgnored;
    row.dataset.poolsideLoading = "true";
    loadingDirectoryPaths = new Set([...loadingDirectoryPaths, relativePath]);
    expandedDirectoryPaths = new Set([...expandedDirectoryPaths, relativePath]);

    try {
      const subtree = await desktopRpc.listDirectorySubtree(
        rootPath,
        relativePath,
        includeGitIgnored,
      );
      const currentTree = fileTree;
      if (!currentTree || currentTree.rootPath !== subtree.rootPath || version !== loadVersion) {
        return;
      }

      applyFileTreeSnapshot(mergeFileTreeSubtree(currentTree, subtree, relativePath));
    } catch (error) {
      console.debug("Unable to load file tree directory", error);
    } finally {
      row.dataset.poolsideLoading = "false";
      loadingDirectoryPaths = new Set(
        Array.from(loadingDirectoryPaths).filter((path) => path !== relativePath),
      );
    }
  }

  function applyDesktopSettings(settings: DesktopSettings | undefined) {
    if (typeof settings?.fileOpenerId === "string" && settings.fileOpenerId.length > 0) {
      desktopFileOpenerId = settings.fileOpenerId;
    }
    if (settings?.fileOpeners) {
      desktopFileContextMenuOpeners = contextMenuOpeners(settings.fileOpeners);
    }
    if (settings?.desktopOpeners) {
      desktopContextMenuOpeners = contextMenuOpeners(settings.desktopOpeners);
    }
  }

  function contextMenuOpeners(openers: DesktopFileOpener[]): DesktopFileTreeContextMenuOpener[] {
    return openers.map(({ id, label }) => ({ id, label }));
  }

  async function createFileTreeIconConfig(
    entries: DesktopFileTreeEntry[],
    fileIconTheme: FileIconTheme,
  ): Promise<FileTreeIconConfig> {
    const iconNamesByBasename = new Map<string, string>();
    const iconNames = new Set<string>();
    const defaultIconName = fileIconTheme.file;

    for (const entry of entries) {
      if (entry.kind !== "file") continue;

      const base = basename(entry.relativePath);
      const iconName = getFileIconName(fileIconTheme, base);
      if (!iconName) continue;

      if (iconName !== defaultIconName) {
        iconNamesByBasename.set(base, iconName);
      }
      iconNames.add(iconName);
    }

    if (fileIconTheme.file) {
      iconNames.add(fileIconTheme.file);
    }

    const iconsByName = new Map<string, { icon: RemappedIcon; symbol: string }>();
    await Promise.all(
      Array.from(iconNames).map(async (iconName) => {
        const iconDefinition = await theme.getFileIconDefinition(iconName);
        if (!iconDefinition) return;

        const symbol = svgIconDefinitionToSymbol(iconDefinition, fileTreeIconSymbolId(iconName));
        if (!symbol) return;

        iconsByName.set(iconName, symbol);
      }),
    );

    const byFileName: Record<string, RemappedIcon> = {};
    for (const [base, iconName] of iconNamesByBasename) {
      const icon = iconsByName.get(iconName)?.icon;
      if (icon) byFileName[base] = icon;
    }

    const defaultFileIcon = fileIconTheme.file
      ? iconsByName.get(fileIconTheme.file)?.icon
      : undefined;
    const symbols = Array.from(iconsByName.values()).map(({ symbol }) => symbol);

    return {
      set: "none",
      ...(symbols.length > 0 && {
        spriteSheet: `<svg data-icon-sprite aria-hidden="true" width="0" height="0">${symbols.join("")}</svg>`,
      }),
      ...(Object.keys(byFileName).length > 0 && { byFileName }),
      ...(defaultFileIcon && {
        remap: {
          "file-tree-icon-file": defaultFileIcon,
        },
      }),
    };
  }

  function fileTreeIconConfigSignature(
    entries: DesktopFileTreeEntry[],
    fileIconTheme: FileIconTheme,
  ) {
    const defaultIconName = fileIconTheme.file ?? "";
    const iconNamesByBasename = new Map<string, string>();

    for (const entry of entries) {
      if (entry.kind !== "file") continue;

      const base = basename(entry.relativePath);
      const iconName = getFileIconName(fileIconTheme, base);
      if (iconName && iconName !== defaultIconName) {
        iconNamesByBasename.set(base, iconName);
      }
    }

    return [
      defaultIconName,
      ...Array.from(iconNamesByBasename)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([base, iconName]) => `${base}:${iconName}`),
    ].join("\0");
  }

  function getFileIconName(fileIconTheme: FileIconTheme, base: string) {
    const fileNameIcon =
      fileIconTheme.fileNames?.[base] ?? fileIconTheme.fileNames?.[base.toLowerCase()];
    return fileNameIcon ?? getFileIconNameByExtension(fileIconTheme, base);
  }

  function getFileIconNameByExtension(
    { fileExtensions, languageIds, file }: FileIconTheme,
    base: string,
  ) {
    const firstDotIndex = base.indexOf(".");
    if (firstDotIndex !== -1 && fileExtensions) {
      const fullExtension = base.slice(firstDotIndex + 1);
      const parts = fullExtension.split(".");

      for (let i = 0; i < parts.length; i++) {
        const ext = parts.slice(i).join(".");
        const iconName = fileExtensions[ext];
        if (iconName) return iconName;
      }
    }

    if (languageIds) {
      for (const lang of languages.getByPath(base)) {
        const iconName = languageIds[lang.id];
        if (iconName) return iconName;
      }
    }

    return file;
  }

  function svgIconDefinitionToSymbol(iconDefinition: string, id: string) {
    const template = document.createElement("template");
    template.innerHTML = iconDefinition.trim();

    const svg = template.content.firstElementChild;
    if (svg?.localName.toLowerCase() !== "svg") return;

    const viewBox = svg.getAttribute("viewBox") ?? "0 0 16 16";
    const symbolAttributes = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"]
      .map((attribute) => {
        const value = svg.getAttribute(attribute);
        return value ? ` ${attribute}="${escapeHtmlAttribute(value)}"` : "";
      })
      .join("");

    return {
      icon: {
        name: id,
        width: 16,
        height: 16,
        viewBox,
      },
      symbol: `<symbol id="${id}" viewBox="${escapeHtmlAttribute(viewBox)}"${symbolAttributes}>${svg.innerHTML}</symbol>`,
    };
  }

  function fileTreeIconSymbolId(iconName: string) {
    const slug = iconName.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/^-+|-+$/g, "") || "icon";
    return `poolside-file-icon-${slug}-${hashString(iconName)}`;
  }

  function hashString(value: string) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) | 0;
    }

    return Math.abs(hash).toString(36);
  }

  function escapeHtmlAttribute(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
</script>

<div class="desktop-files-tree">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      data-tauri-drag-region="false"
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

    {#if canLoad}
      <div
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      </div>
    {/if}
  </div>
</div>

<style>
  .desktop-files-tree {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    background: var(--psx-terminal-background);
    color: var(--psx-foreground-primary);
  }

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    display: flex;
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
  }

  .desktop-files-tree-body {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }

  .desktop-files-tree-mount {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .desktop-files-tree-mount--hidden {
    visibility: hidden;
  }

  .desktop-files-tree-message {
    position: absolute;
    inset: 0;
    z-index: 1;
    color: var(--psx-foreground-secondary);
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 16px;
    text-align: center;
    font-size: 12px;
  }

  .desktop-files-tree-error {
    color: var(--psx-foreground-tertiary);
    max-width: 520px;
  }

  .desktop-files-tree-mount :global(file-tree-container) {
    width: 100%;
    height: 100%;
  }
</style>
