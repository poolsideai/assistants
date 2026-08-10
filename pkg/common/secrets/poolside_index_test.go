package secrets

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newPoolsideSecretsIndexStoreAtPath(path string) *poolsideSecretsIndexStore {
	return &poolsideSecretsIndexStore{path: path}
}

func TestPoolsideSecretsIndexStore_LoadMissingFile(t *testing.T) {
	store := newPoolsideSecretsIndexStoreAtPath(filepath.Join(t.TempDir(), "helper", "secrets-index.json"))

	index, err := store.load()
	require.NoError(t, err)
	require.NotNil(t, index)

	assert.Equal(t, poolsideSecretsIndexVersion, index.Version)
	assert.Empty(t, index.SecretsByName)
}

func TestPoolsideSecretsIndexStore_SaveAndLoad(t *testing.T) {
	path := filepath.Join(t.TempDir(), "helper", "secrets-index.json")
	store := newPoolsideSecretsIndexStoreAtPath(path)

	expected := newPoolsideSecretsIndex()
	expected.SecretsByName["API_KEY"] = poolsideSecretIndexItem{
		ID:          "f4af8ecf-69ac-4a0b-ae81-c5f4057e3ab4",
		Description: "Primary API key",
		UpdatedAt:   "2026-01-02T03:04:05.000000000Z",
	}

	require.NoError(t, store.save(expected))

	fileInfo, err := os.Stat(path)
	require.NoError(t, err)
	assert.Equal(t, os.FileMode(poolsideIndexFileMode), fileInfo.Mode().Perm())

	dirInfo, err := os.Stat(filepath.Dir(path))
	require.NoError(t, err)
	assert.Equal(t, os.FileMode(poolsideIndexDirectoryMode), dirInfo.Mode().Perm())

	actual, err := store.load()
	require.NoError(t, err)
	assert.Equal(t, expected, actual)
}

func TestPoolsideSecretsIndexStore_LoadInvalidVersion(t *testing.T) {
	path := filepath.Join(t.TempDir(), "helper", "secrets-index.json")
	require.NoError(t, os.MkdirAll(filepath.Dir(path), poolsideIndexDirectoryMode))

	raw, err := json.Marshal(poolsideSecretsIndex{
		Version:       99,
		SecretsByName: map[string]poolsideSecretIndexItem{},
	})
	require.NoError(t, err)
	require.NoError(t, os.WriteFile(path, raw, poolsideIndexFileMode))

	store := newPoolsideSecretsIndexStoreAtPath(path)

	_, err = store.load()
	require.Error(t, err)
	assert.ErrorContains(t, err, errorCodeParsingIndex)
	assert.ErrorContains(t, err, "unsupported secrets index version")
}

func TestPoolsideSecretsIndexStore_LoadReadError(t *testing.T) {
	path := filepath.Join(t.TempDir(), "helper", "secrets-index.json")
	require.NoError(t, os.MkdirAll(path, poolsideIndexDirectoryMode))

	store := newPoolsideSecretsIndexStoreAtPath(path)
	_, err := store.load()
	require.Error(t, err)
	assert.ErrorContains(t, err, errorCodeReadingIndex)
}

func TestPoolsideSecretsIndexStore_LoadMalformedJSON(t *testing.T) {
	path := filepath.Join(t.TempDir(), "helper", "secrets-index.json")
	require.NoError(t, os.MkdirAll(filepath.Dir(path), poolsideIndexDirectoryMode))
	require.NoError(t, os.WriteFile(path, []byte("{not-json"), poolsideIndexFileMode))

	store := newPoolsideSecretsIndexStoreAtPath(path)
	_, err := store.load()
	require.Error(t, err)
	assert.ErrorContains(t, err, errorCodeParsingIndex)
}
