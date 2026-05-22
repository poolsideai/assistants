import { runtime, toJsonrpcMethod } from "./orval/clientHelpers";

// --- GitHub awareness (poolside/github/*) ---
//
// Hand-written bindings: the helper exposes these via methods/github.go. They
// are kept here rather than in gen/api.ts so they survive codegen runs.

export type GitHubPRState = "none" | "draft" | "open" | "merged" | "closed";
export type GitHubChecksStatus = "none" | "pending" | "success" | "failure";
export type GitHubReviewDecision = "approved" | "changes_requested" | "review_required" | "";

export interface GitHubChecks {
  status: GitHubChecksStatus;
  total: number;
  passed: number;
  failed: number;
  pending: number;
}

export interface GitHubPRStatus {
  state: GitHubPRState;
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  reviewDecision: GitHubReviewDecision;
  checks: GitHubChecks;
  commentCount: number;
  updatedAt: string;
}

export interface GitHubWorktreeStatus {
  path: string;
  branch: string;
  supported: boolean;
  // Whether the path is inside a git work tree at all. Optional so older
  // helpers that omit it keep working; treat absent as unknown.
  isRepo?: boolean;
  status: GitHubPRStatus;
}

export interface GitHubWorktreeStatusesParams {
  paths: string[];
}

export interface GitHubWorktreeStatusesOutput {
  statuses: GitHubWorktreeStatus[];
  configured: boolean;
}

export interface GitHubCheckRun {
  name: string;
  status: string;
  conclusion: string;
  url: string;
}

export interface GitHubComment {
  author: string;
  body: string;
  url: string;
  createdAt: string;
}

export interface GitHubReview {
  author: string;
  state: string;
  body: string;
  url: string;
  createdAt: string;
}

export interface GitHubPRDetail extends GitHubPRStatus {
  body: string;
  author: string;
  baseRefName: string;
  headRefName: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  checkRuns: GitHubCheckRun[];
  reviews: GitHubReview[];
  comments: GitHubComment[];
}

export interface GitHubPRDetailParams {
  path: string;
}

export interface GitHubPRDetailOutput {
  detail?: GitHubPRDetail;
  configured: boolean;
  repoSupported: boolean;
  branch: string;
}

export interface GitHubAuthStatusOutput {
  source: "cli" | "token" | "none";
  login: string;
  host: string;
  ghInstalled: boolean;
  hasStoredToken: boolean;
}

export interface GitHubSetTokenParams {
  token: string;
}

export interface GitHubPRUrlParams {
  path: string;
}

export interface GitHubPRUrlOutput {
  url: string;
  exists: boolean;
}

export async function poolsideGithubWorktreeStatuses(
  params: GitHubWorktreeStatusesParams,
): Promise<GitHubWorktreeStatusesOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/github/worktreeStatuses"), params);
}

export async function poolsideGithubPrDetail(
  params: GitHubPRDetailParams,
): Promise<GitHubPRDetailOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/github/prDetail"), params);
}

export async function poolsideGithubAuthStatus(): Promise<GitHubAuthStatusOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/github/authStatus"), {});
}

export async function poolsideGithubSetToken(params: GitHubSetTokenParams): Promise<void> {
  await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/github/setToken"), params);
}

export async function poolsideGithubPrUrl(params: GitHubPRUrlParams): Promise<GitHubPRUrlOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/github/prUrl"), params);
}

// --- Approvals (poolside/acp/approvals/*) ---
//
// Hand-written bindings for the helper-owned pending-approval state
// (pkg/poolside-helper/internal/handler/approvals). Permission prompts and
// elicitations are pushed to every surface as a reconciled set via the
// poolside/acp/approvals/didChange notification; these bindings pull the boot/
// reconnect snapshot and answer one approval.

export type ACPApprovalKind = "permission" | "elicitation";

/** ACP session/request_permission content, verbatim (SDK ToolCallUpdate / PermissionOption shapes). */
export interface ACPApprovalPermission {
  toolCall: unknown;
  options: unknown;
}

export interface ACPApprovalElicitation {
  sessionId?: string;
  mode: "form" | "url";
  message: string;
  elicitationId: string;
  requestedSchema?: unknown;
  url?: string;
  _meta?: Record<string, unknown>;
}

/** One pending approval, identified everywhere by (agentServer, sessionId, kind, id). */
export interface ACPApproval {
  agentServer: string;
  sessionId: string;
  kind: ACPApprovalKind;
  /** toolCallId for permissions, elicitationId for elicitations. */
  id: string;
  permission?: ACPApprovalPermission;
  elicitation?: ACPApprovalElicitation;
  createdAt?: string;
}

