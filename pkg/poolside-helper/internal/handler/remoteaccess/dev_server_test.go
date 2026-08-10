package remoteaccess

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/methods"
)

func TestDefaultPortPrefersExplicitEnv(t *testing.T) {
	t.Setenv("POOLSIDE_REMOTE_PORT", "9123")
	t.Setenv("POOLSIDE_WORKTREE_SLOT", "3")
	assert.Equal(t, 9123, defaultPort())
}

func TestDefaultPortDerivesFromWorktreeSlot(t *testing.T) {
	t.Setenv("POOLSIDE_REMOTE_PORT", "")
	t.Setenv("POOLSIDE_WORKTREE_SLOT", "3")
	assert.Equal(t, DefaultPort+30, defaultPort())
}

func TestDefaultPortIgnoresInvalidEnv(t *testing.T) {
	for name, env := range map[string]map[string]string{
		"garbage port":  {"POOLSIDE_REMOTE_PORT": "nope", "POOLSIDE_WORKTREE_SLOT": ""},
		"port too big":  {"POOLSIDE_REMOTE_PORT": "70000", "POOLSIDE_WORKTREE_SLOT": ""},
		"garbage slot":  {"POOLSIDE_REMOTE_PORT": "", "POOLSIDE_WORKTREE_SLOT": "banana"},
		"slot zero":     {"POOLSIDE_REMOTE_PORT": "", "POOLSIDE_WORKTREE_SLOT": "0"},
		"negative slot": {"POOLSIDE_REMOTE_PORT": "", "POOLSIDE_WORKTREE_SLOT": "-2"},
		"nothing set":   {"POOLSIDE_REMOTE_PORT": "", "POOLSIDE_WORKTREE_SLOT": ""},
	} {
		t.Run(name, func(t *testing.T) {
			for k, v := range env {
				t.Setenv(k, v)
			}
			assert.Equal(t, DefaultPort, defaultPort())
		})
	}
}

func TestEnableDefaultsPortFromWorktreeSlot(t *testing.T) {
	// Pick a free port and feed it through the env override so the listen
	// succeeds deterministically.
	port := freePort(t)
	t.Setenv("POOLSIDE_REMOTE_PORT", fmt.Sprintf("%d", port))

	srv, err := NewServer(Options{
		StatePath: filepath.Join(t.TempDir(), "state.json"),
		Hub:       NewHub(),
		Dispatch: func(string, *glsp.Context) (any, bool, bool, error) {
			return nil, true, true, nil
		},
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = srv.Close() })

	status, err := srv.Enable(methods.RemoteAccessEnableParams{Bind: BindLoopback})
	require.NoError(t, err)
	assert.Equal(t, port, status.Port)
}

// TestDevServerProxy covers the dev serving path: UI traffic proxies to the
// dev server, /api stays local, and a dead dev server falls back to static.
func TestDevServerProxy(t *testing.T) {
	dev := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "from-vite:%s", r.URL.Path)
	}))
	t.Cleanup(dev.Close)

	staticDir := t.TempDir()
	require.NoError(t, os.WriteFile(filepath.Join(staticDir, "index.html"), []byte("static-fallback"), 0o644))

	h := newHarness(t)
	proxied := httptest.NewServer(h.server.routes(staticDir, dev.URL))
	t.Cleanup(proxied.Close)

	// UI traffic reaches the dev server.
	body := getBody(t, proxied.URL+"/some/page")
	assert.Equal(t, "from-vite:/some/page", body)

	// API endpoints are handled by the helper, never proxied.
	resp, err := http.Get(proxied.URL + "/api/me")
	require.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	// Dev server gone: fall back to the static bundle.
	dev.Close()
	body = getBody(t, proxied.URL+"/some/page")
	assert.Equal(t, "static-fallback", body)
}

func TestEnableRejectsInvalidDevServerURL(t *testing.T) {
	srv, err := NewServer(Options{
		StatePath: filepath.Join(t.TempDir(), "state.json"),
		Hub:       NewHub(),
		Dispatch: func(string, *glsp.Context) (any, bool, bool, error) {
			return nil, true, true, nil
		},
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = srv.Close() })

	params := methods.RemoteAccessEnableParams{Bind: BindLoopback}
	params.Port = freePort(t)
	params.DevServerURL = "127.0.0.1:5179" // missing scheme
	_, err = srv.Enable(params)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid dev server URL")
}

func TestEnableToleratesMissingEnvStaticDir(t *testing.T) {
	t.Setenv("POOLSIDE_REMOTE_STATIC", filepath.Join(t.TempDir(), "does-not-exist"))
	srv, err := NewServer(Options{
		StatePath: filepath.Join(t.TempDir(), "state.json"),
		Hub:       NewHub(),
		Dispatch: func(string, *glsp.Context) (any, bool, bool, error) {
			return nil, true, true, nil
		},
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = srv.Close() })

	params := methods.RemoteAccessEnableParams{Bind: BindLoopback}
	params.Port = freePort(t)
	_, err = srv.Enable(params)
	require.NoError(t, err, "env static dir is advisory and must not fail enable")
}

func getBody(t *testing.T, url string) string {
	t.Helper()
	resp, err := http.Get(url)
	require.NoError(t, err)
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	require.NoError(t, err)
	return string(data)
}
