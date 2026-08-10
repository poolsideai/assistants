package secrets

// redacted string - if we see this in our logs, we are printing secret values
const redacted = "[REDACTED]"

// SecretValue wraps a secret string to prevent accidental logging or
// serialization. Use Expose() to access the underlying value.
type SecretValue struct{ inner string }

func NewSecretValue(s string) SecretValue { return SecretValue{inner: s} }

// Expose returns the secret value, be careful not to log or store it
func (s SecretValue) Expose() string { return s.inner }

func (s SecretValue) String() string   { return redacted }
func (s SecretValue) GoString() string { return redacted }

func (s SecretValue) MarshalJSON() ([]byte, error) {
	return []byte(`"` + redacted + `"`), nil
}

func (s SecretValue) MarshalText() ([]byte, error) {
	return []byte(redacted), nil
}
