__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"crypto/sha256"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"encoding/hex"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/poolsideai/assistant/pkg/common/userconfig"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	stateFilter      func(methods.ACPNavState) methods.ACPNavState
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return &Server{
		liveStatuses:   map[string]methods.ACPNavConversationLiveStatus{},
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
func (s *Server) CreateChat(_ context.Context, req *methods.ACPNavCreateChatParams, _ *glsp.Context) (methods.ACPNavCreateChatOutput, error) {
	sessionID := strings.TrimSpace(req.SessionID)
	if sessionID == "" {
		return methods.ACPNavCreateChatOutput{}, fmt.Errorf("sessionId is required")
	}

	path := chatStoragePath(sessionID)
	if err := os.MkdirAll(path, 0o700); err != nil {
		return methods.ACPNavCreateChatOutput{}, fmt.Errorf("creating chat working directory: %w", err)
	}
	return methods.ACPNavCreateChatOutput{Path: path}, nil
}

const chatStorageDirectoryName = "chats"

func chatStoragePath(sessionID string) string {
	return filepath.Join(userconfig.StateDirectory(), chatStorageDirectoryName, chatStorageName(sessionID))
}

func chatStorageName(sessionID string) string {
	sum := sha256.Sum256([]byte(sessionID))
	return hex.EncodeToString(sum[:])
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) SetStateFilter(filter func(methods.ACPNavState) methods.ACPNavState) {
	s.stateFilter = filter
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
	return s.listWithLiveStatus(ctx)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) AgentServers(ctx context.Context) (methods.ACPAgentServers, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, sql.ErrConnDone
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func (s *Server) SeedAgentServersIfNeeded(ctx context.Context, agentServers methods.ACPAgentServers) error {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return sql.ErrConnDone
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func (s *Server) ListAgentServers(ctx context.Context, _ *methods.ACPNavListAgentServersParams, _ *glsp.Context) (methods.ACPNavAgentServersState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return methods.ACPNavAgentServersState{}, sql.ErrConnDone
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return methods.ACPNavAgentServersState{}, err
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	defaultAgentServerPinned, err := s.agentServerStore.GetDefaultAgentServerPinned(ctx)
	if err != nil {
		return methods.ACPNavAgentServersState{}, err
	}
	return methods.ACPNavAgentServersState{
		AgentServers:             agentServers,
		DefaultAgentServer:       defaultAgentServer,
		DefaultAgentServerPinned: defaultAgentServerPinned,
	}, nil
}

func (s *Server) SetAgentServers(ctx context.Context, req *methods.ACPNavSetAgentServersParams, _ *glsp.Context) (methods.ACPNavAgentServersState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return methods.ACPNavAgentServersState{}, sql.ErrConnDone
	}
	if err := s.agentServerStore.SetAgentServers(ctx, req.AgentServers, req.DefaultAgentServer, req.DefaultAgentServerPinned); err != nil {
		return methods.ACPNavAgentServersState{}, err
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return methods.ACPNavAgentServersState{}, err
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	defaultAgentServerPinned, err := s.agentServerStore.GetDefaultAgentServerPinned(ctx)
	if err != nil {
		return methods.ACPNavAgentServersState{}, err
	}
	return methods.ACPNavAgentServersState{
		AgentServers:             agentServers,
		DefaultAgentServer:       defaultAgentServer,
		DefaultAgentServerPinned: defaultAgentServerPinned,
	}, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) UpsertProject(ctx context.Context, req *methods.ACPNavUpsertProjectParams, gCtx *glsp.Context) (methods.ACPNavProject, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	project, err := s.store.UpsertProject(ctx, *req)
	if err != nil {
		return methods.ACPNavProject{}, err
	}
	s.notifyDidChange(ctx, gCtx)
	return project, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) SetProjectCollapsed(ctx context.Context, req *methods.ACPNavSetProjectCollapsedParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	s.notifyState(ctx, gCtx, state)
	return state, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) SetProjectSettings(ctx context.Context, req *methods.ACPNavSetProjectSettingsParams, gCtx *glsp.Context) (methods.ACPNavProjectSettingsState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	s.notifyDidChange(ctx, gCtx)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) ReleasePreparedWorktree(_ context.Context, req *methods.ACPNavReleasePreparedWorktreeParams, _ *glsp.Context) (methods.ACPNavReleasePreparedWorktreeOutput, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return methods.ACPNavReleasePreparedWorktreeOutput{}, sql.ErrConnDone
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return methods.ACPNavReleasePreparedWorktreeOutput{}, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) CreateWorktree(ctx context.Context, req *methods.ACPNavCreateWorktreeParams, gCtx *glsp.Context) (methods.ACPNavProject, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	s.notifyDidChange(ctx, gCtx)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) RemoveProject(ctx context.Context, req *methods.ACPNavRemoveProjectParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	s.notifyState(ctx, gCtx, state)
	return state, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) RemoveWorktree(ctx context.Context, req *methods.ACPNavRemoveWorktreeParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	s.notifyState(ctx, gCtx, state)
	return state, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) UpsertConversation(ctx context.Context, req *methods.ACPNavUpsertConversationParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	s.notifyState(ctx, gCtx, state)
	return state, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) PrepareConversationHandoff(ctx context.Context, req *methods.ACPNavPrepareConversationHandoffParams, _ *glsp.Context) (methods.ACPNavConversationHandoffOutput, error) {
	if s.store == nil {
		return methods.ACPNavConversationHandoffOutput{}, sql.ErrConnDone
	}
	if err := s.store.PrepareConversationHandoff(ctx, *req); err != nil {
		return methods.ACPNavConversationHandoffOutput{}, err
	}
	return methods.ACPNavConversationHandoffOutput{}, nil
}

func (s *Server) AbortConversationHandoff(ctx context.Context, req *methods.ACPNavAbortConversationHandoffParams, _ *glsp.Context) (methods.ACPNavConversationHandoffOutput, error) {
	if s.store == nil {
		return methods.ACPNavConversationHandoffOutput{}, sql.ErrConnDone
	}
	if err := s.store.AbortConversationHandoff(ctx, req.HandoffID); err != nil {
		return methods.ACPNavConversationHandoffOutput{}, err
	}
	return methods.ACPNavConversationHandoffOutput{}, nil
}

func (s *Server) GetConversationHistory(ctx context.Context, req *methods.ACPNavGetConversationHistoryParams, _ *glsp.Context) (methods.ACPNavConversationHistory, error) {
	if s.store == nil {
		return methods.ACPNavConversationHistory{}, sql.ErrConnDone
	}
	return s.store.ConversationHistory(ctx, req.ConversationID)
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
	if err != nil {
		return err
	}
	s.notifyState(ctx, gCtx, state)
	return nil
}

// UpdateConversationTitle persists an agent-generated title without changing
// the conversation's active/archive state or its user-authored nickname.
func (s *Server) UpdateConversationTitle(ctx context.Context, gCtx *glsp.Context, agentServer, sessionID, title string) error {
	if s.store == nil {
		return sql.ErrConnDone
	}
	changed, err := s.store.UpdateConversationTitle(ctx, agentServer, sessionID, title)
	if err != nil || !changed {
		return err
	}
	state, err := s.listWithLiveStatus(ctx)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// BindConversationSessionHandoff atomically commits the frozen source leg and
// points the stable conversation id at the target agent session. A handoff is
// never visible durably in only one of those two states.
func (s *Server) BindConversationSessionHandoff(ctx context.Context, gCtx *glsp.Context, conversationID, agentServer, sessionID, cwd, handoffID string) error {
	if s.store == nil {
		return sql.ErrConnDone
	}
	if err := s.store.BindConversationSessionHandoff(ctx, conversationID, agentServer, sessionID, cwd, handoffID); err != nil {
		return err
	}
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		// The leg and target binding are already committed atomically. Treat a
		// refresh failure as best-effort so session/new can still return the
		// target session id and the client does not incorrectly restore source.
		slog.Warn("acpnav: handoff committed but nav refresh failed", "conversation", conversationID, "error", err)
		return nil
	}
	s.notifyState(ctx, gCtx, state)
	return nil
}

func (s *Server) RestoreConversation(ctx context.Context, req *methods.ACPNavRestoreConversationParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	s.notifyState(ctx, gCtx, state)
	return state, nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (s *Server) ArchiveConversation(ctx context.Context, req *methods.ACPNavArchiveConversationParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	s.notifyState(ctx, gCtx, state)
	return state, nil
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
func (s *Server) SetConversationViewState(ctx context.Context, req *methods.ACPNavSetConversationViewStateParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
	if s.store == nil {
		return methods.ACPNavState{}, sql.ErrConnDone
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return s.listWithLiveStatus(ctx)
	}

	statusChanged := false
	s.mu.Lock()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
	}
	s.mu.Unlock()

	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	if statusChanged {
		s.notifyState(ctx, gCtx, state)
	}
	return state, nil
}

type ConversationLiveStatusPatch struct {
	Working        *bool
	WaitingForUser *bool
	Unread         *bool
}

func Bool(value bool) *bool {
	return &value
}

func (s *Server) SetConversationLiveStatus(
	ctx context.Context,
	gCtx *glsp.Context,
	agentServer string,
	sessionID string,
	patch ConversationLiveStatusPatch,
) error {
	if s.store == nil {
		return sql.ErrConnDone
	}
	changed := s.applyConversationLiveStatus(agentServer, sessionID, patch)
	if changed {
		s.notifyDidChange(ctx, gCtx)
	}
	return nil
}

func (s *Server) CompletePrompt(ctx context.Context, gCtx *glsp.Context, agentServer string, sessionID string) error {
	key, ok := liveStatusKey(agentServer, sessionID)
	if !ok {
		return nil
	}
	s.mu.Lock()
__POOL_SYNTHETIC_IMPORT_BASELINE__
	s.mu.Unlock()
	return s.SetConversationLiveStatus(ctx, gCtx, agentServer, sessionID, ConversationLiveStatusPatch{
		Working: Bool(false),
		Unread:  Bool(!active),
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
func (s *Server) ClearAgentServerInFlightStatus(ctx context.Context, gCtx *glsp.Context, agentServer string) error {
	if s.store == nil {
		return sql.ErrConnDone
	}
	agentServer = normalizeAgentServerName(agentServer)
	prefix := agentServer + "\x00"
	changed := false

	s.mu.Lock()
	for key, status := range s.liveStatuses {
		if !strings.HasPrefix(key, prefix) {
			continue
		}
		if status.Working || status.WaitingForUser {
			status.Working = false
			status.WaitingForUser = false
			s.setLiveStatusLocked(key, status)
			changed = true
		}
	}
	s.mu.Unlock()

	if changed {
		s.notifyDidChange(ctx, gCtx)
	}
	return nil
}

func (s *Server) applyConversationLiveStatus(agentServer, sessionID string, patch ConversationLiveStatusPatch) bool {
	key, ok := liveStatusKey(agentServer, sessionID)
	if !ok {
		return false
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	previous := s.liveStatuses[key]
	next := previous
	if patch.Working != nil {
		next.Working = *patch.Working
	}
	if patch.WaitingForUser != nil {
		next.WaitingForUser = *patch.WaitingForUser
	}
	if patch.Unread != nil {
		next.Unread = *patch.Unread
	}
	if next == previous {
		return false
	}
	s.setLiveStatusLocked(key, next)
	return true
}

func (s *Server) setLiveStatusLocked(key string, status methods.ACPNavConversationLiveStatus) {
	if liveStatusIsEmpty(status) {
		delete(s.liveStatuses, key)
		return
	}
	s.liveStatuses[key] = status
}

func (s *Server) listWithLiveStatus(ctx context.Context) (methods.ACPNavState, error) {
	state, err := s.store.List(ctx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	state = s.overlayLiveStatus(state)
	if s.stateFilter != nil {
		state = s.stateFilter(state)
	}
	return state, nil
}

func (s *Server) overlayLiveStatus(state methods.ACPNavState) methods.ACPNavState {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range state.Conversations {
		key, ok := liveStatusKey(state.Conversations[i].AgentServer, state.Conversations[i].SessionID)
		if !ok {
			continue
		}
		status, ok := s.liveStatuses[key]
		if !ok || liveStatusIsEmpty(status) {
			state.Conversations[i].LiveStatus = nil
			continue
		}
		statusCopy := status
		state.Conversations[i].LiveStatus = &statusCopy
	}
	return state
}

func (s *Server) notifyDidChange(ctx context.Context, gCtx *glsp.Context) {
	if gCtx == nil {
		return
	}
	state, err := s.listWithLiveStatus(ctx)
	if err != nil {
		slog.Debug("acpnav: failed to list state for didChange notification", "error", err)
		return
	}
	s.notifyState(ctx, gCtx, state)
}

func (s *Server) notifyState(ctx context.Context, gCtx *glsp.Context, state methods.ACPNavState) {
	if gCtx == nil {
		return
	}
	params := methods.ACPNavDidChangeParams{State: state}
	if err := gCtx.Notify(ctx, params.MethodName(), &params); err != nil {
		slog.Debug("acpnav: failed to notify state change", "error", err)
	}
}

func liveStatusKey(agentServer, sessionID string) (string, bool) {
	agentServer = normalizeAgentServerName(agentServer)
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return "", false
	}
	return agentServer + "\x00" + sessionID, true
}

func liveStatusIsEmpty(status methods.ACPNavConversationLiveStatus) bool {
	return !status.Working && !status.WaitingForUser && !status.Unread
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
