__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  DESKTOP_OPEN_CONVERSATION_SEARCH_EVENT,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  createACPChatWorkingDirectory,
  getACPGithubRepo,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  newConversationID,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ACPGithubRepository,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type DesktopOpenerInfo,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { SET_CURRENT_CONVERSATION_EVENT } from "../../lib/rpc/server";
import { focusPrompt, focusPromptIfUnchanged } from "../../shared/Helpers";
import { DesktopBottomPanel } from "./desktop/DesktopBottomPanel.svelte";
import type { DesktopNavigationEntry } from "./desktop/DesktopNavigationHistory";
import { DesktopRightSidebar } from "./desktop/DesktopRightSidebar.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  initTauriDragDrop,
  makeTauriDragDropCallbacks,
  type TauriDragDropSubscriber,
} from "./desktop/TauriDragDrop.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const DESKTOP_OPEN_TARGET_OPENER_STORAGE_KEY = "poolside:desktop-open-target-opener-id";
const DESKTOP_CONVERSATION_PANEL_STATE_STORAGE_KEY = "poolside.desktop.conversationPanelState.v1";

interface DesktopConversationPanelState {
  rightSidebarVisible: boolean;
  bottomPanelVisible: boolean;
}

const DEFAULT_CONVERSATION_PANEL_STATE: DesktopConversationPanelState = {
  rightSidebarVisible: false,
  bottomPanelVisible: false,
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  #viewState = new DesktopViewState();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  #conversationPanelStates = $state<Record<string, DesktopConversationPanelState>>(
    readStoredDesktopConversationPanelStates(),
  );
  #desktopRightSidebar = new DesktopRightSidebar({
    isDesktop: () => this.#isDesktop,
    isVisible: () => this.desktopRightSidebarVisible,
  });
  #desktopBottomPanel = new DesktopBottomPanel({
    isDesktop: () => this.#isDesktop,
    isVisible: () => this.desktopBottomPanelVisible,
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  #githubRepo?: ACPGithubRepository;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  #onNavigationChange?: () => void;
  #newConversationGeneration = 0;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // History is still loading with no transcript to show. The composer and
  // shell remain available; only the transcript area displays a loading state.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Navigation must be known before choosing a new target. Loading the
  // currently selected agent session does not prevent opening another draft.
  #isNavigationLoading = $derived.by(
    () => this.#core.acpConversationRepo.refreshState.status === "loading",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // The root project owning the currently visible conversation: the closest project
  // containing the conversation's cwd, with a worktree mapped back to its parent.
  // Undefined when the cwd is outside every known project.
  #currentProject = $derived.by(() => {
    const projects = this.#core.acpProjectRepo.projects;
    const root = resolveDesktopWorkspaceRoot(this.#currentConversationCwd, projects);
    const project = projects.find((candidate) => candidate.path === root);
    if (!project?.isWorktree) return project;
    return projects.find((candidate) => candidate.path === project.parentPath);
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
  // (#shouldWaitForInitialProject). Once they have, a user with no projects lands directly in a
  // fresh chat (#hasNoProjectsOnDesktop drives #bootstrapLaunchChat) rather than a project-scoped
  // conversation. The IDE has an implicit workspace, so both are always false there.
__POOL_SYNTHETIC_IMPORT_BASELINE__
  #hasNoProjectsOnDesktop = $derived.by(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.#core.acpProjectRepo.projects.length === 0,
  );
  #shouldOpenProject = $derived.by(
    () => this.#hasNoProjectsOnDesktop && !this.#activeSession?.isChat,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Guards the async launch-chat bootstrap against re-entrancy while its working directory is
  // being created. A plain field (not $state) so toggling it never re-triggers the effect.
  #creatingLaunchChat = false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  DESKTOP_RIGHT_SIDEBAR_MIN_WIDTH = this.#desktopRightSidebar.DESKTOP_RIGHT_SIDEBAR_MIN_WIDTH;
  DESKTOP_RIGHT_SIDEBAR_MAX_WIDTH = this.#desktopRightSidebar.DESKTOP_RIGHT_SIDEBAR_MAX_WIDTH;
  DESKTOP_BOTTOM_PANEL_MIN_HEIGHT = this.#desktopBottomPanel.DESKTOP_BOTTOM_PANEL_MIN_HEIGHT;
  DESKTOP_BOTTOM_PANEL_MAX_HEIGHT = this.#desktopBottomPanel.DESKTOP_BOTTOM_PANEL_MAX_HEIGHT;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  setDesktopRightSidebarWidth = this.#desktopRightSidebar.setWidth;
  startDesktopRightSidebarResize = this.#desktopRightSidebar.startResize;
  moveDesktopRightSidebarResize = this.#desktopRightSidebar.moveResize;
  stopDesktopRightSidebarResize = this.#desktopRightSidebar.stopResize;
  setDesktopBottomPanelHeight = this.#desktopBottomPanel.setHeight;
  startDesktopBottomPanelResize = this.#desktopBottomPanel.startResize;
  moveDesktopBottomPanelResize = this.#desktopBottomPanel.moveResize;
  stopDesktopBottomPanelResize = this.#desktopBottomPanel.stopResize;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  toggleSidebarCollapsed = this.#viewState.toggleSidebarCollapsed;
  showSettings = () => this.#showView(this.#viewState.showSettings);
  showShortcuts = () => this.#showView(this.#viewState.showShortcuts);
  showModels = () => this.#showView(this.#viewState.showModels);
  showVoice = () => this.#showView(this.#viewState.showVoice);
  showConnectors = () => this.#showView(this.#viewState.showConnectors);
  showGithub = () => this.#showView(this.#viewState.showGithub);
  showAgents = () => this.#showView(this.#viewState.showAgents);
  showArchived = () => this.#showView(this.#viewState.showArchived);
  showRemote = () => this.#showView(this.#viewState.showRemote);
  showSettingsSection = (section: Parameters<DesktopViewState["showSettingsSection"]>[0]) => {
    this.#viewState.showSettingsSection(section);
    this.#onNavigationChange?.();
  };
  showProjectSettings = (path?: string | null) => {
    this.#viewState.showProjectSettings(path);
    this.#onNavigationChange?.();
  };
  showChat = () => this.#showView(this.#viewState.showChat);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  #tauriDragDropSubscriber?: TauriDragDropSubscriber;

  constructor(
    core: Runtime,
    {
      tauriDragDropSubscriber,
      onNavigationChange,
    }: {
      tauriDragDropSubscriber?: TauriDragDropSubscriber;
      onNavigationChange?: () => void;
    } = {},
  ) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.#tauriDragDropSubscriber = tauriDragDropSubscriber;
    this.#onNavigationChange = onNavigationChange;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // and past the desktop project gates. With no projects we drive #bootstrapLaunchChat instead,
    // so this project-scoped bootstrap stays off. See PendingSessionBootstrap for the rest.
