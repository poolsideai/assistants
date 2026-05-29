package humautil

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var enumValue = map[string]string{
	"path":   "path",
	"tool":   "tool",
	"mcp":    "mcp",
	"secret": "secret",
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
	require.Len(t, schema.Enum, 4)

	// Sorted alphabetically by PascalCase name: Mcp, Path, Secret, Tool
	assert.Equal(t, "mcp", schema.Enum[0])
	assert.Equal(t, "path", schema.Enum[1])
	assert.Equal(t, "secret", schema.Enum[2])
	assert.Equal(t, "tool", schema.Enum[3])

	names, ok := schema.Extensions["x-enumNames"].([]string)
	require.True(t, ok, "x-enumNames should be a []string")
	require.Len(t, names, 4)

	assert.Equal(t, "Mcp", names[0])
	assert.Equal(t, "Path", names[1])
	assert.Equal(t, "Secret", names[2])
	assert.Equal(t, "Tool", names[3])
}

type testIntEnum int

const (
	testIntEnumOne testIntEnum = 1
)

func TestEnumSchema_IntegerEnumMatchesJSONDecoding(t *testing.T) {
	schema := EnumSchema(map[string]testIntEnum{
		"one": testIntEnumOne,
	})

	// Simulate JSON decoding into any
	jsonData := []byte(`{"state": 1}`)
	var decoded map[string]any
	err := json.Unmarshal(jsonData, &decoded)
	require.NoError(t, err)

	decodedValue := decoded["state"]

	assert.Equal(t, schema.Enum[0], decodedValue)
}
