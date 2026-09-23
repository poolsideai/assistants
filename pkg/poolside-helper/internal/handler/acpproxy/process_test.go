package acpproxy

import (
	"bufio"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"encoding/json"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"fmt"
	"io"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"path/filepath"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"testing"
__POOL_SYNTHETIC_IMPORT_BASELINE__

	acpsdk "github.com/coder/acp-go-sdk"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildInitializeRequest(t *testing.T) {
	t.Run("uses helper defaults when request is omitted", func(t *testing.T) {
__POOL_SYNTHETIC_IMPORT_BASELINE__

		assert.Equal(t, acpsdk.ProtocolVersion(acpsdk.ProtocolVersionNumber), req.ProtocolVersion)
		require.NotNil(t, req.ClientInfo)
		assert.Equal(t, "poolside-helper", req.ClientInfo.Name)
		assert.True(t, req.ClientCapabilities.Fs.ReadTextFile)
		assert.True(t, req.ClientCapabilities.Fs.WriteTextFile)
		assert.False(t, req.ClientCapabilities.Terminal)
		require.NotNil(t, req.ClientCapabilities.Elicitation)
		assert.NotNil(t, req.ClientCapabilities.Elicitation.Form)
		assert.Nil(t, req.ClientCapabilities.Elicitation.Url)
	})

__POOL_SYNTHETIC_IMPORT_BASELINE__
		title := "VS Code"
		req := buildInitializeRequest(&acpsdk.InitializeRequest{
			ProtocolVersion: acpsdk.ProtocolVersion(99),
			Meta: map[string]any{
				"feature": "test",
			},
			ClientInfo: &acpsdk.Implementation{
				Name:    "assistant-ui",
				Title:   &title,
				Version: "1.2.3",
			},
			ClientCapabilities: acpsdk.ClientCapabilities{
				Terminal: true,
			},
__POOL_SYNTHETIC_IMPORT_BASELINE__

		assert.Equal(t, acpsdk.ProtocolVersion(99), req.ProtocolVersion)
		require.NotNil(t, req.Meta)
		assert.Equal(t, "test", req.Meta["feature"])
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		// Elicitation is helper-owned, so it is advertised even for surfaces
		// that do not declare it themselves.
		require.NotNil(t, req.ClientCapabilities.Elicitation)
		assert.NotNil(t, req.ClientCapabilities.Elicitation.Form)
	})

	t.Run("preserves caller-declared elicitation capabilities", func(t *testing.T) {
		req := buildInitializeRequest(&acpsdk.InitializeRequest{
			ClientCapabilities: acpsdk.ClientCapabilities{
				Elicitation: &acpsdk.ElicitationCapabilities{
					Form: &acpsdk.ElicitationFormCapabilities{},
					Url:  &acpsdk.ElicitationUrlCapabilities{},
				},
			},
		})

		require.NotNil(t, req.ClientCapabilities.Elicitation)
		assert.NotNil(t, req.ClientCapabilities.Elicitation.Url)
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
func TestMarkDisconnected(t *testing.T) {
	t.Run("clears the process when its active connection closes", func(t *testing.T) {
		cmd := &exec.Cmd{}
		conn := &acpsdk.ClientSideConnection{}
		proc := &process{
			cmd:      cmd,
			conn:     conn,
			initResp: &acpsdk.InitializeResponse{ProtocolVersion: acpsdk.ProtocolVersionNumber},
			session:  "s1",
			stdin:    nopWriteCloser{},
			state:    processState{kind: processStateRunning},
		}

		require.True(t, proc.markDisconnected(cmd, conn))
		assert.Equal(t, processStateExited, proc.state.kind)
		assert.WithinDuration(t, time.Now(), proc.state.exitedAt, time.Second)
		assert.Nil(t, proc.cmd)
		assert.Nil(t, proc.conn)
		assert.Nil(t, proc.initResp)
		assert.Empty(t, proc.session)
		assert.Nil(t, proc.stdin)
	})

	t.Run("ignores a stale connection closing", func(t *testing.T) {
		cmd := &exec.Cmd{}
		activeConn := &acpsdk.ClientSideConnection{}
		staleConn := &acpsdk.ClientSideConnection{}
		proc := &process{
			cmd:   cmd,
			conn:  activeConn,
			state: processState{kind: processStateRunning},
		}

		require.False(t, proc.markDisconnected(cmd, staleConn))
		assert.Equal(t, processStateRunning, proc.state.kind)
		assert.Same(t, cmd, proc.cmd)
		assert.Same(t, activeConn, proc.conn)
	})
}

func TestWatchDisconnect(t *testing.T) {
	cmd := &exec.Cmd{}
	conn := acpsdk.NewClientSideConnection(
		&acpClient{},
		nopWriteCloser{},
		strings.NewReader(""),
	)
	notified := make(chan error, 1)
	proc := &process{
		cmd:   cmd,
		conn:  conn,
		state: processState{kind: processStateRunning},
	}

	go proc.watchDisconnect("codex-acp", cmd, conn, func(_ string, err error) {
		notified <- err
	})

	select {
	case err := <-notified:
		require.EqualError(t, err, "ACP peer disconnected")
	case <-time.After(time.Second):
		require.FailNow(t, "disconnect notification timed out")
	}
	assert.Equal(t, processStateExited, proc.state.kind)
	assert.Nil(t, proc.conn)
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func TestSupportsSessionClose(t *testing.T) {
	capsProc := func(caps acpsdk.AgentCapabilities) *process {
		return &process{
			state:    processState{kind: processStateRunning},
			initResp: &acpsdk.InitializeResponse{AgentCapabilities: caps},
		}
	}

	t.Run("false without an initialize response", func(t *testing.T) {
		assert.False(t, (&process{}).supportsSessionClose())
	})

	t.Run("false without the close capability", func(t *testing.T) {
		assert.False(t, capsProc(acpsdk.AgentCapabilities{LoadSession: true}).supportsSessionClose())
	})

	t.Run("false with close but no way to reopen", func(t *testing.T) {
		caps := acpsdk.AgentCapabilities{
			SessionCapabilities: acpsdk.SessionCapabilities{Close: &acpsdk.SessionCloseCapabilities{}},
		}
		assert.False(t, capsProc(caps).supportsSessionClose())
	})

	t.Run("true with close and resume", func(t *testing.T) {
		caps := acpsdk.AgentCapabilities{
			SessionCapabilities: acpsdk.SessionCapabilities{
				Close:  &acpsdk.SessionCloseCapabilities{},
				Resume: &acpsdk.SessionResumeCapabilities{},
			},
		}
		assert.True(t, capsProc(caps).supportsSessionClose())
	})

	t.Run("true with close and loadSession", func(t *testing.T) {
		caps := acpsdk.AgentCapabilities{
			LoadSession:         true,
			SessionCapabilities: acpsdk.SessionCapabilities{Close: &acpsdk.SessionCloseCapabilities{}},
		}
		assert.True(t, capsProc(caps).supportsSessionClose())
	})
}

// newProcessWithFakeSessionAgent wires a running process to a fake agent that
// answers every session/new call with a fresh sequential session id, and
// answers session/load and session/resume with an empty result, so tests can
// drive newSessionLocked, loadSessionLocked, and resumeSessionLocked without a
// real subprocess. The returned func performs one session/new call (tagged as
// a config probe when probe is true) and returns the session id the fake
// agent assigned.
func newProcessWithFakeSessionAgent(t *testing.T) (*process, func(probe bool) acpsdk.SessionId) {
	t.Helper()

	agentInR, agentInW := io.Pipe()
	agentOutR, agentOutW := io.Pipe()
	t.Cleanup(func() {
		agentInW.Close()
		agentOutW.Close()
	})

	go func() {
		scanner := bufio.NewScanner(agentInR)
		n := 0
		for scanner.Scan() {
			var req struct {
				ID     any    `json:"id"`
				Method string `json:"method"`
			}
			if err := json.Unmarshal(scanner.Bytes(), &req); err != nil {
				continue
			}
			var result any
			switch req.Method {
			case "session/new":
				n++
				result = map[string]any{"sessionId": fmt.Sprintf("session-%d", n)}
			case "session/load", "session/resume":
				result = map[string]any{}
			default:
				continue
			}
			resp, _ := json.Marshal(map[string]any{
				"jsonrpc": "2.0",
				"id":      req.ID,
				"result":  result,
			})
			if _, err := agentOutW.Write(append(resp, '\n')); err != nil {
				return
			}
		}
	}()

	proc := &process{
		state: processState{kind: processStateRunning},
		conn:  acpsdk.NewClientSideConnection(&acpClient{}, agentInW, agentOutR),
	}

	newSession := func(probe bool) acpsdk.SessionId {
		t.Helper()
		req := acpsdk.NewSessionRequest{Cwd: "/tmp"}
		if probe {
			req.Meta = map[string]any{configProbeMetaKey: true}
		}
		proc.mu.Lock()
		resp, err := proc.newSessionLocked(context.Background(), req)
		proc.mu.Unlock()
		require.NoError(t, err)
		return resp.SessionId
	}

	return proc, newSession
}

func TestNewSessionLockedConfigProbeFallback(t *testing.T) {
	t.Run("adopts a probe session as the fallback when none is set", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)

		probeID := newSession(true)
		require.NotEmpty(t, probeID)

		proc.mu.Lock()
		fallback := proc.session
		proc.mu.Unlock()
		assert.Equal(t, probeID, fallback)
	})

	t.Run("does not repoint an established fallback to a later probe session", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)

		realID := newSession(false)
		require.NotEmpty(t, realID)

		probeID := newSession(true)
		require.NotEqual(t, realID, probeID, "test setup: probe must return a distinct session id")

		proc.mu.Lock()
		fallback := proc.session
		proc.mu.Unlock()
		assert.Equal(t, realID, fallback, "fallback must stay on the real session")
		assert.NotEqual(t, probeID, fallback, "a probe must not repoint an established fallback")
	})

	t.Run("a later real session still repoints the fallback", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)

		_ = newSession(false) // establishes the initial fallback
		_ = newSession(true)  // must not disturb it

		realID := newSession(false)
		require.NotEmpty(t, realID)

		proc.mu.Lock()
		fallback := proc.session
		proc.mu.Unlock()
		assert.Equal(t, realID, fallback)
	})

	t.Run("a rotating probe replaces a fallback that is itself a probe", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)

		firstProbeID := newSession(true)
		require.NotEmpty(t, firstProbeID)

		secondProbeID := newSession(true)
		require.NotEqual(t, firstProbeID, secondProbeID,
			"test setup: the rotation must return a distinct session id")

		proc.mu.Lock()
		fallback := proc.session
		proc.mu.Unlock()
		// The client closes a superseded probe after its drain window, so
		// leaving the fallback on the first one would point it at a closed
		// session.
		assert.Equal(t, secondProbeID, fallback, "rotation must move the fallback to the live probe")
	})
}

