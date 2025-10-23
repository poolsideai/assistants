package userconfig

import (
	"os"
	"path/filepath"

	"github.com/adrg/xdg"
)

// Directory returns the OS abs path for the directory containing user-specific config files.
// Uses XDG_CONFIG_HOME if set, otherwise defaults to $HOME/.config.
func Directory() string {
	configHome := os.Getenv("XDG_CONFIG_HOME")
	if configHome == "" {
		homeDir, err := os.UserHomeDir()
		if err == nil {
			configHome = filepath.Join(homeDir, ".config")
		}
	}
	return configHome
}

// PoolsideDirectory returns the OS abs path to the poolside config directory.
func PoolsideDirectory() string {
	return filepath.Join(Directory(), "poolside")
}

// PoolsideConfigFile returns OS abs to a config file in poolside config directory
func PoolsideConfigFile(name string) string {
	return filepath.Join(PoolsideDirectory(), name)
}

// StateDirectory returns the path to poolside's XDG state directory for data that should
// persist between application restarts but is not important enough to store in $XDG_DATA_HOME
// (e.g. logs, history, recently used files).
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func StateDirectory() string {
	return filepath.Join(xdg.StateHome, "poolside")
}
