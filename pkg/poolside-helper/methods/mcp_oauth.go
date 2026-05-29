package methods

// InitiateMCPOAuthParams represents the parameters for initiating an OAuth flow for an MCP server.
type InitiateMCPOAuthParams struct {
	ServerID   string `json:"serverID"`
	ServerURL  string `json:"serverURL"`
	ServerName string `json:"serverName"`
}

func (p InitiateMCPOAuthParams) MethodName() string {
	return "poolside/mcpOAuthInitiate"
}

// InitiateMCPOAuthOutput represents the output of the OAuth initiation.
type InitiateMCPOAuthOutput struct {
}

// MCPOAuthURLParams represents the parameters for notifying the client to open an OAuth URL.
type MCPOAuthURLParams struct {
	ServerID string `json:"serverID"`
	AuthURL  string `json:"authURL"`
}

func (p MCPOAuthURLParams) MethodName() string {
	return "poolside/mcpOAuthURL"
}

// MCPOAuthCallbackParams carries an OAuth redirect callback URL
// (poolside://oauth/callback?code=…&state=…) that a client with the
// poolside:// URL scheme registered received from the OS. Forwarding it
// completes the pending deep-link OAuth flow that opened the browser.
type MCPOAuthCallbackParams struct {
	URL string `json:"url"`
}

func (p MCPOAuthCallbackParams) MethodName() string {
	return "poolside/mcpOAuthCallback"
}

// MCPOAuthCallbackOutput represents the output of the OAuth callback delivery.
type MCPOAuthCallbackOutput struct {
}

// DeleteMCPSecretsParams represents the parameters for deleting secrets for an MCP server.
type DeleteMCPSecretsParams struct {
	ServerID  string `json:"serverID"`
	ServerURL string `json:"serverURL"`
}

func (p DeleteMCPSecretsParams) MethodName() string {
	return "poolside/deleteMcpSecrets"
}

// DeleteMCPSecretsOutput represents the output of the delete MCP secrets operation.
type DeleteMCPSecretsOutput struct {
}