// TestNewSessionLockedConfigProbePreservesPromptRuntimeErr covers FIX 1: a
// config probe's session/new must not clear a latched promptRuntimeErr, since
// that latch is how the next real prompt learns about a fatal runtime failure
// (e.g. rejected MCP connector credentials) and fails fast with an actionable
// message. Only a non-probe session/new may clear it.
func TestNewSessionLockedConfigProbePreservesPromptRuntimeErr(t *testing.T) {
	t.Run("a config probe does not clear a latched runtime error", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)
		proc.mu.Lock()
		proc.promptRuntimeErr = &mcpConnectorCredentialsError{}
		proc.mu.Unlock()

		probeID := newSession(true)
		require.NotEmpty(t, probeID)

		proc.mu.Lock()
		latched := proc.promptRuntimeErr
		proc.mu.Unlock()
		var connectorErr *mcpConnectorCredentialsError
		assert.ErrorAs(t, latched, &connectorErr,
			"a background probe must not clear a latch the next real prompt depends on")
	})

	t.Run("a real session clears a latched runtime error", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)
		proc.mu.Lock()
		proc.promptRuntimeErr = &mcpConnectorCredentialsError{}
		proc.mu.Unlock()

		realID := newSession(false)
		require.NotEmpty(t, realID)

		proc.mu.Lock()
		latched := proc.promptRuntimeErr
		proc.mu.Unlock()
		assert.NoError(t, latched, "a real session/new must still clear a stale latch")
	})
}

