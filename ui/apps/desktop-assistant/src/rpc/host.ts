import {
  buildDesktopFileTreeContextMenuSpec,
  decodeFileTreeActionId,
  desktopFileTreeContextMenuNeedsPasteboard,
  fileTreeSpecToGenericSpec,
  resolveNativeMenuTheme,
  type DesktopContextMenuRequest,
  type DesktopSystemContextMenuRequest,
  type NativeConfirmationRequest,
  type NativeErrorRequest,
} from "@poolsideai/features/acp";
import type {
  DeleteSecretParams,
  GetSecretParams,
  ListSecretsParams,
  UpsertSecretParams,
} from "@poolsideai/helperapi/schemas";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type OpenAcpChatOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  appliedSourceNotificationCount,
  coalesceACPTextChunkNotificationBatch,
  webviewCommandForHelperNotification,
  type JSONRPCNotifyBatchResult,
} from "@poolsideai/rpc/assistant";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { LogicalPosition } from "@tauri-apps/api/dpi";
import { Menu, type MenuOptions } from "@tauri-apps/api/menu";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { ask, message, open, save } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";

import { logStartupDiagnostic } from "../startupDiagnostics";

const WEBVIEW_RESPONSE_EVENT = "poolside:desktop:webview-response";
// Notification handlers are synchronous in the webview. If no response comes
// back promptly, the webview was reloaded or the bridge message was lost; fail
// before the native 30-second ACK timeout so it can retry the batch safely.
const HELPER_NOTIFICATION_WEBVIEW_TIMEOUT_MS = 10_000;
export const DESKTOP_SETTINGS_CHANGED_EVENT = "poolside:desktop-settings-changed";
export const DESKTOP_OPEN_SETTINGS_PANEL_EVENT = "poolside:desktop-open-settings-panel";
export const DESKTOP_NEW_CONVERSATION_EVENT = "poolside:desktop-new-conversation";
export const DESKTOP_NEW_PROJECT_EVENT = "poolside:desktop-new-project";
export const DESKTOP_OPEN_IN_IDE_EVENT = "poolside:desktop-open-in-ide";
export const DESKTOP_DEEP_LINK_EVENT = "poolside:desktop-deep-link";
// OAuth redirect deep links (must match the helper's DeepLinkOAuthRedirectURI):
// the browser lands here after sign-in and the OS hands the URL to this app,
// which forwards it to the helper to complete the pending flow.
export const MCP_OAUTH_CALLBACK_DEEP_LINK = "poolside://oauth/callback";
export const DESKTOP_NEW_TAB_EVENT = "poolside:desktop-new-tab";
export const DESKTOP_OPEN_CONVERSATION_SEARCH_EVENT = "poolside:desktop-open-conversation-search";
export const DESKTOP_CLOSE_TAB_EVENT = "poolside:desktop-close-tab";
export const DESKTOP_REOPEN_CLOSED_TAB_EVENT = "poolside:desktop-reopen-closed-tab";
export const DESKTOP_OPEN_FILE_TAB_EVENT = "poolside:desktop-open-file-tab";
export const DESKTOP_SELECT_PREVIOUS_TAB_EVENT = "poolside:desktop-select-previous-tab";
export const DESKTOP_SELECT_NEXT_TAB_EVENT = "poolside:desktop-select-next-tab";
export const DESKTOP_SPLIT_RIGHT_EVENT = "poolside:desktop-split-right";
export const DESKTOP_SPLIT_DOWN_EVENT = "poolside:desktop-split-down";
export const DESKTOP_TOGGLE_LEFT_SIDEBAR_EVENT = "poolside:desktop-toggle-left-sidebar";
export const DESKTOP_TOGGLE_RIGHT_SIDEBAR_EVENT = "poolside:desktop-toggle-right-sidebar";
export const DESKTOP_TOGGLE_BOTTOM_PANEL_EVENT = "poolside:desktop-toggle-bottom-panel";
export const DESKTOP_SAVE_LAYOUT_AS_DEFAULT_EVENT = "poolside:desktop-save-layout-as-default";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export const DESKTOP_BUNDLE_REPLACED_EVENT = "poolside:desktop-bundle-replaced";
export const DESKTOP_NAVIGATE_BACK_EVENT = "poolside:desktop-navigate-back";
export const DESKTOP_NAVIGATE_FORWARD_EVENT = "poolside:desktop-navigate-forward";
export const DESKTOP_NAVIGATION_AVAILABILITY_EVENT = "poolside:desktop-navigation-availability";
export const DESKTOP_CLOSE_WINDOW_EVENT = "poolside:desktop-close-window";
export const DESKTOP_FILE_TREE_CONTEXT_MENU_ACTION_EVENT =
  "poolside:desktop-file-tree-context-menu-action";
