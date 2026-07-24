package server

import (
	"github.com/tliron/glsp/server"

__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/shellenv"
)

func NewDefault() (*server.Server, *handler.PoolsideHandler) {
	// GUI launch contexts (Finder on macOS) hand the helper a minimal
	// environment; repair it before handlers that shell out are constructed
	// so gh, MCP server commands, etc. resolve like they do from a terminal.
	shellenv.ApplyToProcess()
	return New(handler.New())
}

func New(h *handler.PoolsideHandler) (*server.Server, *handler.PoolsideHandler) {
	options := server.NewServerOptions(h.IsConcurrentMethod)
	return server.NewServerWithOptions(h, "poolside Helper", false, options), h
}