// newLoadSessionRequest and newResumeSessionRequest build minimal requests for
// driving loadSessionLocked/resumeSessionLocked against the fake agent set up
// by newProcessWithFakeSessionAgent, tagged as a config probe when probe is
// true.
func newLoadSessionRequest(id acpsdk.SessionId, probe bool) acpsdk.LoadSessionRequest {
	req := acpsdk.LoadSessionRequest{SessionId: id, Cwd: "/tmp", McpServers: []acpsdk.McpServer{}}
	if probe {
		req.Meta = map[string]any{configProbeMetaKey: true}
	}
	return req
}

func newResumeSessionRequest(id acpsdk.SessionId, probe bool) acpsdk.ResumeSessionRequest {
	req := acpsdk.ResumeSessionRequest{SessionId: id, Cwd: "/tmp"}
	if probe {
		req.Meta = map[string]any{configProbeMetaKey: true}
	}
	return req
}

// TestLoadSessionLockedConfigProbeFallback covers FIX 2's loadSessionLocked
// half: no client sends the probe marker on session/load today (it is latent,
// see the configProbeMetaKey comment in handler.go), but the guard must match
// newSessionLocked's so the bug cannot come back on this path either.
func TestLoadSessionLockedConfigProbeFallback(t *testing.T) {
	t.Run("adopts a probe session as the fallback when none is set", func(t *testing.T) {
		proc, _ := newProcessWithFakeSessionAgent(t)

		proc.mu.Lock()
		_, err := proc.loadSessionLocked(context.Background(), newLoadSessionRequest("probe-session", true))
		fallback := proc.session
		proc.mu.Unlock()

		require.NoError(t, err)
		assert.Equal(t, acpsdk.SessionId("probe-session"), fallback)
	})

	t.Run("does not repoint an established fallback to a probe load", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)
		realID := newSession(false)
		require.NotEmpty(t, realID)
		proc.mu.Lock()
		proc.promptRuntimeErr = &mcpConnectorCredentialsError{}
		proc.mu.Unlock()

		proc.mu.Lock()
		_, err := proc.loadSessionLocked(context.Background(), newLoadSessionRequest("probe-session", true))
		fallback := proc.session
		latched := proc.promptRuntimeErr
		proc.mu.Unlock()

		require.NoError(t, err)
		assert.Equal(t, realID, fallback, "a probe load must not repoint an established fallback")
		var connectorErr *mcpConnectorCredentialsError
		assert.ErrorAs(t, latched, &connectorErr,
			"a probe load must not clear the runtime-error latch either")
	})

	t.Run("a non-probe load still repoints the fallback", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)
		realID := newSession(false)
		require.NotEmpty(t, realID)

		proc.mu.Lock()
		_, err := proc.loadSessionLocked(context.Background(), newLoadSessionRequest("loaded-session", false))
		fallback := proc.session
		proc.mu.Unlock()

		require.NoError(t, err)
		assert.Equal(t, acpsdk.SessionId("loaded-session"), fallback)
	})
}

