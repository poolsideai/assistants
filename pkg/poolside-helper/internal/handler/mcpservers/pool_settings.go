package mcpservers

import (
	"context"
	"os"
	"path/filepath"

	pkgerrors "github.com/pkg/errors"
	"github.com/tliron/glsp"
	"gopkg.in/yaml.v3"

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

// poolGlobalSettingsFile is the user-global poolside settings file the agent
// reads for every session. Matches agentutil/userconfig.UserGlobalSettingsFilePath.
func poolGlobalSettingsFile() string {
	return userconfig.PoolsideConfigFile("settings.yaml")
}

// SetPoolServerDisabled toggles a pool/agent MCP server's disabled flag in the
// user-global settings file (~/.config/poolside/settings.yaml). The agent's
// SetMCPServerDisabled scopes this to the active workspace; writing the global
// file makes the choice apply everywhere. We merge into a generic document so
// unrelated settings (and other servers) are preserved.
func (s *Server) SetPoolServerDisabled(
	_ context.Context,
	params *methods.MCPServersSetPoolServerDisabledParams,
	_ *glsp.Context,
) (*methods.MCPServersSetPoolServerDisabledOutput, error) {
	if params.ServerName == "" {
		return nil, pkgerrors.New("server name is required")
	}
	if err := writePoolServerDisabled(poolGlobalSettingsFile(), params.ServerName, params.Disabled); err != nil {
		return nil, err
	}
	return &methods.MCPServersSetPoolServerDisabledOutput{}, nil
}

// writePoolServerDisabled merges the disabled flag for serverName into the pool
// settings YAML at path, preserving unrelated settings and other servers, and
// writes it back atomically (creating the file and parent dir if absent).
func writePoolServerDisabled(path, serverName string, disabled bool) error {
	doc := map[string]any{}
	if data, err := os.ReadFile(path); err == nil {
		if len(data) > 0 {
			if err := yaml.Unmarshal(data, &doc); err != nil {
				return pkgerrors.Wrap(err, "parse global poolside settings")
			}
		}
		if doc == nil {
			doc = map[string]any{}
		}
	} else if !os.IsNotExist(err) {
		return pkgerrors.Wrap(err, "read global poolside settings")
	}

	servers, ok := doc["mcp_servers"].(map[string]any)
	if !ok || servers == nil {
		servers = map[string]any{}
	}
	server, ok := servers[serverName].(map[string]any)
	if !ok || server == nil {
		server = map[string]any{}
	}
	server["disabled"] = disabled
	servers[serverName] = server
	doc["mcp_servers"] = servers

	out, err := yaml.Marshal(doc)
	if err != nil {
		return pkgerrors.Wrap(err, "marshal global poolside settings")
	}
	if err := os.MkdirAll(filepath.Dir(path), dirMode); err != nil {
		return pkgerrors.Wrap(err, "create poolside config directory")
	}
	// Atomic write (temp + rename) so a crash can't truncate the settings file
	// the agent reads on every session — matches the connectors store.
	if err := atomicWriteFile(path, out, fileMode); err != nil {
		return pkgerrors.Wrap(err, "write global poolside settings")
	}
	return nil
}
