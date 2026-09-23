__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	ACPNavListMethod                       = acpNavMethodPrefix + "list"
	ACPNavCreateChatMethod                 = acpNavMethodPrefix + "createChat"
	ACPNavUpsertProjectMethod              = acpNavMethodPrefix + "upsertProject"
	ACPNavRenameProjectMethod              = acpNavMethodPrefix + "renameProject"
	ACPNavSetProjectCollapsedMethod        = acpNavMethodPrefix + "setProjectCollapsed"
	ACPNavReorderProjectsMethod            = acpNavMethodPrefix + "reorderProjects"
	ACPNavReorderWorktreesMethod           = acpNavMethodPrefix + "reorderWorktrees"
	ACPNavGetProjectSettingsMethod         = acpNavMethodPrefix + "getProjectSettings"
	ACPNavSetProjectSettingsMethod         = acpNavMethodPrefix + "setProjectSettings"
	ACPNavPrepareWorktreeMethod            = acpNavMethodPrefix + "prepareWorktree"
	ACPNavReleasePreparedWorktreeMethod    = acpNavMethodPrefix + "releasePreparedWorktree"
	ACPNavCreateWorktreeMethod             = acpNavMethodPrefix + "createWorktree"
	ACPNavRemoveProjectMethod              = acpNavMethodPrefix + "removeProject"
	ACPNavRemoveWorktreeMethod             = acpNavMethodPrefix + "removeWorktree"
	ACPNavRenameConversationMethod         = acpNavMethodPrefix + "renameConversation"
	ACPNavUpsertConversationMethod         = acpNavMethodPrefix + "upsertConversation"
	ACPNavPrepareConversationHandoffMethod = acpNavMethodPrefix + "prepareConversationHandoff"
	ACPNavAbortConversationHandoffMethod   = acpNavMethodPrefix + "abortConversationHandoff"
	ACPNavGetConversationHistoryMethod     = acpNavMethodPrefix + "getConversationHistory"
	ACPNavRestoreConversationMethod        = acpNavMethodPrefix + "restoreConversation"
	ACPNavArchiveConversationMethod        = acpNavMethodPrefix + "archiveConversation"
	ACPNavDeleteConversationMethod         = acpNavMethodPrefix + "deleteConversation"
	ACPNavListAgentServersMethod           = acpNavMethodPrefix + "listAgentServers"
	ACPNavCheckAgentRuntimesMethod         = acpNavMethodPrefix + "checkAgentRuntimes"
	ACPNavInstallAgentServerMethod         = acpNavMethodPrefix + "installAgentServer"
	ACPNavSetAgentServersMethod            = acpNavMethodPrefix + "setAgentServers"
	ACPNavGetConfigCacheMethod             = acpNavMethodPrefix + "getConfigCache"
	ACPNavUpsertConfigCacheMethod          = acpNavMethodPrefix + "upsertConfigCache"
	ACPNavSetConversationViewStateMethod   = acpNavMethodPrefix + "setConversationViewState"
	ACPNavGetFileOpenerMethod              = acpNavMethodPrefix + "getFileOpener"
	ACPNavSetFileOpenerMethod              = acpNavMethodPrefix + "setFileOpener"
	ACPNavGetKeybindingsMethod             = acpNavMethodPrefix + "getKeybindings"
	ACPNavSetKeybindingsMethod             = acpNavMethodPrefix + "setKeybindings"
	ACPNavGetGithubColorModeMethod         = acpNavMethodPrefix + "getGithubColorMode"
	ACPNavSetGithubColorModeMethod         = acpNavMethodPrefix + "setGithubColorMode"
	ACPNavDidChangeMethod                  = acpNavMethodPrefix + "didChange"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	ID                 string                        `json:"id"`
	WorkspacePath      string                        `json:"workspacePath"`
	AgentServer        string                        `json:"agentServer"`
	SessionID          string                        `json:"sessionId,omitempty"`
	Cwd                string                        `json:"cwd"`
	Title              string                        `json:"title,omitempty"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
	UpdatedAt          string                        `json:"updatedAt,omitempty"`
	Active             bool                          `json:"active"`
	Archived           bool                          `json:"archived"`
	WorkingDirectories []string                      `json:"workingDirectories"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
	LiveStatus         *ACPNavConversationLiveStatus `json:"liveStatus,omitempty"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type ACPNavConversationLiveStatus struct {
	Working        bool `json:"working"`
	WaitingForUser bool `json:"waitingForUser"`
	Unread         bool `json:"unread"`
}

type ACPAgentServerConfig struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// PinnedConfigOptions lists config option ids whose default value in
	// DefaultConfigOptions was explicitly pinned by the user. Clients skip
	// automatic default updates (such as last-used tracking) for pinned ids.
	PinnedConfigOptions []string `json:"pinned_config_options,omitempty"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	SHA256  string            `json:"sha256,omitempty"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

type ACPAgentServers map[string]ACPAgentServerConfig

type ACPNavAgentServersState struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// DefaultAgentServerPinned reports whether the default agent server choice
	// itself was explicitly pinned by the user, so clients skip automatic
	// default updates (such as last-used tracking) for the choice.
	DefaultAgentServerPinned bool `json:"default_agent_server_pinned,omitempty"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type ACPNavCreateChatParams struct {
	SessionID string `json:"sessionId"`
}