// TestResumeSessionLockedConfigProbeFallback mirrors
// TestLoadSessionLockedConfigProbeFallback for resumeSessionLocked.
func TestResumeSessionLockedConfigProbeFallback(t *testing.T) {
	t.Run("adopts a probe session as the fallback when none is set", func(t *testing.T) {
		proc, _ := newProcessWithFakeSessionAgent(t)

		proc.mu.Lock()
		_, err := proc.resumeSessionLocked(context.Background(), newResumeSessionRequest("probe-session", true))
		fallback := proc.session
		proc.mu.Unlock()

		require.NoError(t, err)
		assert.Equal(t, acpsdk.SessionId("probe-session"), fallback)
	})

	t.Run("does not repoint an established fallback to a probe resume", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)
		realID := newSession(false)
		require.NotEmpty(t, realID)
		proc.mu.Lock()
		proc.promptRuntimeErr = &mcpConnectorCredentialsError{}
		proc.mu.Unlock()

		proc.mu.Lock()
		_, err := proc.resumeSessionLocked(context.Background(), newResumeSessionRequest("probe-session", true))
		fallback := proc.session
		latched := proc.promptRuntimeErr
		proc.mu.Unlock()

		require.NoError(t, err)
		assert.Equal(t, realID, fallback, "a probe resume must not repoint an established fallback")
		var connectorErr *mcpConnectorCredentialsError
		assert.ErrorAs(t, latched, &connectorErr,
			"a probe resume must not clear the runtime-error latch either")
	})

	t.Run("a non-probe resume still repoints the fallback", func(t *testing.T) {
		proc, newSession := newProcessWithFakeSessionAgent(t)
		realID := newSession(false)
		require.NotEmpty(t, realID)

		proc.mu.Lock()
		_, err := proc.resumeSessionLocked(context.Background(), newResumeSessionRequest("resumed-session", false))
		fallback := proc.session
		proc.mu.Unlock()

		require.NoError(t, err)
		assert.Equal(t, acpsdk.SessionId("resumed-session"), fallback)
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
	})

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	})
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	scanStderr("poolside", strings.NewReader("one\ntwo\nthree\nfour\n"), tail, nil)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func TestScanStderrReportsMCPConnectorCredentialsError(t *testing.T) {
	reported := make(chan error, 1)
	line := `2026-07-30T10:58:16.647Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.grafana.com/.well-known/oauth-protected-resource\"" })`

	scanStderr("codex-acp", strings.NewReader(line+"\n"), nil, func(err error) {
		if err != nil {
			reported <- err
		}
	})

	select {
	case err := <-reported:
		var connectorErr *mcpConnectorCredentialsError
		require.ErrorAs(t, err, &connectorErr)
		assert.Contains(t, err.Error(), "reconnect the connector")
	default:
		t.Fatal("expected MCP connector credentials error")
	}
}

