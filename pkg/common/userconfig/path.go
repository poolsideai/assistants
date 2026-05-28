__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

	"github.com/adrg/xdg"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Directory returns the OS abs path for the directory containing user-specific config files.
__POOL_SYNTHETIC_IMPORT_BASELINE__
func Directory() string {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
