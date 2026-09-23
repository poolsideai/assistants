__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  appState,
  desktopUpdate,
  NATIVE_MENU_SET_DEFAULT_EVENT,
  sidebarToasts,
  type ACPDebugAPI,
  type NativeMenuSetDefaultPayload,
  type Notifier,
} from "@poolsideai/features/acp";
import { InfoMessageType } from "@poolsideai/rpc";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { listen } from "@tauri-apps/api/event";
import { homeDir } from "@tauri-apps/api/path";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { mount } from "svelte";
import {
  applyDesktopAccent,
  seedDesktopAccentFromCache,
  watchDesktopAccent,
} from "./desktopAccent";
import { loadDesktopBootstrap } from "./desktopBootstrap";
import DesktopFileViewerPanel from "./DesktopFileViewerPanel.svelte";
import {
  applyDesktopTheme,
  desktopColorTheme,
  watchDesktopTheme,
  type ResolvedDesktopTheme,
} from "./desktopTheme";
import { installExternalLinkHandler } from "./externalLinks";
import {
  acknowledgeHelperNotificationBatch,
  createWebviewResponseSender,
  DESKTOP_BUNDLE_REPLACED_EVENT,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  DESKTOP_CLOSE_TAB_EVENT,
  DESKTOP_CLOSE_WINDOW_EVENT,
  DESKTOP_DEEP_LINK_EVENT,
  DESKTOP_FILE_TREE_CHANGED_EVENT,
  DESKTOP_NAVIGATE_BACK_EVENT,
  DESKTOP_NAVIGATE_FORWARD_EVENT,
  DESKTOP_NAVIGATION_AVAILABILITY_EVENT,
  DESKTOP_NEW_CONVERSATION_EVENT,
  DESKTOP_NEW_PROJECT_EVENT,
  DESKTOP_NEW_TAB_EVENT,
  DESKTOP_OPEN_CONVERSATION_SEARCH_EVENT,
  DESKTOP_OPEN_FILE_TAB_EVENT,
  DESKTOP_OPEN_IN_IDE_EVENT,
  DESKTOP_OPEN_SETTINGS_PANEL_EVENT,
  DESKTOP_REOPEN_CLOSED_TAB_EVENT,
  DESKTOP_SAVE_LAYOUT_AS_DEFAULT_EVENT,
  DESKTOP_SELECT_NEXT_TAB_EVENT,
  DESKTOP_SELECT_PREVIOUS_TAB_EVENT,
  DESKTOP_SETTINGS_CHANGED_EVENT,
  DESKTOP_SPLIT_DOWN_EVENT,
  DESKTOP_SPLIT_RIGHT_EVENT,
  DESKTOP_TOGGLE_BOTTOM_PANEL_EVENT,
  DESKTOP_TOGGLE_LEFT_SIDEBAR_EVENT,
  DESKTOP_TOGGLE_RIGHT_SIDEBAR_EVENT,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  DesktopHost,
  getDesktopSettings,
  markHelperNotificationBridgeReady,
  MCP_OAUTH_CALLBACK_DEEP_LINK,
  openDesktopChangelog,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  setDesktopNavigationMenuEnabled,
  takePendingUpdateAnnouncement,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  TERMINAL_DID_UPDATE_EVENT,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type DesktopFileTreeChangedPayload,
  type DesktopOpenFileTabPayload,
  type DesktopSettings,
  type HelperJsonRpcNotificationBatchEvent,
  type HelperJsonRpcRequestEvent,
  type HelperNotificationBatchApplyResult,
} from "./rpc/host";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { logStartupDiagnostic } from "./startupDiagnostics";
import { tauriDragDropSubscriber } from "./tauriDragDropSubscriber";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  refreshBundleReplacedStatus,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