func TestMCPConnectorCredentialsErrorCancelsActivePrompts(t *testing.T) {
	conn := new(acpsdk.ClientSideConnection)
	proc := &process{
		state: processState{kind: processStateRunning},
		conn:  conn,
	}
	promptCtx, release, err := proc.contextForPrompt(context.Background(), conn)
	require.NoError(t, err)
	defer release()

	proc.failActivePromptsFor(proc.cmd, &mcpConnectorCredentialsError{})

	select {
	case <-promptCtx.Done():
		var connectorErr *mcpConnectorCredentialsError
		require.ErrorAs(t, context.Cause(promptCtx), &connectorErr)
	case <-time.After(time.Second):
		t.Fatal("active prompt was not cancelled")
	}

	_, _, err = proc.contextForPrompt(context.Background(), conn)
	var connectorErr *mcpConnectorCredentialsError
	require.ErrorAs(t, err, &connectorErr)
}

func TestMCPConnectorCredentialsErrorIgnoresStoppedProcess(t *testing.T) {
	stoppedCmd := new(exec.Cmd)
	activeCmd := new(exec.Cmd)
	conn := new(acpsdk.ClientSideConnection)
	proc := &process{
		state: processState{kind: processStateRunning},
		cmd:   activeCmd,
		conn:  conn,
	}
	promptCtx, release, err := proc.contextForPrompt(context.Background(), conn)
	require.NoError(t, err)
	defer release()

	proc.failActivePromptsFor(stoppedCmd, &mcpConnectorCredentialsError{})

	select {
	case <-promptCtx.Done():
		t.Fatal("stopped subprocess cancelled an active replacement prompt")
	default:
	}
	_, releaseSecond, err := proc.contextForPrompt(context.Background(), conn)
	require.NoError(t, err)
	releaseSecond()
}

