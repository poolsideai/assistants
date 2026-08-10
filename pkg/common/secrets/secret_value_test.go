package secrets

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSecretValue_Expose(t *testing.T) {
	sv := NewSecretValue("hunter2")
	assert.Equal(t, "hunter2", sv.Expose())
}

func TestSecretValue_Expose_Empty(t *testing.T) {
	sv := NewSecretValue("")
	assert.Equal(t, "", sv.Expose())
}

func TestSecretValue_String(t *testing.T) {
	sv := NewSecretValue("hunter2")
	assert.Equal(t, "[REDACTED]", sv.String())
	assert.Equal(t, "[REDACTED]", fmt.Sprint(sv))
	assert.Equal(t, "[REDACTED]", fmt.Sprintf("%v", sv))
	assert.Equal(t, "[REDACTED]", sv.String())
}

func TestSecretValue_GoString(t *testing.T) {
	sv := NewSecretValue("hunter2")
	assert.Equal(t, "[REDACTED]", fmt.Sprintf("%#v", sv))
}

func TestSecretValue_MarshalJSON(t *testing.T) {
	type wrapper struct {
		Secret SecretValue `json:"secret"`
	}
	w := wrapper{Secret: NewSecretValue("hunter2")}
	data, err := json.Marshal(w)
	require.NoError(t, err)
	assert.JSONEq(t, `{"secret":"[REDACTED]"}`, string(data))
}

func TestSecretValue_MarshalJSON_Direct(t *testing.T) {
	sv := NewSecretValue("hunter2")
	data, err := json.Marshal(sv)
	require.NoError(t, err)
	assert.Equal(t, `"[REDACTED]"`, string(data))
}
