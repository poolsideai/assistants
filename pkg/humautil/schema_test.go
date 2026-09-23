package humautil

import (
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var enumValue = map[string]string{
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func TestEnumSchema_DeterministicOrdering(t *testing.T) {
	approvalDecisions := map[string]string{
		"allow":         "allow",
		"allow_and_add": "allowAndAdd",
		"deny":          "deny",
	}

	// Run multiple times to catch non-deterministic ordering
	for i := 0; i < 10; i++ {
		schema := EnumSchema(approvalDecisions)

		require.NotNil(t, schema)
		require.Len(t, schema.Enum, 3)

		// Sorted alphabetically by camelCase name: Allow, AllowAndAdd, Deny
		assert.Equal(t, "allow", schema.Enum[0])
		assert.Equal(t, "allowAndAdd", schema.Enum[1])
		assert.Equal(t, "deny", schema.Enum[2])

		names, ok := schema.Extensions["x-enumNames"].([]string)
		require.True(t, ok, "x-enumNames should be a []string")
		require.Len(t, names, 3)

		assert.Equal(t, "Allow", names[0])
		assert.Equal(t, "AllowAndAdd", names[1])
		assert.Equal(t, "Deny", names[2])
	}
}

func TestEnumSchema_ApprovalDecisionType(t *testing.T) {
	schema := EnumSchema(enumValue)

	require.NotNil(t, schema)
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
	assert.Equal(t, "mcp", schema.Enum[0])
	assert.Equal(t, "path", schema.Enum[1])
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

	names, ok := schema.Extensions["x-enumNames"].([]string)
	require.True(t, ok, "x-enumNames should be a []string")
__POOL_SYNTHETIC_IMPORT_BASELINE__

	assert.Equal(t, "Mcp", names[0])
	assert.Equal(t, "Path", names[1])
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