/** didChange payload and list output: the complete pending set. */
export interface ACPApprovalsDidChangeParams {
  pending: ACPApproval[];
}

export interface ACPApprovalsRespondParams {
  agentServer: string;
  sessionId: string;
  kind: ACPApprovalKind;
  id: string;
  optionId?: string;
  overrideRules?: string[];
  action?: "accept" | "decline" | "cancel";
  content?: Record<string, unknown>;
}

export type ACPApprovalRespondOutcome = "accepted" | "already_resolved" | "invalid";

export interface ACPApprovalsRespondOutput {
  outcome: ACPApprovalRespondOutcome;
}

export async function poolsideAcpApprovalsList(): Promise<ACPApprovalsDidChangeParams> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/acp/approvals/list"), {});
}

export async function poolsideAcpApprovalsRespond(
  params: ACPApprovalsRespondParams,
): Promise<ACPApprovalsRespondOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/acp/approvals/respond"), params);
}

export interface GitHubLinksParams {
  path: string;
}

export interface GitHubLinksOutput {
  supported: boolean;
  branch: string;
  repoUrl: string;
  pullsUrl: string;
  issuesUrl: string;
  prUrl: string;
  prExists: boolean;
}

export async function poolsideGithubLinks(params: GitHubLinksParams): Promise<GitHubLinksOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/github/links"), params);
}

export interface GitHubFetchImageParams {
  url: string;
}

export interface GitHubFetchImageOutput {
  dataUri: string;
  ok: boolean;
}

export async function poolsideGithubFetchImage(
  params: GitHubFetchImageParams,
): Promise<GitHubFetchImageOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/github/fetchImage"), params);
}

// The GitHub status color mode is persisted in the acpNav settings DB (like the
// file opener and keybindings) so it survives across machines/reinstalls.
export interface ACPNavGithubColorModeState {
  colorMode: string;
}

export async function poolsideAcpNavGetGithubColorMode(): Promise<ACPNavGithubColorModeState> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/acpNav/getGithubColorMode"), {});
}

export async function poolsideAcpNavSetGithubColorMode(params: {
  colorMode: string;
}): Promise<ACPNavGithubColorModeState> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/acpNav/setGithubColorMode"), params);
}

// --- Voice input (poolside/voiceInput/*) ---
//
// Hand-written bindings for the helper's local Whisper speech-to-text; the
// helper types live in methods/voice_input.go.

export type VoiceInputRuntimeStatus = "unavailable" | "stopped" | "running";

export type VoiceInputDownloadStatus = "downloading" | "completed" | "failed" | "cancelled";

export interface VoiceInputModel {
  id: string;
  name: string;
  multilingual?: boolean;
  recommended?: boolean;
  default?: boolean;
  selected?: boolean;
  downloaded: boolean;
  downloadBytes?: number;
  localPath?: string;
}

export interface VoiceInputDownloadState {
  modelId: string;
  status: VoiceInputDownloadStatus;
  bytesDownloaded?: number;
  bytesTotal?: number;
  bytesPerSecond?: number;
  etaSeconds?: number;
  error?: string;
}

export interface VoiceInputState {
  supported: boolean;
  unavailableReason?: string;
  ready: boolean;
  modelsDirectory: string;
  selectedModelId: string;
  models: VoiceInputModel[];
  runtime: VoiceInputRuntimeStatus;
  download?: VoiceInputDownloadState;
}

export interface VoiceInputTranscribeParams {
  /** Base64-encoded audio; 16 kHz mono PCM16 WAV. */
  audio: string;
  mimeType?: string;
  /** Two-letter language hint; empty auto-detects. */
  language?: string;
}

export interface VoiceInputTranscribeResult {
  text: string;
}

export async function poolsideVoiceInputGetState(): Promise<VoiceInputState> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/voiceInput/getState"), {});
}

export async function poolsideVoiceInputSetModel(params: {
  modelId: string;
}): Promise<VoiceInputState> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/voiceInput/setModel"), params);
}

export async function poolsideVoiceInputDownloadModel(params: {
  modelId?: string;
}): Promise<VoiceInputState> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/voiceInput/downloadModel"), params);
}

export async function poolsideVoiceInputCancelDownload(params: {
  modelId?: string;
}): Promise<VoiceInputState> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/voiceInput/cancelDownload"), params);
}

export async function poolsideVoiceInputDeleteModel(params: {
  modelId: string;
}): Promise<VoiceInputState> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/voiceInput/deleteModel"), params);
}

export async function poolsideVoiceInputTranscribe(
  params: VoiceInputTranscribeParams,
): Promise<VoiceInputTranscribeResult> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/voiceInput/transcribe"), params);
}

