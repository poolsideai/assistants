// The version package exposes version information stamped at build/release time.
//
// Bazel will set these only when built with `--stamp` which is enabled also with `--config publish`
package version

import (
	"fmt"
	"os/user"
)

var (
	Commit    = "local"
	BuildTime = "current"
	Tag       = "untagged"
)

// Human returns a human-readable version string. Use the exported constants
// for programmatic usage.
func Human() string {
	if user, _ := user.Current(); Commit == "local" && user != nil {
		return fmt.Sprintf("local (by %s)", user.Username)
	}
	return fmt.Sprintf("%s (%s) %s", Tag, Commit, BuildTime)
}
