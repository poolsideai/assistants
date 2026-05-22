package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHuman(t *testing.T) {
	prev := Commit
	t.Cleanup(func() {
		Commit = prev
	})

	t.Run("non-release version indicates username", func(t *testing.T) {
		Commit = "local"
		assert.Contains(t, Human(), "local (by ")
	})

	t.Run("built version indicates build time", func(t *testing.T) {
		Commit = "aabbcc"
		assert.Equal(t, "untagged (aabbcc) "+BuildTime, Human())
	})
}
