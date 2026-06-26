package handler

import (
	"context"

	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/events"
)

func (h *PoolsideHandler) OnTextDocumentDidChange(ctx context.Context, event events.TextDocumentDidChange, call glsp.CallFunc) {
}
