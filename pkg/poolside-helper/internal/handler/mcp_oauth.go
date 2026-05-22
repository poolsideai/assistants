package handler

import (
	"context"
	"fmt"
	"log/slog"

	pkgerrors "github.com/pkg/errors"
	"github.com/tliron/glsp"

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

func (h *PoolsideHandler) InitiateMCPOAuth(ctx context.Context, params *methods.InitiateMCPOAuthParams, gCtx *glsp.Context) (*methods.InitiateMCPOAuthOutput, error) {
	log := slog.With("server_id", params.ServerID, "server_name", params.ServerName, "server_url", params.ServerURL)
	log.Info("Initiating MCP OAuth flow")

	if params.ServerURL == "" {
		return nil, pkgerrors.New("server URL is required")
	}
	if params.ServerID == "" {
		return nil, pkgerrors.New("server ID is required")
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
		},
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}

	log.Info("Successfully completed MCP OAuth flow and stored token")

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		Type:    protocol.Info,
		Message: fmt.Sprintf("poolside: Successfully signed in to %s MCP", params.ServerName),
	}); err != nil {
		log.Warn("Failed to notify client of OAuth completion", "error", err)
	}

	return &methods.InitiateMCPOAuthOutput{}, nil
}

// MCPOAuthCallback completes a pending deep-link OAuth flow with the redirect
// URL the client received from the OS (poolside://oauth/callback?…). Flows
// wait on this only when they were started with a deep-link redirect.
func (h *PoolsideHandler) MCPOAuthCallback(_ context.Context, params *methods.MCPOAuthCallbackParams, _ *glsp.Context) (*methods.MCPOAuthCallbackOutput, error) {
	if err := mcp.DeliverOAuthCallback(params.URL); err != nil {
		return nil, pkgerrors.Wrap(err, "MCP OAuth callback")
	}
	return &methods.MCPOAuthCallbackOutput{}, nil
}

func (h *PoolsideHandler) DeleteMCPSecrets(ctx context.Context, params *methods.DeleteMCPSecretsParams, _ *glsp.Context) (*methods.DeleteMCPSecretsOutput, error) {
	log := slog.With("server_id", params.ServerID, "server_url", params.ServerURL)

__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, pkgerrors.Wrap(err, "failed to delete MCP secrets")
	}

	log.Info("Successfully deleted MCP server secrets")
	return &methods.DeleteMCPSecretsOutput{}, nil
}
