__POOL_SYNTHETIC_IMPORT_BASELINE__
  DeleteSecretOutput,
  DeleteSecretParams,
  GetSecretOutput,
  GetSecretParams,
  ListSecretsOutput,
  ListSecretsParams,
  UpsertSecretOutput,
  UpsertSecretParams,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
interface LineRange {
  start: number;
  end: number;
  confidence?: number;
}

/**
 * Host encodes all RPC methods that can be sent from a webview to a host
 */
export interface Host {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  getFileContents(path: string): Promise<AttachedFile | undefined>;
  getFileIconDefinition(iconName: string): Promise<string | undefined>;
  getImageFileData(path: string): Promise<ImageFileData | undefined>;
  getPromptContext: () => Promise<PromptContextFacet[]>;
  getUrlContents(url: string): Promise<AttachedUrl | undefined>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  jsonrpcNotify(methodName: string, params: object): Promise<void>;
  openExternalURL: (url: string) => void;
  openFile: (path: string, line?: number, column?: number) => void;
  /**
   * Reveals the host editor's native source-control (git) view. Backs the
   * conversation "Review" bar on VS Code, which has no in-webview changes
   * view. A no-op on hosts without a native SCM view (desktop has its own
   * changes view; mobile has none yet) — those never call it.
   */
  revealSourceControl(): void;
  selectProjectFolder(): Promise<ProjectFolder | undefined>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  saveTextFile(options: SaveTextFileOptions): Promise<string | undefined>;
  openWorkspace(path: string): Promise<void>;
  addFolderToWorkspace(path: string): Promise<void>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  openSettings(setting?: string): void;
  openTerminal(command?: string, cwd?: string): void;
  listAssistantTerminals(worktreePath: string): Promise<AssistantTerminalTab[]>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    commandMode?: AssistantTerminalCommandMode,
    cwd?: string,
    /**
     * Initial PTY size measured from the pane that will display the terminal.
     * Spawning at the real size lets the shell paint its first prompt at the
     * correct width, so no compensating clear (with its visible `^L` flash)
     * is needed. Hosts fall back to 80×24 when omitted.
     */
    cols?: number,
    rows?: number,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  deleteAssistantTerminal(terminalId: string): Promise<void>;
  writeAssistantTerminal(terminalId: string, data: string): Promise<void>;
  clearAssistantTerminal(terminalId: string): Promise<void>;
  resizeAssistantTerminal(terminalId: string, cols: number, rows: number): Promise<void>;
  closeAssistantTerminalsForWorktree(worktreePath: string): Promise<void>;
  closeAssistantTerminalsForProject(projectPath: string): Promise<void>;
  ready(): void;
  reportError(error: ErrorObject): void;
  reportEvent(name: TelemetryEventInputEventType, data: TelemetryEventInputMetadata): void;
  setACPAgentServers(agentServers: ACPAgentServers, defaultAgentServer?: string): Promise<void>;
  openAcpChat(opts: OpenAcpChatOptions): Promise<void>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  updateAcpChatPanelMetadata(metadata: AcpChatPanelMetadata): void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  upsertSecret(upsertSecretParams: UpsertSecretParams): Promise<UpsertSecretOutput>;
  deleteSecret(deleteSecretParams: DeleteSecretParams): Promise<DeleteSecretOutput>;
  listSecrets(listSecretsParams: ListSecretsParams): Promise<ListSecretsOutput>;
  getSecret(getSecretParams: GetSecretParams): Promise<GetSecretOutput>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  warning = "warning",
}

export const INFO_MESSAGE_EVENT = "poolside:info-message";

/**
 * HostClient is the interface which should be implemented to communicate with the RPC Host process
 */
export type HostClient = Client<Host>;

type HostMessages = Messages<Host>;
export type HostMessage = HostMessages[keyof HostMessages];

export interface AttachedFile {
  path?: string;
  content?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  selectedCode?: string;
  visibleRange?: LineRange;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  cursorLine?: number;
}

export interface ImageFileData {
  data: string;
  mimeType: string;
  path: string;
}

export interface SaveTextFileOptions {
  contents: string;
  defaultFileName?: string;
  title?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
}

