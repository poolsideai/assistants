package secrets

import (
	"context"
	"fmt"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	poolsideSecretsServiceName = "ai.poolside.secrets"
	poolsideSecretKeyPrefix    = "ps-secret:"
	poolsideSecretMinValueSize = 4
	// Windows Credential Manager caps each credential blob at 2560 bytes
	// (CRED_MAX_CREDENTIAL_BLOB_SIZE / 2 for Unicode). We use that as the
	// cross-platform ceiling so secrets stay portable across OSes.
	poolsideSecretMaxValueSize = 2560 // 2.5 KiB
)

// Minimum length (6) enforces meaningful, discoverable names for the agent.
// The name is not used as a keyring key (a UUID is used instead), so the
// constraints here are purely for usability, not platform limitations.
var poolsideSecretNameRegex = regexp.MustCompile(`^[a-zA-Z0-9_./-]{6,256}$`)

type SecretSource string

const (
	SecretSourceLocal SecretSource = "local"
)

type Secret struct {
	Name        string       `json:"name"`
	Value       SecretValue  `json:"value"`
	Description string       `json:"description"`
	Source      SecretSource `json:"source,omitempty"`
}

type UpsertSecretParams struct {
	Name         string
	Value        string
	Description  string
	PreviousName string
}

// PoolsideSecretStore manages named secrets.
type PoolsideSecretStore interface {
	Upsert(ctx context.Context, params UpsertSecretParams) error
	Delete(ctx context.Context, name string) error
	Get(ctx context.Context, name string) (*Secret, error)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	List(ctx context.Context) ([]Secret, error)
}

type poolsideSecretStoreKey string

type keyringPoolsideSecretStore struct {
	store      *KeyringStore[poolsideSecretStoreKey, string]
	indexStore *poolsideSecretsIndexStore
}

func NewPoolsideSecretStore() PoolsideSecretStore {
	return newPoolsideSecretStore(
		NewRawStringKeyringStore[poolsideSecretStoreKey](poolsideSecretsServiceName),
		newPoolsideSecretsIndexStore(),
	)
}

func newPoolsideSecretStore(
	store *KeyringStore[poolsideSecretStoreKey, string],
	indexStore *poolsideSecretsIndexStore,
) *keyringPoolsideSecretStore {
	return &keyringPoolsideSecretStore{
		store:      store,
		indexStore: indexStore,
	}
}

func (k *keyringPoolsideSecretStore) Upsert(ctx context.Context, params UpsertSecretParams) error {
	name := strings.TrimSpace(params.Name)
	if !poolsideSecretNameRegex.MatchString(name) {
		return fmt.Errorf("secret name must match %s", poolsideSecretNameRegex.String())
	}

	if len(params.Value) < poolsideSecretMinValueSize || len(params.Value) > poolsideSecretMaxValueSize {
		return fmt.Errorf(
			"secret value must be between %d and %d bytes",
			poolsideSecretMinValueSize,
			poolsideSecretMaxValueSize,
		)
	}

	previousName := strings.TrimSpace(params.PreviousName)

	index, err := k.indexStore.load()
	if err != nil {
		return fmt.Errorf("failed to load poolside secrets index: %w", err)
	}

	resolvedName, secretID := resolvePoolsideSecretID(index, previousName, name)
	if secretID == "" {
		secretID = uuid.NewString()
	}

	if current, exists := index.SecretsByName[name]; exists && current.ID != secretID {
		return fmt.Errorf("secret with name %q already exists", name)
	}

	value := params.Value
	if err := k.store.Save(ctx, newPoolsideSecretStoreKey(secretID), &value); err != nil {
		return fmt.Errorf("failed to save poolside secret value for %q: %w", name, err)
	}

	if resolvedName != "" && resolvedName != name {
		delete(index.SecretsByName, resolvedName)
	}

	index.SecretsByName[name] = poolsideSecretIndexItem{
		ID:          secretID,
		Description: params.Description,
		UpdatedAt:   time.Now().UTC().Format(time.RFC3339Nano),
	}

	if err := k.indexStore.save(index); err != nil {
		return fmt.Errorf("failed to save poolside secrets index: %w", err)
	}

	return nil
}

func (k *keyringPoolsideSecretStore) Delete(ctx context.Context, name string) error {
	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return fmt.Errorf("secret name is required")
	}

	index, err := k.indexStore.load()
	if err != nil {
		return fmt.Errorf("failed to load poolside secrets index: %w", err)
	}

	indexItem, exists := index.SecretsByName[trimmedName]
	if !exists {
		return nil
	}

	if err := k.store.Delete(ctx, newPoolsideSecretStoreKey(indexItem.ID)); err != nil {
		return fmt.Errorf("failed to delete poolside secret value for %q: %w", trimmedName, err)
	}

	delete(index.SecretsByName, trimmedName)
	if err := k.indexStore.save(index); err != nil {
		return fmt.Errorf("failed to save poolside secrets index: %w", err)
	}

	return nil
}

func (k *keyringPoolsideSecretStore) Get(ctx context.Context, name string) (*Secret, error) {
	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return nil, fmt.Errorf("secret name is required")
	}

	index, err := k.indexStore.load()
	if err != nil {
		return nil, fmt.Errorf("failed to load poolside secrets index: %w", err)
	}

	indexItem, exists := index.SecretsByName[trimmedName]
	if !exists {
		return nil, nil
	}

	if strings.TrimSpace(indexItem.ID) == "" {
		delete(index.SecretsByName, trimmedName)
		if err := k.indexStore.save(index); err != nil {
			return nil, fmt.Errorf("failed to prune stale poolside secrets index entries: %w", err)
		}
		return nil, nil
	}

	record, err := k.store.Load(ctx, newPoolsideSecretStoreKey(indexItem.ID))
	if err != nil {
		return nil, fmt.Errorf("failed to load poolside secret value for %q: %w", trimmedName, err)
	}
	if record == nil {
		delete(index.SecretsByName, trimmedName)
		if err := k.indexStore.save(index); err != nil {
			return nil, fmt.Errorf("failed to prune stale poolside secrets index entries: %w", err)
		}
		return nil, nil
	}

	return &Secret{
		Name:        trimmedName,
		Value:       NewSecretValue(*record),
		Description: indexItem.Description,
		Source:      SecretSourceLocal,
	}, nil
}

func (k *keyringPoolsideSecretStore) List(ctx context.Context) ([]Secret, error) {
	index, err := k.indexStore.load()
	if err != nil {
		return nil, fmt.Errorf("failed to load poolside secrets index: %w", err)
	}

	secrets := make([]Secret, 0, len(index.SecretsByName))

	for name, indexItem := range index.SecretsByName {
		if strings.TrimSpace(indexItem.ID) == "" {
			continue
		}

		secrets = append(secrets, Secret{
			Name:        name,
			Description: indexItem.Description,
			Source:      SecretSourceLocal,
		})
	}

	sort.Slice(secrets, func(i, j int) bool {
		return secrets[i].Name < secrets[j].Name
	})

	return secrets, nil
}

func resolvePoolsideSecretID(index *poolsideSecretsIndex, previousName string, name string) (string, string) {
	if previousName != "" {
		if indexItem, exists := index.SecretsByName[previousName]; exists {
			return previousName, indexItem.ID
		}
	}

	if indexItem, exists := index.SecretsByName[name]; exists {
		return name, indexItem.ID
	}

	return "", ""
}

func newPoolsideSecretStoreKey(secretID string) poolsideSecretStoreKey {
	return poolsideSecretStoreKey(poolsideSecretKeyPrefix + secretID)
}
