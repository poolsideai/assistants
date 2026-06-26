package handler

import (
	"context"

	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/lsptypes"
)

func (h *PoolsideHandler) OnWorkspaceDidRenameFiles(ctx context.Context, params lsptypes.RenameFilesParams, call glsp.CallFunc) {
}
