package handler

import (
	"context"

	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/lsptypes"
)

func (h *PoolsideHandler) OnWorkspaceDidCreateFiles(ctx context.Context, params lsptypes.CreateFilesParams, call glsp.CallFunc) {
}
