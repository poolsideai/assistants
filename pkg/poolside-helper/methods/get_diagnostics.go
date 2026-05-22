package methods

import (
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

type GetDiagnosticsParams struct {
	URI      protocol2.DocumentURI        `json:"uri"`
	Severity protocol2.DiagnosticSeverity `json:"severity"`
	// WaitMs is passed when the caller knows a recent edit has happened and the diagnostics might not
	// have been published to the IDE yet. The IDE should allow up to wait_ms for new diagnostics to
	// arrive before returning.
	WaitMs int32 `json:"waitMs,omitempty"`
}

func (p GetDiagnosticsParams) MethodName() string {
	return "poolside/getDiagnostics"
}

type GetDiagnosticsOutput struct {
	Diagnostics []protocol2.Diagnostic `json:"diagnostics"`
}