func TestPromptCleanupDoesNotDeleteReplacementProcessCancel(t *testing.T) {
	firstConn := new(acpsdk.ClientSideConnection)
	proc := &process{
		state: processState{kind: processStateRunning},
		conn:  firstConn,
	}
	_, releaseFirst, err := proc.contextForPrompt(context.Background(), firstConn)
	require.NoError(t, err)

	secondConn := new(acpsdk.ClientSideConnection)
	proc.mu.Lock()
	proc.resetLocked(processState{kind: processStateRunning})
	proc.conn = secondConn
	proc.mu.Unlock()
	secondPromptCtx, releaseSecond, err := proc.contextForPrompt(context.Background(), secondConn)
	require.NoError(t, err)
	defer releaseSecond()

	releaseFirst()
	proc.failActivePromptsFor(proc.cmd, &mcpConnectorCredentialsError{})

	select {
	case <-secondPromptCtx.Done():
		var connectorErr *mcpConnectorCredentialsError
		require.ErrorAs(t, context.Cause(secondPromptCtx), &connectorErr)
	case <-time.After(time.Second):
		t.Fatal("replacement prompt lost its cancellation entry")
	}
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
		assert.NotContains(t, servers, LocalAgentServerName)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	t.Run("preserves explicitly configured local server", func(t *testing.T) {
		servers := NormalizeAgentServers(map[string]AgentServerConfig{
			LocalAgentServerName: {Type: "local"},
		})

		assert.Equal(t, AgentServerConfig{Type: "local"}, servers[LocalAgentServerName])
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
	t.Run("uses user shell PATH before app PATH", func(t *testing.T) {
		withUserShellEnvProvider(t, func() []string {
			return []string{"PATH=" + pathList("/shell/bin", "/usr/bin")}
		})
		t.Setenv("PATH", pathList("/app/bin", "/usr/bin"))

		env, err := buildProcessEnv(startConfig{
			binary: "node",
		})
		require.NoError(t, err)

		assert.Equal(t, pathList("/shell/bin", "/usr/bin", "/app/bin"), lastEnvValue(env, "PATH"))
	})

	t.Run("uses user shell env before app env", func(t *testing.T) {
		withUserShellEnvProvider(t, func() []string {
			return []string{
				"PATH=/shell/bin",
				"VOLTA_HOME=/shell/volta",
				"SHELL_ONLY=value",
			}
		})
		t.Setenv("PATH", "/app/bin")
		t.Setenv("VOLTA_HOME", "/app/volta")

		env, err := buildProcessEnv(startConfig{
			binary: "node",
		})
		require.NoError(t, err)

		assert.Equal(t, "/shell/volta", lastEnvValue(env, "VOLTA_HOME"))
		assert.Equal(t, "value", lastEnvValue(env, "SHELL_ONLY"))
	})

	t.Run("preserves configured agent PATH override", func(t *testing.T) {
		withUserShellEnvProvider(t, func() []string {
			return []string{"PATH=/shell/bin"}
		})
		t.Setenv("PATH", "/app/bin")

		env, err := buildProcessEnv(startConfig{
			binary: "node",
			env: map[string]string{
				"PATH": "/agent/bin",
			},
		})
		require.NoError(t, err)

		assert.Equal(t, "/agent/bin", lastEnvValue(env, "PATH"))
	})

	t.Run("adds common user tool dirs when shell PATH is unavailable", func(t *testing.T) {
		withUserShellEnvProvider(t, func() []string {
			return nil
		})
		home := t.TempDir()
		asdfShims := filepath.Join(home, ".asdf", "shims")
		asdfBin := filepath.Join(home, ".asdf", "bin")
		require.NoError(t, os.MkdirAll(asdfShims, 0o755))
		require.NoError(t, os.MkdirAll(asdfBin, 0o755))
		t.Setenv("HOME", home)
		t.Setenv("PATH", "/usr/bin")

		env, err := buildProcessEnv(startConfig{
			binary: "node",
		})
		require.NoError(t, err)

		pathDirs := filepath.SplitList(lastEnvValue(env, "PATH"))
		assert.Contains(t, pathDirs, asdfShims)
		assert.Contains(t, pathDirs, asdfBin)
	})

__POOL_SYNTHETIC_IMPORT_BASELINE__
		withUserShellEnvProvider(t, func() []string {
			return nil
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
		withUserShellEnvProvider(t, func() []string {
			return nil
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
		withUserShellEnvProvider(t, func() []string {
			return nil
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
func TestResolveExecutablePath(t *testing.T) {
	t.Run("uses provided env PATH", func(t *testing.T) {
		dir := t.TempDir()
		npx := filepath.Join(dir, "npx")
		require.NoError(t, os.WriteFile(npx, []byte("#!/bin/sh\n"), 0o755))

		resolved, err := resolveExecutablePath("npx", []string{"PATH=" + dir})
		require.NoError(t, err)

		assert.Equal(t, npx, resolved)
	})

	t.Run("leaves explicit path unchanged", func(t *testing.T) {
		resolved, err := resolveExecutablePath("./node_modules/.bin/acp", []string{"PATH=/nowhere"})
		require.NoError(t, err)

		assert.Equal(t, "./node_modules/.bin/acp", resolved)
	})

	t.Run("ignores non-executable file", func(t *testing.T) {
		dir := t.TempDir()
		require.NoError(t, os.WriteFile(filepath.Join(dir, "npx"), []byte("nope"), 0o644))

		resolved, err := resolveExecutablePath("definitely-missing-poolside-test-bin", []string{"PATH=" + dir})

		assert.Empty(t, resolved)
		assert.Error(t, err)
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

func withUserShellEnvProvider(t *testing.T, provider func() []string) {
	t.Helper()

	previous := userShellEnvProvider
	userShellEnvProvider = provider
	t.Cleanup(func() {
		userShellEnvProvider = previous
	})
}

func pathList(dirs ...string) string {
	return strings.Join(dirs, string(os.PathListSeparator))
}
