package methods

import (
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

type GetDiagnosticsParams struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// WaitMs is passed when the caller knows a recent edit has happened and the diagnostics might not
	// have been published to the IDE yet. The IDE should allow up to wait_ms for new diagnostics to
	// arrive before returning.
	WaitMs int32 `json:"waitMs,omitempty"`
}

func (p GetDiagnosticsParams) MethodName() string {
	return "poolside/getDiagnostics"
}

type GetDiagnosticsOutput struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}
