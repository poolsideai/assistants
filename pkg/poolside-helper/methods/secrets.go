package methods

type UpsertSecretParams struct {
	Name              string  `json:"name"`
	Value             string  `json:"value"`
	SecretDescription string  `json:"description"`
	PreviousName      *string `json:"previousName,omitempty"`
}

func (p UpsertSecretParams) MethodName() string {
	return "poolside/upsertSecret"
}

func (p UpsertSecretParams) Description() string {
	return "Add or update a poolside secret"
}

type UpsertSecretOutput struct{}

type DeleteSecretParams struct {
	Name string `json:"name"`
}

func (p DeleteSecretParams) MethodName() string {
	return "poolside/deleteSecret"
}

func (p DeleteSecretParams) Description() string {
	return "Delete a poolside secret"
}

type DeleteSecretOutput struct{}

type ListSecretsParams struct {
	RequiredSecrets []string `json:"requiredSecrets"`
}

func (p ListSecretsParams) MethodName() string {
	return "poolside/listSecrets"
}

func (p ListSecretsParams) Description() string {
	return "List poolside secrets"
}

type SecretSummary struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	IsRequired   bool   `json:"isRequired"`
	IsConfigured bool   `json:"isConfigured"`
}

type ListSecretsOutput struct {
	Secrets []SecretSummary `json:"secrets"`
}

type GetSecretParams struct {
	Name string `json:"name"`
}

func (p GetSecretParams) MethodName() string {
	return "poolside/getSecret"
}

func (p GetSecretParams) Description() string {
	return "Get a single poolside secret"
}

type GetSecretOutput struct {
	Name        string `json:"name"`
	Value       string `json:"value"`
	Description string `json:"description"`
}
