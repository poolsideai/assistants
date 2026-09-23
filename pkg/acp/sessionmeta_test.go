package acp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDecodeSessionHandoffID(t *testing.T) {
	assert.Equal(t, "handoff-1", DecodeSessionHandoffID(map[string]any{
		MetaKeySessionHandoffID: "handoff-1",
	}))
	assert.Empty(t, DecodeSessionHandoffID(map[string]any{
		MetaKeySessionHandoffID: true,
	}))
	assert.Empty(t, DecodeSessionHandoffID(nil))
}
