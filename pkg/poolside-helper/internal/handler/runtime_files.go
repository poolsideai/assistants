package handler

import (
	"context"

	"github.com/tliron/glsp"

__POOL_SYNTHETIC_IMPORT_BASELINE__
)

func (h *PoolsideHandler) runtimeFiles(ctx context.Context, req *methods.RuntimeFilesParams, gCtx *glsp.Context) (*methods.RuntimeFilesOutput, error) {
	return &methods.RuntimeFilesOutput{
		Files: []methods.RuntimeFiles{},
	}, nil
}