const HELPER_JSONRPC_REQUEST_EVENT = "poolside:helper-jsonrpc-request";
const HELPER_JSONRPC_NOTIFICATION_BATCH_EVENT = "poolside:helper-jsonrpc-notification-batch";
// Star-row clicks in an open native menu. native_menu.rs emits this with
// `emit_to`, targeted at the window that opened the menu, and
// presentNativeMenu matches payloads to its own request by `token`. Reception
// still goes through `currentWindow.listen`: Tauri's global `listen` observes
// every window's targeted emissions too, so only the window-scoped listener
// keeps another window's clicks out of this webview.
const NATIVE_MENU_SET_DEFAULT_TAURI_EVENT = "native-menu:set-default";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const DESKTOP_WINDOW_FULLSCREEN_CLASS = "desktop-window-fullscreen";
const TERMINAL_FONT_FALLBACK = 'Menlo, Monaco, Consolas, "Liberation Mono", monospace';
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Same reasoning as the vibrancy class above: seed from the cached accent so
  // the window does not flash the built-in blue before the bridge read lands.
  seedDesktopAccentFromCache();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
interface TerminalUpdatePayload {
  terminalId: string;
  title?: string;
  cwd?: string;
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
function sendWebviewCommand(
  command: string,
  payload: unknown[],
  requestId: string = crypto.randomUUID(),
) {
  window.postMessage({ command, payload, requestId }, window.location.origin);
}

function dispatchDesktopCommand(eventName: string, detail?: unknown): boolean {
  const event = new CustomEvent(eventName, { cancelable: true, detail });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

function setDesktopWindowFullscreenClass(fullscreen: boolean): void {
  document.body.classList.toggle(DESKTOP_WINDOW_FULLSCREEN_CLASS, fullscreen);
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function applyDesktopFontPreferences(settings: DesktopSettings): void {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // The markdown styles read --psx-text-leading for chat line height.
  document.documentElement.style.setProperty(
    "--psx-text-leading",
__POOL_SYNTHETIC_IMPORT_BASELINE__
  );
  document.documentElement.style.setProperty(
    "--vscode-terminal-font-family",
    terminalFontFamilyCssValue(settings.terminalFontFamily),
  );
  document.documentElement.style.setProperty(
    "--vscode-terminal-font-size",
    `${settings.terminalFontSize}px`,
  );
  document.documentElement.style.setProperty(
    "--psx-terminal-cursor-style",
    settings.terminalCursorStyle,
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
}

// Chat text reads best around 1.5x leading; keep it proportional so larger
// font sizes get proportionally more breathing room.
function chatLineHeightPx(chatFontSize: number): number {
  return Math.round(chatFontSize * 1.5);
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function terminalFontFamilyCssValue(fontFamily: string): string {
  const trimmed = fontFamily.trim();
  if (!trimmed) return TERMINAL_FONT_FALLBACK;
  if (trimmed.includes(",") || trimmed.toLocaleLowerCase().includes("monospace")) return trimmed;
  return `${trimmed}, ${TERMINAL_FONT_FALLBACK}`;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const rpcWebViewResponseHandler = createWebviewResponseSender();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    document.title = `Poolside - ${titleLabel}`;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
interface StartOptions {
  onShellInteractive?: () => void;
  onInitialScreenSettled?: () => void;
}

export async function start({ onShellInteractive, onInitialScreenSettled }: StartOptions = {}) {
  logStartupDiagnostic("start.begin");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const target = document.getElementById("app");

  if (!target) {
    throw new Error("App mount target not found");
  }

  const currentWindow = getCurrentWindow();
  const bootstrap = await loadDesktopBootstrap({
    readSettings: async () => {
      const settings = await getDesktopSettings({ boot: true });
      logStartupDiagnostic("start.desktopSettings");
      return settings;
    },
    readVersion: getVersion,
    readHomeDirectory: homeDir,
    prepareAppearance: async (settings) => {
      const theme = await applyDesktopTheme(settings.themePreference);
      applyDesktopFontPreferences(settings);
      applyDesktopWindowVibrancy(settings);
      logStartupDiagnostic("start.themeApplied");
      return theme;
    },
    reconcileAccent: async () => {
      // Both accent palettes are independent of the selected theme.
      await applyDesktopAccent();
      logStartupDiagnostic("start.accentApplied");
    },
    readWindowFocused: () => currentWindow.isFocused(),
    readWindowFullscreen: () => currentWindow.isFullscreen(),
  });
  let { desktopSettings, currentResolvedTheme, isWindowFocused, isWindowFullscreen } = bootstrap;
  const { assistantVersion, homeDirectory } = bootstrap;
  let currentThemePreference = desktopSettings.themePreference;
  logStartupDiagnostic("start.settingsLoaded", { assistantVersion });
  logStartupDiagnostic("start.windowProbed");
  setDesktopWindowFullscreenClass(isWindowFullscreen);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const initialState = {
    userSettings: {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      themeOverride: null,
      wrapLines: false,
      showMermaidDiagrams: true,
      renderScan: false,
      highlightTelemetryElements: false,
      boolFeatures: {},
      notifyOnApproval: true,
    },
    environment: {
      assistantEnv: import.meta.env.DEV ? ("development" as const) : ("production" as const),
      assistantHost: "desktop",
      // Node process.platform identifiers, matching what the IDE hosts report
      // (VS Code passes process.platform; Visual Studio hard-codes "win32").
      // Native-menu gating (supportsNativeMenus) requires "darwin". The Tauri
      // webview has no process, so derive it from the engine's UA.
      operatingSystem: navigator.userAgent.includes("Mac")
        ? "darwin"
        : navigator.userAgent.includes("Windows")
          ? "win32"
          : "linux",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      assistantProduct: "desktop-assistant",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      desktopCodeFontFamily: desktopSettings.codeFontFamily,
      desktopCodeFontSize: desktopSettings.codeFontSize,
      desktopTerminalFontFamily: desktopSettings.terminalFontFamily,
      desktopTerminalFontSize: desktopSettings.terminalFontSize,
      desktopTerminalCursorStyle: desktopSettings.terminalCursorStyle,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      desktopSteerWithEnter: desktopSettings.steerWithEnter,
      desktopFullscreen: isWindowFullscreen,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      capabilities: {
        header: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
        hostClipboardWrite: true,
        runTerminalCommands: false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
        openWorkspace: false,
        addFolderToWorkspace: false,
        // Spoolside bridge flows that click through a confirmation disable
        // this per-flow (withDomConfirmationDialogs in spoolsideBridge.ts) —
        // native dialogs are invisible to the bridge.
        nativeConfirmDialog: true,
      },
    },
    colorTheme: desktopColorTheme(currentResolvedTheme),
__POOL_SYNTHETIC_IMPORT_BASELINE__
    workspaces: [],
    homeDirectory,
    keybindings: {},
    isHelperSupported: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  };

  const desktopHost = new DesktopHost(initialState, ({ command, payload, requestId }) =>
    sendWebviewCommand(command, payload, requestId),
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
  installExternalLinkHandler((url) => desktopHost.openExternalURL(url));

  function setDesktopFullscreen(fullscreen: boolean) {
    if (isWindowFullscreen === fullscreen) return;
    isWindowFullscreen = fullscreen;
    setDesktopWindowFullscreenClass(fullscreen);
    initialState.environment.desktopFullscreen = fullscreen;
    appState.update((state) => ({
      ...state,
      environment: {
        ...state.environment,
        desktopFullscreen: fullscreen,
      },
    }));
  }

  async function refreshDesktopFullscreen() {
    setDesktopFullscreen(await currentWindow.isFullscreen());
  }

  void currentWindow.onFocusChanged(({ payload: focused }) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  void currentWindow.onResized(() => {
    void refreshDesktopFullscreen();
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const rpcHostRequestHandler = (method: string, args: unknown[]) =>
    desktopHost.handleHostRequest(method, args);

  void listen<DesktopSettings>(DESKTOP_SETTINGS_CHANGED_EVENT, (event) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    currentThemePreference = event.payload.themePreference;
    initialState.environment.desktopFileOpenerId = event.payload.fileOpenerId;
    initialState.environment.desktopCodeFontFamily = event.payload.codeFontFamily;
    initialState.environment.desktopCodeFontSize = event.payload.codeFontSize;
    initialState.environment.desktopTerminalFontFamily = event.payload.terminalFontFamily;
    initialState.environment.desktopTerminalFontSize = event.payload.terminalFontSize;
    initialState.environment.desktopTerminalCursorStyle = event.payload.terminalCursorStyle;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    initialState.environment.desktopSteerWithEnter = event.payload.steerWithEnter;
    initialState.environment.desktopOpeners = event.payload.desktopOpeners;
    applyDesktopFontPreferences(event.payload);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    appState.update((state) => ({
      ...state,
      environment: {
        ...state.environment,
        desktopFileOpenerId: event.payload.fileOpenerId,
        desktopCodeFontFamily: event.payload.codeFontFamily,
        desktopCodeFontSize: event.payload.codeFontSize,
        desktopTerminalFontFamily: event.payload.terminalFontFamily,
        desktopTerminalFontSize: event.payload.terminalFontSize,
        desktopTerminalCursorStyle: event.payload.terminalCursorStyle,
__POOL_SYNTHETIC_IMPORT_BASELINE__
        desktopSteerWithEnter: event.payload.steerWithEnter,
        desktopOpeners: event.payload.desktopOpeners,
      },
    }));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    void desktopHost.updateHelperConfig();
    void applyAndNotifyTheme(event.payload.themePreference);
  });

  void listen(DESKTOP_OPEN_SETTINGS_PANEL_EVENT, () => {
    void desktopHost.openSettings();
  });

  void listen(DESKTOP_NEW_CONVERSATION_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_NEW_CONVERSATION_EVENT);
  });

  void listen(DESKTOP_NEW_PROJECT_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_NEW_PROJECT_EVENT);
  });

  void listen(DESKTOP_OPEN_IN_IDE_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_OPEN_IN_IDE_EVENT);
  });

  void listen<string[]>(DESKTOP_DEEP_LINK_EVENT, (event) => {
    dispatchDesktopCommand(DESKTOP_DEEP_LINK_EVENT, event.payload);
  });

  void listen(DESKTOP_NEW_TAB_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_OPEN_CONVERSATION_SEARCH_EVENT, { initialQuery: "+" });
  });

  void listen(DESKTOP_CLOSE_TAB_EVENT, () => {
    if (!dispatchDesktopCommand(DESKTOP_CLOSE_TAB_EVENT)) {
      void currentWindow.close();
    }
  });

  void listen(DESKTOP_REOPEN_CLOSED_TAB_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_REOPEN_CLOSED_TAB_EVENT);
  });

  void listen<DesktopOpenFileTabPayload>(DESKTOP_OPEN_FILE_TAB_EVENT, (event) => {
    dispatchDesktopCommand(DESKTOP_OPEN_FILE_TAB_EVENT, event.payload);
  });

  void listen(DESKTOP_SPLIT_RIGHT_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_SPLIT_RIGHT_EVENT);
  });

  void listen(DESKTOP_SPLIT_DOWN_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_SPLIT_DOWN_EVENT);
  });

  void listen(DESKTOP_TOGGLE_LEFT_SIDEBAR_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_TOGGLE_LEFT_SIDEBAR_EVENT);
  });

  void listen(DESKTOP_TOGGLE_RIGHT_SIDEBAR_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_TOGGLE_RIGHT_SIDEBAR_EVENT);
  });

  void listen(DESKTOP_TOGGLE_BOTTOM_PANEL_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_TOGGLE_BOTTOM_PANEL_EVENT);
  });

  void listen(DESKTOP_SELECT_PREVIOUS_TAB_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_SELECT_PREVIOUS_TAB_EVENT);
  });

  void listen(DESKTOP_SELECT_NEXT_TAB_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_SELECT_NEXT_TAB_EVENT);
  });

  void listen(DESKTOP_SAVE_LAYOUT_AS_DEFAULT_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_SAVE_LAYOUT_AS_DEFAULT_EVENT);
  });

  void listen(DESKTOP_NAVIGATE_BACK_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_NAVIGATE_BACK_EVENT);
  });

  void listen(DESKTOP_NAVIGATE_FORWARD_EVENT, () => {
    dispatchDesktopCommand(DESKTOP_NAVIGATE_FORWARD_EVENT);
  });

  void listen(DESKTOP_CHECK_FOR_UPDATES_EVENT, () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  window.addEventListener(DESKTOP_CLOSE_WINDOW_EVENT, () => {
    void currentWindow.close();
  });

  let navigationMenuUpdate = Promise.resolve();
  window.addEventListener(DESKTOP_NAVIGATION_AVAILABILITY_EVENT, (event) => {
    const detail = (event as CustomEvent<{ canGoBack?: boolean; canGoForward?: boolean }>).detail;
    navigationMenuUpdate = navigationMenuUpdate
      .then(() =>
        setDesktopNavigationMenuEnabled(detail?.canGoBack === true, detail?.canGoForward === true),
      )
      .catch((error) => {
        console.debug("Unable to update desktop navigation menu", error);
      });
  });

  window.addEventListener(DESKTOP_DEEP_LINK_EVENT, (event) => {
    const urls = (event as CustomEvent<string[]>).detail;
    if (!Array.isArray(urls)) return;
    for (const url of urls) {
      const isOAuthCallback =
        url === MCP_OAUTH_CALLBACK_DEEP_LINK || url.startsWith(`${MCP_OAUTH_CALLBACK_DEEP_LINK}?`);
      // An OAuth callback's query carries a live authorization code — log
      // only the redacted target, never the full URL.
      console.info(
        "poolside: deep link received",
        isOAuthCallback ? `${MCP_OAUTH_CALLBACK_DEEP_LINK}?<redacted>` : url,
      );
      if (isOAuthCallback) {
        desktopHost.mcpOAuthCallback(url).catch((error) => {
          console.warn("poolside: MCP OAuth deep-link callback failed", error);
          desktopHost.showInfoMessage(
            "Sign-in didn't complete — the connection may have timed out. Try connecting again.",
            InfoMessageType.error,
          );
        });
      }
    }
  });

  void listen<HelperJsonRpcRequestEvent>(HELPER_JSONRPC_REQUEST_EVENT, (event) => {
    void desktopHost.handleHelperRequest(event.payload);
  });

  // The native bridge retries an unacknowledged batch with the same id. Cache
  // both in-flight and completed application results so a lost acknowledgement
  // never causes an already-applied prefix to be delivered twice. Native
  // delivery is strictly serial, so once a newer id appears older ids cannot
  // be retried and this cache only needs a tiny bounded tail.
  const helperNotificationBatchResults = new Map<
    number,
    Promise<HelperNotificationBatchApplyResult>
  >();
  const applyHelperNotificationBatch = (event: HelperJsonRpcNotificationBatchEvent) => {
    const existing = helperNotificationBatchResults.get(event.id);
    if (existing) return existing;

    const result = desktopHost.handleHelperNotifications(event.notifications).catch(
      (error): HelperNotificationBatchApplyResult => ({
        applied: 0,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    helperNotificationBatchResults.set(event.id, result);
    while (helperNotificationBatchResults.size > 2) {
      const oldest = helperNotificationBatchResults.keys().next().value;
      if (oldest === undefined || oldest === event.id) break;
      helperNotificationBatchResults.delete(oldest);
    }
    return result;
  };

  void listen<HelperJsonRpcNotificationBatchEvent>(
    HELPER_JSONRPC_NOTIFICATION_BATCH_EVENT,
    (event) => {
      void applyHelperNotificationBatch(event.payload)
        .then((result) => {
          if (result.error) {
            console.error("Unable to apply full helper notification batch", result.error);
          }
          return acknowledgeHelperNotificationBatch(event.payload.id, result.applied);
        })
        .catch((error) => {
          console.error("Unable to report helper notification batch result", error);
        });
    },
  )
    .then(() => markHelperNotificationBridgeReady())
    .catch((error) => {
      console.error("Unable to initialize helper notification bridge", error);
    });

  void listen<DesktopFileTreeChangedPayload>(DESKTOP_FILE_TREE_CHANGED_EVENT, (event) => {
    window.dispatchEvent(
      new CustomEvent(DESKTOP_FILE_TREE_CHANGED_EVENT, { detail: event.payload }),
    );
  });

  // Scoped to this window: the native menu emits star clicks to the window
  // that opened it (`emit_to`), and presentNativeMenu matches them to its own
  // request by token.
  void currentWindow.listen<NativeMenuSetDefaultPayload>(
    NATIVE_MENU_SET_DEFAULT_TAURI_EVENT,
    (event) => {
      window.dispatchEvent(
        new CustomEvent(NATIVE_MENU_SET_DEFAULT_EVENT, { detail: event.payload }),
      );
    },
  );

  void listen(TERMINAL_DID_OPEN_EVENT, (event) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  void listen<TerminalUpdatePayload>(TERMINAL_DID_UPDATE_EVENT, (event) => {
    void sendWebviewCommand("assistantTerminalDidUpdate", [event.payload]);
  });

  void listen<TerminalWritePayload>(TERMINAL_DID_WRITE_EVENT, (event) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  void listen<TerminalExitPayload>(TERMINAL_DID_EXIT_EVENT, (event) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  void listen<TerminalClosePayload>(TERMINAL_DID_CLOSE_EVENT, (event) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  void listen<number>(DESKTOP_NOTIFICATION_CLICK_EVENT, (event) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (!isWindowFocused) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  await init();
  logStartupDiagnostic("start.mounting");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    target,
    props: {
      rpcHostRequestHandler,
      rpcWebViewResponseHandler,
      initialState,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      desktopFileViewerPanel: DesktopFileViewerPanel,
      tauriDragDropSubscriber,
      onShellInteractive,
      onInitialScreenSettled,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
  });

  logStartupDiagnostic("start.mounted");

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Applying installs the staged update before restarting, so unlike the old
  // bare relaunch it can genuinely fail — a cancelled privilege prompt, a full
  // disk, a pulled release. The pill only re-enables itself, so report why.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const applyUpdate = async () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    try {
      await applyDownloadedUpdate();
    } catch (error) {
      desktopHost.showInfoMessage(
        "Couldn't install the update — the download is still available, so use the Update button to try again.",
        InfoMessageType.error,
      );
      throw error;
    }
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
    switch (status.kind) {
      case "downloaded":
        desktopUpdate.set({
          available: true,
          busy: false,
          version: status.version,
          notes: status.notes,
__POOL_SYNTHETIC_IMPORT_BASELINE__
          apply: applyUpdate,
        });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        break;
      // The bundle on disk is already new; only this process is stale.
      case "replaced":
        desktopUpdate.set({ available: true, busy: false, apply: applyUpdate });
        break;
      default:
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Raised when a native file panel was blocked because the bundle had already
  // been replaced on disk; show the same restart affordance.
  window.addEventListener(DESKTOP_BUNDLE_REPLACED_EVENT, () => {
    void refreshBundleReplacedStatus();
  });
  startAutoUpdateLoop();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Post-update toast: announce the freshly installed version once, linking to
  // the Changelog window. The host persists the announced version before
  // returning it, so a missed or dismissed toast never repeats.
  takePendingUpdateAnnouncement()
    .then((version) => {
      if (!version) return;
      sidebarToasts.addActionToast(
        `Updated to ${version}`,
        { label: "Changelog", onClick: () => void openDesktopChangelog() },
        { timeoutMs: 15_000 },
      );
    })
    .catch((error) => console.debug("post-update announcement failed", error));

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Clicking the pill relaunches without installing anything (dev builds
    // never stage an update — see applyDownloadedUpdate).
    const mockNotes = [
      "## Changes since 1.0.0",
      "",
      "### Improvements",
      "",
      "- Add third-party licenses to About (#539)",
      "",
      "### Fixes",
      "",
      "- Fix diff viewer cache collisions (#550)",
    ].join("\n");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    ).__mockDesktopUpdate = (version = "0.0.0-mock", notes = mockNotes) =>
      updaterStatus.set({ kind: "downloaded", version, notes });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            : { kind: "downloaded", version: "0.0.0-mock", notes: mockNotes },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  watchDesktopTheme(
    () => currentThemePreference,
    (theme) => {
      notifyTheme(theme);
    },
  );

  watchDesktopAccent();
  logStartupDiagnostic("start.completed");

  async function applyAndNotifyTheme(themePreference: DesktopSettings["themePreference"]) {
    const theme = await applyDesktopTheme(themePreference);
    notifyTheme(theme);
  }

  function notifyTheme(theme: ResolvedDesktopTheme) {
    if (currentResolvedTheme === theme) return;
    currentResolvedTheme = theme;
    desktopHost.setColorTheme(desktopColorTheme(theme));
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
