__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"path/filepath"
	"strings"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/stretchr/testify/require"
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

func TestAgentsCacheDirHonorsOverride(t *testing.T) {
	override := t.TempDir()
	t.Setenv("POOLSIDE_ACP_AGENTS_DIR", override)

	dir, err := AgentsCacheDir()
	require.NoError(t, err)
	assert.Equal(t, override, dir)

	root, err := BinaryInstallRoot("poolside", "https://example.com/pool.tar.gz", "")
	require.NoError(t, err)
	assert.Equal(t, override, filepath.Dir(filepath.Dir(root)),
		"binary install root should live under the overridden agents cache dir")
}

func TestBinaryInstallRootIncludesChecksum(t *testing.T) {
	t.Setenv("POOLSIDE_ACP_AGENTS_DIR", t.TempDir())

	first, err := BinaryInstallRoot("poolside", "https://example.com/pool.tar.gz", strings.Repeat("a", 64))
	require.NoError(t, err)
	second, err := BinaryInstallRoot("poolside", "https://example.com/pool.tar.gz", strings.Repeat("b", 64))
	require.NoError(t, err)

	assert.NotEqual(t, first, second)
}

func TestAgentsCacheDirDefaultsToUserCache(t *testing.T) {
	t.Setenv("POOLSIDE_ACP_AGENTS_DIR", "")
	t.Setenv("HOME", t.TempDir())

	dir, err := AgentsCacheDir()
	require.NoError(t, err)
	assert.Equal(t, "acp-agents", filepath.Base(dir))
	assert.Equal(t, "poolside", filepath.Base(filepath.Dir(dir)))
}
