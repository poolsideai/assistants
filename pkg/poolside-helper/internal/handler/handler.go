__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/approvals"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/localinference"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	githandler "github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/git"
	githubhandler "github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/github"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/remoteaccess"
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/remoteterminal"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/voiceinput"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// N.B. please put new sets of handlers in their own packages, e.g. a new handler/$foo package (see git and acpnav for implementation).
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// protects mutable fields below.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// methods that should not inherit the default request deadline
	noDeadlineMethods map[string]struct{}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	huma                huma.API
	schemaMu            sync.Mutex
	schemaRegistrations []func(huma.API)
	cachedFS            overlayFs
__POOL_SYNTHETIC_IMPORT_BASELINE__
	docLocks map[string]*sync.Mutex
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// fan-out of helper->client traffic to remote access clients
	remoteHub    *remoteaccess.Hub
	remoteAccess *remoteaccess.Server
	// sequenced live session events for stamping, fan-out, and cursor resume
	sessionLog *remoteaccess.SessionLog
	// helper-side PTYs for remote (mobile) clients
	remoteTerminals *remoteterminal.Manager

__POOL_SYNTHETIC_IMPORT_BASELINE__
	acpProxyHandler            *acpproxy.Handler
	acpNavHandler              *acpnav.Server
	fileSearchHandler          *filesearch.Server
	localInferenceHandler      *localinference.Server
	voiceInputHandler          *voiceinput.Server
	secretsHandler             *secretshandler.Server
	githubHandler              *githubhandler.Server
	gitHandler                 *githandler.Server
