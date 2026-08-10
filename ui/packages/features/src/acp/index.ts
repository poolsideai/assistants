export { DEFAULT_AGENT_SERVER, LOCAL_AGENT_SERVER, normalizeAgentServerName } from "./agentServers";
export {
  ASSISTANT_CONFIG_DISPLAY_PATH,
  canOpenAssistantConfigFile,
  openAssistantConfigFile,
} from "./assistantConfig";
export { createACPChatWorkingDirectory } from "./chatWorkspaces";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { default as AssistantTerminalView } from "./components/AssistantTerminalView.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type {
  ChatPaneChrome,
  ChatPaneSidebarChrome,
  ChatPaneTerminalChrome,
  OpenExternalTerminal,
} from "./components/chat/chatPaneChrome";
export {
  DESKTOP_OPEN_CONVERSATION_SEARCH_EVENT,
  DESKTOP_OPEN_DIFF_TAB_EVENT,
  type DesktopNewTabAvailability,
  type DesktopOpenDiffTabEventDetail,
} from "./components/chat/desktopCommandPicker";
export {
  NATIVE_MENU_SET_DEFAULT_EVENT,
  showDesktopContextMenu,
  type DesktopContextMenuRequest,
  type DesktopContextMenuSpecItem,
  type NativeMenuSetDefaultPayload,
} from "./components/chat/desktopContextMenu";
export {
  requestDesktopFilePromptChip,
  requestDesktopImageAttachment,
  type DesktopImageAttachmentEventDetail,
} from "./components/chat/desktopFilePromptChip";
export {
  buildDesktopFileTreeContextMenuSpec,
  buildOpenInContextMenuSpec,
  decodeFileTreeActionId,
  desktopFileTreeContextMenuNeedsPasteboard,
  encodeFileTreeActionId,
  fileTreeSpecToGenericSpec,
  type DesktopFileTreeContextMenuOpener,
  type DesktopFileTreeContextMenuRequest,
  type DesktopFileTreeContextMenuSpecItem,
} from "./components/chat/desktopFilesTreeContextMenu";
export type { DesktopFileViewerPanelProps } from "./components/chat/desktopFileViewerPanel";
export {
  buildDesktopImageContextMenuItems,
  performDesktopImageContextMenuAction,
  type DesktopImageContextMenuRPC,
  type DesktopImageContextMenuState,
  type DesktopImageData,
  type PerformDesktopImageContextMenuActionOptions,
} from "./components/chat/desktopImageContextMenu";
export {
  readStoredWorktreeSetupSurface,
  terminalPlacementForWorktreeSetupSurface,
  writeStoredWorktreeSetupSurface,
  type DesktopWorktreeSetupSurface,
} from "./components/chat/desktopLayoutPersistence";
export type {
  DesktopSplitNavigationLocation,
  DesktopSplitNavigationRequest,
} from "./components/chat/desktopNavigation";
export {
  desktopRenderedImageTarget,
  imageFromContextMenuEvent,
  loadRenderedImageData,
  showDesktopRenderedImageContextMenu,
  type DesktopRenderedImageTarget,
} from "./components/chat/desktopRenderedImageContextMenu";
export {
  DESKTOP_SPLITS_CACHE_LIMIT,
  DesktopSplitsCache,
  terminalIdsForDesktopSplitsEntry,
  type DesktopSplitsEntry,
} from "./components/chat/desktopSplitsCache";
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type { DesktopSystemContextMenuRequest } from "./components/chat/desktopSystemContextMenu";
export { default as ElicitationPrompt } from "./components/chat/elicitation/ElicitationPrompt.svelte";
export {
  parseGitGutterDecorations,
  type GitGutterDecorations,
  type GitGutterRange,
} from "./components/chat/gitGutterDecorations";
export { agentIconUrl, agentName, isClaudeAgent } from "./components/chat/menus/config/agentConfig";
export { resolveNativeMenuTheme } from "./components/chat/nativeMenuTheme";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { default as DesktopSettingsView } from "./components/DesktopSettingsView.svelte";
export { default as DesktopSideBar } from "./components/DesktopSideBar.svelte";
export { default as AcpHandoffConfirmationProvider } from "./components/HandoffConfirmationProvider.svelte";
export { default as IDESideBar } from "./components/IDESideBar.svelte";
export { default as MobileSideBar } from "./components/MobileSideBar.svelte";
export { default as ProjectSettingsView } from "./components/ProjectSettingsView.svelte";
export { default as SessionEventsRenderer } from "./components/SessionEventsRenderer.svelte";
export { default as DesktopProjectSettingsIndex } from "./components/settings/DesktopProjectSettingsIndex.svelte";
export { default as DesktopProjectSettingsView } from "./components/settings/DesktopProjectSettingsView.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  DESKTOP_SETTINGS_NAV_SECTIONS,
  DESKTOP_SETTINGS_SECTIONS,
  IDE_SETTINGS_SECTIONS,
  SETTINGS_HEADINGS,
  SETTINGS_NAV_ITEMS,
  type DesktopSettingsNavSection,
  type DesktopSettingsSection,
  type SettingsSection,
} from "./components/settings/settingsSections";
export {
  AcpSidebarController,
  type ConversationRowState,
  type SidebarLiveStatus,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { sidebarToasts, type SidebarToast } from "./components/sidebar/sidebarToastsState.svelte";
export type {
  NativeConfirmationRequest,
  NativeErrorRequest,
} from "./components/ui/nativeConfirmation";
export { default as StreamingIndicator } from "./components/ui/StreamingIndicator.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { createACPConnection } from "./createACPConnection";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type { DesktopOpenerInfo } from "./desktopOpeners";
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { extractErrorMessage } from "./errors";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  getACPAgentRegistryContext,
  getACPAgentRegistryRepo,
  setACPAgentRegistryContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  getACPAgentServersContext,
  getACPAgentServersRepo,
  setACPAgentServersContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  ACPAgentUpdateRepository,
  getACPAgentUpdateContext,
  getACPAgentUpdateRepo,
  setACPAgentUpdateContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type {
  ACPAgentUpdate,
  ACPAgentUpdateProgress,
  ACPAgentUpdateStage,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  ACPConversationRepositoryWriter,
  getACPConversationRepo,
  setACPConversationContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { DESKTOP_GIT_CHANGED_EVENT } from "./features/DesktopGitChangesState.svelte";
export {
  ACPGithubRepositoryWriter,
  getACPGithubRepo,
  setACPGithubContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { AggregatedSessionListSource } from "./features/HistoryRepository.svelte";
export {
  ACPLocalHistoryRepositoryWriter,
  getACPLocalHistoryRepo,
  setACPLocalHistoryContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  ACPProjectRepositoryWriter,
  getACPProjectRepo,
  setACPProjectContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  getACPContext,
  getACPSessionRepo,
  setACPContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  AcpSetupScriptOutputRepositoryWriter,
  getACPSetupScriptOutputRepo,
  setACPSetupScriptOutputContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type {
  AcpSetupScriptOutput,
  AcpSetupScriptOutputRepository,
  AcpSetupScriptOutputStatus,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export { getUserMCPServersRepo } from "./features/UserMCPServersRepository.svelte";
export {
  ACPWorktreeRepositoryWriter,
  createACPWorktreeRepository,
  createAssistantTerminalCommandRunner,
  getACPWorktreeRepo,
  setACPWorktreeContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type {
  ACPWorktreeCommandRunner,
  ACPWorktreeRepository,
  AssistantTerminalCommandRunnerOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
export {
  GITHUB_COLOR_MODES,
  githubChecksCountLabel,
  githubCommentsCountLabel,
  githubDotColorClass,
  githubPRActionLabel,
  githubReviewDecisionLabel,
  githubStatusCategory,
  githubStatusSummary,
} from "./github/githubStatus";
export type {
  GitHubCheckRun,
  GitHubChecks,
  GitHubColorMode,
  GitHubComment,
  GitHubPRDetail,
  GitHubPRStatus,
  GitHubReview,
  GitHubStatusCategory,
  GitHubWorktreeStatus,
} from "./github/githubStatus";
export {
  CODEX_GOAL_CONTROL_METHOD,
  parseClaudeGoalUpdate,
  parseCodexGoalUpdate,
  type ACPClaudeGoalUpdate,
  type ACPGoalState,
  type ACPGoalStatus,
} from "./goals";
export * from "./hostAdapter";
export {
  rpc as acpHostRpc,
  createHelperApiClient,
  initializeStatefulModule as initializeACPHostRpc,
} from "./hostRpc";
export type { HelperAPIClient, HostMessageSender, RPCClient } from "./hostRpc";
export { POOLSIDE_ROUNDEL_ICON_URL } from "./localAgentIcon";
export { markdownHost } from "./markdownHost";
export {
  ACP_DESKTOP_CONVERSATIONS_EVENT,
  countAttentionConversations,
  isACPChatConversation,
  newConversationID,
} from "./navTypes";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACPConversationsState,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type { ACPTransport } from "./RPCTransport";
export type { ACPResolvedSessionInfo } from "./sessionInfo";
export { spoolsideSlotForWorktree, spoolsideSlotMobileUrl } from "./spoolsideMobile";
export type { MobileSpoolsideInstance, MobileSpoolsideSlot } from "./spoolsideMobile";
export { wireACPHistorySync } from "./wireACPHistorySync";
export { wireACPSessionSync } from "./wireACPSessionSync";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACP_CHAT_WORKSPACE_PATH,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  acpSessionWorkspacePath,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
