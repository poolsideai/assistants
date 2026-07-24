package logging

import (
	"log/slog"
	"os"

__POOL_SYNTHETIC_IMPORT_BASELINE__
)

// logLevel is shared across the process to allow dynamic log level changes
var logLevel = new(slog.LevelVar)

// Init initializes the default slog logger for poolside-helper.
func Init() {
	handler := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		Level: logLevel,
	})
	slog.SetDefault(slog.New(handler))
}

// UpdateLevelForEnvironment updates the log level based on the assistant environment.
func UpdateLevelForEnvironment(env methods.AssistantEnvironment) {
	switch env {
	case methods.DevelopmentEnv, methods.TestingEnv:
		logLevel.Set(slog.LevelDebug)
		slog.Info("log level set to DEBUG", "environment", string(env))
	default:
		logLevel.Set(slog.LevelInfo)
	}
}