__POOL_SYNTHETIC_IMPORT_BASELINE__
	clientSupportsWatchedFiles bool
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func New() *PoolsideHandler {
	handler := newHandlerBaseState()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.SearchFilesParams{}.MethodName(),
		Description: methods.SearchFilesParams{}.Description(),
	}, handler.fileSearchHandler.Search)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.MCPOAuthCallbackParams{}.MethodName(),
		Description: "Complete a pending MCP OAuth flow with a deep-link redirect callback URL",
	}, handler.MCPOAuthCallback)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.UpsertSecretParams{}.MethodName(),
		Description: methods.UpsertSecretParams{}.Description(),
	}, handler.secretsHandler.UpsertSecret)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.DeleteSecretParams{}.MethodName(),
		Description: methods.DeleteSecretParams{}.Description(),
	}, handler.secretsHandler.DeleteSecret)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ListSecretsParams{}.MethodName(),
		Description: methods.ListSecretsParams{}.Description(),
	}, handler.secretsHandler.ListSecrets)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GetSecretParams{}.MethodName(),
		Description: methods.GetSecretParams{}.Description(),
	}, handler.secretsHandler.GetSecret)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitHubWorktreeStatusesParams{}.MethodName(),
		Description: methods.GitHubWorktreeStatusesParams{}.Description(),
	}, handler.githubHandler.WorktreeStatuses)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitHubPRDetailParams{}.MethodName(),
		Description: methods.GitHubPRDetailParams{}.Description(),
	}, handler.githubHandler.PRDetail)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitHubAuthStatusParams{}.MethodName(),
		Description: methods.GitHubAuthStatusParams{}.Description(),
	}, handler.githubHandler.AuthStatus)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitHubSetTokenParams{}.MethodName(),
		Description: methods.GitHubSetTokenParams{}.Description(),
	}, handler.githubHandler.SetToken)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitHubPRURLParams{}.MethodName(),
		Description: methods.GitHubPRURLParams{}.Description(),
	}, handler.githubHandler.PRUrl)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitHubLinksParams{}.MethodName(),
		Description: methods.GitHubLinksParams{}.Description(),
	}, handler.githubHandler.Links)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitHubFetchImageParams{}.MethodName(),
		Description: methods.GitHubFetchImageParams{}.Description(),
	}, handler.githubHandler.FetchImage)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitStatusParams{}.MethodName(),
		Description: methods.GitStatusParams{}.Description(),
	}, handler.gitHandler.Status)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiffFileParams{}.MethodName(),
		Description: methods.GitDiffFileParams{}.Description(),
	}, handler.gitHandler.DiffFile)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiffOpenParams{}.MethodName(),
		Description: methods.GitDiffOpenParams{}.Description(),
	}, handler.gitHandler.DiffOpen)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiffListParams{}.MethodName(),
		Description: methods.GitDiffListParams{}.Description(),
	}, handler.gitHandler.DiffList)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiffReadParams{}.MethodName(),
		Description: methods.GitDiffReadParams{}.Description(),
	}, handler.gitHandler.DiffRead)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiffContentsParams{}.MethodName(),
		Description: methods.GitDiffContentsParams{}.Description(),
	}, handler.gitHandler.DiffContents)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiffStatsParams{}.MethodName(),
		Description: methods.GitDiffStatsParams{}.Description(),
	}, handler.gitHandler.DiffStats)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiffCloseParams{}.MethodName(),
		Description: methods.GitDiffCloseParams{}.Description(),
	}, handler.gitHandler.DiffClose)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitStageParams{}.MethodName(),
		Description: methods.GitStageParams{}.Description(),
	}, handler.gitHandler.Stage)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitUnstageParams{}.MethodName(),
		Description: methods.GitUnstageParams{}.Description(),
	}, handler.gitHandler.Unstage)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitDiscardParams{}.MethodName(),
		Description: methods.GitDiscardParams{}.Description(),
	}, handler.gitHandler.Discard)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.GitCommitParams{}.MethodName(),
		Description: methods.GitCommitParams{}.Description(),
	}, handler.gitHandler.Commit)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.LocalInferenceGetStateMethod,
		Description: "returns local on-device inference state and catalog",
	}, handler.localInferenceHandler.GetState)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.LocalInferenceSetDefaultModelMethod,
		Description: "updates the default local on-device model",
	}, handler.localInferenceHandler.SetDefaultModel)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.LocalInferenceSearchModelsMethod,
		Description: "searches Hugging Face for installable local on-device models",
	}, handler.localInferenceHandler.SearchModels)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.LocalInferenceDownloadModelMethod,
		Description: "starts downloading a local on-device model",
	}, handler.localInferenceHandler.DownloadModel)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.LocalInferenceCancelDownloadMethod,
		Description: "cancels the download of a local on-device model",
	}, handler.localInferenceHandler.CancelDownload)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.LocalInferenceDeleteModelMethod,
		Description: "deletes a local on-device model from disk",
	}, handler.localInferenceHandler.DeleteModel)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.LocalInferenceUnloadModelMethod,
		Description: "releases the model resident in the local sidecar's memory",
	}, handler.localInferenceHandler.UnloadModel)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavListMethod,
		Description: "lists locally pinned ACP projects, worktrees, and active conversations",
	}, handler.ACPNavList)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavCreateChatMethod,
		Description: "creates the XDG state working directory for a chat session",
	}, handler.acpNavHandler.CreateChat)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavUpsertProjectMethod,
		Description: "adds or updates a locally known ACP project or worktree",
	}, handler.ACPNavUpsertProject)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavRenameProjectMethod,
		Description: "renames a locally known ACP project or worktree",
	}, handler.acpNavHandler.RenameProject)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavSetProjectCollapsedMethod,
		Description: "updates the locally persisted collapsed state for an ACP project",
	}, handler.acpNavHandler.SetProjectCollapsed)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavReorderProjectsMethod,
		Description: "updates the locally persisted order for root ACP projects",
	}, handler.acpNavHandler.ReorderProjects)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavReorderWorktreesMethod,
		Description: "updates the locally persisted order for a project's worktrees",
	}, handler.acpNavHandler.ReorderWorktrees)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavGetProjectSettingsMethod,
		Description: "gets setup and teardown scripts for an ACP project",
	}, handler.acpNavHandler.GetProjectSettings)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavSetProjectSettingsMethod,
		Description: "updates setup and teardown scripts for an ACP project",
	}, handler.acpNavHandler.SetProjectSettings)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavPrepareWorktreeMethod,
		Description: "reserves a name for the next ACP worktree without touching the filesystem or database",
	}, handler.ACPNavPrepareWorktree)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavReleasePreparedWorktreeMethod,
		Description: "releases a name previously reserved by prepareWorktree",
	}, handler.ACPNavReleasePreparedWorktree)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavCreateWorktreeMethod,
		Description: "creates a git worktree for an ACP project and stores it locally",
	}, handler.ACPNavCreateWorktree)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavRemoveProjectMethod,
		Description: "removes an ACP project and its worktrees/conversations from local navigation state",
	}, handler.ACPNavRemoveProject)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavRemoveWorktreeMethod,
		Description: "removes a git worktree from disk and from local ACP navigation state",
	}, handler.ACPNavRemoveWorktree)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavUpsertConversationMethod,
		Description: "adds or restores a conversation in the locally active ACP navigation list",
	}, handler.acpNavHandler.UpsertConversation)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavPrepareConversationHandoffMethod,
		Description: "durably freezes the current ACP session leg before handing a conversation to another agent",
	}, handler.acpNavHandler.PrepareConversationHandoff)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavAbortConversationHandoffMethod,
		Description: "discards an uncommitted ACP conversation handoff",
	}, handler.acpNavHandler.AbortConversationHandoff)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavGetConversationHistoryMethod,
		Description: "loads completed ACP agent legs for a conversation",
	}, handler.acpNavHandler.GetConversationHistory)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavRestoreConversationMethod,
		Description: "restores an archived ACP conversation and recreates its project entry",
	}, handler.acpNavHandler.RestoreConversation)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavArchiveConversationMethod,
		Description: "archives a conversation from the locally active ACP navigation list",
	}, handler.acpNavHandler.ArchiveConversation)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavRenameConversationMethod,
		Description: "renames a conversation in local ACP navigation state",
	}, handler.acpNavHandler.RenameConversation)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavDeleteConversationMethod,
		Description: "deletes conversations with a matching ACP session from local navigation state",
	}, handler.acpNavHandler.DeleteConversation)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavListAgentServersMethod,
		Description: "lists locally enabled ACP agent servers",
	}, handler.ACPNavListAgentServers)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavCheckAgentRuntimesMethod,
		Description: "reports whether the runtimes registry ACP agent distributions launch through are available",
	}, handler.CheckACPNavAgentRuntimes)

	registerExtensionMethodNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPNavInstallAgentServerMethod,
		Description: "downloads and unpacks registry ACP agent server assets before enabling the server",
	}, handler.InstallACPNavAgentServer)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavSetAgentServersMethod,
		Description: "replaces the locally enabled ACP agent servers",
	}, handler.SetACPNavAgentServers)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavGetConfigCacheMethod,
		Description: "gets cached ACP session configuration options for an agent server",
	}, handler.acpNavHandler.GetConfigCache)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavUpsertConfigCacheMethod,
		Description: "updates cached ACP session configuration options for an agent server",
	}, handler.acpNavHandler.UpsertConfigCache)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavSetConversationViewStateMethod,
		Description: "updates transient editor view state for an ACP conversation",
	}, handler.acpNavHandler.SetConversationViewState)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavGetFileOpenerMethod,
		Description: "gets the user's preferred desktop file opener",
	}, handler.acpNavHandler.GetFileOpener)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavSetFileOpenerMethod,
		Description: "updates the user's preferred desktop file opener",
	}, handler.acpNavHandler.SetFileOpener)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavGetKeybindingsMethod,
		Description: "gets the user's desktop keyboard-shortcut overrides",
	}, handler.acpNavHandler.GetKeybindings)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavSetKeybindingsMethod,
		Description: "updates the user's desktop keyboard-shortcut overrides",
	}, handler.acpNavHandler.SetKeybindings)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavGetGithubColorModeMethod,
		Description: "gets the user's worktree status color mode",
	}, handler.acpNavHandler.GetGithubColorMode)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPNavSetGithubColorModeMethod,
		Description: "updates the user's worktree status color mode",
	}, handler.acpNavHandler.SetGithubColorMode)

	publishClientSideTypes(handler, methods.ACPNavDidChangeMethod, methods.ACPNavDidChangeParams{},
		"notifies the client when ACP navigation state changes")

	publishClientSideTypes(handler, methods.LocalInferenceDidChangeMethod, methods.LocalInferenceDidChangeParams{},
		"notifies the client when local on-device inference state changes")

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// ACP proxy methods
	registerUnserializedExtensionMethodUntypedNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPInitializeMethod,
		Description: "initializes the ACP agent subprocess",
	}, handler.acpProxyHandler.Initialize)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPRestartServerMethod,
		Description: "restarts the ACP agent subprocess",
	}, handler.acpProxyHandler.RestartServer)

	registerUnserializedExtensionMethodUntypedNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPAuthenticateMethod,
		Description: "authenticates with the ACP agent using a previously advertised auth method",
	}, handler.acpProxyHandler.Authenticate)

	registerUnserializedExtensionMethodUntypedNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPLogoutMethod,
		Description: "logs out of the ACP agent's current authenticated state",
	}, handler.acpProxyHandler.Logout)

	// NewSession, LoadSession, and ResumeSession can take well over the default 5s serialized
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		Method:      methods.ACPNewSessionMethod,
		Description: "creates a new ACP session",
	}, handler.acpProxyHandler.NewSession)