// --- Conversation view state (poolside/acpNav/setConversationViewState) ---
//
// Hand-written variant of the generated binding: the generated schema lags
// the helper's `reset` field, which drops every view-state entry this client
// connection reported before applying the update (sent on the first report
// after a webview boot).

export interface ConversationViewStateParams {
  agentServer: string;
  sessionId: string;
  active: boolean;
  reset?: boolean;
}

export async function poolsideAcpNavReportConversationViewState(
  params: ConversationViewStateParams,
): Promise<void> {
  await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/acpNav/setConversationViewState"), params);
}

// --- Remote access administration (poolside/remoteAccess/*) ---
//
// Hand-written bindings for the desktop settings surface (methods defined in
// pkg/poolside-helper/methods/remote_access.go). Primary-client only: the
// remote-access deny list blocks these for paired devices.

export interface RemoteAccessDevice {
  id: string;
  name: string;
  createdAt: string;
  lastSeenAt?: string;
  connected: boolean;
}

export interface RemoteAccessTLSInfo {
  mode: "trusted" | "localCA" | "plainHttp";
  warning?: string;
  caUrl?: string;
}

export interface RemoteAccessTailscaleInfo {
  cliInstalled: boolean;
  interfaceUp: boolean;
  backendState?: string;
  dnsName?: string;
  httpsEnabled: boolean;
  certCached: boolean;
  error?: string;
}

export interface RemoteAccessPendingPairing {
  id: string;
  deviceName: string;
  createdAt: string;
  expiresAt: string;
}

export interface RemoteAccessStatus {
  enabled: boolean;
  bind?: string;
  port?: number;
  urls?: string[];
  autoStart?: boolean;
  autoStartBind?: string;
  devices: RemoteAccessDevice[];
  pendingPairings?: RemoteAccessPendingPairing[];
  connectedClients: number;
  tls?: RemoteAccessTLSInfo;
  tailscale?: RemoteAccessTailscaleInfo;
}

export interface RemoteAccessPairingCode {
  code: string;
  expiresAt: string;
  urls?: string[];
}

export async function poolsideRemoteAccessStatus(): Promise<RemoteAccessStatus> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/remoteAccess/status"), {});
}

export async function poolsideRemoteAccessEnable(params: {
  bind?: string;
  port?: number;
}): Promise<RemoteAccessStatus> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/remoteAccess/enable"), params);
}

export async function poolsideRemoteAccessDisable(): Promise<RemoteAccessStatus> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/remoteAccess/disable"), {});
}

export async function poolsideRemoteAccessSetAutoStart(params: {
  autoStart: boolean;
  bind?: string;
}): Promise<RemoteAccessStatus> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/remoteAccess/setAutoStart"), params);
}

export async function poolsideRemoteAccessCreatePairingCode(): Promise<RemoteAccessPairingCode> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/remoteAccess/createPairingCode"), {});
}

export async function poolsideRemoteAccessConfirmPairing(params: {
  pairingId: string;
  code: string;
}): Promise<RemoteAccessStatus> {
  return await runtime.jsonrpcCall(
    toJsonrpcMethod("/poolside/remoteAccess/confirmPairing"),
    params,
  );
}

export async function poolsideRemoteAccessRevokeDevice(params: {
  deviceId: string;
}): Promise<RemoteAccessStatus> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/remoteAccess/revokeDevice"), params);
}

// --- Git working tree (poolside/git/*) ---
//
// Hand-written bindings for the helper's local git operations backing the
// desktop Changes panel; the helper types live in methods/git.go.

export type GitFileChangeStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "copied"
  | "typechange"
  | "untracked"
  | "unmerged"
  | "unknown";

export interface GitFileChange {
  path: string;
  origPath?: string;
  status: GitFileChangeStatus;
}

export interface GitStatusOutput {
  isRepo: boolean;
  /** True when isRepo is false because the git binary is not installed. */
  gitMissing?: boolean;
  branch: string;
  detached: boolean;
  /** Remote tracking branch (e.g. "origin/main"), absent when none is set. */
  upstream?: string;
  ahead: number;
  behind: number;
  staged: GitFileChange[];
  unstaged: GitFileChange[];
  untracked: GitFileChange[];
  stashCount: number;
  /** Total added lines vs HEAD (staged + unstaged + untracked, binary files excluded). */
  additions: number;
  /** Total deleted lines vs HEAD (staged + unstaged + untracked, binary files excluded). */
  deletions: number;
}

export interface GitStatusParams {
  path: string;
}

export async function poolsideGitStatus(params: GitStatusParams): Promise<GitStatusOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/status"), params);
}

