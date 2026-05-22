__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import (
	"fmt"
	"os/user"
)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

// Human returns a human-readable version string. Use the exported constants
// for programmatic usage.
func Human() string {
	if user, _ := user.Current(); Commit == "local" && user != nil {
		return fmt.Sprintf("local (by %s)", user.Username)
	}
	return fmt.Sprintf("%s (%s) %s", Tag, Commit, BuildTime)
}
