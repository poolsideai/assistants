package handler

import (
	"context"
	"strings"

	"github.com/pkg/errors"

	"github.com/poolsideai/assistant/pkg/poolside-helper/gopls/pkg/protocol"
)

// uriToPath converts a file:// URI to a filesystem path. If the input is
// already a plain path (no scheme), it is returned as-is.
func uriToPath(s string) string {
	if strings.HasPrefix(s, "file://") {
		return protocol.DocumentURI(s).Path()
	}
	return s
}

func (h *PoolsideHandler) ReadFile(ctx context.Context, uri protocol.DocumentURI) ([]byte, error) {
	fh, err := h.cachedFS.ReadFile(ctx, uri)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	return fh.Content()
}
