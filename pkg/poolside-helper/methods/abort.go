package methods

type AbortParams struct {
	OperationID string `json:"operationId" doc:"an identifier that can be used to halt an operation"`
}

func (u AbortParams) MethodName() string {
	return "poolside/abort"
}

type AbortOutput struct{}
