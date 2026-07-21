__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { affectsConfiguration, getPoolsideConfigurationSection } from "./api/configuration";
import * as apiProposals from "./apiProposals";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { getPoolsideConfig } from "./configuration";
import { sendActiveFileContext } from "./context";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { configureExtensionIdentity, POOLSIDE } from "./extensionIdentity";
import { getHelperSingleton, initializeHelperClient, updateHelperConfig } from "./helper";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { getInitialKeybindings } from "./state";
import { createStatusBarItem } from "./statusBar";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { TelemetryLogger } from "./telemetry/TelemetryLogger";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { AcpChatPanelSerializer, POOLSIDE_ACP_CHAT_VIEW_TYPE } from "./views/acpChatPanels";
__POOL_SYNTHETIC_IMPORT_BASELINE__

/**
 * Pre-activation state, i.e. set before doActivate
 */
let telemetry: TelemetryLogger;
let system: System;

/**
 * Activate the extension on launch
 * @param context
 */
export async function activate(context: vscode.ExtensionContext) {
  configureExtensionIdentity(context.extension.id);

  telemetry = new TelemetryLogger();
__POOL_SYNTHETIC_IMPORT_BASELINE__

  try {
    await doActivate(system);
  } catch (error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
}

async function doActivate(system: System) {
  initializeHelperClient(system);

  system.context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(
      POOLSIDE_ACP_CHAT_VIEW_TYPE,
      new AcpChatPanelSerializer(system.acpChatPanels),
    ),
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
    system.acpChatPanels.setEditorFocused(state.focused);
__POOL_SYNTHETIC_IMPORT_BASELINE__

  vscode.workspace.onDidChangeConfiguration((e) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  // Commands
  registerCommand("newConversation", () => openNewConversation(system));
  registerCommand("focusInput", () => focusInput(system));
  registerCommand("togglePlanMode", () => {
    system.acpChatPanels.togglePlanModeOnActivePanel();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  registerCommand("showSidebar", () => system.assistant.showSidebar());

  // Always-visible launch affordance; the editor title button needs an open document
  system.context.subscriptions.push(createStatusBarItem());

  registerCommand("openPermissionSettings", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  registerCommand("openSettings", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  registerCommand("resetConfiguration", (_this) => {
    const workspaceConfig = getPoolsideConfigurationSection();

    if (!workspaceConfig) {
      return;
    }

    Object.keys(workspaceConfig).forEach((key) => {
      // read or modify the config
      const result = workspaceConfig.inspect(key);
      if (result) {
        workspaceConfig.update(key, undefined, vscode.ConfigurationTarget.WorkspaceFolder);
        workspaceConfig.update(key, undefined, vscode.ConfigurationTarget.Workspace);
        workspaceConfig.update(key, undefined, vscode.ConfigurationTarget.Global);
      }
    });
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
  }

  // start poolside Helper
__POOL_SYNTHETIC_IMPORT_BASELINE__
    telemetry.reportError(new Error("failed to start poolside Helper", { cause: err }));

    vscode.window.showErrorMessage(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  });

  system.context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
      if (e.contentChanges.length > 0) {
        system.decorationProvider.deleteInserts(e.document.uri.fsPath);
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
  );

  system.context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(() => {
      debouncedSendActiveFileContext(system);
      system.decorationProvider.applyInserts();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  );

  // Notify the webview when the user updates their keybindings
__POOL_SYNTHETIC_IMPORT_BASELINE__
  shortcutWatcher.on("all", sendKeybindings);
  system.context.subscriptions.push({ dispose: () => shortcutWatcher.close() });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const serializedLanguages = serializeLanguages(languages);
    system.assistant.rpc.setLanguages(serializedLanguages);
    system.acpChatPanels.setLanguages(serializedLanguages);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  executeSetContextCommand(`${POOLSIDE}.webviewFocus`, false);
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  system.acpChatPanels.setFileIconTheme(theme);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  system.acpChatPanels.setTheme(theme);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Handle the configuration change event which is fired when the user changes their settings
 * @param e
 */
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if (e.affectsConfiguration(POOLSIDE)) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    system.acpChatPanels.setConfiguration(poolsideConfig);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  if (affectsConfiguration(e, "poolside.showKeybindings")) {
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
    affectsConfiguration(e, "poolside.codeFontSize")
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

async function sendKeybindings() {
  const keybindings = await getInitialKeybindings();
  system.assistant.rpc.setKeybindings(keybindings);
  system.acpChatPanels.setKeybindings(keybindings);
}

/**
 * Deactivate the extension on close
 */
export async function deactivate() {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  await helper.sendNotification("shutdown");
  await helper.sendNotification("exit");
  await system.deactivate();
}

async function openNewConversation(system: System) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

async function focusInput(system: System) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}
