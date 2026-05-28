package acp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEncodeOverrideRules(t *testing.T) {
	assert.Nil(t, EncodeOverrideRules(nil))
	assert.Nil(t, EncodeOverrideRules([]string{}))
	assert.Equal(t, map[string]any{
		MetaKeyPermissionOverrideRules: []string{"gh *"},
	}, EncodeOverrideRules([]string{"gh *"}))
}