export const DESKTOP_FILE_TREE_CHANGED_EVENT = "poolside:desktop-file-tree-changed";

type TauriMenuItemOptions = NonNullable<MenuOptions["items"]>[number];

const DESKTOP_SYSTEM_CONTEXT_MENU_CLOSE_DELAY_MS = 30_000;

let activeDesktopSystemContextMenu: { menu: Menu; dismiss: () => Promise<void> } | undefined;

type AssistantTerminalCommandMode = "interactive" | "nonInteractive";
__POOL_SYNTHETIC_IMPORT_BASELINE__
export const TERMINAL_DID_UPDATE_EVENT = "poolside:assistant-terminal-did-update";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

export interface DesktopSettings {
  themePreference: DesktopThemePreference;
  chatFontSize: number;
  codeFontFamily: string;
  codeFontFamilies: string[];
  codeFontSize: number;
  terminalFontFamily: string;
  terminalFontFamilies: string[];
  terminalFontSize: number;
  terminalCursorStyle: DesktopTerminalCursorStyle;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  steerWithEnter: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  appIconTint: AppIconTint;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

export interface HelperNotificationBatchApplyResult {
  /** Original native notifications applied in order before the first failure. */
  applied: number;
  error?: string;
}

/**
 * The macOS accent colours, resolved under each appearance because they differ
 * (a purple accent is #953D96 in light and #A550A7 in dark). `null` off macOS.
 * See src-tauri/src/system_accent.rs.
 */
export interface SystemAccentColors {
  light: SystemAccentPalette;
  dark: SystemAccentPalette;
}

export interface SystemAccentPalette {
  /** `NSColor.controlAccentColor`. */
  accent: string;
  /** Black or white, whichever AppKit would draw on top of `accent`. */
  foreground: string;
  /** `NSColor.selectedTextBackgroundColor`. */
  selection: string;
}

export type DesktopThemePreference = "system" | "light" | "dark";
/**
 * Colours the app icon can be tinted with, based on `SLOT_COLORS` in
 * `@poolsideai/spoolside`. See src-tauri/src/app_icon.rs.
 */
export type AppIconTint =
  | "default"
  | "blue"
  | "green"
  | "pink"
  | "orange"
  | "yellow"
  | "cyan"
  | "red";

export type DesktopTerminalCursorStyle = "block" | "bar" | "underline";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /** Release notes from the update feed (the CrabNebula release notes). */
  notes?: string | null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  status: "alreadyStable" | "noUpdate" | "cancelled" | "staged";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  kind: "inApp" | "default" | "editorEnv" | "application" | "terminal";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export interface DesktopOpenFileTabPayload {
  path: string;
  line?: number;
  column?: number;
}

export interface DesktopTextFile {
  path: string;
  contents: string;
}

export interface DesktopFileTree {
  rootPath: string;
  entries: DesktopFileTreeEntry[];
  deferredDirectories: string[];
  gitStatus: DesktopFileTreeGitStatusEntry[];
}

export interface DesktopFileTreeEntry {
  path: string;
  relativePath: string;
  kind: "directory" | "file";
  gitIgnored: boolean;
}

export interface DesktopFileTreeChangedPayload {
  changes: DesktopFileTreeChange[];
}

export interface DesktopFileTreeChange {
  path: string;
  type: number;
}

export type DesktopFileTreeContextMenuAction =
  | "open"
  | "openWith"
  | "revealInFinder"
  | "openInTerminal"
  | "addFileToChat"
__POOL_SYNTHETIC_IMPORT_BASELINE__
  | "cut"
  | "copy"
  | "paste"
  | "copyPath"
  | "copyRelativePath"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

export interface DesktopFileTreeContextMenuActionPayload {
  requestId: string;
  action: DesktopFileTreeContextMenuAction;
  openerId?: string;
}

export interface DesktopFileTreeContextMenuRequest {
  requestId: string;
  item: {
    kind: DesktopFileTreeEntry["kind"];
  };
  position: {
    x: number;
    y: number;
  };
  currentOpenerId: string;
  fileOpeners: DesktopFileTreeContextMenuOpener[];
  desktopOpeners: DesktopFileTreeContextMenuOpener[];
}

export interface DesktopFileTreeContextMenuOpener {
  id: string;
  label: string;
}

export type DesktopFilePasteboardOperation = "copy" | "cut";

export interface DesktopFilePasteResult {
  pasted: number;
}

export interface DesktopFileTreeGitStatusEntry {
  path: string;
  status: DesktopFileTreeGitStatus;
}

export type DesktopFileTreeGitStatus =
  | "added"
  | "deleted"
  | "ignored"
  | "modified"
  | "renamed"
  | "untracked";

interface ProjectFolder {
  path: string;
  name: string;
}

export interface DesktopInitialState {
  userSettings: {
    uri: string;
    agentServers?: ACPAgentServers;
    [key: string]: unknown;
  };
  environment: Record<string, unknown>;
  workspaces: unknown[];
  keybindings: Record<string, string | undefined>;
  [key: string]: unknown;
}

export interface HelperJsonRpcError {
  message: string;
  code?: number;
  data?: unknown;
}

export interface HelperJsonRpcRequestEvent {
  id: unknown;
  method: string;
  params: unknown;
}

export interface HelperJsonRpcNotificationEvent {
  method: string;
  params: unknown;
}

export interface HelperJsonRpcNotificationBatchEvent {
  id: number;
  notifications: HelperJsonRpcNotificationEvent[];
}

type WebviewResponsePayload = {
  requestId: string;
  response?: unknown;
  error?: unknown;
};

export type WebviewResponseSender = (command: string, payload: WebviewResponsePayload) => void;

export class DesktopHost {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  private readonly webviewReady: Promise<void>;
  private resolveReady!: () => void;