type ACPNavCreateChatOutput struct {
	Path string `json:"path"`
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
type ACPNavReleasePreparedWorktreeOutput struct{}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type ACPNavConversationLeg struct {
	HandoffID         string          `json:"handoffId"`
	Ordinal           int             `json:"ordinal"`
	AgentServer       string          `json:"agentServer"`
	SessionID         string          `json:"sessionId"`
	TargetAgentServer string          `json:"targetAgentServer"`
	TargetSessionID   string          `json:"targetSessionId"`
	SchemaVersion     int             `json:"schemaVersion"`
	Events            json.RawMessage `json:"events"`
	Turns             json.RawMessage `json:"turns"`
	Plan              json.RawMessage `json:"plan"`
	CreatedAt         string          `json:"createdAt"`
}

type ACPNavPrepareConversationHandoffParams struct {
	HandoffID         string          `json:"handoffId"`
	ConversationID    string          `json:"conversationId"`
	SourceAgentServer string          `json:"sourceAgentServer"`
	SourceSessionID   string          `json:"sourceSessionId"`
	TargetAgentServer string          `json:"targetAgentServer"`
	Events            json.RawMessage `json:"events"`
	Turns             json.RawMessage `json:"turns"`
	Plan              json.RawMessage `json:"plan"`
	CreatedAt         string          `json:"createdAt"`
}

type ACPNavAbortConversationHandoffParams struct {
	HandoffID string `json:"handoffId"`
}

type ACPNavGetConversationHistoryParams struct {
	ConversationID string `json:"conversationId"`
}

type ACPNavConversationHistory struct {
	Legs []ACPNavConversationLeg `json:"legs"`
}

type ACPNavConversationHandoffOutput struct{}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type ACPNavListAgentServersParams struct{}

type ACPNavCheckAgentRuntimesParams struct{}

// ACPNavAgentRuntimesState reports whether the runtimes registry agent
// distributions launch through are available on this machine, so the
// marketplace can warn before an install instead of failing on first launch.
type ACPNavAgentRuntimesState struct {
	NPX ACPNavAgentRuntimeStatus `json:"npx"`
}

type ACPNavAgentRuntimeStatus struct {
	Available bool `json:"available"`
	// Path is the resolved executable path when available.
	Path string `json:"path,omitempty"`
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
type ACPNavSetAgentServersParams struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// DefaultAgentServerPinned pins or unpins the default agent server choice.
	// Like DefaultAgentServer, it is only written when present: a set that
	// omits it preserves the stored pinned flag.
	DefaultAgentServerPinned *bool `json:"default_agent_server_pinned,omitempty"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

type ACPNavSetConversationViewStateParams struct {
	AgentServer string `json:"agentServer"`
	SessionID   string `json:"sessionId"`
	Active      bool   `json:"active"`
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type ACPNavDidChangeParams struct {
	State ACPNavState `json:"state"`
}

func (p ACPNavDidChangeParams) MethodName() string {
	return ACPNavDidChangeMethod
}
