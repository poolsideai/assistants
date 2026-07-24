__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	ServerID   string `json:"serverID"`
	ServerURL  string `json:"serverURL"`
	ServerName string `json:"serverName"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