__POOL_SYNTHETIC_IMPORT_BASELINE__
		Method:      methods.ACPLoadSessionMethod,
		Description: "loads an existing ACP session",
	}, handler.acpProxyHandler.LoadSession)

	registerUnserializedExtensionMethodUntypedNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPResumeSessionMethod,
		Description: "resumes an existing ACP session without replaying its transcript",
	}, handler.acpProxyHandler.ResumeSession)

	registerExtensionMethodUntyped(handler, JSONRPCOperation{
		Method:      methods.ACPListSessionsMethod,
		Description: "lists ACP sessions",
	}, handler.acpProxyHandler.ListSessions)

	registerUnserializedExtensionMethodUntypedNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPPromptMethod,
		Description: "sends a prompt to the ACP agent subprocess",
	}, handler.acpProxyHandler.Prompt)

	registerUnserializedExtensionMethodUntypedNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPSteerMethod,
		Description: "steers an ongoing ACP agent turn through its native extension",
	}, handler.acpProxyHandler.Steer)

	registerUnserializedExtensionMethodUntyped(handler, JSONRPCOperation{
		Method:      methods.ACPCodexGoalControlMethod,
		Description: "pauses or clears a Codex goal through its native extension",
	}, handler.acpProxyHandler.CodexGoalControl)

	registerUnserializedExtensionMethodUntyped(handler, JSONRPCOperation{
		Method:      methods.ACPCancelMethod,
		Description: "cancels an ongoing ACP operation",
	}, handler.acpProxyHandler.Cancel)

	registerUnserializedExtensionMethodUntyped(handler, JSONRPCOperation{
		Method:      methods.ACPSetModeMethod,
		Description: "changes the ACP session mode",
	}, handler.acpProxyHandler.SetMode)

	registerUnserializedExtensionMethodUntyped(handler, JSONRPCOperation{
		Method:      methods.ACPSetConfigOptionMethod,
		Description: "sets a session config option",
	}, handler.acpProxyHandler.SetConfigOption)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPCloseSessionMethod,
		Description: "closes an ACP session's agent-side resources, keeping it reopenable",
	}, handler.acpProxyHandler.CloseSession)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPRenameSessionMethod,
		Description: "renames an ACP session when the agent supports the extension",
	}, handler.acpProxyHandler.RenameSession)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPMCPSettingsMethod,
		Description: "returns MCP settings for an ACP session",
	}, handler.acpProxyHandler.MCPSettings)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPMCPSetServerDisabledMethod,
		Description: "enables or disables an MCP server for an ACP session",
	}, handler.acpProxyHandler.MCPSetServerDisabled)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPMCPDeleteSecretsMethod,
		Description: "deletes stored MCP secrets for an ACP session",
	}, handler.acpProxyHandler.MCPDeleteSecrets)

	registerUnserializedExtensionMethodUntypedNoDeadline(handler, JSONRPCOperation{
		Method:      methods.ACPMCPAuthenticateMethod,
		Description: "authenticates an MCP server for an ACP session",
	}, handler.acpProxyHandler.MCPAuthenticate)

	registerExtensionMethod(handler, JSONRPCOperation{
		Method:      methods.ACPMCPSetInputVariableMethod,
		Description: "sets an MCP input variable for an ACP session",
	}, handler.acpProxyHandler.MCPSetInputVariable)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		"publishes the response schema for ACP elicitation requests")

	// Approvals: helper-owned pending permission prompts / elicitations.
	// respond must be concurrent — it is answered while the agent's prompt
	// (and the approval-holding request) is still in flight.
	registerUnserializedExtensionMethodUntyped(handler, JSONRPCOperation{
		Method:      methods.ACPApprovalsRespondMethod,
		Description: "answers one pending approval; first valid answer wins",
	}, handler.acpProxyHandler.RespondApproval)
	registerUnserializedExtensionMethodUntyped(handler, JSONRPCOperation{
		Method:      methods.ACPApprovalsListMethod,
		Description: "returns the current pending approval set",
	}, handler.acpProxyHandler.ListApprovals)
	publishClientSideTypes(handler, methods.ACPApprovalsDidChangeMethod, methods.ACPApprovalsDidChangeParams{},
		"pushes the full pending approval set to every surface on change")
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	publishClientSideTypes(handler, methods.ACPTurnEndedMethod, methods.ACPTurnEndedNotification{},
		"notifies every surface that an ACP turn has ended")
	publishClientSideTypes(handler, methods.MCPServersDidChangeParams{}.MethodName(), methods.MCPServersDidChangeParams{},
		"notifies every surface that the user's MCP connector set changed")

	setupRemoteAccess(handler)
	setupRemoteTerminal(handler)
	setupVoiceInput(handler)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func newHandlerBaseState() *PoolsideHandler {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		noDeadlineMethods: make(map[string]struct{}),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		docLocks: map[string]*sync.Mutex{},
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		remoteHub: remoteaccess.NewHub(),

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		acpNavHandler:         acpnav.NewServer(),
		localInferenceHandler: localinference.NewServer(),
		voiceInputHandler:     voiceinput.NewServer(),
		secretsHandler:        secretshandler.NewServer(),
		githubHandler:         githubhandler.NewServer(http.DefaultClient),
		gitHandler:            githandler.NewServer(),
		mcpServersHandler:     mcpservers.NewServer(),
__POOL_SYNTHETIC_IMPORT_BASELINE__
	h.fileSearchHandler = filesearch.NewServer(h.searchFileWorkspaceFolders)
	h.acpNavHandler.SetStateFilter(h.acpNavStateForHost)
	h.mcpServersHandler.SetDeepLinkOAuthCapable(func() bool {
		h.mx.Lock()
		defer h.mx.Unlock()
		return h.config != nil && h.config.ClientCapabilities.MCPOAuthDeepLink
	})
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// Reuse the Hugging Face MCP connector's OAuth token for Hugging Face API
	// requests (e.g. downloading gated models that require TOS acceptance).
	h.localInferenceHandler.SetHuggingFaceTokenSource(h.mcpServersHandler.HuggingFaceTokenSource())
	h.localInferenceHandler.SetHuggingFaceTokenInvalidator(h.mcpServersHandler.InvalidateHuggingFaceToken)

	h.acpProxyHandler = acpproxy.NewHandler(
		func() acpproxy.HandlerConfig {
			cfg := acpproxy.HandlerConfig{
				AgentServers: h.activeACPAgentServers(context.Background()),
			}
			if folders := h.GetWorkspaceFolders(); len(folders) > 0 {
				cfg.WorkingDir = uriToPath(string(folders[0].URI))
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
			cfg.AgentServerEnvProvider = h.localInferenceHandler.AgentServerEnv
			cfg.AgentServerReady = h.localInferenceHandler.AgentServerReady

			return cfg
		},
		h.ReadFile,
		h.acpNavHandler,
	)
__POOL_SYNTHETIC_IMPORT_BASELINE__
	h.sessionLog = remoteaccess.NewSessionLog(h.remoteHub)
	h.acpProxyHandler.SetSessionEvents(&sessionEventSink{log: h.sessionLog, hub: h.remoteHub})

	// Pending approvals are helper-owned state: every change pushes the full
	// set to all surfaces (primary + remotes), which reconcile by key — so
	// reconnects and late joins are idempotent instead of re-raced.
	approvalStore := approvals.NewStore()
	approvalStore.SetNotifier(func(pending []methods.ACPApproval) {
		if pending == nil {
			pending = []methods.ACPApproval{}
		}
		h.remoteHub.NotifyAll(methods.ACPApprovalsDidChangeMethod, methods.ACPApprovalsDidChangeParams{Pending: pending})
	})
	h.acpProxyHandler.SetApprovals(approvalStore)

	// The connector store is shared on disk across helper instances, but change
	// listeners are in-memory per client — broadcast every mutation, and watch
	// the store for other instances' writes, so every surface re-injects its
	// live agent sessions with the current connector set.
	h.mcpServersHandler.SetChangeNotifier(func() {
		h.remoteHub.NotifyAll(methods.MCPServersDidChangeParams{}.MethodName(), methods.MCPServersDidChangeParams{})
	})
	h.cleanupFns = append(h.cleanupFns, h.mcpServersHandler.WatchStoreForExternalChanges())

	// Models placed in the local models directory outside the app download
	// flow are only discovered by a state read; watch the directory so they
	// reach every client without waiting for one (PE-2474).
	h.cleanupFns = append(h.cleanupFns, h.localInferenceHandler.WatchModelsDirectory())

	h.remoteTerminals = remoteterminal.NewManager(h.remoteHub.NotifyClient)
	h.cleanupFns = append(h.cleanupFns, h.remoteTerminals.Close)

	h.cleanupFns = append(h.cleanupFns, h.acpProxyHandler.Close)
	h.cleanupFns = append(h.cleanupFns, h.acpNavHandler.Close)
	h.cleanupFns = append(h.cleanupFns, h.localInferenceHandler.Close)
	h.cleanupFns = append(h.cleanupFns, h.voiceInputHandler.Close)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	h.schemaMu.Lock()
	defer h.schemaMu.Unlock()
	if h.huma == nil {
		h.huma = humachi.New(chi.NewMux(), huma.DefaultConfig("poolside helper", "0.1.0"))
		for _, register := range h.schemaRegistrations {
			register(h.huma)
		}
		h.schemaRegistrations = nil
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Runtime dispatch needs only typed handlers. Build documentation schemas on
// first OpenAPI access (including development validation), not every launch.
func (h *PoolsideHandler) registerSchema(register func(huma.API)) {
	h.schemaMu.Lock()
	defer h.schemaMu.Unlock()
	if h.huma == nil {
		h.schemaRegistrations = append(h.schemaRegistrations, register)
	} else {
		register(h.huma)
	}
}

// all method calls go via Handle (primary stdio/TCP client) or HandleRemote
// (authenticated remote access clients).
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if h.remoteHub != nil {
		// Record the primary connection's raw notify, then wrap the request's
		// Notify so helper->client notifications (including closures captured
		// by acpproxy/acpnav) fan out to remote clients too. Calls stay on the
		// originating connection: the former broadcast-call race for approvals
		// is replaced by the helper-owned approval store.
		h.remoteHub.SetPrimary(req.Notify)
		req.Notify = h.remoteHub.WrapNotify(remoteaccess.PrimaryOrigin, req.Notify)
	}
	return h.handleCore(req, remoteaccess.PrimaryOrigin)
}

// HandleRemote dispatches a request from an authenticated remote client. The
// remoteaccess server enforces its method allowlist before calling this;
// originID keeps fan-out from echoing traffic back to the originator.
func (h *PoolsideHandler) HandleRemote(originID string, req *glsp.Context) (any, bool, bool, error) {
	if h.remoteHub != nil {
		req.Notify = h.remoteHub.WrapNotify(originID, req.Notify)
	}
	return h.handleCore(req, originID)
}

func (h *PoolsideHandler) handleCore(req *glsp.Context, originID string) (r any, validMethod bool, validParams bool, err error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	ctx, cancel := h.newRequestContext(req.Method)
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// Handlers that scope traffic per client connection (acpproxy load
	// replay, remote resume) read the origin from the request context.
	ctx = methods.WithClientOrigin(ctx, originID)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if data, ok := jsonrpcErrorData(err); ok {
			attrs = append(attrs, slog.String("error_data", data))
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if err != nil || req.Method != methods.ACPNavListMethod {
			slog.Log(req.Context, level, "jsonrpc handled", attrs...)
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
const (
	serializedRequestTimeout = 5 * time.Second
	concurrentRequestTimeout = 30 * time.Second
)

func (h *PoolsideHandler) newRequestContext(method string) (context.Context, context.CancelFunc) {
	if _, ok := h.noDeadlineMethods[method]; ok {
		return context.WithCancel(context.Background())
	}
	if _, ok := h.concurrentMethods[method]; ok {
		return context.WithTimeout(context.Background(), concurrentRequestTimeout)
	}
	return context.WithTimeout(context.Background(), serializedRequestTimeout)
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
func jsonrpcErrorData(err error) (string, bool) {
	if err == nil {
		return "", false
	}
	var wireErr *jsonrpc2.WireError
	if !errors.As(err, &wireErr) || wireErr.Data == nil {
		return "", false
	}
	return string(*wireErr.Data), true
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
