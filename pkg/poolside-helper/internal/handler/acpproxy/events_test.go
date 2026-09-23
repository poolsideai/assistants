__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"encoding/json"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	acphelpers "github.com/poolsideai/assistant/pkg/acp"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	all       []broadcastEvent
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	message      map[string]any
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type broadcastEvent struct {
	method string
	params any
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	s.published = append(s.published, publishedEvent{
		agentServer:  agentServer,
		sessionID:    sessionID,
		originDevice: originDevice,
		skipPrimary:  skipPrimary,
		message:      message,
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
func (s *fakeEventSink) NotifyAll(method string, params any) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.all = append(s.all, broadcastEvent{method: method, params: params})
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
func (s *fakeEventSink) broadcastSnapshot() []broadcastEvent {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]broadcastEvent(nil), s.all...)
}

func (s *fakeEventSink) turnSnapshot() []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]string(nil), s.turns...)
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
func TestPublishUserMessageAssignsOneUniqueIDPerRelayedMessage(t *testing.T) {
	h := NewHandler(dummyConfig(), nil, nil)
	sink := &fakeEventSink{}
	h.SetSessionEvents(sink)
	_, client := h.processFor(DefaultAgentServerName, newGlspContext(nil, nil))

	prompt := []acpsdk.ContentBlock{
		{Text: &acpsdk.ContentBlockText{Type: "text", Text: "first"}},
		{Text: &acpsdk.ContentBlockText{Type: "text", Text: " second"}},
	}
	steer := []acpsdk.ContentBlock{
		{Text: &acpsdk.ContentBlockText{Type: "text", Text: "change direction"}},
	}
	publishUserMessage(client, sink, DefaultAgentServerName, "s1", methods.PrimaryClientOrigin, prompt, false)
	publishUserMessage(client, sink, DefaultAgentServerName, "s1", methods.PrimaryClientOrigin, steer, true)
	require.NoError(t, client.waitForSessionUpdates(context.Background()))

	published, _ := sink.snapshot()
	require.Len(t, published, 3)
	updateFor := func(event publishedEvent) map[string]any {
		params, ok := event.message["params"].(map[string]any)
		require.True(t, ok)
		update, ok := params["update"].(map[string]any)
		require.True(t, ok)
		return update
	}
	first := updateFor(published[0])
	second := updateFor(published[1])
	steered := updateFor(published[2])
	firstID, ok := first["messageId"].(string)
	require.True(t, ok)
	require.NotEmpty(t, firstID)
	assert.Equal(t, firstID, second["messageId"], "blocks from one prompt must materialize together")
	assert.NotEqual(t, firstID, steered["messageId"], "a steer must not merge into the preceding prompt")
	assert.Equal(t, map[string]any{methods.ACPUserMessageSteerMetaKey: true}, steered["_meta"])
}

func TestClaudePromptSuggestionRoutesThroughSessionEventSink(t *testing.T) {
	h := NewHandler(dummyConfig(), nil, nil)
	sink := &fakeEventSink{}
	h.SetSessionEvents(sink)
	_, client := h.processFor("claude-acp", newGlspContext(nil, nil))

	raw := json.RawMessage(`{
		"sessionId": "s1",
		"message": {
			"type": "prompt_suggestion",
			"suggestion": "Run the focused tests",
			"uuid": "suggestion-1",
			"session_id": "claude-session-1"
		}
	}`)
	out, err := client.HandleExtensionMethod(context.Background(), methods.ACPClaudeSDKMessageMethod, raw)

	require.NoError(t, err)
	assert.Nil(t, out)
	require.NoError(t, client.waitForSessionUpdates(context.Background()))

	published, direct := sink.snapshot()
	assert.Empty(t, direct)
	require.Len(t, published, 1)
	assert.Equal(t, "claude-acp", published[0].agentServer)
	assert.Equal(t, "s1", published[0].sessionID)
	assert.Equal(t, methods.ACPClaudeSDKMessageMethod, published[0].message["method"])
}

func TestCompactionUpdateUsesSessionFanoutOrLegacyBroadcast(t *testing.T) {
	h := NewHandler(dummyConfig(), nil, nil)
	sink := &fakeEventSink{}
	h.SetSessionEvents(sink)
	_, client := h.processFor(DefaultAgentServerName, newGlspContext(nil, nil))

	for _, raw := range []json.RawMessage{
		json.RawMessage(`{"sessionId":"s1","id":"scoped","phase":"started"}`),
		json.RawMessage(`{"id":"legacy","phase":"started"}`),
	} {
		out, err := client.HandleExtensionMethod(context.Background(), acphelpers.ExtensionMethodCompactionUpdate, raw)
		require.NoError(t, err)
		assert.Nil(t, out)
	}
	require.NoError(t, client.waitForSessionUpdates(context.Background()))

	published, direct := sink.snapshot()
	require.Len(t, published, 1)
	assert.Empty(t, direct)
	assert.Equal(t, "s1", published[0].sessionID)
	assert.Equal(t, methods.ACPCompactionUpdateMethod, published[0].message["method"])

	broadcasts := sink.broadcastSnapshot()
	require.Len(t, broadcasts, 1)
	assert.Equal(t, methods.JSONRPCNotifyMethod, broadcasts[0].method)
	bridge, ok := broadcasts[0].params.(map[string]any)
	require.True(t, ok)
	message, ok := bridge["message"].(map[string]any)
	require.True(t, ok)
	assert.Equal(t, methods.ACPCompactionUpdateMethod, message["method"])
}

func TestTurnEndedFollowsCompactionAndReachesEverySurface(t *testing.T) {
	h := NewHandler(dummyConfig(), nil, nil)
	sink := &fakeEventSink{}
	h.SetSessionEvents(sink)
	_, client := h.processFor(DefaultAgentServerName, newGlspContext(nil, nil))
	sink.BeginTurn(DefaultAgentServerName, "s1")

	out, err := client.HandleExtensionMethod(
		context.Background(),
		acphelpers.ExtensionMethodCompactionUpdate,
		json.RawMessage(`{"sessionId":"s1","id":"failed","phase":"started"}`),
	)
	require.NoError(t, err)
	assert.Nil(t, out)
	client.enqueueTurnEnded("s1")
	require.NoError(t, client.waitForSessionUpdates(context.Background()))

	published, direct := sink.snapshot()
	assert.Empty(t, direct)
	require.Len(t, published, 2)
	assert.Equal(t, methods.ACPCompactionUpdateMethod, published[0].message["method"])
	assert.Equal(t, methods.ACPTurnEndedMethod, published[1].message["method"])
	assert.Equal(t, []string{"begin:s1", "end:s1"}, sink.turnSnapshot())
}

func TestTurnEndedIsNeverScopedToConcurrentLoad(t *testing.T) {
	h := NewHandler(dummyConfig(), nil, nil)
	sink := &fakeEventSink{}
	h.SetSessionEvents(sink)
	_, client := h.processFor(DefaultAgentServerName, newGlspContext(nil, nil))
	sink.BeginTurn(DefaultAgentServerName, "s1")
	release, err := h.beginSessionLoad(context.Background(), DefaultAgentServerName, "s1", "remote:dev/a")
	require.NoError(t, err)
	defer release()

	client.enqueueTurnEnded("s1")
	require.NoError(t, client.waitForSessionUpdates(context.Background()))

	published, direct := sink.snapshot()
	assert.Empty(t, direct)
	require.Len(t, published, 1)
	assert.Equal(t, methods.ACPTurnEndedMethod, published[0].message["method"])
	assert.Equal(t, []string{"begin:s1", "end:s1"}, sink.turnSnapshot())
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
