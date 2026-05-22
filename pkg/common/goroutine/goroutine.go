package goroutine

import (
	"fmt"
	"log/slog"
	"testing"

	pkgerrors "github.com/pkg/errors"
)

// WithRecover is equivalent to `go fn()`, but recovers on panic,
// This prevents a panic from crashing the process. It will
// call onPanic with an error, either an error passed to panic
// or an error value wrapping the non-error panic value.
//
// If not provided, onPanic will default to logging the error via slog.Error,
// but NOT in tests. This is designed to be a safety measure,
// so failing loudly in tests is when specific panic handling is not supplied is desirable.
func WithRecover(f func(), onPanic ...func(error)) {
	handle := logError
	if testing.Testing() && !goroutinePackageBeingTested {
		handle = failLoudly
	}
	if len(onPanic) > 0 {
		handle = onPanic[0]
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				err, ok := r.(error)
				if ok {
					// capture a stack if we're missing one
					if _, ok := err.(interface {
						StackTrace() pkgerrors.StackTrace
					}); !ok {
						err = pkgerrors.WithStack(err)
					}
				} else {
					err = pkgerrors.Errorf("panic with value: %v", r)
				}
				handle(err)
			}
		}()

		f()
	}()
}

var goroutinePackageBeingTested bool

func logError(err error) {
	slog.Error("recovered from panic", slog.String("error", fmt.Sprintf("%+v", err)))
}

func failLoudly(err error) {
	panic(err)
}