export interface ActiveFileContext {
  workspaces: WorkspaceFolder[];
  // Resolved by the host so webviews can render paths relative to the actual
  // user profile without guessing from a platform-specific path shape.
  homeDirectory?: string;
  // Working directory the assistant should use when no folder is open.
  // Computed by the host (e.g. extension) since only it can resolve $HOME.
  defaultCwd?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  url: string;
  title?: string;
  content: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__

export interface ACPAgentServerConfig {
  type?: "custom" | "registry" | "local";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  binary?: Record<string, ACPAgentServerBinaryDistribution>;
  default_config_options?: Record<string, string>;
  /**
   * Config option ids whose default the user pinned explicitly. Pinned keys
   * keep their `default_config_options` value: the last-used auto-follow
   * skips them until they are unpinned.
   */
  pinned_config_options?: string[];
}

export interface ACPAgentServerBinaryDistribution {
  archive: string;
  sha256?: string;
  cmd: string;
  args?: string[];
  env?: Record<string, string>;
}

export type ACPAgentServers = Record<string, ACPAgentServerConfig>;

/**
 * OpenAcpChatOptions controls the host's `openAcpChat` RPC.
 *
__POOL_SYNTHETIC_IMPORT_BASELINE__
 *   creates the single "pending" chat panel (the empty agent-picker state).
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * - `agentName` and `sessionTitle` are used to set the editor tab title.
 */
export interface OpenAcpChatOptions {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agentServer?: string;
  sessionId?: string;
  agentName?: string;
  agentIconUrl?: string;
  sessionTitle?: string;
  cwd?: string;
  workingDirectories?: string[];
  /** Open the conversation for inspection only (archived conversations). */
  readOnly?: boolean;
  /** Cwds to retry session/load with when `cwd` no longer exists. */
  fallbackCwds?: string[];
}

export interface AcpChatPanelMetadata {
  agentServer?: string;
  agentName?: string;
  agentIconUrl?: string;
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
export interface Configuration {
  uri: string;
  themeOverride: string | null;
  wrapLines: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // boolean only feature flags, matching the server-side features.
  // These are pre-processed to allow us to specify full "poolside.boolFeatures.foo"
  // keys, but end up with a single object, where all non-booleans are dropped.
  // VSCode only currently
  boolFeatures?: {
    [name: string]: boolean;
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  agentServers?: ACPAgentServers;
  acpAgentServers?: ACPAgentServers;
}

export interface WorkspaceFolder {
  path: string;
  name: string;
  index: number;
}

export interface ProjectFolder {
  path: string;
  name: string;
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
export type AssistantTerminalCommandMode = "interactive" | "nonInteractive";

export interface AssistantTerminalTab {
  id: string;
  title: string;
  cwd: string;
  worktreePath: string;
  createdAt: string;
  exitCode?: number;
  buffer?: string;
}

export interface AssistantTerminalUpdate {
  terminalId: string;
  title?: string;
  cwd?: string;
}

export type TelemetryEventInputEventType =
  (typeof TelemetryEventInputEventType)[keyof typeof TelemetryEventInputEventType];

export const TelemetryEventInputEventType = {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  file_opened: "file_opened",
  selection_changed: "selection_changed",
  file_edited: "file_edited",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
} as const;

export type TelemetryEventInputMetadata = { [key: string]: unknown };

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export interface SearchFile {
  path: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /** Exact query text to use when drilling into this row. */
  navigationPath?: string;
  /** Virtual rows are UI navigation targets, not real files to insert/open. */
  virtualKind?: "workspace-folder";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /** A user-friendly form of the path (e.g. `~/Documents/x` or workspace-relative)
   *  computed by the server based on how the query was phrased. Used for chip
   *  tooltips so users see the same shape they typed.
   */
  displayPath?: string;
}

export interface CodeSymbolResponse {
  symbols: CodeSymbol[];
}

export interface CodeSymbol {
  name: string;
  kind: CodeSymbolKind;
}

export type CodeSymbolKind = "type" | "code" | "value";

export type Keybindings = Record<string, string | undefined>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  kind: EnrichedContextKind;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export enum EnrichedContextKind {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  iconDefinitions?: Record<string, string>; // iconName -> SVG/img string
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