  constructor(
    private readonly initialState: DesktopInitialState,
    private readonly postWebviewMessage: (message: {
      command: string;
      payload: unknown[];
      requestId: string;
    }) => void,
  ) {
    this.webviewReady = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  async handleHostRequest(method: string, args: unknown[]): Promise<unknown> {
    const handler = (this as unknown as Record<string, unknown>)[method];
    if (typeof handler !== "function") return undefined;
    return await handler.apply(this, args);
  }

  async handleHelperRequest({ id, method, params }: HelperJsonRpcRequestEvent): Promise<void> {
    try {
      const result = await this.dispatchHelperRequest(method, params);
      await helperJsonRpcRespond(id, result);
    } catch (error) {
      await helperJsonRpcRespond(id, undefined, toHelperJsonRpcError(error));
    }
  }

  async handleHelperNotification({
    method,
    params,
  }: HelperJsonRpcNotificationEvent): Promise<void> {
    const result = await this.handleHelperNotifications([{ method, params }]);
    if (result.error) throw new Error(result.error);
  }

  async handleHelperNotifications(
    notifications: readonly HelperJsonRpcNotificationEvent[],
  ): Promise<HelperNotificationBatchApplyResult> {
    let applied = 0;
    let acpNotifications: unknown[] = [];
    const flushACPNotifications = async (): Promise<string | undefined> => {
      if (acpNotifications.length === 0) return undefined;
      const batch = coalesceACPTextChunkNotificationBatch(acpNotifications);
      acpNotifications = [];
      let result: JSONRPCNotifyBatchResult;
      try {
        result = (await this.callWebview(
          "jsonrpcNotifyBatch",
          [batch.notifications],
          HELPER_NOTIFICATION_WEBVIEW_TIMEOUT_MS,
        )) as JSONRPCNotifyBatchResult;
      } catch (error) {
        return getUnknownErrorMessage(error);
      }

      const appliedMessages = Number.isInteger(result?.applied)
        ? Math.max(0, Math.min(result.applied, batch.notifications.length))
        : 0;
      applied += appliedSourceNotificationCount(batch.sourceCounts, appliedMessages);
      if (appliedMessages < batch.notifications.length) {
        return result?.error ?? "Webview stopped before applying the full ACP notification batch";
      }
      return undefined;
    };

    for (const { method, params } of notifications) {
      if (method === "poolside/jsonrpc/notify") {
        acpNotifications.push(params);
        continue;
      }
      const flushError = await flushACPNotifications();
      if (flushError) return { applied, error: flushError };
      try {
        await this.dispatchHelperNotification(method, params);
        applied += 1;
      } catch (error) {
        return { applied, error: getUnknownErrorMessage(error) };
      }
    }
    const flushError = await flushACPNotifications();
    return flushError ? { applied, error: flushError } : { applied };
  }

  async jsonrpc(methodName: string, params: object): Promise<unknown> {
    return await helperJsonRpc(methodName, params);
  }

  async jsonrpcNotify(methodName: string, params: object): Promise<void> {
    await helperJsonRpcNotify(methodName, params);
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
  }

  async getCodeSymbols(): Promise<{ symbols: unknown[] }> {
    return { symbols: [] };
  }

  openExternalURL(url: string): void {
    void openExternalUrl(url).catch((error) => {
      console.debug("Unable to open external URL", error);
    });
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  openImageFile(): void {}

  async getUrlContents(): Promise<undefined> {
    return undefined;
  }

  async getFileContents(path: string): Promise<{ path: string; content: string } | undefined> {
    if (!(await invokeCheckFileExists(path))) return undefined;
    const file = await readTextFile(path);
    return { path: file.path, content: file.contents };
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  async getPromptContext(): Promise<unknown[]> {
    return [];
  }

  openTerminal(): void {}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    commandMode?: AssistantTerminalCommandMode,
    cwd?: string,
    cols?: number,
    rows?: number,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return await invoke("create_assistant_terminal", {
      worktreePath,
      command,
      env,
      commandMode,
      cwd,
      cols,
      rows,
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  showInfoMessage(message: string, type: InfoMessageType = InfoMessageType.info): void {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const log = type === InfoMessageType.error ? console.error : console.info;
    log(`poolside: ${message}`);
  }

  async mcpOAuthCallback(url: string): Promise<void> {
    await helperJsonRpc("poolside/mcpOAuthCallback", { url });
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  /**
   * Guards the out-of-process AppKit panels below.
   *
   * macOS launches `NSOpenPanel`/`NSSavePanel` in a separate process that
   * validates the caller against its on-disk bundle. Once that bundle has been
   * replaced the service exits immediately and takes this process with it — a
   * hard crash with no report (see bundle_guard.rs). Offer the restart that
   * fixes it instead of opening the panel.
   *
   * NSAlert is in-process, so the prompt itself is safe in this state.
   */
  private async nativeFilePanelIsSafe(): Promise<boolean> {
    let replaced = false;
    try {
      replaced = await desktopBundleReplaced();
    } catch (error) {
      // Never block a panel that would have worked.
      console.debug("bundle replacement check failed", error);
      return true;
    }
    if (!replaced) return true;

    window.dispatchEvent(new CustomEvent(DESKTOP_BUNDLE_REPLACED_EVENT));
    const restart = await this.showNativeConfirmDialog({
      title: "Restart to finish updating",
      description:
        "Poolside was updated on disk while it was running. Opening files or folders will quit this window until you restart.",
      confirmLabel: "Restart",
    });
    if (restart) await relaunch();
    return false;
  }

  async selectProjectFolder(): Promise<ProjectFolder | undefined> {
    if (!(await this.nativeFilePanelIsSafe())) return undefined;
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Add Project",
    });
    if (typeof selected !== "string") return undefined;

    return {
      path: selected,
      name: projectFolderName(selected),
    };
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!(await this.nativeFilePanelIsSafe())) return undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async getDesktopSettings(): Promise<DesktopSettings> {
    return await getDesktopSettings();
  }

  async getDesktopAppVersion(): Promise<string> {
    return await getVersion();
  }

  async openDesktopChangelog(): Promise<void> {
    await openDesktopChangelog();
  }

  ready(): void {
    this.resolveReady();
    this.queueHelperConfigUpdate();
  }

  reportError(error: unknown): void {
    console.debug("Assistant reported an error", error);
    logStartupDiagnostic("assistant.reportError", error);
  }

  reportEvent(name: string, data: unknown): void {
    console.debug("Assistant reported an event", { name, data });
  }

  setColorTheme(colorTheme: object): void {
    void this.callWebview("setTheme", [colorTheme]);
  }

  async setDesktopThemePreference(
    themePreference: DesktopThemePreference,
  ): Promise<DesktopSettings> {
    return await setDesktopThemePreference(themePreference);
  }

  async setDesktopChatPreferences(chatFontSize: number): Promise<DesktopSettings> {
    return await setDesktopChatPreferences(chatFontSize);
  }

  async setDesktopCodePreferences(
    codeFontFamily: string,
    codeFontSize: number,
  ): Promise<DesktopSettings> {
    return await setDesktopCodePreferences(codeFontFamily, codeFontSize);
  }

  async setDesktopTerminalPreferences(
    terminalFontFamily: string,
    terminalFontSize: number,
    terminalCursorStyle: DesktopTerminalCursorStyle,
  ): Promise<DesktopSettings> {
    return await setDesktopTerminalPreferences(
      terminalFontFamily,
      terminalFontSize,
      terminalCursorStyle,
    );
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async setDesktopSteerWithEnter(steerWithEnter: boolean): Promise<DesktopSettings> {
    return await setDesktopSteerWithEnter(steerWithEnter);
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async setDesktopAppIconTint(appIconTint: AppIconTint): Promise<DesktopSettings> {
    return await setDesktopAppIconTint(appIconTint);
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
    if (result.status === "staged" && result.version) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async showDesktopFileTreeContextMenu(request: DesktopFileTreeContextMenuRequest): Promise<void> {
    await showDesktopFileTreeContextMenu(request);
  }

  async showDesktopContextMenu(request: DesktopContextMenuRequest): Promise<string | null> {
    return await showDesktopContextMenu(request);
  }

  async showDesktopSystemContextMenu(
    request: DesktopSystemContextMenuRequest,
  ): Promise<string | null> {
    return await showDesktopSystemContextMenu(request);
  }

  async fileIconDataUri(path: string): Promise<string | undefined> {
    return await fileIconDataUri(path);
  }

  // Native OS counterparts of the webview ConfirmationDialog, advertised via
  // the `nativeConfirmDialog` capability. The webview cannot keep a native
  // dialog open while an action runs, so failures report through
  // showNativeErrorDialog afterwards.
  //
  // The custom NSAlert command carries the app icon and a red destructive
  // confirm button, which tauri-plugin-dialog's `ask()` cannot do; the plugin
  // remains the fallback on other platforms (or if the command fails).
  async showNativeConfirmDialog(request: NativeConfirmationRequest): Promise<boolean> {
    try {
      return await invoke<boolean>("show_confirm_dialog", { request });
    } catch (error) {
      console.warn("show_confirm_dialog failed; falling back to plugin dialog", error);
      return await ask(request.description, {
        title: request.title,
        kind: request.destructive ? "warning" : "info",
        okLabel: request.confirmLabel,
        cancelLabel: "Cancel",
      });
    }
  }

  async showNativeErrorDialog(request: NativeErrorRequest): Promise<void> {
    try {
      await invoke("show_error_dialog", { request });
    } catch (error) {
      console.warn("show_error_dialog failed; falling back to plugin dialog", error);
      await message(request.message, { title: request.title, kind: "error" });
    }
  }

  async fileUrlPasteboardHasFiles(): Promise<boolean> {
    return await fileUrlPasteboardHasFiles();
  }

  async revealPathInFinder(path: string): Promise<void> {
    await revealPathInFinder(path);
  }

  async writeFileUrlToPasteboard(
    path: string,
    operation: DesktopFilePasteboardOperation,
  ): Promise<void> {
    await writeFileUrlToPasteboard(path, operation);
  }

  async trashPath(path: string): Promise<void> {
    await trashPath(path);
  }

  async pasteFilesIntoDirectory(destination: string): Promise<DesktopFilePasteResult> {
    return await pasteFilesIntoDirectory(destination);
  }

  async listDirectoryTree(path: string, includeGitIgnored = false): Promise<DesktopFileTree> {
    return await listDirectoryTree(path, includeGitIgnored);
  }

  async listDirectorySubtree(
    rootPath: string,
    relativePath: string,
    includeGitIgnored = false,
  ): Promise<DesktopFileTree> {
    return await listDirectorySubtree(rootPath, relativePath, includeGitIgnored);
  }

  async setACPAgentServers(agentServers: ACPAgentServers): Promise<void> {
    await helperJsonRpc("poolside/acpNav/setAgentServers", { agentServers });
    this.initialState.userSettings.acpAgentServers = agentServers;
    await this.updateHelperConfig();
  }

  async openAcpChat(opts?: OpenAcpChatOptions): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Desktop is a single window, so "open" means selecting the conversation
    // in place (e.g. a clicked notification), not revealing a per-session panel.
    if (opts?.conversationId) {
      void this.callWebview("setCurrentConversation", [opts.conversationId]);
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__

  async closeAcpChat(): Promise<void> {}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  async upsertSecret(params: UpsertSecretParams): Promise<unknown> {
    return await helperJsonRpc("poolside/upsertSecret", params);
  }

  async deleteSecret(params: DeleteSecretParams): Promise<unknown> {
    return await helperJsonRpc("poolside/deleteSecret", params);
  }

  async listSecrets(params: ListSecretsParams): Promise<unknown> {
    return await helperJsonRpc("poolside/listSecrets", params);
  }

  async getSecret(params: GetSecretParams): Promise<unknown> {
    return await helperJsonRpc("poolside/getSecret", params);
  }

  async writeToClipboard(text: string): Promise<void> {
    await writeToClipboard(text);
  }

  async writeImageToPasteboard(path: string): Promise<void> {
    await writeImageToPasteboard(path);
  }

  async writeImageDataToPasteboard(data: string): Promise<void> {
    await writeImageDataToPasteboard(data);
  }

  async getConfiguration() {
    return this.initialState.userSettings;
  }

  async getContext() {
    return {
      workspaces: [],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
  }

  async updateHelperConfig(): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await helperJsonRpcNotify("workspace/didChangeConfiguration", {
      settings: {
        agentServers: this.initialState.userSettings.agentServers,
        agentId: "",
        chatModelId: "",
        editorSettings: this.initialState.userSettings,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      },
    });
  }

  private queueHelperConfigUpdate(): void {
    void this.updateHelperConfig().catch((error) => {
      console.debug("Unable to update poolside-helper configuration", error);
    });
  }

  private async dispatchHelperRequest(method: string, params: unknown): Promise<unknown> {
    switch (method) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        return await this.callWebview("elicitation", [params]);
      case "poolside/jsonrpc/request":
        return await this.callWebview("jsonrpcRequest", [params]);
      default:
        return undefined;
    }
  }

  private async dispatchHelperNotification(method: string, params: unknown): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    switch (method) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.openExternalURL(helperAuthURL(params));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await this.callWebview(command, [params], HELPER_NOTIFICATION_WEBVIEW_TIMEOUT_MS);
  }

  private async callWebview(
    command: string,
    payload: unknown[],
    timeoutMs?: number,
  ): Promise<unknown> {
    if (timeoutMs === undefined) {
      await this.webviewReady;
    } else {
      await new Promise<void>((resolve, reject) => {
        const timeoutId = window.setTimeout(
          () => reject(new Error(`Timed out waiting for webview readiness for ${command}`)),
          timeoutMs,
        );
        void this.webviewReady.then(() => {
          window.clearTimeout(timeoutId);
          resolve();
        });
      });
    }

    return await new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      let timeoutId: number | undefined;
      const cleanup = () => {
        window.removeEventListener(WEBVIEW_RESPONSE_EVENT, listener);
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      };
      const listener = (event: Event) => {
        const customEvent = event as CustomEvent<{
          command: string;
          payload: WebviewResponsePayload;
        }>;
        if (
          customEvent.detail.command !== command ||
          customEvent.detail.payload.requestId !== requestId
        ) {
          return;
        }

        cleanup();
        if (customEvent.detail.payload.error) {
          reject(customEvent.detail.payload.error);
        } else {
          resolve(customEvent.detail.payload.response);
        }
      };

      window.addEventListener(WEBVIEW_RESPONSE_EVENT, listener);
      if (timeoutMs !== undefined) {
        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error(`Timed out waiting for webview command ${command}`));
        }, timeoutMs);
      }
      try {
        this.postWebviewMessage({ command, payload, requestId });
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }
}

export function createWebviewResponseSender(): WebviewResponseSender {
  return (command, payload) => {
    window.dispatchEvent(
      new CustomEvent(WEBVIEW_RESPONSE_EVENT, {
        detail: { command, payload },
      }),
    );
  };
}

async function helperJsonRpc(method: string, params: object): Promise<unknown> {
  try {
    return await invoke("helper_jsonrpc", { method, params });
  } catch (error) {
    throw toHelperJsonRpcError(error);
  }
}

async function helperJsonRpcNotify(method: string, params: object): Promise<void> {
  try {
    await invoke("helper_jsonrpc_notify", { method, params });
  } catch (error) {
    throw toHelperJsonRpcError(error);
  }
}

export async function acknowledgeHelperNotificationBatch(
  id: number,
  applied: number,
): Promise<void> {
  await invoke("helper_jsonrpc_notification_batch_ack", { id, applied });
}

export async function markHelperNotificationBridgeReady(): Promise<void> {
  await invoke("helper_jsonrpc_notification_bridge_ready");
}

async function helperJsonRpcRespond(
  id: unknown,
  result?: unknown,
  error?: HelperJsonRpcError,
): Promise<void> {
  await invoke("helper_jsonrpc_respond", {
    id,
    result: result ?? null,
    error: error ?? null,
  });
}

// `boot: true` returns the response without opener icons — only the startup
// path may use it (the post-mount openers refresh restores the full set).
export async function getDesktopSettings(options?: { boot?: boolean }): Promise<DesktopSettings> {
  return await invoke("get_desktop_settings", { boot: options?.boot ?? false });
}

export async function setDesktopNavigationMenuEnabled(
  backEnabled: boolean,
  forwardEnabled: boolean,
): Promise<void> {
  await invoke("set_navigation_menu_enabled", { backEnabled, forwardEnabled });
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export async function setDesktopThemePreference(
  themePreference: DesktopThemePreference,
): Promise<DesktopSettings> {
  return await invoke("set_desktop_theme_preference", { themePreference });
}

export async function setDesktopChatPreferences(chatFontSize: number): Promise<DesktopSettings> {
  return await invoke("set_desktop_chat_preferences", { chatFontSize });
}

export async function setDesktopCodePreferences(
  codeFontFamily: string,
  codeFontSize: number,
): Promise<DesktopSettings> {
  return await invoke("set_desktop_code_preferences", { codeFontFamily, codeFontSize });
}

export async function setDesktopTerminalPreferences(
  terminalFontFamily: string,
  terminalFontSize: number,
  terminalCursorStyle: DesktopTerminalCursorStyle,
): Promise<DesktopSettings> {
  return await invoke("set_desktop_terminal_preferences", {
    terminalFontFamily,
    terminalFontSize,
    terminalCursorStyle,
  });
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export async function setDesktopSteerWithEnter(steerWithEnter: boolean): Promise<DesktopSettings> {
  return await invoke("set_desktop_steer_with_enter", { steerWithEnter });
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export async function setDesktopAppIconTint(appIconTint: AppIconTint): Promise<DesktopSettings> {
  return await invoke("set_desktop_app_icon_tint", { appIconTint });
}

export async function getSystemAccentColors(): Promise<SystemAccentColors | null> {
  return await invoke("get_system_accent_colors");
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
/** Check once and download that exact selected-channel update. */
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Install the staged download and relaunch into it. Resolves only on failure —
 * a successful install restarts the process.
 */
export async function installStagedDesktopUpdate(): Promise<void> {
  await invoke("install_staged_desktop_update");
}

/** True once the running .app has been replaced on disk (see bundle_guard.rs). */
export async function desktopBundleReplaced(): Promise<boolean> {
  return await invoke("desktop_bundle_replaced");
}

/** Open (or focus) the Changelog window rendering the bundled release notes. */
export async function openDesktopChangelog(): Promise<void> {
  await invoke("open_changelog");
}

/**
 * The freshly installed version to announce, exactly once per update. The host
 * persists the returned version as seen, so a dismissed toast never repeats.
 */
export async function takePendingUpdateAnnouncement(): Promise<string | null> {
  return await invoke("take_pending_update_announcement");
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
/**
 * Present a native context menu via the `show_native_menu` command. Resolves
 * with the selected action id once the menu closes, or `null` when it was
 * dismissed without a selection.
 */
export async function showDesktopContextMenu(
  request: DesktopContextMenuRequest,
): Promise<string | null> {
  return await invoke<string | null>("show_native_menu", { request });
}

/** Present an ordinary OS-styled context menu through Tauri's menu API. */
async function showDesktopSystemContextMenu(
  request: DesktopSystemContextMenuRequest,
): Promise<string | null> {
  await closeActiveDesktopSystemContextMenu();

  let menu: Menu | undefined;
  let closeTimeout: number | undefined;
  let settled = false;
  let resolveSelection!: (selection: string | null) => void;
  const selection = new Promise<string | null>((resolve) => {
    resolveSelection = resolve;
  });

  const settle = (selected: string | null) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(closeTimeout);
    resolveSelection(selected);
  };

  const dismiss = async () => {
    if (!menu) {
      settle(null);
      return;
    }
    if (activeDesktopSystemContextMenu?.menu === menu) {
      activeDesktopSystemContextMenu = undefined;
    }
    const menuToClose = menu;
    menu = undefined;
    settle(null);
    await menuToClose.close().catch((error) => {
      console.debug("Unable to close system context menu", error);
    });
  };

  const select = (id: string) => {
    settle(id);
    window.setTimeout(() => void dismiss(), 0);
  };

  menu = await Menu.new({
    items: tauriMenuItemsForDesktopSystemContextMenu(request.items, select),
  });
  activeDesktopSystemContextMenu = { menu, dismiss };

  try {
    await menu.popup(new LogicalPosition(request.position.x, request.position.y));
    if (!settled && menu) {
      closeTimeout = window.setTimeout(
        () => void dismiss(),
        DESKTOP_SYSTEM_CONTEXT_MENU_CLOSE_DELAY_MS,
      );
    }
    return await selection;
  } catch (error) {
    await dismiss();
    throw error;
  }
}

/**
 * The OS's own icon for the file at `path` (as Finder shows it) as a PNG data
 * URI, rendered natively at 32×32 px — 2x a 16pt display box, so webview
 * `<img>`s stay sharp on retina displays. `undefined` off macOS or when the
 * icon cannot be encoded.
 */
export async function fileIconDataUri(path: string): Promise<string | undefined> {
  const base64 = await invoke<string | null>("file_icon_png", { path });
  return base64 ? `data:image/png;base64,${base64}` : undefined;
}

async function closeActiveDesktopSystemContextMenu(): Promise<void> {
  await activeDesktopSystemContextMenu?.dismiss();
}

function tauriMenuItemsForDesktopSystemContextMenu(
  spec: DesktopSystemContextMenuRequest["items"],
  select: (id: string) => void,
): TauriMenuItemOptions[] {
  return spec.map((item): TauriMenuItemOptions => {
    if (item.kind === "separator") {
      return { item: "Separator" };
    }

    return {
      text: item.label,
      enabled: item.enabled,
      accelerator: item.accelerator,
      action: () => select(item.id),
    };
  });
}

export async function showDesktopFileTreeContextMenu(
  request: DesktopFileTreeContextMenuRequest,
): Promise<void> {
  const pasteboardHasFiles = desktopFileTreeContextMenuNeedsPasteboard(request)
    ? await fileUrlPasteboardHasFiles()
    : false;
  const fileTreeSpec = buildDesktopFileTreeContextMenuSpec(request, pasteboardHasFiles);
  const genericItems = fileTreeSpecToGenericSpec(fileTreeSpec);

  const selected = await showDesktopContextMenu({
    position: request.position,
    // This path builds its request directly (it does not go through the
    // features-side transport), so it resolves the webview menu theme itself.
    theme: resolveNativeMenuTheme(),
    items: genericItems,
  });
  if (selected === null) return;

  const decoded = decodeFileTreeActionId(selected);
  window.dispatchEvent(
    new CustomEvent<DesktopFileTreeContextMenuActionPayload>(
      DESKTOP_FILE_TREE_CONTEXT_MENU_ACTION_EVENT,
      { detail: { requestId: request.requestId, ...decoded } },
    ),
  );
}

export async function fileUrlPasteboardHasFiles(): Promise<boolean> {
  return await invoke("file_url_pasteboard_has_files");
}

export async function revealPathInFinder(path: string): Promise<void> {
  await invoke("reveal_path_in_finder", { path });
}

export async function writeFileUrlToPasteboard(
  path: string,
  operation: DesktopFilePasteboardOperation,
): Promise<void> {
  await invoke("write_file_url_to_pasteboard", { path, operation });
}

export async function writeImageToPasteboard(path: string): Promise<void> {
  await invoke("write_image_to_pasteboard", { path });
}

export async function writeImageDataToPasteboard(data: string): Promise<void> {
  await invoke("write_image_data_to_pasteboard", { data });
}

export async function writeToClipboard(text: string): Promise<void> {
  try {
    await invoke("write_text_to_pasteboard", { text });
  } catch (error) {
    // The native command currently uses NSPasteboard on macOS. Preserve the
    // browser path on other desktop platforms until they have native bridges.
    if (!navigator.clipboard?.writeText) throw error;
    await navigator.clipboard.writeText(text);
  }
}

export async function trashPath(path: string): Promise<void> {
  await invoke("trash_path", { path });
}

export async function pasteFilesIntoDirectory(
  destination: string,
): Promise<DesktopFilePasteResult> {
  return await invoke("paste_files_into_directory", { destination });
}

export async function listDirectoryTree(
  path: string,
  includeGitIgnored = false,
): Promise<DesktopFileTree> {
  return await invoke("list_directory_tree", { path, includeGitIgnored });
}

export async function listDirectorySubtree(
  rootPath: string,
  relativePath: string,
  includeGitIgnored = false,
): Promise<DesktopFileTree> {
  return await invoke("list_directory_subtree", { rootPath, relativePath, includeGitIgnored });
}

export async function readTextFile(path: string): Promise<DesktopTextFile> {
  return await invoke("read_text_file", { path });
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
async function openExternalUrl(url: string): Promise<void> {
  await invoke("open_external_url", { url });
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
function projectFolderName(path: string): string {
  const trimmed = path.replace(/[\\/]+$/, "");
  return trimmed.split(/[\\/]/).pop() || path;
}

function toHelperJsonRpcError(error: unknown): HelperJsonRpcError {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

function isHelperJsonRpcError(error: unknown): error is HelperJsonRpcError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
