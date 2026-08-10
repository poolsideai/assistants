import type { AnyMessage } from "@agentclientprotocol/sdk";
import type {
  ACPNavConversation,
  ACPNavConversationLiveStatus,
  ACPNavState,
} from "@poolsideai/helperapi/schemas";
import type {
  AcpChatPanelMetadata,
  ActiveFileContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  Configuration,
  Keybindings,
  Language,
  OpenAcpChatOptions,
} from "@poolsideai/rpc";
import type { AssistantError, AssistantResponse } from "@poolsideai/rpc/assistant";
import { randomUUID } from "crypto";
import * as vscode from "vscode";
import { HostRPCServer } from "../rpc/server";
import type { System } from "../system";
import { AcpTabIconProvider, type AcpTabIconStatus } from "./acpTabIcon";
import { getWebviewHtml } from "./getWebviewHtml";

export const POOLSIDE_ACP_CHAT_VIEW_TYPE = "poolside-acp-chat" as const;
export const DEFAULT_AGENT_SERVER = "poolside";

export interface AcpChatPanelState {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agentServer: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agentName?: string;
  agentIconUrl?: string;
  cwd?: string;
  workingDirectories?: string[];
  readOnly?: boolean;
  fallbackCwds?: string[];
}

export interface AcpChatPanelInitialState {
  kind: "pending" | "session";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agentServer?: string;
  sessionId?: string;
  cwd?: string;
  workingDirectories?: string[];
  readOnly?: boolean;
  fallbackCwds?: string[];
}

interface PanelEntry {
  panel: vscode.WebviewPanel;
  rpcServer: HostRPCServer;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agentServer?: string;
  sessionId?: string;
  agentName?: string;
  agentIconUrl?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  sessionTitle?: string;
  lastTouchedAt: number;
  iconRequestId: number;
  disposables: vscode.Disposable[];
}

interface BridgedACPMessage {
  agentServer?: string;
  message?: AnyMessage;
}

type TabStatusKind = AcpTabIconStatus;

const emptyLiveStatus: ACPNavConversationLiveStatus = {
  working: false,
  waitingForUser: false,
  unread: false,
};

