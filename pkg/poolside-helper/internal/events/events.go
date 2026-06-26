package events

import (
	"github.com/poolsideai/assistant/pkg/poolside-helper/gopls/pkg/protocol"
)

type TextDocumentDidChange struct {
	URI        protocol.DocumentURI
	NewContent []byte
	OldContent []byte
}
