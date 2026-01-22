// Package path provides a type-safe way to handle filesystem paths
// as a sequence of path components. It ensures proper path manipulation
// and provides methods for common path operations.
package path

import (
	"path/filepath"
	"runtime"
	"strings"
)

// Path represents a filesystem path as a sequence of path components.
// Each element in the slice represents a single path component.
// The path is always normalized.
type Path []string

// String returns the path as a string with components joined by
// the system-specific path separator. The resulting path always
// starts with a path separator or volume name (on windows).
func (p Path) String() string {
	// there's an issue with filepath.Join on windows if the first path part is the volume name
	// where it won't add the separator between the volume name and the path, so we use strings.Join
	var ret string
	for i, e := range p {
		if e != "" {
			ret = filepath.Clean(strings.Join(p[i:], string(filepath.Separator)))
			break
		}
	}

	if runtime.GOOS == "windows" && len(p) > 0 {
		if vol := filepath.VolumeName(ret); vol != "" && strings.HasPrefix(ret, vol) {
			return ret
		}
	}

	return string(filepath.Separator) + ret
}

// Parse creates a new Path from a string representation.
// The input string can be either absolute or relative, but leading separators
// are stripped. On Windows, volume names (drive letters or UNC paths) are also
// stripped, making all paths relative to the volume root.
// Empty strings and root paths ("/") return nil.
// The resulting path is normalized (removes ".", "..", and duplicate separators).
func Parse(s string) Path {
	if s == "" {
		return nil
	}
	// Clean the path and remove leading separator
	s = filepath.Clean(s)
	// Extract and remove volume name (e.g., "C:" or "\\server\share" on Windows)
	// This makes all paths relative to the volume root
	volume := filepath.VolumeName(s)
	s = s[len(volume):]
	if len(s) > 0 && s[0] == filepath.Separator {
		s = s[1:]
	}
	if s == "" {
		return nil
	}
	return Path(strings.Split(s, string(filepath.Separator)))
}
