package handler

import (
	"context"

	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/methods"
)

// GetUserConfig retrieves the current user configuration
func (h *PoolsideHandler) GetUserConfig(
	ctx context.Context, params *methods.GetUserConfigParams, gCtx *glsp.Context,
) (*methods.GetUserConfigOutput, error) {
	return &methods.GetUserConfigOutput{
		SettingsFilePaths: []string{},
	}, nil
}
