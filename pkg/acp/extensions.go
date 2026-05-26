package acp

import (
	acpsdk "github.com/coder/acp-go-sdk"
)

// Extension method names
const (
	ExtensionMethodElicitation string = "_poolside/elicitation"
	// ExtensionMethodShowMessage is the JSON-RPC extension notification sent from
	// the ACP agent to clients to display an ephemeral message. Analogous to LSP's
	// window/showMessage but through the ACP extension mechanism.
	ExtensionMethodShowMessage string = "_poolside/show_message"
	// ExtensionMethodCompactionUpdate is the JSON-RPC extension notification sent
	// from the ACP agent to clients when trajectory compaction starts or completes.
	// The "started" phase is transient (never replayed on session load). Only
	// "completed" is persisted in the trajectory and re-emitted during replay.
	ExtensionMethodCompactionUpdate string = "_poolside/compaction_update"

	// ExtensionMethodMCPSettings returns server-owned MCP settings for a
	// session. MCP runtime state is owned by the ACP server, not the helper.
	ExtensionMethodSessionRename        string = "_poolside/rename_session"
	ExtensionMethodMCPSettings          string = "_poolside/mcp/settings"
	ExtensionMethodMCPSetServerDisabled string = "_poolside/mcp/set_server_disabled"
	ExtensionMethodMCPDeleteSecrets     string = "_poolside/mcp/delete_secrets"
	ExtensionMethodMCPAuthenticate      string = "_poolside/mcp/authenticate"
	ExtensionMethodMCPSetInputVariable  string = "_poolside/mcp/set_input_variable"
)

type SessionRenameRequest struct {
	SessionID acpsdk.SessionId `json:"sessionId"`
	Title     string           `json:"title"`
}

type SessionRenameResponse struct{}

type ShowMessageNotification struct {
	Type    string `json:"type"` // "error", "warning", "info"
	Message string `json:"message"`
}

type MCPSettingsRequest struct {
	SessionID acpsdk.SessionId `json:"sessionId"`
}

type MCPSettingsResponse struct {
	MCPServers            []MCPSettingsServerInputs `json:"mcpServers"`
	AllowCustomMCPServers bool                      `json:"allowCustomMCPServers"`
	HasLocalMCPServers    bool                      `json:"hasLocalMCPServers"`
	LocalMCPServerNames   []string                  `json:"localMCPServerNames"`
}

type MCPSettingsServerInputs struct {
	ServerID        string             `json:"serverID"`
	ServerName      string             `json:"serverName"`
	ServerURL       string             `json:"serverURL"`
	Variables       []MCPInputVariable `json:"variables,omitempty"`
	RequiresOAuth   bool               `json:"requiresOAuth"`
	IsAuthenticated bool               `json:"isAuthenticated"`
	Disabled        bool               `json:"disabled"`
	Source          string             `json:"source"`
}

type MCPInputVariable struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Value       *string `json:"value,omitempty"`
}

type MCPSetServerDisabledRequest struct {
	SessionID  acpsdk.SessionId `json:"sessionId"`
	ServerName string           `json:"serverName"`
	Disabled   bool             `json:"disabled"`
}

type MCPSetServerDisabledResponse struct{}

type MCPDeleteSecretsRequest struct {
	SessionID acpsdk.SessionId `json:"sessionId"`
	ServerID  string           `json:"serverID"`
	ServerURL string           `json:"serverURL"`
}

type MCPDeleteSecretsResponse struct{}

type MCPAuthenticateRequest struct {
	SessionID  acpsdk.SessionId `json:"sessionId"`
	ServerID   string           `json:"serverID"`
	ServerURL  string           `json:"serverURL"`
	ServerName string           `json:"serverName"`
}

type MCPAuthenticateResponse struct{}

type MCPSetInputVariableRequest struct {
	SessionID    acpsdk.SessionId `json:"sessionId"`
	ServerID     string           `json:"serverID"`
	ServerURL    string           `json:"serverURL"`
	VariableName string           `json:"variableName"`
	Value        string           `json:"value"`
}

type MCPSetInputVariableResponse struct{}

// CompactionPhase identifies the lifecycle stage of a compaction run.
type CompactionPhase string

type CompactionNotification struct {
	SessionID acpsdk.SessionId `json:"sessionId,omitempty"` // routes the notification to its ACP session
	ID        string           `json:"id"`                  // correlates started↔completed
	Phase     CompactionPhase  `json:"phase"`               // "started" | "completed"
	Summary   string           `json:"summary,omitempty"`   // populated on "completed" only
}
