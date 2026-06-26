package handler

import (
	"context"

	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/methods"
)

func (h *PoolsideHandler) runtimeFiles(ctx context.Context, req *methods.RuntimeFilesParams, gCtx *glsp.Context) (*methods.RuntimeFilesOutput, error) {
	return &methods.RuntimeFilesOutput{
		Files: []methods.RuntimeFiles{},
	}, nil
}