__POOL_SYNTHETIC_IMPORT_BASELINE__
      prepareWhileConfigLoading: true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        !this.#hasNoProjectsOnDesktop,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    // With no projects, land the user directly in a ready-to-type chat instead of a "get started"
    // page. Mirrors the project-scoped PendingSessionBootstrap (create an ephemeral session while
    // the target is idle), but a chat needs an async working directory so it lives here. The
    // in-flight guard plus the isChat check keep it to a single chat until one exists; if that chat
    // is later deselected/archived, #activeSession stops being a chat and a fresh one is seeded.
    $effect(() => {
      if (
        !this.#hasNoProjectsOnDesktop ||
        this.#viewState.view !== "chat" ||
        this.#creatingLaunchChat ||
        this.#activeSession?.isChat ||
        this.#core.acpAgentServers.state.status === "loading"
      ) {
        return;
      }
      this.#creatingLaunchChat = true;
      void this.#bootstrapLaunchChat().finally(() => {
        this.#creatingLaunchChat = false;
      });
    });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.#githubRepo = getACPGithubRepo();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Subscribe to Tauri file drag-drop events. The subscriber is injected by the desktop-assistant
    // app (which has access to @tauri-apps/api); non-desktop hosts leave it undefined, making this
    // a no-op. HTML5 drag events are suppressed by Tauri's native handler, so we drive both the
    // drag-over visual affordance and chip insertion through Tauri events instead.
    initTauriDragDrop(
      makeTauriDragDropCallbacks(this.#core, { rpc }),
      this.#tauriDragDropSubscriber,
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
        "searchConversations",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "toggleRightPanel",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        keybindings.register("searchConversations", () => {
          window.dispatchEvent(new CustomEvent(DESKTOP_OPEN_CONVERSATION_SEARCH_EVENT));
        }),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        keybindings.register("toggleRightPanel", () => this.toggleDesktopRightSidebarVisible()),
        keybindings.register("toggleBottomPanel", () => this.toggleDesktopBottomPanelVisible()),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.#desktopRightSidebar.loadSavedState();
      this.#desktopBottomPanel.loadSavedState();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          this.showSettingsSection(section);
__POOL_SYNTHETIC_IMPORT_BASELINE__
          this.showSettings();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const handleSetCurrentConversation = (event: Event) => {
        const conversationId = (event as CustomEvent<{ conversationId?: string }>).detail
          ?.conversationId;
        if (!conversationId) return;
        this.openConversation(conversationId);
      };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.#onNavigationChange?.();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        sessions: this.#core.acpRepo,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      window.addEventListener(SET_CURRENT_CONVERSATION_EVENT, handleSetCurrentConversation);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        window.removeEventListener(SET_CURRENT_CONVERSATION_EVENT, handleSetCurrentConversation);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Focus on selection, without waiting for history. A late history result
    // must never steal focus from the search box, another pane or settings.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (!conversationId || this.#lastFocusedConversationId === conversationId) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return focusPromptIfUnchanged(
        () => this.#viewState.view === "chat" && this.#core.activeConversationId === conversationId,
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  get desktopRightSidebarVisible() {
    return this.#currentConversationPanelState().rightSidebarVisible;
  }
  get desktopRightSidebarWidth() {
    return this.#desktopRightSidebar.width;
  }
  get desktopRightSidebarResizing() {
    return this.#desktopRightSidebar.resizing;
  }
  get desktopBottomPanelVisible() {
    return this.#currentConversationPanelState().bottomPanelVisible;
  }
  get desktopBottomPanelHeight() {
    return this.#desktopBottomPanel.height;
  }
  get desktopBottomPanelResizing() {
    return this.#desktopBottomPanel.resizing;
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
  get initialScreenSettled() {
    const projectStatus = this.#core.acpProjectRepo.refreshState.status;
    const conversationStatus = this.#core.acpConversationRepo.refreshState.status;
    const agentServersStatus = this.#core.acpAgentServers.state.status;
    const statuses = [projectStatus, conversationStatus, agentServersStatus];

    if (statuses.some((status) => status === "failure")) return true;
    if (statuses.some((status) => status !== "success")) return false;
    if (this.#core.acpProjectRepo.projects.length === 0) return true;
    if (this.#bootstrap.sessionError()) return true;
    if (this.#core.acpRepo.agents.authRequiredForAgent(this.#activeConversationAgentServer())) {
      return true;
    }

    const session = this.#activeSession;
    return session !== null && session !== undefined && session.loadState.status !== "loading";
  }
  get initialAgentReady() {
    const agent = this.#activeConversationAgentServer();
    return (
      this.#core.acpAgentServers.state.status === "success" &&
      this.#activeSession != null &&
      !this.#isSessionLoading &&
      !this.#core.acpRepo.agents.isConfigCacheLoadingFor(agent) &&
      !this.#core.acpRepo.agents.authRequiredForAgent(agent) &&
      !this.#core.acpRepo.agents.authInProgressForAgent(agent) &&
      !this.#bootstrap.sessionError()
    );
  }
  // Diagnostic snapshot of every input to initialScreenSettled, consumed by the
  // desktop host's startup-diagnostics probe while the startup frame is
  // visible. Read-only; safe to call from outside the reactive graph.
  startupDiagnosticsSnapshot(): Record<string, unknown> {
    const session = this.#activeSession;
    const agentServer = this.#activeConversationAgentServer();
    let initialScreenSettled: unknown;
    try {
      initialScreenSettled = this.initialScreenSettled;
    } catch (error) {
      initialScreenSettled = `threw: ${String(error)}`;
    }
    let sessionError: unknown;
    try {
      const error = this.#bootstrap.sessionError();
      sessionError =
        error == null ? null : String((error as { message?: unknown }).message ?? error);
    } catch (error) {
      sessionError = `threw: ${String(error)}`;
    }
    return {
      initialScreenSettled,
      view: this.#viewState.view,
      projectStatus: this.#core.acpProjectRepo.refreshState.status,
      conversationStatus: this.#core.acpConversationRepo.refreshState.status,
      agentServersStatus: this.#core.acpAgentServers.state.status,
      projectCount: this.#core.acpProjectRepo.projects.length,
      conversationCount: this.#core.acpConversationRepo.sessions.length,
      hasLoadedProjectsOnce: this.#hasLoadedProjectsOnce,
      isDesktop: this.#isDesktop,
      activeConversationId: this.#core.activeConversationId,
      hasActiveSession: session != null,
      activeSessionLoadState: session?.loadState.status ?? null,
      activeSessionIsChat: session?.isChat ?? null,
      activeSessionAgentSessionId: session?.sessionId ?? null,
      agentServer,
      defaultAgentServer: this.#core.acpRepo.agents.defaultAgentServer,
      authRequired: this.#core.acpRepo.agents.authRequiredForAgent(agentServer),
      configCacheLoading: this.#core.acpRepo.agents.isConfigCacheLoadingFor(agentServer),
      sessionError,
      isBlockingSessionLoading: this.#isBlockingSessionLoading,
    };
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  get desktopChatLayoutKey() {
    return (
      this.#core.activeConversationId ??
      `new:${this.#activeConversationAgentServer()}:${this.#currentConversationCwd}`
    );
  }
  get terminalWorktreePath() {
    return resolveDesktopWorkspaceRoot(
      this.#currentConversationCwd,
      this.#core.acpProjectRepo.projects,
    );
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
  restoreNavigation = (
    entry: Pick<DesktopNavigationEntry, "view" | "projectSettingsPath" | "conversationId">,
  ) => {
    this.#viewState.restore(entry.view, entry.projectSettingsPath);
    this.#core.activeConversationId = entry.conversationId;
  };

__POOL_SYNTHETIC_IMPORT_BASELINE__
    return await this.#createNewConversation(cwd);
  };

  // Seeds an ephemeral chat for the no-projects launch. Unlike handleNewChat it does not persist
  // the pending conversation, so an untouched draft never clutters the sidebar (matching the
  // project-scoped bootstrap); the first prompt persists it like any other conversation.
  async #bootstrapLaunchChat() {
    if (this.#isNavigationLoading) {
      return;
    }
    const previousConversationId = this.#core.activeConversationId;
    const conversationId = newConversationID();
    const cwd = await createACPChatWorkingDirectory(conversationId);
    if (
      this.#viewState.view !== "chat" ||
      this.#core.activeConversationId !== previousConversationId ||
      !this.#hasNoProjectsOnDesktop
    )
      return;
    const agentServer = this.#core.acpRepo.agents.defaultAgentServer;
    const { cwd: protocolCwd } = resolveConversationWorkspaceScope(this.#appStateSnapshot, cwd);
    this.#bootstrap.markPrepared(agentServer, protocolCwd);
    const session = this.#core.acpRepo.createSession(protocolCwd, agentServer, conversationId, {
      isChat: true,
    });
    this.#core.activeConversationId = session.conversationId;
    this.#onNavigationChange?.();
  }

  handleNewChat = async () => {
    if (this.#isNavigationLoading) {
      return null;
    }
    const isCurrent = this.#captureNewConversationRequest();
    const conversationId = newConversationID();
    const cwd = await createACPChatWorkingDirectory(conversationId);
    if (!isCurrent()) return null;
    return await this.#createNewConversation(cwd, { conversationId, isChat: true });
  };

  async #createNewConversation(
    cwd: string,
    options: { conversationId?: string; isChat?: boolean } = {},
  ) {
    if (this.#isNavigationLoading) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const isCurrent = this.#captureNewConversationRequest();
    if (this.#core.acpAgentServers.state.status !== "success") {
      await this.#core.acpAgentServers.refresh();
      if (!isCurrent()) return null;
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
      this.#onNavigationChange?.();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const session = options.isChat
      ? this.#core.acpRepo.createSession(cwd, agentServer, options.conversationId ?? null, {
          isChat: true,
        })
      : this.#core.acpRepo.createSession(cwd, agentServer, options.conversationId ?? null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.#onNavigationChange?.();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
  #captureNewConversationRequest() {
    const generation = ++this.#newConversationGeneration;
    const conversationId = this.#core.activeConversationId;
    const view = this.#viewState.view;
    const projectSettingsPath = this.#viewState.projectSettingsPath;
    // Directory creation and agent discovery can outlive a navigation choice.
    // Also discard older New commands even if the newer one is still waiting.
    return () =>
      generation === this.#newConversationGeneration &&
      conversationId === this.#core.activeConversationId &&
      view === this.#viewState.view &&
      projectSettingsPath === this.#viewState.projectSettingsPath;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  handleActiveConversationIdChange = (id: string | null): string | null => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        this.#onNavigationChange?.();
        return null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const replacementConversationId = this.#core.acpRepo.createSession(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      this.#core.activeConversationId = replacementConversationId;
      this.#onNavigationChange?.();
      return replacementConversationId;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.#onNavigationChange?.();
    return id;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // project owning the visible conversation, then open a conversation in it. No-ops
  // when that project is unknown or not a git repository. The sidebar button keeps
  // the richer optimistic/abortable flow.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const project = this.#currentProject;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Same gate as the sidebar button: disabled only on a confirmed non-repo
    // (undefined = status not loaded yet, let the attempt proceed).
    if (this.#githubRepo?.isRepoFor(project.path) === false) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const openerId = resolveDesktopOpenTargetOpenerId(
      this.#appStateSnapshot.environment.desktopFileOpenerId,
      this.#appStateSnapshot.environment.desktopOpeners,
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Jump to an existing conversation (e.g. the host relaying a clicked
  // notification), leaving any settings view for the chat.
  openConversation = (conversationId: string) => {
    this.#viewState.showChat();
    this.handleActiveConversationIdChange(conversationId);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  setDesktopRightSidebarVisible = (visible: boolean) => {
    this.#setConversationPanelState({ rightSidebarVisible: visible });
  };

  toggleDesktopRightSidebarVisible = () => {
    this.setDesktopRightSidebarVisible(!this.desktopRightSidebarVisible);
  };

  setDesktopBottomPanelVisible = (visible: boolean) => {
    this.#setConversationPanelState({ bottomPanelVisible: visible });
  };

  toggleDesktopBottomPanelVisible = () => {
    this.setDesktopBottomPanelVisible(!this.desktopBottomPanelVisible);
  };

  #currentConversationPanelState(): DesktopConversationPanelState {
    return (
      this.#conversationPanelStates[this.desktopChatLayoutKey] ?? DEFAULT_CONVERSATION_PANEL_STATE
    );
  }

  #setConversationPanelState(next: Partial<DesktopConversationPanelState>) {
    const key = this.desktopChatLayoutKey;
    const current = this.#currentConversationPanelState();
    this.#conversationPanelStates = {
      ...this.#conversationPanelStates,
      [key]: {
        ...current,
        ...next,
      },
    };
    writeStoredDesktopConversationPanelStates(this.#conversationPanelStates);
  }

  #showView(show: () => void) {
    show();
    this.#onNavigationChange?.();
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

function resolveDesktopOpenTargetOpenerId(
  fallbackOpenerId: string | undefined,
  openers: DesktopOpenerInfo[] | undefined,
): string {
  const desktopOpeners = Array.isArray(openers) ? openers : [];
  const storedOpenerId = readStoredDesktopOpenTargetOpenerId();
  if (storedOpenerId && hasDesktopOpener(desktopOpeners, storedOpenerId)) {
    return storedOpenerId;
  }

  if (fallbackOpenerId && hasDesktopOpener(desktopOpeners, fallbackOpenerId)) {
    return fallbackOpenerId;
  }

  return desktopOpeners[0]?.id ?? fallbackOpenerId ?? "default";
}

function hasDesktopOpener(openers: DesktopOpenerInfo[], openerId: string): boolean {
  return openers.some((opener) => opener.id === openerId);
}

function readStoredDesktopOpenTargetOpenerId(): string | null {
  try {
    return globalThis.localStorage?.getItem(DESKTOP_OPEN_TARGET_OPENER_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function readStoredDesktopConversationPanelStates(): Record<string, DesktopConversationPanelState> {
  try {
    const value = globalThis.localStorage?.getItem(DESKTOP_CONVERSATION_PANEL_STATE_STORAGE_KEY);
    if (!value) return {};

    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const states: Record<string, DesktopConversationPanelState> = {};
    for (const [key, state] of Object.entries(parsed)) {
      if (!key || !state || typeof state !== "object" || Array.isArray(state)) continue;
      states[key] = {
        rightSidebarVisible:
          (state as Partial<DesktopConversationPanelState>).rightSidebarVisible === true,
        bottomPanelVisible:
          (state as Partial<DesktopConversationPanelState>).bottomPanelVisible === true,
      };
    }
    return states;
  } catch {
    return {};
  }
}

function writeStoredDesktopConversationPanelStates(
  states: Record<string, DesktopConversationPanelState>,
) {
  try {
    globalThis.localStorage?.setItem(
      DESKTOP_CONVERSATION_PANEL_STATE_STORAGE_KEY,
      JSON.stringify(states),
    );
  } catch {
    // Best-effort UI preference persistence.
  }
}
