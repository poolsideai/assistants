package events

import (
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

type TextDocumentDidChange struct {
	URI        protocol.DocumentURI
	NewContent []byte
	OldContent []byte
}
