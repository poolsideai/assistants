package handler

import (
	"context"

	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/lsptypes"
)

func (h *PoolsideHandler) OnWorkspaceWillDeleteFiles(ctx context.Context, params lsptypes.DeleteFilesParams, call glsp.CallFunc) {
}