export interface GitDiffFileParams {
  path: string;
  file: string;
  staged?: boolean;
  untracked?: boolean;
  /**
   * HEAD-vs-worktree diff (staged + unstaged combined), e.g. for editor
   * gutter decorations. Takes precedence over staged.
   */
  head?: boolean;
}

export interface GitDiffFileOutput {
  patch: string;
  binary: boolean;
  /** True when oldContent/newContent carry the full before/after contents. */
  hasContents?: boolean;
  /** Full base-side file content (enables expanding unmodified lines). */
  oldContent?: string;
  /** Full result-side file content (enables expanding unmodified lines). */
  newContent?: string;
}

export async function poolsideGitDiffFile(params: GitDiffFileParams): Promise<GitDiffFileOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/diffFile"), params);
}

export type GitDiffScope = "uncommitted" | "staged" | "unstaged";

export interface GitDiffFileSummary {
  path: string;
  origPath?: string;
  status: GitFileChangeStatus;
  statsReady?: boolean;
  additions?: number;
  deletions?: number;
  binary?: boolean;
}

export interface GitDiffStats {
  files: number;
  additions: number;
  deletions: number;
  fileStats?: GitDiffFileStats[];
}

export interface GitDiffFileStats {
  path: string;
  additions?: number;
  deletions?: number;
  binary?: boolean;
}

export interface GitDiffOpenParams {
  path: string;
  scope?: GitDiffScope;
  /** File to make immediately available when opening from a changed-file row. */
  targetPath?: string;
}

export interface GitDiffOpenOutput {
  unavailable?: boolean;
  gitMissing?: boolean;
  sessionId: string;
  files: GitDiffFileSummary[];
  nextCursor?: string;
  complete: boolean;
  target?: GitDiffFileSummary;
  stats?: GitDiffStats;
}

export async function poolsideGitDiffOpen(params: GitDiffOpenParams): Promise<GitDiffOpenOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/diffOpen"), params);
}

export interface GitDiffListParams {
  sessionId: string;
  cursor?: string;
}

export interface GitDiffListOutput {
  files: GitDiffFileSummary[];
  nextCursor?: string;
  complete: boolean;
  stats?: GitDiffStats;
}

export async function poolsideGitDiffList(params: GitDiffListParams): Promise<GitDiffListOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/diffList"), params);
}

export interface GitDiffChunk {
  patch: string;
  rows: number;
  additions: number;
  deletions: number;
  /** Number of @@ sections in patch, for row-height estimates. */
  hunks?: number;
  binary?: boolean;
  truncatedLines?: number;
}

export interface GitDiffReadParams {
  sessionId: string;
  file: string;
  cursor?: string;
}

export interface GitDiffReadOutput {
  chunk?: GitDiffChunk;
  nextCursor?: string;
  complete: boolean;
}

export async function poolsideGitDiffRead(params: GitDiffReadParams): Promise<GitDiffReadOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/diffRead"), params);
}

export interface GitDiffContentsParams {
  sessionId: string;
  file: string;
}

export interface GitDiffContentsOutput {
  /** True when oldContent/newContent carry the full before/after contents. */
  hasContents?: boolean;
  /** Full base-side content for the snapshot's scope. */
  oldContent?: string;
  /** Full result-side content for the snapshot's scope. */
  newContent?: string;
}

export async function poolsideGitDiffContents(
  params: GitDiffContentsParams,
): Promise<GitDiffContentsOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/diffContents"), params);
}

export interface GitDiffStatsOutput {
  ready: boolean;
  stats?: GitDiffStats;
}

export async function poolsideGitDiffStats(params: {
  sessionId: string;
}): Promise<GitDiffStatsOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/diffStats"), params);
}

export async function poolsideGitDiffClose(params: { sessionId: string }): Promise<void> {
  await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/diffClose"), params);
}

export interface GitStageParams {
  path: string;
  files: string[];
}

export async function poolsideGitStage(params: GitStageParams): Promise<GitStatusOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/stage"), params);
}

export async function poolsideGitUnstage(params: GitStageParams): Promise<GitStatusOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/unstage"), params);
}

export interface GitDiscardParams {
  path: string;
  files?: string[];
  untrackedFiles?: string[];
}

export async function poolsideGitDiscard(params: GitDiscardParams): Promise<GitStatusOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/discard"), params);
}

export interface GitCommitParams {
  path: string;
  message: string;
}

export async function poolsideGitCommit(params: GitCommitParams): Promise<GitStatusOutput> {
  return await runtime.jsonrpcCall(toJsonrpcMethod("/poolside/git/commit"), params);
}
