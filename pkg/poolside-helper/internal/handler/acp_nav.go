package handler

import (
	"context"

	"github.com/tliron/glsp"

	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler/acpproxy"
	"github.com/poolsideai/assistant/pkg/poolside-helper/methods"
)

func (h *PoolsideHandler) ACPNavList(ctx context.Context, req *methods.ACPNavListParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
	return h.acpNavHandler.List(ctx, req, gCtx)
}

func (h *PoolsideHandler) acpNavStateForHost(state methods.ACPNavState) methods.ACPNavState {
	if h.config != nil && h.config.AssistantHost == "desktop" {
		return state
	}

	conversations := make([]methods.ACPNavConversation, 0, len(state.Conversations))
	for _, conversation := range state.Conversations {
		if acpproxy.NormalizeAgentServerName(conversation.AgentServer) != methods.LocalAgentServerName {
			conversations = append(conversations, conversation)
		}
	}
	state.Conversations = conversations
	return state
}

func (h *PoolsideHandler) ACPNavListAgentServers(ctx context.Context, req *methods.ACPNavListAgentServersParams, gCtx *glsp.Context) (methods.ACPNavAgentServersState, error) {
	state, err := h.acpNavHandler.ListAgentServers(ctx, req, gCtx)
	if err != nil {
		return methods.ACPNavAgentServersState{}, err
	}
	return h.agentServersForHost(state), nil
}

func (h *PoolsideHandler) agentServersForHost(state methods.ACPNavAgentServersState) methods.ACPNavAgentServersState {
	if h.config != nil && h.config.AssistantHost == "desktop" {
		return state
	}

	agentServers := make(methods.ACPAgentServers, len(state.AgentServers))
	for name, cfg := range state.AgentServers {
		if name != methods.LocalAgentServerName {
			agentServers[name] = cfg
		}
	}
	state.AgentServers = agentServers
	if state.DefaultAgentServer == methods.LocalAgentServerName {
		state.DefaultAgentServer = acpproxy.DefaultAgentServerName
	}
	return state
}

func (h *PoolsideHandler) ACPNavUpsertProject(ctx context.Context, req *methods.ACPNavUpsertProjectParams, gCtx *glsp.Context) (methods.ACPNavProject, error) {
	project, err := h.acpNavHandler.UpsertProject(ctx, req, gCtx)
	if err != nil {
		return methods.ACPNavProject{}, err
	}
	h.invalidateFileSearchAfterACPNavChange()
	return project, nil
}

func (h *PoolsideHandler) ACPNavPrepareWorktree(ctx context.Context, req *methods.ACPNavPrepareWorktreeParams, gCtx *glsp.Context) (methods.ACPNavProject, error) {
	// Prepare reserves a name in memory only — no DB or filesystem change,
	// so the file-search cache does not need to be invalidated here.
	return h.acpNavHandler.PrepareWorktree(ctx, req, gCtx)
}

func (h *PoolsideHandler) ACPNavReleasePreparedWorktree(ctx context.Context, req *methods.ACPNavReleasePreparedWorktreeParams, gCtx *glsp.Context) (methods.ACPNavReleasePreparedWorktreeOutput, error) {
	return h.acpNavHandler.ReleasePreparedWorktree(ctx, req, gCtx)
}

func (h *PoolsideHandler) ACPNavCreateWorktree(ctx context.Context, req *methods.ACPNavCreateWorktreeParams, gCtx *glsp.Context) (methods.ACPNavProject, error) {
	project, err := h.acpNavHandler.CreateWorktree(ctx, req, gCtx)
	if err != nil {
		return methods.ACPNavProject{}, err
	}
	h.invalidateFileSearchAfterACPNavChange()
	return project, nil
}

func (h *PoolsideHandler) ACPNavRemoveProject(ctx context.Context, req *methods.ACPNavRemoveProjectParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
	state, err := h.acpNavHandler.RemoveProject(ctx, req, gCtx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	h.invalidateFileSearchAfterACPNavChange()
	return state, nil
}

func (h *PoolsideHandler) ACPNavRemoveWorktree(ctx context.Context, req *methods.ACPNavRemoveWorktreeParams, gCtx *glsp.Context) (methods.ACPNavState, error) {
	state, err := h.acpNavHandler.RemoveWorktree(ctx, req, gCtx)
	if err != nil {
		return methods.ACPNavState{}, err
	}
	h.invalidateFileSearchAfterACPNavChange()
	return state, nil
}

func (h *PoolsideHandler) invalidateFileSearchAfterACPNavChange() {
	if h.fileSearchHandler != nil {
		h.fileSearchHandler.Invalidate()
	}
}
