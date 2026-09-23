package acpproxy

import (
	"context"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"fmt"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"strings"
	"sync"

	acpsdk "github.com/coder/acp-go-sdk"
	"github.com/google/uuid"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/tliron/glsp"
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// isSessionGoneError matches agent responses meaning "no such live session".
// Adapters express this inconsistently (claude-agent-acp raises a plain
// internal error with a "Session not found" detail), so match on the message.
func isSessionGoneError(err error) bool {
	var reqErr *acpsdk.RequestError
	if !errors.As(err, &reqErr) || reqErr == nil {
		return false
	}
	if strings.Contains(strings.ToLower(reqErr.Message), "session not found") {
		return true
	}
	data, marshalErr := json.Marshal(reqErr.Data)
	return marshalErr == nil && strings.Contains(strings.ToLower(string(data)), "session not found")
}

const steeringTurnBoundaryDiagnostic = "[ede_diagnostic] result_type=user last_content_type=n/a stop_reason=null"

// isSteeringTurnBoundaryError matches a Claude Agent SDK diagnostic emitted
// after an injected user message successfully takes over the active turn. The
// adapter has already streamed the steered response at this point, so the
// diagnostic is a turn-boundary signal rather than a failed prompt.
func isSteeringTurnBoundaryError(err error) bool {
	return err != nil && strings.Contains(err.Error(), steeringTurnBoundaryDiagnostic)
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type Handler struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	loadScopes     map[promptSessionKey]string
	loadDone       map[promptSessionKey]chan struct{}
	readFile       ReadFileFn
	configFn       ConfigFn
	liveStatusSink LiveStatusSink
	events         SessionEventSink
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// closed is set by Close, before it stops the processes. A session call
	// that arrives during shutdown must not restart an agent (see
	// processReadyForSession): nothing would stop the new subprocess, leaving
	// an agent orphaned past helper exit.
	closed bool
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type LiveStatusSink interface {
	SetConversationLiveStatus(context.Context, *glsp.Context, string, string, acpnav.ConversationLiveStatusPatch) error
	CompletePrompt(context.Context, *glsp.Context, string, string) error
	ClearAgentServerInFlightStatus(context.Context, *glsp.Context, string) error
	// UpdateConversationTitle persists an agent-authored title in the nav store
	// so it survives even when no webview has materialized the session.
	UpdateConversationTitle(ctx context.Context, gCtx *glsp.Context, agentServer, sessionID, title string) error
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

type conversationHandoffSink interface {
	BindConversationSessionHandoff(ctx context.Context, gCtx *glsp.Context, conversationID, agentServer, sessionID, cwd, handoffID string) error
}

func NewHandler(cfg ConfigFn, readFile ReadFileFn, liveStatusSink LiveStatusSink) *Handler {
	return &Handler{
		configFn:        cfg,
		readFile:        readFile,
		liveStatusSink:  liveStatusSink,
		procs:           map[string]*process{},
		clients:         map[string]*acpClient{},
		promptsInFlight: map[promptSessionKey]*activeTurn{},
		finishedTurns:   map[string]*activeTurn{},
		loadScopes:      map[promptSessionKey]string{},
		loadDone:        map[promptSessionKey]chan struct{}{},
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (h *Handler) Close() error {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	h.closed = true
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return stopProcesses(procs)
}

// isClosed reports whether Close has run, so lifecycle paths that would start
// a subprocess can decline once shutdown has begun.
func (h *Handler) isClosed() bool {
	h.mu.Lock()
	defer h.mu.Unlock()

	return h.closed
}

// stopProcesses stops every process concurrently. Each stop waits for its
// subprocess to exit (see process.stop), so stopping serially would add those
// waits together and delay helper shutdown by seconds per agent server.
func stopProcesses(procs []*process) error {
	var (
		mu      sync.Mutex
		stopErr error
		wg      sync.WaitGroup
	)
__POOL_SYNTHETIC_IMPORT_BASELINE__
		wg.Go(func() {
			if err := proc.stop(); err != nil {
				mu.Lock()
				defer mu.Unlock()
				if stopErr == nil {
					stopErr = fmt.Errorf("stop %s: %w", proc.name(), err)
				}
			}
		})
	}
	wg.Wait()
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	procs := make([]*process, 0, len(toStop))
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
			procs = append(procs, proc)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err := stopProcesses(procs); err != nil {
		return fmt.Errorf("stop changed agent servers: %w", err)
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		client = &acpClient{
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
				"jsonrpc": "2.0",
				"method":  method,
				"params":  params,
__POOL_SYNTHETIC_IMPORT_BASELINE__
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
				"jsonrpc": "2.0",
				"id":      uuid.NewString(),
				"method":  method,
				"params":  params,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		client.activeSession = func() acpsdk.SessionId {
			proc.mu.Lock()
			defer proc.mu.Unlock()
			return proc.session
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
	} else {
		client.liveStatus = h.liveStatusSink
		client.agentServer = serverName
		client.gCtx = gCtx
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	err := proc.ensureStarted(ctx, h.configFn, serverName, client, initReq, func(serverName string, err error) {
		if h.liveStatusSink != nil {
			if statusErr := h.liveStatusSink.ClearAgentServerInFlightStatus(context.Background(), gCtx, serverName); statusErr != nil {
				slog.Debug("acpproxy: failed to clear status after server exit", "server", serverName, "error", statusErr)
			}
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return proc, agentLaunchErrorToJSONRPC(err)
}

// agentLaunchErrorToJSONRPC surfaces install and missing-runtime failures with
// a dedicated error code so the webview can show an actionable retry state
// instead of a generic agent error.
func agentLaunchErrorToJSONRPC(err error) error {
	var installErr *AgentInstallError
	if errors.As(err, &installErr) {
		return &methods.JSONRPCError{
			Code:    methods.PoolsideErrorCodeAgentInstallFailed,
			Message: installErr.Error(),
			Data: &methods.JSONRPCErrorData{
				AgentInstall: &methods.AgentInstallData{AgentServer: installErr.AgentServer},
			},
		}
	}
	var runtimeErr *MissingRuntimeError
	if errors.As(err, &runtimeErr) {
		return &methods.JSONRPCError{
			Code:    methods.PoolsideErrorCodeAgentInstallFailed,
			Message: runtimeErr.Error(),
			Data: &methods.JSONRPCErrorData{
				AgentInstall: &methods.AgentInstallData{AgentServer: runtimeErr.AgentServer},
			},
		}
	}
	return err
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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

func (h *Handler) processReadyForSession(ctx context.Context, gCtx *glsp.Context, serverName string) (*process, error) {
	serverName = normalizeServerName(serverName)
	proc, err := h.processReadyForCall(ctx, gCtx, serverName)
	if err != nil {
		return nil, err
	}
	// A session call can land in the window between an agent exit and the
	// client's next initialize: the client's connection cache and this
	// process slot are separate views of the same lifecycle, so the client
	// cannot reliably order its calls around a crash it has not heard about
	// yet. The slot keeps the last initialize request across resets, so
	// restart the agent with it rather than failing the session call with
	// "not initialized". A server the client never initialized has no
	// retained request and still fails as before, and once Close has begun no
	// call may start an agent that nothing would then stop.
	if !proc.isRunning() && !h.isClosed() {
		if initReq := proc.initializeRequest(); initReq != nil {
			slog.Info("acpproxy: restarting agent server for session call", "server", serverName)
			if _, err := h.ensureStarted(ctx, gCtx, serverName, initReq); err != nil {
				return nil, err
			}
		}
	}
	if err := h.preflightAgentServerForSession(ctx, gCtx, serverName, proc); err != nil {
		return nil, err
	}
	return proc, nil
}

func (h *Handler) preflightAgentServerForSession(ctx context.Context, gCtx *glsp.Context, serverName string, proc *process) error {
	if !proc.isRunning() {
		return nil
	}
	readiness := h.configFn().AgentServerReady
	if readiness == nil {
		return nil
	}
	ready, err := readiness(ctx, serverName)
	if err != nil {
		return fmt.Errorf("acpproxy: agent server %q readiness: %w", serverName, err)
	}
	if ready {
		return nil
	}

	slog.Info("acpproxy: restarting agent server after failed readiness check", "server", serverName)
	initReq := proc.initializeRequest()
	if err := proc.stop(); err != nil {
		return err
	}
	_, err = h.ensureStarted(ctx, gCtx, serverName, initReq)
	return err
}

func (h *Handler) Initialize(ctx context.Context, params *methods.ACPInitializeParams, gCtx *glsp.Context) (*methods.ACPInitializeOutput, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, err
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
func (h *Handler) NewSession(ctx context.Context, params *methods.ACPNewSessionParams, gCtx *glsp.Context) (*methods.ACPNewSessionOutput, error) {
	proc, err := h.processReadyForSession(ctx, gCtx, params.AgentServer)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		handoffID := acp.DecodeSessionHandoffID(req.Meta)
		if handoffID != "" {
			sink, ok := h.liveStatusSink.(conversationHandoffSink)
			if !ok {
				return nil, fmt.Errorf("acpproxy: conversation history store does not support handoffs")
			}
			if bindErr := sink.BindConversationSessionHandoff(ctx, gCtx, convID, params.AgentServer, string(resp.SessionId), req.Cwd, handoffID); bindErr != nil {
				return nil, fmt.Errorf("acpproxy: commit conversation handoff: %w", bindErr)
			}
		} else if bindErr := h.liveStatusSink.BindConversationSession(ctx, gCtx, convID, params.AgentServer, string(resp.SessionId), req.Cwd); bindErr != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func (h *Handler) LoadSession(ctx context.Context, params *methods.ACPLoadSessionParams, gCtx *glsp.Context) (*methods.ACPLoadSessionOutput, error) {
	serverName := normalizeServerName(params.AgentServer)
	proc, err := h.processReadyForSession(ctx, gCtx, serverName)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	_, client := h.processFor(serverName, gCtx)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	unavailable := h.injectUserMCPServers(ctx, proc, serverName, req.Meta, &req.McpServers)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	notifySessionResolved(ctx, gCtx, serverName, string(req.SessionId), req.McpServers, unavailable)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (h *Handler) ResumeSession(ctx context.Context, params *methods.ACPResumeSessionParams, gCtx *glsp.Context) (*methods.ACPResumeSessionOutput, error) {
	serverName := normalizeServerName(params.AgentServer)
	proc, err := h.processReadyForSession(ctx, gCtx, serverName)
	if err != nil {
		return nil, err
	}

	req := params.ResumeSessionRequest
	unavailable := h.injectUserMCPServers(ctx, proc, serverName, req.Meta, &req.McpServers)

	proc.mu.Lock()
	resp, err := proc.resumeSessionLocked(ctx, req)
	proc.mu.Unlock()
	if err != nil {
		h.refreshAuthAfterCallError(ctx, params.AgentServer, err)
		return resp, err
	}

	notifySessionResolved(ctx, gCtx, serverName, string(req.SessionId), req.McpServers, unavailable)
	return resp, nil
}

func (h *Handler) ListSessions(ctx context.Context, params *methods.ACPListSessionsParams, gCtx *glsp.Context) (*methods.ACPListSessionsOutput, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
	}

__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}

	return &resp, nil
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
	}

__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

// CloseSession releases an idle session's agent-side resources (e.g. a
// per-session subprocess) while keeping the session reopenable later via
// session/resume or session/load. Unlike DeleteSession it never starts the
// agent server: an unstarted server has no live sessions to close. It also
// no-ops (success) when the agent does not advertise session/close, or
// advertises no way to reopen a closed session — closing would strand the
// conversation — so callers may invoke it unconditionally.
func (h *Handler) CloseSession(ctx context.Context, params *methods.ACPCloseSessionParams, gCtx *glsp.Context) (*methods.ACPCloseSessionOutput, error) {
	h.mu.Lock()
	proc := h.procs[normalizeServerName(params.AgentServer)]
	h.mu.Unlock()
	if proc == nil {
		return &methods.ACPCloseSessionOutput{}, nil
	}

	conn, err := proc.initializedConn()
	if err != nil {
		return &methods.ACPCloseSessionOutput{}, nil
	}

	if !proc.supportsSessionClose() {
		return &methods.ACPCloseSessionOutput{}, nil
	}

	resp, err := conn.CloseSession(ctx, params.CloseSessionRequest)
	if err != nil {
		// Close is idempotent: a session the agent no longer holds (already
		// closed by another trigger — archive then evict, or an agent restart)
		// is in the desired state.
		if isSessionGoneError(err) {
			return &methods.ACPCloseSessionOutput{}, nil
		}
		h.refreshAuthAfterCallError(ctx, params.AgentServer, err)
		return nil, preserveACPError("acpproxy: close session", err)
	}

	return &resp, nil
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
func (h *Handler) Steer(ctx context.Context, params *methods.ACPSteerParams, gCtx *glsp.Context) (*methods.ACPSteerOutput, error) {
	serverName := normalizeServerName(params.AgentServer)
	proc, err := h.processReadyForCall(ctx, gCtx, serverName)
	if err != nil {
		return nil, err
	}
	_, client := h.processFor(serverName, gCtx)

	conn, err := proc.initializedConn()
	if err != nil {
		return nil, err
	}

	// Track the attempt before doing anything that can yield to the agent's
	// notification queue. Claude can finish the original ACP prompt immediately
	// after accepting the injected message, racing the extension response.
	// runTurn waits for this attempt to resolve before deciding whether that
	// prompt response is the real turn boundary.
	tracked := h.beginPromptSteer(serverName, string(params.SessionID))
	accepted := false
	defer func() {
		h.finishPromptSteer(serverName, string(params.SessionID), tracked, accepted)
	}()

	if h.events != nil {
		publishUserMessage(client, h.events, serverName, string(params.SessionID), methods.ClientOriginFromContext(ctx), params.Prompt, true)
	} else {
		relayUserMessageToOtherClients(gCtx, client, serverName, string(params.SessionID), params.Prompt, true)
	}

	raw, err := conn.CallExtension(ctx, methods.ACPSessionSteeringExtensionMethod, params.ACPSteerRequest)
	if err != nil {
		h.refreshAuthAfterCallError(ctx, serverName, err)
		return nil, preserveACPError("acpproxy: steer session", err)
	}

	var output methods.ACPSteerOutput
	if err := json.Unmarshal(raw, &output); err != nil {
		return nil, fmt.Errorf("acpproxy: steer session: decode response: %w", err)
	}
	accepted = output.Outcome == methods.ACPSteerOutcomeInjected
	return &output, nil
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
func (h *Handler) CodexGoalControl(ctx context.Context, params *methods.ACPCodexGoalControlParams, gCtx *glsp.Context) (*methods.ACPCodexGoalControlOutput, error) {
	if params.SessionID == "" {
		return nil, fmt.Errorf("acpproxy: codex goal control: sessionId is required")
	}
	if params.Action != methods.ACPCodexGoalControlPause && params.Action != methods.ACPCodexGoalControlClear {
		return nil, fmt.Errorf("acpproxy: codex goal control: unsupported action %q", params.Action)
	}
	serverName := normalizeServerName(params.AgentServer)

	var output methods.ACPCodexGoalControlOutput
	if err := h.callExtension(
		ctx,
		gCtx,
		serverName,
		methods.ACPCodexGoalControlExtensionMethod,
		"acpproxy: codex goal control",
		params.ACPCodexGoalControlRequest,
		&output,
	); err != nil {
		return nil, err
	}
	_, client := h.processFor(serverName, gCtx)
	if flushErr := client.waitForSessionUpdates(ctx); flushErr != nil {
		return nil, preserveACPError("acpproxy: codex goal control notifications", flushErr)
	}
	return &output, nil
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
	serverName := normalizeServerName(params.AgentServer)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	proc, err := h.processReadyForCall(ctx, gCtx, serverName)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	_, client := h.processFor(serverName, gCtx)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
			panicErr := errFromTurnPanic(rv)
			h.completeTurn(serverName, string(sessionID), turn, nil, panicErr)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	resp, turnErr = h.runTurn(ctx, params, gCtx, client, proc, conn, serverName, sessionID, turn)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (h *Handler) runTurn(ctx context.Context, params *methods.ACPPromptParams, gCtx *glsp.Context, client *acpClient, proc *process, conn *acpsdk.ClientSideConnection, serverName string, sessionID acpsdk.SessionId, turn *activeTurn) (*methods.ACPPromptOutput, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		defer client.enqueueTurnEnded(sessionID)
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if h.liveStatusSink != nil {
		if statusErr := h.liveStatusSink.SetConversationLiveStatus(ctx, gCtx, serverName, string(sessionID), acpnav.ConversationLiveStatusPatch{
			Working: acpnav.Bool(true),
			Unread:  acpnav.Bool(false),
		}); statusErr != nil {
			slog.Debug("acpproxy: failed to mark prompt working", "server", serverName, "session_id", string(sessionID), "error", statusErr)
		}
		defer func() {
			if statusErr := h.liveStatusSink.CompletePrompt(context.Background(), gCtx, serverName, string(sessionID)); statusErr != nil {
				slog.Debug("acpproxy: failed to complete prompt status", "server", serverName, "session_id", string(sessionID), "error", statusErr)
			}
		}()
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
	req := params.PromptRequest
	req.SessionId = sessionID

	// A steer fallback re-delivers a message Steer already mirrored to the
	// other surfaces; mirroring it again would show it there twice.
	if !isSteerFallbackPrompt(req.Meta) {
		if h.events != nil {
			publishUserMessage(client, h.events, serverName, string(sessionID), methods.ClientOriginFromContext(ctx), req.Prompt, false)
		} else {
			relayUserMessageToOtherClients(gCtx, client, serverName, string(sessionID), req.Prompt, false)
		}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	promptCtx, releasePrompt, err := proc.contextForPrompt(ctx, conn)
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, err
	}
	defer releasePrompt()

	resp, promptErr := conn.Prompt(promptCtx, req)
	if proc.isClaudeAgent() {
		h.markPromptReturned(turn)
		steerCompletion, waitErr := h.waitForClaudeSteeredCompletion(promptCtx, turn)
		if waitErr != nil {
			var connectorErr *mcpConnectorCredentialsError
			if cause := context.Cause(promptCtx); errors.As(cause, &connectorErr) {
				return nil, cause
			}
			return nil, waitErr
		}
		if steerCompletion.cancelled {
			return &methods.ACPPromptOutput{StopReason: acpsdk.StopReasonCancelled}, nil
		}
		if steerCompletion.accepted && (promptErr == nil || isSteeringTurnBoundaryError(promptErr)) {
			// Claude currently settles the ACP request at the interrupted
			// generation's result, then streams the injected continuation outside
			// that request. The wait above extends the helper-owned turn through
			// the continuation's result boundary, so normalize the interrupted
			// response (including the SDK's user-result diagnostic) to the logical
			// turn's successful completion.
			slog.Debug("acpproxy: completed Claude prompt after steered continuation", "server", serverName, "session_id", string(sessionID))
			out := methods.ACPPromptOutput{StopReason: acpsdk.StopReasonEndTurn}
			if promptErr == nil {
				out = resp
				out.StopReason = acpsdk.StopReasonEndTurn
			}
			return &out, nil
		}
	}
	if promptErr != nil {
		var connectorErr *mcpConnectorCredentialsError
		if cause := context.Cause(promptCtx); errors.As(cause, &connectorErr) {
			return nil, cause
		}
		h.refreshAuthAfterCallError(ctx, params.AgentServer, promptErr)
		return nil, preserveACPError("acpproxy: prompt", promptErr)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	turnID string
	done   chan struct{}
	resp   *methods.ACPPromptOutput
	err    error

	// Claude's adapter currently returns from session/prompt at the result
	// boundary interrupted by steering, while the injected continuation keeps
	// streaming. These fields let the helper extend its logical prompt through
	// the continuation's own terminal usage update. They are guarded by Handler.mu.
	steerPending              int
	steerAccepted             int
	terminalUserUsageUpdates  int
	promptReturnUsageBaseline int
	steerStateChanged         chan struct{}
	cancelled                 bool
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	turn := &activeTurn{
		turnID:            turnID,
		done:              make(chan struct{}),
		steerStateChanged: make(chan struct{}),
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
func signalSteerStateChangedLocked(turn *activeTurn) {
	close(turn.steerStateChanged)
	turn.steerStateChanged = make(chan struct{})
}

// beginPromptSteer registers an extension request against the helper-owned
// turn. It returns false when the prompt has already completed; the extension
// is still forwarded so the agent can report its own idle-race outcome.
func (h *Handler) beginPromptSteer(serverName, sessionID string) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	turn := h.promptsInFlight[promptSessionKey{agentServer: serverName, sessionID: sessionID}]
	if turn == nil {
		return false
	}
	turn.steerPending++
	signalSteerStateChangedLocked(turn)
	return true
}

func (h *Handler) finishPromptSteer(serverName, sessionID string, tracked, accepted bool) {
	if !tracked {
		return
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	turn := h.promptsInFlight[promptSessionKey{agentServer: serverName, sessionID: sessionID}]
	if turn == nil {
		return
	}
	if turn.steerPending > 0 {
		turn.steerPending--
	}
	if accepted {
		turn.steerAccepted++
	}
	signalSteerStateChangedLocked(turn)
}

// observeSessionUpdate counts only Claude's user-result usage trailers: the
// adapter attaches cost at result boundaries, whereas streaming usage updates
// omit it. Autonomous result trailers use one of the same origin kinds the
// Claude adapter excludes from its user-turn lifecycle; other tagged origins
// (including a steered user continuation) still belong to the prompt.
func (h *Handler) observeSessionUpdate(serverName, sessionID string, update acpsdk.SessionUpdate) {
	usage := update.UsageUpdate
	if usage == nil || usage.Cost == nil {
		return
	}
	if isClaudeAutonomousUsageUpdate(usage) {
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()
	turn := h.promptsInFlight[promptSessionKey{agentServer: normalizeServerName(serverName), sessionID: sessionID}]
	if turn == nil {
		return
	}
	turn.terminalUserUsageUpdates++
	signalSteerStateChangedLocked(turn)
}

func isClaudeAutonomousUsageUpdate(usage *acpsdk.SessionUsageUpdate) bool {
	origin, ok := usage.Meta["_claude/origin"].(map[string]any)
	if !ok {
		return false
	}
	kind, _ := origin["kind"].(string)
	switch kind {
	case "task-notification", "peer", "coordinator", "observer", "observer-activity":
		return true
	default:
		return false
	}
}

func (h *Handler) markPromptReturned(turn *activeTurn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	turn.promptReturnUsageBaseline = turn.terminalUserUsageUpdates
	signalSteerStateChangedLocked(turn)
}

type claudeSteerCompletion struct {
	accepted  bool
	cancelled bool
}

func (h *Handler) waitForClaudeSteeredCompletion(ctx context.Context, turn *activeTurn) (claudeSteerCompletion, error) {
	for {
		h.mu.Lock()
		pending := turn.steerPending
		accepted := turn.steerAccepted
		cancelled := turn.cancelled
		terminalUpdates := turn.terminalUserUsageUpdates
		target := turn.promptReturnUsageBaseline + accepted
		changed := turn.steerStateChanged
		h.mu.Unlock()

		if cancelled {
			return claudeSteerCompletion{accepted: accepted > 0, cancelled: true}, nil
		}
		if pending == 0 {
			if accepted == 0 {
				return claudeSteerCompletion{}, nil
			}
			if terminalUpdates >= target {
				return claudeSteerCompletion{accepted: true}, nil
			}
		}

		select {
		case <-ctx.Done():
			return claudeSteerCompletion{}, context.Cause(ctx)
		case <-changed:
		}
	}
}

func (h *Handler) cancelPromptWait(serverName, sessionID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	turn := h.promptsInFlight[promptSessionKey{agentServer: normalizeServerName(serverName), sessionID: sessionID}]
	if turn == nil {
		return
	}
	turn.cancelled = true
	signalSteerStateChangedLocked(turn)
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func relayedUserMessageUpdate(messageID string, block acpsdk.ContentBlock, steer bool) map[string]any {
	update := map[string]any{
		"sessionUpdate": "user_message_chunk",
		"messageId":     messageID,
		"content":       block,
	}
	if steer {
		update["_meta"] = map[string]any{methods.ACPUserMessageSteerMetaKey: true}
	}
	return update
}

// isSteerFallbackPrompt reports whether a prompt's _meta marks it as
// re-delivering a steer message the agent declined to inject; Steer mirrored
// that user message to the other surfaces already.
func isSteerFallbackPrompt(meta map[string]any) bool {
	return meta[methods.ACPSteerFallbackMetaKey] == true
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
func publishUserMessage(client *acpClient, events SessionEventSink, serverName, sessionID, originID string, blocks []acpsdk.ContentBlock, steer bool) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	messageID := uuid.NewString()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
				"update":    relayedUserMessageUpdate(messageID, block, steer),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func relayUserMessageToOtherClients(gCtx *glsp.Context, client *acpClient, serverName, sessionID string, blocks []acpsdk.ContentBlock, steer bool) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	messageID := uuid.NewString()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
					"update":    relayedUserMessageUpdate(messageID, block, steer),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (h *Handler) Cancel(ctx context.Context, params *methods.ACPCancelParams, gCtx *glsp.Context) (*methods.ACPCancelOutput, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
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
	if h.liveStatusSink != nil {
		defer func() {
			if statusErr := h.liveStatusSink.CompletePrompt(context.Background(), gCtx, params.AgentServer, string(sessionID)); statusErr != nil {
				slog.Debug("acpproxy: failed to complete prompt status after cancel", "server", params.AgentServer, "session_id", string(sessionID), "error", statusErr)
			}
			if statusErr := h.liveStatusSink.SetConversationLiveStatus(context.Background(), gCtx, params.AgentServer, string(sessionID), acpnav.ConversationLiveStatusPatch{
				WaitingForUser: acpnav.Bool(false),
			}); statusErr != nil {
				slog.Debug("acpproxy: failed to clear pending status after cancel", "server", params.AgentServer, "session_id", string(sessionID), "error", statusErr)
			}
		}()
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err := conn.Cancel(ctx, acpsdk.CancelNotification{
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}); err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}
	h.cancelPromptWait(params.AgentServer, string(sessionID))

	return &methods.ACPCancelOutput{}, nil
}

func (h *Handler) SetMode(ctx context.Context, params *methods.ACPSetModeParams, gCtx *glsp.Context) (*methods.ACPSetModeOutput, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
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
	resp, err := conn.SetSessionMode(ctx, acpsdk.SetSessionModeRequest{
__POOL_SYNTHETIC_IMPORT_BASELINE__
		ModeId:    params.ModeId,
	})
	if err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}

	return &resp, nil
}

func (h *Handler) SetConfigOption(ctx context.Context, params *methods.ACPSetConfigOptionParams, gCtx *glsp.Context) (*methods.ACPSetConfigOptionOutput, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
	}
	req, _, err := setConfigOptionRequestSessionID(params.SetSessionConfigOptionRequest, activeSession)
	if err != nil {
		return nil, err
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	resp, err := conn.SetSessionConfigOption(ctx, req)
	if err != nil {
		h.refreshAuthAfterCallError(ctx, params.AgentServer, err)
		return nil, preserveACPError("acpproxy: set config option", err)
	}

	return &resp, nil
}

func setConfigOptionRequestSessionID(req acpsdk.SetSessionConfigOptionRequest, fallback acpsdk.SessionId) (acpsdk.SetSessionConfigOptionRequest, acpsdk.SessionId, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		sessionID := v.SessionId
		if sessionID == "" {
			sessionID = fallback
		}
		if sessionID == "" {
			return req, "", fmt.Errorf("acpproxy: no active session; call session/new first")
		}
		v.SessionId = sessionID
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return req, sessionID, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		sessionID := v.SessionId
		if sessionID == "" {
			sessionID = fallback
		}
		if sessionID == "" {
			return req, "", fmt.Errorf("acpproxy: no active session; call session/new first")
		}
		v.SessionId = sessionID
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return req, sessionID, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if fallback == "" {
			return req, "", fmt.Errorf("acpproxy: no active session; call session/new first")
		}
		return req, "", fmt.Errorf("acpproxy: set config option: unsupported request variant (expected ValueId or Boolean, got %+v)", req)
	}
}
