package acpproxy

import (
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"context"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"fmt"
	"io"
	"log/slog"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"os/exec"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"path/filepath"
	"runtime"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"sync"
__POOL_SYNTHETIC_IMPORT_BASELINE__

	acpsdk "github.com/coder/acp-go-sdk"

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

const (
__POOL_SYNTHETIC_IMPORT_BASELINE__
	LocalAgentServerName         = methods.LocalAgentServerName
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

// How long a stopping subprocess gets to exit on its own after its stdin
// closes, and then again after being asked to terminate. Agents persist state
// as they shut down, so killing one outright can strand a conversation:
// `pool acp` writes the record that maps an ACP session to its backend
// session, and a session whose record never lands replays an empty transcript
// and can never be prompted again (PE-2460). Variables so tests can shorten
// the ladder.
var (
	processStdinExitGrace  = 2 * time.Second
	processSignalExitGrace = time.Second
)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

// process manages the lifecycle of a `pool acp` child process.
type process struct {
	mu sync.Mutex
	// serverName identifies the agent server this slot serves. It outlives any
	// one subprocess instance, so resetLocked leaves it alone.
	serverName string
	state      processState
	cmd        *exec.Cmd
	conn       *acpsdk.ClientSideConnection
	initResp   *acpsdk.InitializeResponse
	initReq    *acpsdk.InitializeRequest
	session    acpsdk.SessionId
	// sessionIsProbe records whether `session` came from a config probe, so a
	// later probe may replace it while a real session may not be displaced.
	// See adoptSessionLocked.
	sessionIsProbe bool
	stdin          io.WriteCloser
	// exited is closed once the current subprocess has been reaped, letting
	// stop wait for a voluntary exit without racing watchExit for cmd.Wait.
	exited chan struct{}
	onStop func()
	// claudeAuthVerified records a usable `--cli auth status` result (a login
	// or a non-first-party provider) for this subprocess instance (see
	// claude_auth_probe.go). Positive-only: cleared on restart, never set on
	// an inconclusive or logged-out-firstParty result.
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// promptRuntimeErr records a fatal runtime failure reported only on the
	// subprocess's stderr. promptCancels lets that signal release any ACP
	// prompts the adapter otherwise leaves pending indefinitely.
	promptRuntimeErr error
	promptCancels    map[uint64]context.CancelCauseFunc
	nextPromptID     uint64
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (p *process) isRunning() bool {
	p.mu.Lock()
	defer p.mu.Unlock()

	return p.isRunningLocked()
}

// name returns the agent server this slot serves, so stop errors can say
// which agent failed to stop. Empty for a slot that never started.
func (p *process) name() string {
	p.mu.Lock()
	defer p.mu.Unlock()

	return p.serverName
}

// adoptSessionLocked records the fallback session used to attribute untagged
// elicitations and empty-sessionId requests. A config probe never displaces a
// real session — that would route a mid-turn elicitation to a throwaway
// session no surface renders — but it does replace an earlier probe: the
// client closes a superseded probe after a drain window, so keeping the old
// one would leave the fallback pointing at a closed session. Must be called
// with p.mu held.
func (p *process) adoptSessionLocked(id acpsdk.SessionId, probe bool) {
	if probe && p.session != "" && !p.sessionIsProbe {
		return
	}
	p.session = id
	p.sessionIsProbe = probe
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	p.sessionIsProbe = false
__POOL_SYNTHETIC_IMPORT_BASELINE__
	p.exited = nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	p.promptRuntimeErr = nil
	p.promptCancels = nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func (p *process) initializedConn() (*acpsdk.ClientSideConnection, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, fmt.Errorf("acpproxy: not initialized; call initialize first")
	}

	return p.conn, nil
}

func (p *process) initializeRequest() *acpsdk.InitializeRequest {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.initReq == nil {
		return nil
	}
	req := *p.initReq
	return &req
}

type startConfig struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// processDir is the working directory for the subprocess itself (e.g. repo root for go run).
	processDir string
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	SHA256  string            `json:"sha256,omitempty"`
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// MCPServerInjector is called by the proxy before each session/new, session/load,
// or session/resume to get the set of user MCP servers to inject. It returns the
// servers to add and a list of unavailable entries with their reasons. Nil return
// means no injection.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// AgentServerReadinessProvider is called before session boundaries for agent
// servers with helper-owned runtime dependencies. Returning false tells the
// proxy to restart the ACP subprocess so fresh runtime environment can be
// injected before session/new or session/load.
type AgentServerReadinessProvider func(context.Context, string) (bool, error)

__POOL_SYNTHETIC_IMPORT_BASELINE__
	WorkingDir             string
	AgentServers           map[string]AgentServerConfig
	AgentServerEnvProvider func(context.Context, string) (map[string]string, error)
	AgentServerReady       AgentServerReadinessProvider
	// MCPServerInjector is optional. When set, it is called for every session/new,
	// session/load, and session/resume (except config-probe sessions) to inject
	// user MCP servers.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if normalizedName == LocalAgentServerName {
			normalized[LocalAgentServerName] = mergeLocalAgentServerConfig(cfg)
			continue
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
func defaultLocalAgentServerConfig() AgentServerConfig {
	return AgentServerConfig{
		Type:    "local",
		Command: "",
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
func mergeLocalAgentServerConfig(cfg AgentServerConfig) AgentServerConfig {
	merged := defaultLocalAgentServerConfig()
	if cfg.Command != "" && !isLegacySelfCommand(cfg.Command) {
		merged.Command = cfg.Command
		merged.Args = cfg.Args
	}
	if cfg.Type != "" {
		merged.Type = cfg.Type
	}
	merged.Env = cfg.Env
	merged.Binary = cfg.Binary
	merged.DefaultConfigOptions = cfg.DefaultConfigOptions
	return merged
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func defaultInitializeRequest() acpsdk.InitializeRequest {
	return acpsdk.InitializeRequest{
		ProtocolVersion: acpsdk.ProtocolVersionNumber,
		ClientInfo: &acpsdk.Implementation{
			Name:    "poolside-helper",
			Version: version.Tag,
		},
		ClientCapabilities: acpsdk.ClientCapabilities{
__POOL_SYNTHETIC_IMPORT_BASELINE__
				ReadTextFile:  true,
				WriteTextFile: true,
			},
			Elicitation: elicitationCapabilities(),
		},
	}
}

// elicitationCapabilities is what the helper advertises on behalf of every
// surface: elicitations are helper-owned state (the approval store), so
// support does not vary by surface. Form only — surfaces do not render
// url-mode elicitations yet.
func elicitationCapabilities() *acpsdk.ElicitationCapabilities {
	return &acpsdk.ElicitationCapabilities{
		Form: &acpsdk.ElicitationFormCapabilities{},
	}
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
	if req == nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}
	if initReq.ClientCapabilities.Elicitation == nil {
		initReq.ClientCapabilities.Elicitation = elicitationCapabilities()
	}
	return initReq
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
// It must be called with p.mu held.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil
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
	binary, err := resolveExecutablePath(cfg.binary, env)
	if err != nil {
		return missingRuntimeLaunchError(cfg.serverName, cfg.binary, err)
	}

	args := append([]string{binary}, cfg.extraArgs...)
	slog.Info("acpproxy: starting subprocess", "server", cfg.serverName, "cmd", args, "cwd", cfg.processDir)

	cmd := exec.Command(binary, cfg.extraArgs...)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if cfg.processDir != "" {
		cmd.Dir = cfg.processDir
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("acpproxy: stdin pipe: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("acpproxy: stdout pipe: %w", err)
	}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("acpproxy: start: %w", err)
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		scanStderr(cfg.serverName, stderr, stderrTail, func(err error) {
			p.failActivePromptsFor(cmd, err)
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
	if err != nil {
		stdin.Close()
__POOL_SYNTHETIC_IMPORT_BASELINE__
		_ = cmd.Wait()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}

	exited := make(chan struct{})
	p.serverName = cfg.serverName
	p.cmd = cmd
	p.conn = conn
	p.initResp = &initResp
	initReqCopy := initReq
	p.initReq = &initReqCopy
	p.stdin = stdin
	p.exited = exited
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

	go p.watchExit(cfg.serverName, cmd, exited, cfg.onExit)
	go p.watchDisconnect(cfg.serverName, cmd, conn, cfg.onExit)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return nil
}

// watchDisconnect handles the case where the ACP JSON-RPC stream closes but
// the wrapper process (commonly npx) stays alive. Waiting only on cmd.Wait
// leaves the process marked running and every later request reuses a dead
// connection, returning "peer disconnected before response" immediately.
func (p *process) watchDisconnect(serverName string, cmd *exec.Cmd, conn *acpsdk.ClientSideConnection, onExit func(serverName string, err error)) {
	<-conn.Done()
	if !p.markDisconnected(cmd, conn) {
		return
	}

	if cmd.Process != nil {
		_ = killProcessTree(cmd)
	}
	err := errors.New("ACP peer disconnected")
	slog.Info("acpproxy: subprocess connection closed", "server", serverName, "error", err)
	if onExit != nil {
		onExit(serverName, err)
	}
}

func (p *process) watchExit(serverName string, cmd *exec.Cmd, exited chan struct{}, onExit func(serverName string, err error)) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// Announce the reap before the state check: stop has already cleared the
	// state by the time it waits here, and it must still observe the exit.
	close(exited)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (p *process) markDisconnected(cmd *exec.Cmd, conn *acpsdk.ClientSideConnection) bool {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.cmd != cmd || p.conn != conn || !p.isRunningLocked() {
		return false
	}

	p.resetLocked(processState{kind: processStateExited, exitedAt: time.Now()})
	return true
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
// replacing any existing session. Must be called with p.mu held.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, fmt.Errorf("acpproxy: not initialized; call initialize first")
	}

	// promptRuntimeErr latches a fatal runtime failure reported only on the
	// subprocess's stderr (e.g. the MCP connector credentials error) so the
	// next prompt can fail fast with an actionable message. Config probes
	// recur throughout a run (the client refreshes its config cache with
	// them); letting one clear the latch would silently drop that signal
	// before the real prompt waiting on it ever sees it.
	if !isConfigProbeSession(req.Meta) {
		p.promptRuntimeErr = nil
	}
	resp, err := p.conn.NewSession(ctx, req)
	if err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}
	p.adoptSessionLocked(resp.SessionId, isConfigProbeSession(req.Meta))
	slog.Info("acpproxy: session created", "session_id", string(resp.SessionId), "resp", resp)
	return &resp, nil
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
// replacing any existing session. Must be called with p.mu held.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, fmt.Errorf("acpproxy: not initialized; call initialize first")
	}

	if !isConfigProbeSession(req.Meta) {
		p.promptRuntimeErr = nil
	}
	resp, err := p.conn.LoadSession(ctx, req)
	if err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}
	// No client sends the probe marker on load today, but the marker is
	// documented as valid here too (configProbeMetaKey), so route this path
	// through the same rule and the bug cannot come back.
	p.adoptSessionLocked(req.SessionId, isConfigProbeSession(req.Meta))
	slog.Info("acpproxy: session loaded", "session_id", string(req.SessionId))
	return &resp, nil
}

// resumeSessionLocked resumes an existing ACP session on an already-running
// process without replaying its transcript. Must be called with p.mu held.
func (p *process) resumeSessionLocked(ctx context.Context, req acpsdk.ResumeSessionRequest) (*acpsdk.ResumeSessionResponse, error) {
	if !p.isRunningLocked() {
		return nil, fmt.Errorf("acpproxy: not initialized; call initialize first")
	}

	if !isConfigProbeSession(req.Meta) {
		p.promptRuntimeErr = nil
	}
	resp, err := p.conn.ResumeSession(ctx, req)
	if err != nil {
		return nil, preserveACPError("acpproxy: resume session", err)
	}
	// See loadSessionLocked: same latent-probe path, kept consistent.
	p.adoptSessionLocked(req.SessionId, isConfigProbeSession(req.Meta))
	slog.Info("acpproxy: session resumed", "session_id", string(req.SessionId))
	return &resp, nil
}

// stop closes the subprocess's stdin and lets it exit on its own before
// escalating to a signal. Agents flush state as they shut down — `pool acp`
// writes the record mapping an ACP session to its backend session — so killing
// one outright can leave a conversation that replays empty and can never be
// prompted again (PE-2460). Escalation still bounds the wait so an agent that
// ignores EOF cannot outlive the helper.
func (p *process) stop() error {
	serverName, cmd, exited, onStop, closeErr := func() (string, *exec.Cmd, chan struct{}, func(), error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
			return p.serverName, nil, nil, nil, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		serverName, cmd, exited, onStop := p.serverName, p.cmd, p.exited, p.onStop
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return serverName, cmd, exited, onStop, closeErr
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}
	awaitProcessExit(serverName, cmd, exited)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// awaitProcessExit waits for a stopping subprocess to exit, escalating to
// terminate and then kill. The process group is signalled rather than only the
// direct child so wrapper processes (commonly npx) cannot leave the real agent
// running.
func awaitProcessExit(serverName string, cmd *exec.Cmd, exited <-chan struct{}) {
	if cmd == nil || cmd.Process == nil {
		return
	}
	if waitForClose(exited, processStdinExitGrace) {
		return
	}

	slog.Warn("acpproxy: subprocess still running after stdin close; terminating",
		"server", serverName, "pid", cmd.Process.Pid, "after", processStdinExitGrace)
	_ = terminateProcessTree(cmd)
	if waitForClose(exited, processSignalExitGrace) {
		return
	}

	slog.Warn("acpproxy: subprocess ignored terminate; killing",
		"server", serverName, "pid", cmd.Process.Pid, "after", processSignalExitGrace)
	_ = killProcessTree(cmd)
}

func waitForClose(done <-chan struct{}, timeout time.Duration) bool {
	if done == nil {
		return false
	}
	timer := time.NewTimer(timeout)
	defer timer.Stop()
	select {
	case <-done:
		return true
	case <-timer.C:
		return false
	}
}

func (p *process) initializeResponse() (*acpsdk.InitializeResponse, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.initResp == nil {
		return nil, fmt.Errorf("acpproxy: initialize response unavailable")
	}

	resp := *p.initResp
	return &resp, nil
}

// supportsSessionClose reports whether the connected agent advertises
// session/close plus a way to reopen a closed session (session/resume or
// loadSession). Without a reopen path, closing would strand the conversation.
func (p *process) supportsSessionClose() bool {
	initResp, err := p.initializeResponse()
	if err != nil {
		return false
	}
	caps := initResp.AgentCapabilities
	if caps.SessionCapabilities.Close == nil {
		return false
	}
	return caps.SessionCapabilities.Resume != nil || caps.LoadSession
}

// ConfigFn provides dynamic access to handler configuration.
__POOL_SYNTHETIC_IMPORT_BASELINE__

// ensureStarted lazily initializes the subprocess on first use.
__POOL_SYNTHETIC_IMPORT_BASELINE__
	p.mu.Lock()
	defer p.mu.Unlock()

__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil
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
	if shouldResolveBundledPoolsideBinary(serverName, serverCfg) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		resolved.Type = serverCfg.Type
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if cfg.AgentServerEnvProvider != nil {
		env, err := cfg.AgentServerEnvProvider(ctx, serverName)
		if err != nil {
			return fmt.Errorf("acpproxy: agent server %q environment: %w", serverName, err)
		}
		serverCfg.Env = mergeStringMaps(serverCfg.Env, env)
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
	} else {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func shouldResolveBundledPoolsideBinary(serverName string, cfg AgentServerConfig) bool {
	if cfg.Type == "registry" || cfg.Command != "" || len(cfg.Binary) > 0 {
		return false
	}
	return serverName == DefaultAgentServerName || serverName == LocalAgentServerName
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
func (p *process) contextForPrompt(parent context.Context, conn *acpsdk.ClientSideConnection) (context.Context, func(), error) {
	p.mu.Lock()
	if !p.isRunningLocked() || p.conn != conn {
		p.mu.Unlock()
		return nil, nil, fmt.Errorf("acpproxy: not initialized; call initialize first")
	}
	if p.promptRuntimeErr != nil {
		err := p.promptRuntimeErr
		p.mu.Unlock()
		return nil, nil, err
	}

	ctx, cancel := context.WithCancelCause(parent)
	p.nextPromptID++
	id := p.nextPromptID
	if p.promptCancels == nil {
		p.promptCancels = map[uint64]context.CancelCauseFunc{}
	}
	p.promptCancels[id] = cancel
	p.mu.Unlock()

	release := func() {
		p.mu.Lock()
		delete(p.promptCancels, id)
		p.mu.Unlock()
		cancel(nil)
	}
	return ctx, release, nil
}

// failActivePromptsFor records a subprocess runtime failure only if cmd is
// still the active subprocess. A stopped process's stderr scanner can drain
// after its replacement starts and must not poison the replacement's prompts.
func (p *process) failActivePromptsFor(cmd *exec.Cmd, err error) {
	if err == nil {
		return
	}

	p.mu.Lock()
	if !p.isRunningLocked() || p.cmd != cmd {
		p.mu.Unlock()
		return
	}
	p.promptRuntimeErr = err
	cancels := make([]context.CancelCauseFunc, 0, len(p.promptCancels))
	for _, cancel := range p.promptCancels {
		cancels = append(cancels, cancel)
	}
	p.mu.Unlock()

	for _, cancel := range cancels {
		cancel(err)
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func resolveExecutablePath(binary string, env []string) (string, error) {
	if binary == "" || hasPathSeparator(binary) {
		return binary, nil
	}

	for _, dir := range filepath.SplitList(envValue(env, "PATH")) {
		if dir == "" {
			continue
		}
		for _, name := range executableCandidateNames(binary, env) {
			candidate := filepath.Join(dir, name)
			if isExecutableFile(candidate) {
				return candidate, nil
			}
		}
	}

	resolved, err := exec.LookPath(binary)
	if err == nil {
		return resolved, nil
	}
	return "", fmt.Errorf("acpproxy: resolve executable %q: %w", binary, err)
}

func hasPathSeparator(path string) bool {
	return strings.ContainsRune(path, os.PathSeparator) ||
		(runtime.GOOS == "windows" && strings.ContainsRune(path, '/'))
}

func executableCandidateNames(binary string, env []string) []string {
	if runtime.GOOS != "windows" || filepath.Ext(binary) != "" {
		return []string{binary}
	}

	pathExt := envValue(env, "PATHEXT")
	if pathExt == "" {
		pathExt = ".COM;.EXE;.BAT;.CMD"
	}

	names := []string{binary}
	for _, ext := range strings.Split(pathExt, ";") {
		if ext == "" {
			continue
		}
		names = append(names, binary+ext)
	}
	return names
}

func isExecutableFile(path string) bool {
	stat, err := os.Stat(path)
	if err != nil || stat.IsDir() {
		return false
	}
	if runtime.GOOS == "windows" {
		return true
	}
	return stat.Mode()&0o111 != 0
}

func envValue(env []string, key string) string {
	var value string
	for _, entry := range env {
		entryKey, entryValue, ok := strings.Cut(entry, "=")
		if ok && entryKey == key {
			value = entryValue
		}
	}
	return value
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type mcpConnectorCredentialsError struct{}

func (*mcpConnectorCredentialsError) Error() string {
	return "MCP connector credentials were rejected; reconnect the connector in Settings, then retry"
}

func scanStderr(serverName string, r io.Reader, tail *lineTail, reportRuntimeError func(error)) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if reportRuntimeError != nil {
			if err := classifyRuntimeStderr(line); err != nil {
				reportRuntimeError(err)
			}
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func classifyRuntimeStderr(line string) error {
	lower := strings.ToLower(line)
	if strings.Contains(lower, "rmcp::transport::worker") &&
		strings.Contains(lower, "worker quit with fatal:") &&
		strings.Contains(lower, "authrequired(authrequirederror") &&
		strings.Contains(lower, "www_authenticate_header") {
		return &mcpConnectorCredentialsError{}
	}
	return nil
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
}