function normalizeAgentServer(agentServer: string | undefined): string {
  return agentServer || DEFAULT_AGENT_SERVER;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

function panelTitle(sessionTitle: string | undefined): string {
  if (sessionTitle) return sessionTitle;
  return "Poolside Chat";
}

function agentNameFromServer(agentServer: string): string {
  return agentServer === DEFAULT_AGENT_SERVER ? "Poolside" : agentServer;
}

/**
 * AcpChatPanels owns the per-session ACP chat editor tabs. The sidebar webview
 * never hosts the chat in ACP mode; instead it calls `openAcpChat` on the host
 * which delegates to this manager.
 *
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
 */
export class AcpChatPanels {
  private panels = new Map<string, PanelEntry>();
  private navConversations = new Map<string, ACPNavConversation>();
  private focusInputWhenReady = new Set<string>();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  private latestConfiguration: Configuration | undefined;
  private latestContext: ActiveFileContext | undefined;
  private latestEditorFocused: boolean | undefined;
  private latestFileIconTheme: unknown;
  private latestKeybindings: Keybindings | undefined;
  private latestLanguages: Language[] | undefined;
  private latestTheme: unknown;
  private readonly tabIcons: AcpTabIconProvider;

  constructor(private system: System) {
    this.tabIcons = new AcpTabIconProvider(system);
  }

  async openSession(opts: OpenAcpChatOptions): Promise<void> {
    const agentServer = normalizeAgentServer(opts.agentServer);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (existing) {
      const metadata: AcpChatPanelMetadata = {
        agentServer,
        agentName: opts.agentName,
      };
      if ("agentIconUrl" in opts) {
        metadata.agentIconUrl = opts.agentIconUrl;
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
      existing.panel.reveal();
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
    const panel = vscode.window.createWebviewPanel(
      POOLSIDE_ACP_CHAT_VIEW_TYPE,
      panelTitle(opts.sessionTitle),
      { viewColumn: vscode.ViewColumn.Active },
      {
        retainContextWhenHidden: true,
        enableScripts: true,
      },
    );

    panel.iconPath = this.fallbackIconPathForKind("default");

    const initial: AcpChatPanelInitialState = opts.sessionId
      ? {
          kind: "session",
__POOL_SYNTHETIC_IMPORT_BASELINE__
          agentServer,
          sessionId: opts.sessionId,
          cwd: opts.cwd,
          workingDirectories: cloneStringArray(opts.workingDirectories),
          readOnly: opts.readOnly,
          fallbackCwds: cloneStringArray(opts.fallbackCwds),
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentName: opts.agentName,
      agentIconUrl: opts.agentIconUrl,
      sessionTitle: opts.sessionTitle,
    });
  }

  async focusInput(): Promise<void> {
    const entry = this.mostRecentPanel();
    if (!entry) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      try {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      } catch (error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        throw error;
      }
      return;
    }

    await this.focusEntryInput(entry);
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
    if (!entry) return;
    entry.panel.dispose();
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!entry) return;
    this.replayHostState(entry);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      void this.focusEntryInput(entry);
    }
  }

  setConfiguration(configuration: Configuration): void {
    this.latestConfiguration = configuration;
    this.notifyAll("setConfiguration", [configuration]);
  }

  setContext(context: ActiveFileContext): void {
    this.latestContext = context;
    this.notifyAll("setContext", [context]);
  }

  updatePanelMetadata(conversationId: string, metadata: AcpChatPanelMetadata): void {
    const entry = this.panels.get(conversationId);
    if (!entry) return;

__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (metadata.agentServer !== undefined) {
      entry.agentServer = normalizeAgentServer(metadata.agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }
    if (metadata.agentName !== undefined) {
      entry.agentName = metadata.agentName;
    }
    if ("agentIconUrl" in metadata) {
      entry.agentIconUrl = metadata.agentIconUrl;
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
    this.applyPanelDecorations(entry);
  }

  setEditorFocused(focused: boolean): void {
    this.latestEditorFocused = focused;
    this.notifyAll("setEditorFocused", [focused]);
  }

  setFileIconTheme(theme: unknown): void {
    this.latestFileIconTheme = theme;
    this.notifyAll("setFileIconTheme", [theme]);
  }

  setKeybindings(keybindings: Keybindings): void {
    this.latestKeybindings = keybindings;
    this.notifyAll("setKeybindings", [keybindings]);
  }

  setLanguages(languages: Language[]): void {
    this.latestLanguages = languages;
    this.notifyAll("setLanguages", [languages]);
  }

  setTheme(theme: unknown): void {
    this.latestTheme = theme;
    this.notifyAll("setTheme", [theme]);
  }

  /**
   * Called when the extension observes a successful `session/new` response
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   */
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    agentServer = normalizeAgentServer(agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.navConversations.clear();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    for (const conversation of state.conversations ?? []) {
      if (!conversation.active || conversation.archived) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        continue;
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }

    for (const entry of Array.from(this.panels.values())) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        entry.panel.dispose();
        continue;
      }
      this.applyPanelNavState(entry);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }
  }

  async routeInbound(methodName: string, params: unknown): Promise<unknown> {
    switch (methodName) {
      case "poolside/jsonrpc/notify":
        return this.routeJsonrpcNotify(params);
      case "poolside/jsonrpc/request":
        return this.routeJsonrpcRequest(params);
      case "poolside/acp/serverDidExit":
        return this.routeAgentServerDidExit(params);
      case "poolside/acp/elicitation/create":
        return this.routeElicitation(params);
      case "poolside/acp/approvals/didChange":
        return this.routeApprovalsDidChange(params);
      case "poolside/mcpServers/didChange":
        return this.routeMcpServersDidChange();
    }
  }

  /**
   * Webview panel serializer entrypoint. Rebinds a restored panel back into
__POOL_SYNTHETIC_IMPORT_BASELINE__
   */
  async adoptPanel(panel: vscode.WebviewPanel, state: AcpChatPanelState): Promise<void> {
    const agentServer = normalizeAgentServer(state.agentServer);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      panel.dispose();
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return;
    }

    const initial: AcpChatPanelInitialState = {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentServer,
      sessionId: state.sessionId,
      cwd: state.cwd,
      workingDirectories: cloneStringArray(state.workingDirectories),
      readOnly: state.readOnly,
      fallbackCwds: cloneStringArray(state.fallbackCwds),
    };

    await this.bindPanel(panel, initial, {
      agentName: state.agentName,
      agentIconUrl: state.agentIconUrl,
    });
  }

  disposeAll(): void {
    for (const entry of this.panels.values()) {
      entry.panel.dispose();
    }
    this.panels.clear();
    this.navConversations.clear();
    this.focusInputWhenReady.clear();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  private async bindPanel(
    panel: vscode.WebviewPanel,
    initial: AcpChatPanelInitialState,
    metadata: { agentName?: string; agentIconUrl?: string; sessionTitle?: string } = {},
  ): Promise<void> {
    panel.webview.options = {
      enableScripts: true,
    };

    const rpcServer = new HostRPCServer(this.system, panel.webview, {
      acpChatPanels: this,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    });
    const messageDisposable = panel.webview.onDidReceiveMessage(rpcServer.route.bind(rpcServer));
__POOL_SYNTHETIC_IMPORT_BASELINE__
      panel,
      rpcServer,
__POOL_SYNTHETIC_IMPORT_BASELINE__
      agentServer: initial.agentServer,
      sessionId: initial.sessionId,
      agentName: metadata.agentName,
      agentIconUrl: metadata.agentIconUrl,
      sessionTitle: metadata.sessionTitle,
      lastTouchedAt: Date.now(),
      iconRequestId: 0,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    panel.onDidDispose(() => {
      for (const d of entry.disposables) d.dispose();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (entry.sessionId) {
        void this.setConversationViewState(
          entry.agentServer ?? DEFAULT_AGENT_SERVER,
          entry.sessionId,
          false,
        );
      }
    });

    panel.webview.html = await getWebviewHtml(this.system, panel.webview, "acp-chat", [
      { key: "POOLSIDE_INITIAL_ACP_CHAT_STATE", value: initial },
    ]);
    this.applyPanelNavState(entry);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  private routeJsonrpcNotify(params: unknown): void {
    const { agentServer, message } = unwrapBridgeMessage(params);
    const sessionId = sessionIdFromMessage(message);
    if (sessionId) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (entry) {
        entry.lastTouchedAt = Date.now();
        void this.postToPanel(entry, "jsonrpcNotify", [params]);
        return;
      }
    }

    for (const entry of this.panelsForAgent(agentServer)) {
      void this.postToPanel(entry, "jsonrpcNotify", [params]);
    }
  }

  private async routeJsonrpcRequest(params: unknown): Promise<unknown> {
    const { agentServer, message } = unwrapBridgeMessage(params);
    const sessionId = sessionIdFromMessage(message);
    const entry = sessionId
__POOL_SYNTHETIC_IMPORT_BASELINE__
      : this.mostRecentPanelForAgent(agentServer);
    if (!entry) {
      throw new Error(
        `No ACP chat panel is open for ${agentServer}${sessionId ? `:${sessionId}` : ""}`,
      );
    }

    entry.lastTouchedAt = Date.now();
    return await this.requestFromPanel(entry, "jsonrpcRequest", [params]);
  }

  private routeAgentServerDidExit(params: unknown): void {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      entry.lastTouchedAt = Date.now();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }
  }

  private async routeElicitation(params: unknown): Promise<unknown> {
    const agentServer = agentServerFromParams(params);
    const sessionId = sessionIdFromParams(params);
    const entry = sessionId
__POOL_SYNTHETIC_IMPORT_BASELINE__
      : this.mostRecentPanelForAgent(agentServer);
    if (!entry) {
      throw new Error(
        `No ACP chat panel is open for ${agentServer}${sessionId ? `:${sessionId}` : ""}`,
      );
    }

    entry.lastTouchedAt = Date.now();
    return await this.requestFromPanel(entry, "elicitation", [params]);
  }

  // The helper's pending approval set changed. Every panel receives the full
  // set and reconciles by key — a panel renders entries for its own session
  // inline and holds the rest unbound, so no per-panel filtering is needed.
  private routeApprovalsDidChange(params: unknown): void {
    for (const entry of this.panels.values()) {
      void this.postToPanel(entry, "acpApprovalsDidChange", [params]);
    }
  }

  // The user's MCP connector store changed: every panel re-lists it and
  // re-injects the connector set into its live agent sessions.
  private routeMcpServersDidChange(): void {
    for (const entry of this.panels.values()) {
      void this.postToPanel(entry, "mcpServersDidChange", []);
    }
  }

  private panelsForAgent(agentServer: string): PanelEntry[] {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  }

  private mostRecentPanelForAgent(agentServer: string): PanelEntry | undefined {
    const entries = this.panelsForAgent(agentServer);
    if (entries.length <= 1) return entries[0];
    return [...entries].sort((left, right) => right.lastTouchedAt - left.lastTouchedAt).at(0);
  }

  private mostRecentPanel(): PanelEntry | undefined {
    const entries = Array.from(this.panels.values());
    if (entries.length <= 1) return entries[0];
    return [...entries].sort((left, right) => right.lastTouchedAt - left.lastTouchedAt).at(0);
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
  private async focusEntryInput(entry: PanelEntry): Promise<void> {
    entry.panel.reveal();
    entry.lastTouchedAt = Date.now();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const posted = await this.postToPanel(entry, "focusInput", []);
    if (!posted) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }
  }

  private async postToPanel(
    entry: PanelEntry,
    command: string,
    payload: unknown[],
  ): Promise<boolean> {
    return await entry.panel.webview.postMessage({
      command,
      requestId: randomUUID(),
      payload,
    });
  }

  private notifyAll(command: string, payload: unknown[]): void {
    for (const entry of this.panels.values()) {
      void this.postToPanel(entry, command, payload);
    }
  }

  private replayHostState(entry: PanelEntry): void {
    if (this.latestConfiguration) {
      void this.postToPanel(entry, "setConfiguration", [this.latestConfiguration]);
    }
    if (this.latestContext) {
      void this.postToPanel(entry, "setContext", [this.latestContext]);
    }
    if (this.latestEditorFocused !== undefined) {
      void this.postToPanel(entry, "setEditorFocused", [this.latestEditorFocused]);
    }
    if (this.latestKeybindings) {
      void this.postToPanel(entry, "setKeybindings", [this.latestKeybindings]);
    }
    if (this.latestLanguages) {
      void this.postToPanel(entry, "setLanguages", [this.latestLanguages]);
    }
    if (this.latestTheme !== undefined) {
      void this.postToPanel(entry, "setTheme", [this.latestTheme]);
    }
    if (this.latestFileIconTheme !== undefined) {
      void this.postToPanel(entry, "setFileIconTheme", [this.latestFileIconTheme]);
    }
  }

  private async requestFromPanel(
    entry: PanelEntry,
    command: string,
    payload: unknown[],
  ): Promise<unknown> {
    const requestId = randomUUID();
    const response = new Promise<unknown>((resolve, reject) => {
      const listener = entry.panel.webview.onDidReceiveMessage(
        (event: AssistantResponse | AssistantError) => {
          if (event.payload?.requestId !== requestId) return;
          listener.dispose();
          if ("error" in event.payload && event.payload.error) {
            reject(event.payload.error);
          } else {
            resolve(event.payload.response);
          }
        },
      );
    });

    await entry.panel.webview.postMessage({ command, requestId, payload });
    return await response;
  }

  private applyPanelNavState(entry: PanelEntry): void {
    if (!entry.sessionId) {
      this.applyPanelDecorations(entry);
      return;
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (conversation?.title) {
      entry.sessionTitle = conversation.title;
    }
    if (conversation?.agentServer) {
      entry.agentServer = conversation.agentServer;
      entry.agentName ??= agentNameFromServer(conversation.agentServer);
    }
    this.applyPanelDecorations(entry, conversation?.liveStatus);
  }

  private applyPanelDecorations(
    entry: PanelEntry,
    liveStatus: ACPNavConversationLiveStatus = emptyLiveStatus,
  ): void {
    const kind = tabStatusKind(liveStatus);
    entry.panel.title = panelTitle(entry.sessionTitle);
    this.applyPanelIcon(entry, kind);
  }

  private applyPanelIcon(entry: PanelEntry, kind: TabStatusKind): void {
    const agentServer = normalizeAgentServer(entry.agentServer);
    const agentIconUrl = entry.agentIconUrl;
    const requestId = ++entry.iconRequestId;
    const cachedIconPath = this.tabIcons.cachedIconPathForAgent(agentServer, agentIconUrl, kind);
    if (cachedIconPath) {
      entry.panel.iconPath = cachedIconPath;
      return;
    }

    entry.panel.iconPath = this.fallbackIconPathForKind(kind);
    if (!agentIconUrl || agentServer === DEFAULT_AGENT_SERVER) return;

    void this.tabIcons
      .iconPathForAgent(agentServer, agentIconUrl, kind)
      .then((iconPath) => {
        if (!iconPath) return;
        if (this.panels.get(entry.conversationId) !== entry) return;
        if (entry.iconRequestId !== requestId) return;
        entry.panel.iconPath = iconPath;
      })
      .catch((error) => {
        this.system.telemetry.reportError(
          new Error("failed to update ACP chat tab icon", { cause: error }),
        );
      });
  }

  private fallbackIconPathForKind(kind: TabStatusKind): vscode.WebviewPanel["iconPath"] {
    const iconFile =
      kind === "waiting"
        ? "icon-status-waiting.svg"
        : kind === "working"
          ? "icon-status-working.svg"
          : kind === "unread"
            ? "icon-status-unread.svg"
            : "icon-light.svg";
    const iconUri = vscode.Uri.parse(
      this.system.context.asAbsolutePath(`./dist/resources/${iconFile}`),
    );
    return {
      dark: iconUri,
      light: iconUri,
    };
  }

  private syncPanelViewState(entry: PanelEntry): void {
    if (!entry.sessionId) return;
    void this.setConversationViewState(
      entry.agentServer ?? DEFAULT_AGENT_SERVER,
      entry.sessionId,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  }

  private async setConversationViewState(
    agentServer: string,
    sessionId: string,
    active: boolean,
  ): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    try {
      const { getHelperSingleton } = await import("../helper");
      const client = await getHelperSingleton(this.system);
__POOL_SYNTHETIC_IMPORT_BASELINE__
        agentServer,
        sessionId,
        active,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    } catch (error) {
      this.system.telemetry.reportError(
        new Error("failed to update ACP conversation view state", { cause: error }),
      );
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
}

/**
 * `WebviewPanelSerializer` that rebinds restored ACP chat panels through the
 * shared `AcpChatPanels` instance. Used to survive window reloads.
 */
export class AcpChatPanelSerializer implements vscode.WebviewPanelSerializer {
  constructor(private panels: AcpChatPanels) {}

  async deserializeWebviewPanel(panel: vscode.WebviewPanel, state: unknown): Promise<void> {
    if (!isAcpChatPanelState(state)) {
      panel.dispose();
      return;
    }
    await this.panels.adoptPanel(panel, state);
  }
}

function isAcpChatPanelState(state: unknown): state is AcpChatPanelState {
  return (
    typeof state === "object" &&
    state !== null &&
__POOL_SYNTHETIC_IMPORT_BASELINE__
    typeof (state as AcpChatPanelState).agentServer === "string" &&
__POOL_SYNTHETIC_IMPORT_BASELINE__
      typeof (state as AcpChatPanelState).sessionId === "string") &&
    ((state as AcpChatPanelState).agentName === undefined ||
      typeof (state as AcpChatPanelState).agentName === "string") &&
    ((state as AcpChatPanelState).agentIconUrl === undefined ||
      typeof (state as AcpChatPanelState).agentIconUrl === "string")
  );
}

function unwrapBridgeMessage(payload: unknown): { agentServer: string; message: AnyMessage } {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    (payload as BridgedACPMessage).message
  ) {
    return {
      agentServer: agentServerFromParams(payload),
      message: (payload as BridgedACPMessage).message!,
    };
  }

  return {
    agentServer: DEFAULT_AGENT_SERVER,
    message: payload as AnyMessage,
  };
}

function agentServerFromParams(params: unknown): string {
  if (params && typeof params === "object" && typeof (params as any).agentServer === "string") {
    return (params as any).agentServer || DEFAULT_AGENT_SERVER;
  }
  return DEFAULT_AGENT_SERVER;
}

function sessionIdFromParams(params: unknown): string | undefined {
  if (params && typeof params === "object" && typeof (params as any).sessionId === "string") {
    return (params as any).sessionId;
  }
}

function sessionIdFromMessage(message: AnyMessage): string | undefined {
  const params = "params" in message ? message.params : undefined;
  return sessionIdFromParams(params);
}

function tabStatusKind(status: ACPNavConversationLiveStatus): TabStatusKind {
  if (status.waitingForUser) return "waiting";
  if (status.working) return "working";
  if (status.unread) return "unread";
  return "default";
}

function cloneStringArray(value: readonly string[] | undefined): string[] | undefined {
  return value ? Array.from(value) : undefined;
}
