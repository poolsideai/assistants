// Package path provides a type-safe way to handle filesystem paths
// as a sequence of path components. It ensures proper path manipulation
// and provides methods for common path operations.
package path

import (
	"path/filepath"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"strings"
)

// Path represents a filesystem path as a sequence of path components.
// Each element in the slice represents a single path component.
// The path is always normalized.
type Path []string

// String returns the path as a string with components joined by
// the system-specific path separator. The resulting path always
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (p Path) String() string {
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

// Parse creates a new Path from a string representation.
// The input string can be either absolute or relative, but leading separators
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Empty strings and root paths ("/") return nil.
// The resulting path is normalized (removes ".", "..", and duplicate separators).
func Parse(s string) Path {
	if s == "" {
		return nil
	}
	// Clean the path and remove leading separator
	s = filepath.Clean(s)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if len(s) > 0 && s[0] == filepath.Separator {
		s = s[1:]
	}
	if s == "" {
		return nil
	}
	return Path(strings.Split(s, string(filepath.Separator)))
}
