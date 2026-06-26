package secrets

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/poolsideai/assistant/pkg/common/userconfig"
)

const (
	poolsideSecretsIndexVersion = 1
	poolsideIndexDirectoryMode  = 0o700
	poolsideIndexFileMode       = 0o600
)

type poolsideSecretsIndex struct {
	Version       int                                `json:"version"`
	SecretsByName map[string]poolsideSecretIndexItem `json:"secretsByName"`
}

type poolsideSecretIndexItem struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	UpdatedAt   string `json:"updatedAt"`
}

type poolsideSecretsIndexStore struct {
	path string
}

func newPoolsideSecretsIndexStore() *poolsideSecretsIndexStore {
	return &poolsideSecretsIndexStore{
		path: filepath.Join(userconfig.StateDirectory(), "helper", "secrets-index.json"),
	}
}

func (s *poolsideSecretsIndexStore) load() (*poolsideSecretsIndex, error) {
	data, err := os.ReadFile(s.path)
	if err != nil {
		if os.IsNotExist(err) {
			return newPoolsideSecretsIndex(), nil
		}
		return nil, fmt.Errorf("%s: failed to read secrets index: %w", errorCodeReadingIndex, err)
	}

	index := &poolsideSecretsIndex{}
	if err := json.Unmarshal(data, index); err != nil {
		return nil, fmt.Errorf("%s: failed to parse secrets index: %w", errorCodeParsingIndex, err)
	}

	if err := validatePoolsideSecretsIndex(index); err != nil {
		return nil, err
	}

	return index, nil
}

func (s *poolsideSecretsIndexStore) save(index *poolsideSecretsIndex) error {
	if err := validatePoolsideSecretsIndex(index); err != nil {
		return err
	}

	dir := filepath.Dir(s.path)
	if err := os.MkdirAll(dir, poolsideIndexDirectoryMode); err != nil {
		return fmt.Errorf("failed to create secrets index directory: %w", err)
	}

	if err := os.Chmod(dir, poolsideIndexDirectoryMode); err != nil {
		return fmt.Errorf("failed to set secrets index directory permissions: %w", err)
	}

	data, err := json.Marshal(index)
	if err != nil {
		return fmt.Errorf("failed to serialize secrets index: %w", err)
	}

	tempFile, err := os.CreateTemp(dir, ".secrets-index-*.tmp")
	if err != nil {
		return fmt.Errorf("failed to create temporary secrets index file: %w", err)
	}

	tempPath := tempFile.Name()
	success := false
	defer func() {
		if !success {
			_ = os.Remove(tempPath)
		}
	}()

	if err := tempFile.Chmod(poolsideIndexFileMode); err != nil {
		_ = tempFile.Close()
		return fmt.Errorf("failed to set temporary secrets index permissions: %w", err)
	}

	if _, err := tempFile.Write(data); err != nil {
		_ = tempFile.Close()
		return fmt.Errorf("failed to write temporary secrets index: %w", err)
	}

	if err := tempFile.Sync(); err != nil {
		_ = tempFile.Close()
		return fmt.Errorf("failed to sync temporary secrets index: %w", err)
	}

	if err := tempFile.Close(); err != nil {
		return fmt.Errorf("failed to close temporary secrets index: %w", err)
	}

	if err := os.Rename(tempPath, s.path); err != nil {
		return fmt.Errorf("failed to replace secrets index: %w", err)
	}

	if err := os.Chmod(s.path, poolsideIndexFileMode); err != nil {
		return fmt.Errorf("failed to set secrets index permissions: %w", err)
	}

	success = true
	return nil
}

func newPoolsideSecretsIndex() *poolsideSecretsIndex {
	return &poolsideSecretsIndex{
		Version:       poolsideSecretsIndexVersion,
		SecretsByName: map[string]poolsideSecretIndexItem{},
	}
}

func validatePoolsideSecretsIndex(index *poolsideSecretsIndex) error {
	if index == nil {
		return fmt.Errorf("%s: secrets index is nil", errorCodeParsingIndex)
	}

	if index.Version != poolsideSecretsIndexVersion {
		return fmt.Errorf("%s: unsupported secrets index version %d", errorCodeParsingIndex, index.Version)
	}

	if index.SecretsByName == nil {
		index.SecretsByName = map[string]poolsideSecretIndexItem{}
	}

	return nil
}
