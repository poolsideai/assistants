package goroutine

import (
	"log/slog"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestWithRecover(t *testing.T) {
	goroutinePackageBeingTested = true
	t.Cleanup(func() {
		goroutinePackageBeingTested = false
	})

	t.Run("panic with custom handler", func(t *testing.T) {
		done := make(chan struct{})
		var captured error

		onPanic := func(err error) {
			captured = err
			close(done)
		}

		panickingFn := func() {
			panic("test panic")
		}

		WithRecover(panickingFn, onPanic)

		select {
		case <-done:
			require.NotNil(t, captured)
			assert.Contains(t, captured.Error(), "panic with value: test panic")
		case <-time.After(time.Second):
			t.Fatal("timed out waiting for onPanic to be called")
		}
	})

	t.Run("no panic occurs", func(t *testing.T) {
		done := make(chan struct{})
		var executed bool

		normalFunc := func() {
			executed = true
			close(done)
		}

		WithRecover(normalFunc)

		select {
		case <-done:
			require.True(t, executed)
		case <-time.After(time.Second):
			t.Fatal("Test timed out waiting for function execution")
		}
	})
}

func TestDefaultErrorLogging(t *testing.T) {
	goroutinePackageBeingTested = true
	t.Cleanup(func() {
		goroutinePackageBeingTested = false
	})

	t.Run("default slog error logging on panic", func(t *testing.T) {
		done := make(chan struct{})

		oldDefault := slog.Default()
		t.Cleanup(func() {
			slog.SetDefault(oldDefault)
		})

		var buf strings.Builder
		handler := slog.NewTextHandler(&buf, &slog.HandlerOptions{
			Level: slog.LevelError,
		})
		logger := slog.New(handler)
		slog.SetDefault(logger)

		panickingFn := func() {
			close(done)
			panic("test default logging")
		}

		WithRecover(panickingFn)

		select {
		case <-done:
			// since we panicked, and have no handler, we can't synchronise, so wait a good while
			// to minimize flakes
			time.Sleep(100 * time.Millisecond)
			logOutput := buf.String()
			require.Contains(t, logOutput, "recovered from panic")
			require.Contains(t, logOutput, "test default logging")
		case <-time.After(time.Second):
			t.Fatal("panickingFn never ran")
		}
	})
}
