__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"crypto/sha256"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"path/filepath"
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
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/acpproxy"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	h := New()
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
	registerJSONRPCMethod(h, JSONRPCOperation{
		Method: "test/error-data",
	}, func(ctx context.Context, req *int, lspReq *glsp.Context) (any, error) {
		wireErr := &jsonrpc2.WireError{
			Code:    jsonrpc2.CodeInternalError,
			Message: "Internal error",
		}
		wireErr.SetError(map[string]any{
			"error":   "loaded session does not exist",
			"details": []string{"session-1", "workspace-a"},
		})
		return nil, wireErr
	})
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		h := New()
__POOL_SYNTHETIC_IMPORT_BASELINE__
			AssistantEnvironment: string(methods.AssistantEnvironment("production")),
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
	t.Run("jsonrpc error data is logged", func(t *testing.T) {
		tlog := testLogger()

		_, validMethod, _, err := h.Handle(lsptest.NewGLSPTestCtxForMethod(t,
			"test/error-data",
			mustJSON(t, 42),
		))
		require.True(t, validMethod, "expected valid method")
		assert.Error(t, err)

		assert.Contains(t, tlog.String(), `error="jsonrpc2: code -32603 message: Internal error`)
		assert.Contains(t, tlog.String(), `error_data="{\"details\":[\"session-1\",\"workspace-a\"],\"error\":\"loaded session does not exist\"}"`)
	})

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

	t.Run("successful acp nav list requests are silent", func(t *testing.T) {
		tlog := testLogger()
		h := New()
		h.SetInitialized(true)
		h.extensionHandlers[methods.ACPNavListMethod] = func(ctx context.Context, req *glsp.Context) (any, error) {
			return methods.ACPNavState{}, nil
		}

		_, validMethod, validParams, err := h.Handle(lsptest.NewGLSPTestCtxForMethod(t,
			methods.ACPNavListMethod,
			mustJSON(t, &methods.ACPNavListParams{}),
		))
		require.NoError(t, err)
		require.True(t, validMethod && validParams, "expected valid call")

		assert.NotContains(t, tlog.String(), methods.ACPNavListMethod)
	})
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		h := New()
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
			mustJSON(t, map[string]any{"id": 42}),
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
		h := New()
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
				mustJSON(t, map[string]any{"id": rid}),
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
			// Loop variable passed as an argument (not captured) to appease
			// nogo's loopclosure analyzer, which cannot see the Go language
			// version under rules_go and assumes pre-1.22 capture semantics.
			go func(rid int) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
			}(rid)
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
				mustJSON(t, map[string]any{"id": rid}),
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
		h := New()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
			methods.ACPInitializeMethod,
			methods.ACPSteerMethod,
			methods.ACPSetConfigOptionMethod,
			methods.ACPSetModeMethod,
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
		h := newHandlerBaseState()
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
		registerExtensionMethodUntyped(h, JSONRPCOperation{
			Method: "test/serializedUntypedMethod",
		}, func(ctx context.Context, req *string, lspReq *glsp.Context) (string, error) {
			return "", nil
		})

		registerUnserializedExtensionMethodUntyped(h, JSONRPCOperation{
			Method: "test/unserializedUntypedMethod",
		}, func(ctx context.Context, req *string, lspReq *glsp.Context) (string, error) {
			return "", nil
		})

		registerUnserializedExtensionMethodUntypedNoDeadline(h, JSONRPCOperation{
			Method: "test/unserializedUntypedMethodNoDeadline",
		}, func(ctx context.Context, req *string, lspReq *glsp.Context) (string, error) {
			return "", nil
		})

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		assert.False(t, h.IsConcurrentMethod("test/serializedUntypedMethod"), "serialized untyped method should not be concurrent")
		assert.True(t, h.IsConcurrentMethod("test/unserializedUntypedMethod"), "unserialized untyped method should be concurrent")
		assert.True(t, h.IsConcurrentMethod("test/unserializedUntypedMethodNoDeadline"), "unserialized no-deadline method should be concurrent")
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func TestRequestContextDeadlines(t *testing.T) {
	h := newHandlerBaseState()
	h.SetInitialized(true)

	var sawDefaultDeadline bool
	registerExtensionMethodUntyped(h, JSONRPCOperation{
		Method: "test/defaultDeadlineMethod",
	}, func(ctx context.Context, req *string, lspReq *glsp.Context) (string, error) {
		_, sawDefaultDeadline = ctx.Deadline()
		return "", nil
	})

	var sawNoDeadline bool
	registerUnserializedExtensionMethodUntypedNoDeadline(h, JSONRPCOperation{
		Method: "test/noDeadlineMethod",
	}, func(ctx context.Context, req *string, lspReq *glsp.Context) (string, error) {
		_, sawNoDeadline = ctx.Deadline()
		return "", nil
	})

	_, validMethod, validParams, err := h.Handle(lsptest.NewGLSPTestCtxForMethod(t,
		"test/defaultDeadlineMethod",
		mustJSON(t, "hello"),
	))
	require.NoError(t, err)
	require.True(t, validMethod)
	require.True(t, validParams)
	assert.True(t, sawDefaultDeadline)

	_, validMethod, validParams, err = h.Handle(lsptest.NewGLSPTestCtxForMethod(t,
		"test/noDeadlineMethod",
		mustJSON(t, "hello"),
	))
	require.NoError(t, err)
	require.True(t, validMethod)
	require.True(t, validParams)
	assert.False(t, sawNoDeadline)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func TestACPInitializeHasNoRequestDeadline(t *testing.T) {
	h := New()

	_, ok := h.noDeadlineMethods[methods.ACPInitializeMethod]
	require.True(t, ok)
	assert.True(t, h.IsConcurrentMethod(methods.ACPInitializeMethod))
}

func TestACPNavInstallAgentServerHasNoRequestDeadline(t *testing.T) {
	h := New()

	_, ok := h.noDeadlineMethods[methods.ACPNavInstallAgentServerMethod]
	require.True(t, ok)
	assert.True(t, h.IsConcurrentMethod(methods.ACPNavInstallAgentServerMethod))
}

func TestAgentServerBinaryDistributionConversionsPreserveSHA256(t *testing.T) {
	binaries := map[string]methods.ACPAgentServerBinaryDistribution{
		"darwin-aarch64": {
			Archive: "https://example.com/agent.tar.gz",
			SHA256:  "0123456789abcdef",
			Cmd:     "./agent",
		},
	}

	proxyBinaries := toProxyAgentServerBinaries(binaries)
	require.Contains(t, proxyBinaries, "darwin-aarch64")
	assert.Equal(t, "0123456789abcdef", proxyBinaries["darwin-aarch64"].SHA256)

	roundTripped := toMethodsAgentServerBinaries(proxyBinaries)
	require.Contains(t, roundTripped, "darwin-aarch64")
	assert.Equal(t, "0123456789abcdef", roundTripped["darwin-aarch64"].SHA256)
}

func TestAgentServersForHost(t *testing.T) {
	state := methods.ACPNavAgentServersState{
		AgentServers: methods.ACPAgentServers{
			acpproxy.DefaultAgentServerName: {},
			methods.LocalAgentServerName:    {Type: "local"},
		},
		DefaultAgentServer: methods.LocalAgentServerName,
	}

	t.Run("desktop keeps local inference", func(t *testing.T) {
		h := New()
		h.config = &Config{AssistantHost: "desktop"}

		filtered := h.agentServersForHost(state)

		assert.Contains(t, filtered.AgentServers, methods.LocalAgentServerName)
		assert.Equal(t, methods.LocalAgentServerName, filtered.DefaultAgentServer)
	})

	t.Run("VS Code removes local inference and falls back to Poolside", func(t *testing.T) {
		h := New()
		h.config = &Config{AssistantHost: "vscode"}

		filtered := h.agentServersForHost(state)

		assert.NotContains(t, filtered.AgentServers, methods.LocalAgentServerName)
		assert.Equal(t, acpproxy.DefaultAgentServerName, filtered.DefaultAgentServer)
		assert.Contains(t, state.AgentServers, methods.LocalAgentServerName)
	})
}

func TestACPNavStateForHost(t *testing.T) {
	state := methods.ACPNavState{
		Conversations: []methods.ACPNavConversation{
			{ID: "poolside", AgentServer: acpproxy.DefaultAgentServerName},
			{ID: "local", AgentServer: methods.LocalAgentServerName},
		},
	}

	t.Run("desktop keeps local conversations", func(t *testing.T) {
		h := &PoolsideHandler{config: &Config{AssistantHost: "desktop"}}
		filtered := h.acpNavStateForHost(state)
		require.Len(t, filtered.Conversations, 2)
	})

	t.Run("vscode hides local conversations", func(t *testing.T) {
		h := &PoolsideHandler{config: &Config{AssistantHost: "vscode"}}
		filtered := h.acpNavStateForHost(state)
		require.Len(t, filtered.Conversations, 1)
		assert.Equal(t, "poolside", filtered.Conversations[0].ID)
		require.Len(t, state.Conversations, 2, "filter must not mutate shared state")
	})
}

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
__POOL_SYNTHETIC_IMPORT_BASELINE__

type performanceRPCInput struct {
	Content string   `json:"content"`
	Parts   []string `json:"parts"`
}

func BenchmarkJSONRPCDecodeLargePayload(b *testing.B) {
	b.Setenv("POOLSIDE_REMOTE_ACCESS_STATE", filepath.Join(b.TempDir(), "remote.json"))
	payload, err := json.Marshal(performanceRPCInput{Content: strings.Repeat("streamed file content\n", 16000), Parts: []string{"one", "two"}})
	require.NoError(b, err)
	for _, unvalidated := range []bool{false, true} {
		name := "registered-production"
		if unvalidated {
			name = "unvalidated"
		}
		b.Run(name, func(b *testing.B) {
			h := New()
			operation := JSONRPCOperation{Method: "test/performance"}
			handle := func(_ context.Context, input *performanceRPCInput, _ *glsp.Context) (int, error) {
				return len(input.Content), nil
			}
			if unvalidated {
				registerSerializedJSONRPCUnvalidated(h, operation, handle)
			} else {
				registerJSONRPCMethod(h, operation, handle)
			}
			request := &glsp.Context{Params: payload}
			b.ReportAllocs()
			b.SetBytes(int64(len(payload)))
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				_, err := h.extensionHandlers[operation.Method](context.Background(), request)
				if err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

// The diagnostic digest lets the performance audit compare the entire emitted
// schema before/after changing when it is built, without pinning API evolution.
func TestJSONRPCSchemaDiagnostic(t *testing.T) {
	t.Setenv("POOLSIDE_REMOTE_ACCESS_STATE", filepath.Join(t.TempDir(), "remote.json"))
	h := New()
	encoded, err := json.Marshal(h.OpenAPI().OpenAPI())
	require.NoError(t, err)
	require.Greater(t, len(h.OpenAPI().OpenAPI().Paths), 100)
	t.Logf("schema bytes=%d sha256=%x", len(encoded), sha256.Sum256(encoded))
}

func BenchmarkJSONRPCStartupRegistration(b *testing.B) {
	b.Setenv("POOLSIDE_REMOTE_ACCESS_STATE", filepath.Join(b.TempDir(), "remote.json"))
	b.ResetTimer()
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		h := New()
		if len(h.extensionHandlers) < 100 {
			b.Fatal("missing registered handlers")
		}
	}
}

func TestJSONRPCDeferredSchemasPreserveValidationAndLateRegistration(t *testing.T) {
	t.Setenv("POOLSIDE_REMOTE_ACCESS_STATE", filepath.Join(t.TempDir(), "remote.json"))
	h := New()
	require.Nil(t, h.huma, "production startup should not build schemas")
	input := &glsp.Context{Params: json.RawMessage(`{"ping":"` + strings.Repeat("x", 129) + `"}`)}
	_, err := h.extensionHandlers["poolside/hello"](context.Background(), input)
	require.NoError(t, err)
	assert.Nil(t, h.huma, "production requests should not build schemas")
	h.config.AssistantEnvironment = string(methods.DevelopmentEnv)
	_, err = h.extensionHandlers["poolside/hello"](context.Background(), input)
	require.ErrorContains(t, err, "expected length <= 128")
	require.NotNil(t, h.huma)
	assert.Empty(t, h.schemaRegistrations, "release registration closures after use")
	registerJSONRPCMethod(h, JSONRPCOperation{Method: "test/late"}, func(context.Context, *HelloIn, *glsp.Context) (bool, error) { return true, nil })
	assert.Contains(t, h.OpenAPI().OpenAPI().Paths, "/test/late")
}

func TestJSONRPCConcurrentFirstSchemaAccess(t *testing.T) {
	t.Setenv("POOLSIDE_REMOTE_ACCESS_STATE", filepath.Join(t.TempDir(), "remote.json"))
	h := New()
	var wg sync.WaitGroup
	counts := make(chan int, 16)
	for i := 0; i < cap(counts); i++ {
		wg.Go(func() { counts <- len(h.OpenAPI().OpenAPI().Paths) })
	}
	wg.Wait()
	want := len(h.OpenAPI().OpenAPI().Paths)
	for i := 0; i < cap(counts); i++ {
		assert.Equal(t, want, <-counts)
	}
}

func TestJSONRPCSingleDecodePreservesInputSemantics(t *testing.T) {
	for _, input := range []string{"", "{", "{\"ping\":"} {
		_, err := decodeJSONRPCInput[HelloIn](json.RawMessage(input))
		require.ErrorIs(t, err, ErrInvalidParams)
		assert.ErrorContains(t, err, "could not parse input as json")
	}
	for _, input := range []string{`{"ping":42}`, `[]`, `"text"`} {
		_, err := decodeJSONRPCInput[HelloIn](json.RawMessage(input))
		require.ErrorIs(t, err, ErrInvalidParams)
		assert.ErrorContains(t, err, "could not decode input")
	}
	input, err := decodeJSONRPCInput[HelloIn](json.RawMessage(`{"ping":"hello","extra":42}`))
	require.NoError(t, err)
	require.NotNil(t, input)
	assert.Equal(t, "hello", input.Ping)
	input, err = decodeJSONRPCInput[HelloIn](json.RawMessage(`null`))
	require.NoError(t, err)
	assert.Nil(t, input)
}
