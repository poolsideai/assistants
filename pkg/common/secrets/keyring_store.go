package secrets

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/zalando/go-keyring"
)

// KeyringStore persists JSON-encoded values in OS keychains through go-keyring.
// It is intended for user-scoped local processes, not server-side high-throughput services.
// Keychain operations may involve platform daemons, prompts, and storage constraints.
type KeyringStore[K ~string, T any] struct {
	service string
	codec   keyringValueCodec[T]
}

// NewKeyringStore creates a store that JSON-marshals/unmarshals values on write/read.
// Use this when persisting structured data (e.g. a typed config or metadata struct)
// that needs automatic serialization.
// Keep service names stable so existing entries remain addressable.
func NewKeyringStore[K ~string, T any](service string) *KeyringStore[K, T] {
	return &KeyringStore[K, T]{
		service: service,
		codec:   newJSONKeyringValueCodec[T](),
	}
}

// NewRawStringKeyringStore creates a store that persists strings as-is without JSON encoding.
// Use this when storing an opaque secret value (e.g. an API key or token) where the
// raw string is the value itself — it avoids the overhead and extra quoting of JSON.
func NewRawStringKeyringStore[K ~string](service string) *KeyringStore[K, string] {
	return &KeyringStore[K, string]{
		service: service,
		codec:   newRawStringKeyringValueCodec(),
	}
}

func (k *KeyringStore[K, T]) Load(ctx context.Context, key K) (*T, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	data, err := runWithContext(ctx, func() (string, error) {
		return keyring.Get(k.service, string(key))
	})
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("%s: failed to retrieve data from keyring: %w", errorCodeReadingSecret, err)
	}

	result, err := k.codec.decode(data)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (k *KeyringStore[K, T]) Save(ctx context.Context, key K, value *T) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	data, err := k.codec.encode(value)
	if err != nil {
		return err
	}

	_, err = runWithContext(ctx, func() (struct{}, error) {
		return struct{}{}, keyring.Set(k.service, string(key), string(data))
	})
	if err != nil {
		return fmt.Errorf("failed to save secrets to keyring: %w", err)
	}

	return nil
}

type keyringValueCodec[T any] struct {
	encode func(value *T) (string, error)
	decode func(data string) (T, error)
}

func newJSONKeyringValueCodec[T any]() keyringValueCodec[T] {
	return keyringValueCodec[T]{
		encode: func(value *T) (string, error) {
			data, err := json.Marshal(value)
			if err != nil {
				return "", fmt.Errorf("failed to marshal the secret: %w", err)
			}
			return string(data), nil
		},
		decode: func(data string) (T, error) {
			var result T
			if err := json.Unmarshal([]byte(data), &result); err != nil {
				return result, fmt.Errorf("%s: failed to unmarshal secret: %w", errorCodeParsingSecret, err)
			}
			return result, nil
		},
	}
}

func newRawStringKeyringValueCodec() keyringValueCodec[string] {
	return keyringValueCodec[string]{
		encode: func(value *string) (string, error) {
			return *value, nil
		},
		decode: func(data string) (string, error) {
			return data, nil
		},
	}
}

func (k *KeyringStore[K, T]) Delete(ctx context.Context, key K) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	_, err := runWithContext(ctx, func() (struct{}, error) {
		return struct{}{}, keyring.Delete(k.service, string(key))
	})
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			return nil
		}
		return fmt.Errorf("failed to delete secret: %w", err)
	}

	return nil
}

// go-keyring does not expose context-aware APIs, so cancellation is implemented
// by racing the operation result with ctx.Done().
func runWithContext[T any](ctx context.Context, fn func() (T, error)) (T, error) {
	type result struct {
		value T
		err   error
	}

	resultCh := make(chan result, 1)
	go func() {
		value, err := fn()
		resultCh <- result{
			value: value,
			err:   err,
		}
	}()

	select {
	case <-ctx.Done():
		var zero T
		return zero, ctx.Err()
	case res := <-resultCh:
		if err := ctx.Err(); err != nil {
			var zero T
			return zero, err
		}
		return res.value, res.err
	}
}
