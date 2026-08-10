package secrets

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/zalando/go-keyring"
)

type testSecrets struct {
	Token    string            `json:"token"`
	Metadata map[string]string `json:"metadata,omitempty"`
}

type testKey string

func TestKeyringStore_SaveAndLoad(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	ctx := context.Background()
	secret := testSecrets{Token: "mytoken", Metadata: map[string]string{"name": "test"}}

	require.NoError(t, store.Save(ctx, testKey("my-key"), &secret))

	val, err := store.Load(ctx, testKey("my-key"))

	require.NoError(t, err)
	require.NotNil(t, val)
	assert.Equal(t, secret, *val)
}

func TestKeyringStore_LoadNotFound(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	ctx := context.Background()

	val, err := store.Load(ctx, testKey("does-not-exist"))
	require.NoError(t, err)
	assert.Nil(t, val)
	assert.Nil(t, err)
}

func TestKeyringStore_Delete(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	ctx := context.Background()
	secret := testSecrets{Token: "mytoken", Metadata: map[string]string{"name": "test"}}

	require.NoError(t, store.Save(ctx, testKey("my-key"), &secret))
	require.NoError(t, store.Delete(ctx, testKey("my-key")))
	val, err := store.Load(ctx, testKey("my-key"))
	require.NoError(t, err)
	assert.Nil(t, val)
}

func TestKeyringStore_DeleteNotFound(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	ctx := context.Background()
	secret := testSecrets{Token: "mytoken", Metadata: map[string]string{"name": "test"}}

	require.NoError(t, store.Save(ctx, testKey("my-key"), &secret))
	require.NoError(t, store.Delete(ctx, testKey("my-key")))
	assert.NoError(t, store.Delete(ctx, testKey("my-key")))
}

func TestKeyringStore_Overwrite(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, string]("string-service")
	ctx := context.Background()
	first, second := "first", "second"

	require.NoError(t, store.Save(ctx, testKey("my-key"), &first))
	require.NoError(t, store.Save(ctx, testKey("my-key"), &second))

	val, err := store.Load(ctx, testKey("my-key"))
	require.NoError(t, err)
	assert.Equal(t, val, &second)
}

func TestKeyringStore_DifferentServices(t *testing.T) {
	keyring.MockInit()
	stringStore := NewKeyringStore[testKey, string]("string-service")
	testStore := NewKeyringStore[testKey, testSecrets]("test-service")

	first := "first"
	secret := testSecrets{Token: "token", Metadata: map[string]string{"test": "secret"}}

	ctx := context.Background()

	require.NoError(t, stringStore.Save(ctx, testKey("my-key"), &first))
	require.NoError(t, testStore.Save(ctx, testKey("my-key"), &secret))

	stringVal, stringErr := stringStore.Load(ctx, testKey("my-key"))

	require.NoError(t, stringErr)
	assert.Equal(t, stringVal, &first)

	testVal, testErr := testStore.Load(ctx, testKey("my-key"))

	require.NoError(t, testErr)
	assert.Equal(t, testVal, &secret)
}

func TestKeyringStore_RawStringStore_SaveAndLoad(t *testing.T) {
	keyring.MockInit()
	store := NewRawStringKeyringStore[testKey]("raw-string-service")
	ctx := context.Background()
	secret := "plain-text-value"

	require.NoError(t, store.Save(ctx, testKey("my-key"), &secret))

	storedRaw, err := keyring.Get("raw-string-service", "my-key")
	require.NoError(t, err)
	assert.Equal(t, secret, storedRaw)

	val, err := store.Load(ctx, testKey("my-key"))
	require.NoError(t, err)
	require.NotNil(t, val)
	assert.Equal(t, secret, *val)
}

func TestKeyringStore_RawStringStore_LoadJSONPayloadAsString(t *testing.T) {
	keyring.MockInit()
	store := NewRawStringKeyringStore[testKey]("raw-string-service")
	ctx := context.Background()

	require.NoError(t, keyring.Set("raw-string-service", "my-key", `{"value":"legacy"}`))

	val, err := store.Load(ctx, testKey("my-key"))
	require.NoError(t, err)
	require.NotNil(t, val)
	assert.Equal(t, `{"value":"legacy"}`, *val)
}

func TestKeyringStore_LoadMalformedSecret(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	ctx := context.Background()

	require.NoError(t, keyring.Set("test-service", "my-key", "{bad-json"))

	_, err := store.Load(ctx, testKey("my-key"))
	require.Error(t, err)
	assert.ErrorContains(t, err, errorCodeParsingSecret)
}

func TestKeyringStore_LoadCanceledContext(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	val, err := store.Load(ctx, testKey("my-key"))

	require.ErrorIs(t, err, context.Canceled)
	assert.Nil(t, val)
}

func TestKeyringStore_SaveCanceledContext(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	secret := testSecrets{Token: "mytoken", Metadata: map[string]string{"name": "test"}}

	err := store.Save(ctx, testKey("my-key"), &secret)

	require.ErrorIs(t, err, context.Canceled)

	val, loadErr := store.Load(context.Background(), testKey("my-key"))
	require.NoError(t, loadErr)
	assert.Nil(t, val)
}

func TestKeyringStore_DeleteCanceledContext(t *testing.T) {
	keyring.MockInit()
	store := NewKeyringStore[testKey, testSecrets]("test-service")
	secret := testSecrets{Token: "mytoken", Metadata: map[string]string{"name": "test"}}

	require.NoError(t, store.Save(context.Background(), testKey("my-key"), &secret))

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err := store.Delete(ctx, testKey("my-key"))

	require.ErrorIs(t, err, context.Canceled)

	val, loadErr := store.Load(context.Background(), testKey("my-key"))
	require.NoError(t, loadErr)
	require.NotNil(t, val)
	assert.Equal(t, secret, *val)
}
