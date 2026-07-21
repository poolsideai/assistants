__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  SessionEventsState,
  ToolCallExpansionState,
  toolActivityFrom,
} from "./SessionEventsState.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("keeps pre-reply finished tools summarized while the reply streams without turn metadata", () => {
    const events = [
      { eventKind: "user_message", messageId: "u1", content: [] },
      tool("edit-1", "edit", "completed"),
      tool("run-1", "execute", "completed"),
      { eventKind: "user_message", messageId: "u2", content: [] },
      tool("read-1", "read", "completed"),
      tool("read-2", "read", "completed"),
    ] satisfies SessionEvent[];

    const state = new SessionEventsState({
      events,
      isPrompting: true,
    });

    const groups = state.grouped.filter((item) => item.kind === "event_group");

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  it("summarizes tools on both sides of a steer as one completed turn", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        steerMessage("Focus on the UI package"),
        tool("read-3", "read", "completed"),
        tool("read-4", "read", "completed"),
        agentMessage("Done"),
      ],
      isPrompting: false,
      toolActivity: "grouped",
      turns: [
        {
          startedAt: "2026-06-02T10:00:00.000Z",
          endedAt: "2026-06-02T10:01:00.000Z",
          startIndex: 0,
          endIndex: 5,
        },
      ],
    });

    const groups = state.grouped.filter((item) => item.kind === "event_group");
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      turn: { startIndex: 0, endIndex: 5 },
      events: [
        { index: 0 },
        { index: 1 },
        { index: 2, event: { eventKind: "user_message", steer: true } },
        { index: 3 },
        { index: 4 },
      ],
    });
  });

  it("folds an interrupted turn's automatic tail into its live group while idle", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("edit-1", "edit", "completed"),
        tool("run-1", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "grouped",
      turns: [interruptedTurn(0, 3)],
    });

    // The two-slot tail only stabilizes the live transcript. Once interrupted,
    // its unpinned tools join the same live-style group.
    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }],
      turn: { startIndex: 0, endIndex: 3, interrupted: true },
    });
  });

  it("folds a two-tool interrupted turn instead of leaving every tool expanded", () => {
    const state = new SessionEventsState({
      events: [tool("edit-1", "edit", "completed"), tool("run-1", "execute", "cancelled")],
      isPrompting: false,
      toolActivity: "grouped",
      turns: [interruptedTurn(0, 1)],
    });

    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }],
      turn: { interrupted: true },
    });
  });

  it("folds a trailing steer prompt into an interrupted grouped turn", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("run-1", "execute", "cancelled"),
        steerMessage("Stop the remaining wait"),
      ],
      isPrompting: false,
      toolActivity: "grouped",
      turns: [interruptedTurn(0, 3)],
    });

    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [
        { index: 0 },
        { index: 1 },
        { index: 2 },
        { index: 3, event: { eventKind: "user_message", steer: true } },
      ],
    });
  });

  it("folds tools before a trailing interrupted reply", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("run-1", "execute", "cancelled"),
        agentMessage("Partial reply"),
      ],
      isPrompting: false,
      toolActivity: "grouped",
      turns: [interruptedTurn(0, 3)],
    });

    expect(state.grouped).toHaveLength(2);
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }],
    });
    expect(state.grouped[1]).toMatchObject({
      kind: "event",
      event: { eventKind: "agent_message" },
    });
  });

  it("keeps agent messages outside an interrupted turn's folds, splitting the runs", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("read-3", "read", "completed"),
        tool("read-4", "read", "completed"),
        agentMessage("Call 1 succeeded. Now calling 2nd time:"),
        tool("run-1", "execute", "completed"),
        tool("run-2", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "grouped",
      turns: [interruptedTurn(0, 6)],
    });

    // Grouped mode retains the streaming run boundaries around messages, while
    // the automatic tail joins the second run once the interrupt settles.
    expect(state.grouped).toHaveLength(3);
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }],
    });
    expect(state.grouped[1]).toMatchObject({
      kind: "event",
      event: { eventKind: "agent_message" },
    });
    expect(state.grouped[2]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 5 }, { index: 6 }],
    });
  });

  it("folds an interrupted compact turn into one live-style group", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        agentMessage("Call 1 succeeded. Now calling 2nd time:"),
        tool("run-1", "execute", "completed"),
        tool("run-2", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "compact",
      turns: [interruptedTurn(0, 4)],
    });

    // Compact keeps its membership-based shape and absorbs interim messages;
    // the automatic tail joins the fold once the interrupt settles.
    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      id: "group-0",
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }],
      turn: { interrupted: true },
    });
  });

  it("folds every unpinned tool in an interrupted compact turn", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("run-1", "execute", "completed"),
        tool("run-2", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "compact",
      turns: [interruptedTurn(0, 2)],
    });

    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      id: "group-0",
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }],
      turn: { interrupted: true },
    });
  });

  it("keeps an interim message inside the settled interrupted compact fold", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("read-3", "read", "completed"),
        agentMessage("Now running the build:"),
        tool("run-1", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "compact",
      turns: [interruptedTurn(0, 4)],
    });

    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      id: "group-0",
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }],
      turn: { interrupted: true },
    });
  });

  it("keeps a steer prompt inside the settled interrupted compact fold", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("run-1", "execute", "cancelled"),
        steerMessage("Skip the broad suite"),
      ],
      isPrompting: false,
      toolActivity: "compact",
      turns: [interruptedTurn(0, 3)],
    });

    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      id: "group-0",
      kind: "event_group",
      live: true,
      events: [
        { index: 0 },
        { index: 1 },
        { index: 2 },
        { index: 3, event: { eventKind: "user_message", steer: true } },
      ],
      turn: { interrupted: true },
    });
  });

  it("keeps an interrupted compact fold whole across interleaved thoughts", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        thought("Checking the config next"),
        tool("read-2", "read", "completed"),
        tool("run-1", "execute", "completed"),
        tool("run-2", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "compact",
      turns: [interruptedTurn(0, 4)],
    });

    // The membership fold grows in place to absorb the automatic tail while
    // the thought retains its separate interrupted-compact rendering.
    expect(state.grouped).toHaveLength(2);
    expect(state.grouped[0]).toMatchObject({
      id: "group-0",
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 2 }, { index: 3 }, { index: 4 }],
      turn: { interrupted: true },
    });
    expect(state.grouped[1]).toMatchObject({
      kind: "event",
      event: { eventKind: "agent_thought" },
    });
  });

  it("keeps an interrupted compact group's id anchored on its first tool across a leading message", () => {
    const state = new SessionEventsState({
      events: [
        agentMessage("Let me explore the key directories"),
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("run-1", "execute", "completed"),
        tool("run-2", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "compact",
      turns: [interruptedTurn(0, 4)],
    });

    // The group grows to absorb the automatic tail without changing the first
    // tool anchor, so the VirtualList row is not re-keyed on cancel.
    expect(state.grouped).toHaveLength(1);
    expect(state.grouped[0]).toMatchObject({
      id: "group-1",
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }],
      turn: { interrupted: true },
    });
  });

  it("keeps an interrupted turn's tools expanded in detailed mode", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("edit-1", "edit", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "detailed",
      turns: [interruptedTurn(0, 2)],
    });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  it("keeps an interrupted turn's live group while a subsequent turn is prompting", () => {
    const events = [
      tool("edit-1", "edit", "completed"),
      tool("edit-2", "edit", "completed"),
      tool("read-1", "read", "completed"),
      tool("run-1", "execute", "cancelled"),
      { eventKind: "user_message", messageId: "u2", content: [] },
    ] satisfies SessionEvent[];

    const state = new SessionEventsState({
      events,
      isPrompting: true,
      toolActivity: "grouped",
      turns: [interruptedTurn(0, 3)],
    });

    const groups = state.grouped.filter((item) => item.kind === "event_group");
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }],
      turn: { startIndex: 0, endIndex: 3, interrupted: true },
    });
  });

  it("keeps an interrupted turn's live groups after a later turn has completed", () => {
    const events = [
      tool("edit-1", "edit", "cancelled"),
      tool("edit-2", "edit", "cancelled"),
      tool("read-1", "read", "cancelled"),
      tool("run-1", "execute", "cancelled"),
      { eventKind: "user_message", messageId: "u2", content: [] },
      tool("edit-3", "edit", "completed"),
      tool("run-2", "execute", "completed"),
    ] satisfies SessionEvent[];

    const state = new SessionEventsState({
      events,
      isPrompting: false,
      toolActivity: "grouped",
      turns: [
        interruptedTurn(0, 3),
        {
          startedAt: "2026-06-02T10:05:00.000Z",
          endedAt: "2026-06-02T10:06:00.000Z",
          startIndex: 4,
          endIndex: 6,
        },
      ],
    });

    const groups = state.grouped.filter((item) => item.kind === "event_group");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }],
      turn: { startIndex: 0, endIndex: 3, interrupted: true },
    });
    expect(groups[1]).toMatchObject({
      turn: { startIndex: 4, endIndex: 6 },
    });
    expect(groups[1]).not.toMatchObject({ live: true });
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("shows every thought while prompting, marking only the latest live", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped).toHaveLength(2);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      kind: "event",
      liveThought: false,
      event: { eventKind: "agent_thought", content: [{ text: "Planning the files" }] },
    });
    expect(state.grouped[1]).toMatchObject({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("keeps earlier thoughts once a later tool call appears", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped).toHaveLength(3);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      kind: "event",
      event: { eventKind: "agent_thought", content: [{ text: "Planning the files" }] },
    });
    expect(state.grouped[1]).toMatchObject({
      kind: "event",
      event: { eventKind: "agent_thought", content: [{ text: "Creating index.html" }] },
    });
    expect(state.grouped[2]).toMatchObject({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("shows thinking on a completed turn", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped).toHaveLength(2);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      kind: "event",
      liveThought: false,
      event: { eventKind: "agent_thought", content: [{ text: "Checking the result" }] },
    });
    expect(state.grouped[1]).toMatchObject({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("shows a trailing thought on an idle transcript", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped).toHaveLength(2);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped[1]).toMatchObject({
      kind: "event",
      liveThought: false,
      event: { eventKind: "agent_thought", content: [{ text: "Interrupted mid-thought" }] },
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("keeps a thought between live reads, marking only the latest live", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped).toHaveLength(4);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      kind: "event",
      liveThought: false,
      event: { eventKind: "agent_thought", content: [{ text: "peeking" }] },
    });
    expect(state.grouped[2]).toMatchObject({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped[3]).toMatchObject({ kind: "event", liveThought: true });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("shows a thought before later content", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    it("keeps a steer prompt visible between live grouped tool runs", () => {
      const state = new SessionEventsState({
        events: [
          { eventKind: "user_message", messageId: "u1", content: [] },
          tool("read-1", "read", "completed"),
          tool("read-2", "read", "completed"),
          steerMessage("Focus on the failing test"),
          tool("read-3", "read", "completed"),
          tool("edit-1", "edit", "completed"),
          tool("run-1", "execute", "completed"),
          tool("run-2", "execute", "in_progress"),
        ],
        isPrompting: true,
        toolActivity: "grouped",
      });

      expect(state.grouped).toHaveLength(6);
      expect(state.grouped[1]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 1 }, { index: 2 }],
      });
      expect(state.grouped[2]).toMatchObject({
        kind: "event",
        index: 3,
        event: { eventKind: "user_message", steer: true },
      });
      expect(state.grouped[3]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 4 }, { index: 5 }],
      });
      expect(state.grouped[4]).toMatchObject({ event: { toolCallId: "run-1" } });
      expect(state.grouped[5]).toMatchObject({ event: { toolCallId: "run-2" } });
    });

    it("renders a trailing steer prompt after the currently active tools", () => {
      const state = new SessionEventsState({
        events: [
          { eventKind: "user_message", messageId: "u1", content: [] },
          tool("read-1", "read", "completed"),
          tool("read-2", "read", "completed"),
          tool("read-3", "read", "completed"),
          tool("edit-1", "edit", "completed"),
          tool("run-1", "execute", "completed"),
          tool("run-2", "execute", "in_progress"),
          steerMessage("Stop the remaining wait"),
        ],
        isPrompting: true,
        toolActivity: "grouped",
      });

      expect(state.grouped).toHaveLength(5);
      expect(state.grouped[1]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }],
      });
      expect(state.grouped[2]).toMatchObject({ event: { toolCallId: "run-1" } });
      expect(state.grouped[3]).toMatchObject({ event: { toolCallId: "run-2" } });
      expect(state.grouped[4]).toMatchObject({
        kind: "event",
        index: 7,
        event: { eventKind: "user_message", steer: true },
      });
    });

    it("folds thoughts into the group with the tools around them", () => {
      const state = new SessionEventsState({
        events: [
          { eventKind: "user_message", messageId: "u1", content: [] },
          tool("read-1", "read", "completed"),
          thought("Checking the config next"),
          tool("read-2", "read", "completed"),
          tool("read-3", "read", "completed"),
          tool("run-1", "execute", "in_progress"),
        ],
        isPrompting: true,
        toolActivity: "grouped",
      });

      // The settled thought joins the fold rather than splitting it in two;
      // read-3 and run-1 hold the tail.
      expect(state.grouped).toHaveLength(4);
      expect(state.grouped[1]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 1 }, { index: 2 }, { index: 3 }],
      });
      expect(state.grouped[2]).toMatchObject({ event: { toolCallId: "read-3" } });
      expect(state.grouped[3]).toMatchObject({ event: { toolCallId: "run-1" } });
    });

    it("renders a markdown reply in full and starts a new fold beneath it", () => {
      const state = new SessionEventsState({
        events: [
          { eventKind: "user_message", messageId: "u1", content: [] },
          tool("read-1", "read", "completed"),
          thought("Looking for the bug"),
          tool("read-2", "read", "completed"),
          agentMessage("Found the bug"),
          tool("read-3", "read", "completed"),
          thought("Now fixing it"),
          tool("edit-1", "edit", "completed"),
          tool("run-1", "execute", "completed"),
          tool("read-4", "read", "in_progress"),
        ],
        isPrompting: true,
        toolActivity: "grouped",
      });

      // One thought-and-tool fold each side of the uncollapsed message;
      // run-1 and read-4 hold the tail.
      expect(state.grouped).toHaveLength(6);
      expect(state.grouped[1]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 1 }, { index: 2 }, { index: 3 }],
      });
      expect(state.grouped[2]).toMatchObject({
        kind: "event",
        event: { eventKind: "agent_message", content: [{ text: "Found the bug" }] },
      });
      expect(state.grouped[3]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 5 }, { index: 6 }, { index: 7 }],
      });
      expect(state.grouped[4]).toMatchObject({ event: { toolCallId: "run-1" } });
      expect(state.grouped[5]).toMatchObject({ event: { toolCallId: "read-4" } });
    });

    it("collapses thoughts into the end-of-turn summary", () => {
      const state = new SessionEventsState({
        events: [
          tool("read-1", "read", "completed"),
          thought("Looking for the bug"),
          tool("edit-1", "edit", "completed"),
          agentMessage("Done"),
        ],
        isPrompting: false,
        toolActivity: "grouped",
        turns: [
          {
            startedAt: "2026-06-02T10:00:00.000Z",
            endedAt: "2026-06-02T10:01:00.000Z",
            startIndex: 0,
            endIndex: 3,
          },
        ],
      });

      expect(state.grouped).toHaveLength(2);
      expect(state.grouped[0]).toMatchObject({
        kind: "event_group",
        events: [{ index: 0 }, { index: 1 }, { index: 2 }],
        turn: { startIndex: 0 },
      });
      expect(state.grouped[0]).not.toMatchObject({ live: true });
      expect(state.grouped[1]).toMatchObject({
        kind: "event",
        event: { eventKind: "agent_message", content: [{ text: "Done" }] },
      });
    });

    it("folds settled thoughts and the automatic tail into an interrupted live group", () => {
      const state = new SessionEventsState({
        events: [
          tool("read-1", "read", "completed"),
          thought("Checking the config next"),
          tool("read-2", "read", "completed"),
          tool("edit-1", "edit", "completed"),
          tool("run-1", "execute", "cancelled"),
        ],
        isPrompting: false,
        toolActivity: "grouped",
        turns: [interruptedTurn(0, 4)],
      });

      expect(state.grouped).toHaveLength(1);
      expect(state.grouped[0]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }],
        turn: { startIndex: 0, endIndex: 4, interrupted: true },
      });
    });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    it("keeps completed compact reasoning inside one turn summary", () => {
      const events = [
        thought("Planning the read"),
        tool("read-1", "read", "completed"),
        thought("Checking another file"),
        tool("read-2", "read", "completed"),
        thought("Preparing the answer"),
        agentMessage("Done"),
      ] satisfies SessionEvent[];

      const state = new SessionEventsState({
        events,
        isPrompting: false,
        toolActivity: "compact",
        turns: [
          {
            startedAt: "2026-06-02T10:00:00.000Z",
            endedAt: "2026-06-02T10:01:00.000Z",
            startIndex: 0,
            endIndex: 5,
          },
        ],
      });

      expect(state.grouped).toHaveLength(2);
      expect(state.grouped[0]).toMatchObject({
        id: "group-1",
        kind: "event_group",
        events: [
          { index: 0, event: { eventKind: "agent_thought" } },
          { index: 1, event: { toolCallId: "read-1" } },
          { index: 2, event: { eventKind: "agent_thought" } },
          { index: 3, event: { toolCallId: "read-2" } },
          { index: 4, event: { eventKind: "agent_thought" } },
        ],
      });
      expect(state.grouped[1]).toMatchObject({
        kind: "event",
        event: { eventKind: "agent_message", content: [{ text: "Done" }] },
      });
    });

    it("summarizes compact reasoning while idle without turn metadata", () => {
      const state = new SessionEventsState({
        events: [
          thought("Planning the read"),
          tool("read-1", "read", "completed"),
          thought("Checking another file"),
          tool("read-2", "read", "completed"),
          agentMessage("Done"),
        ],
        isPrompting: false,
        toolActivity: "compact",
      });

      expect(state.grouped).toHaveLength(2);
      expect(state.grouped[0]).toMatchObject({
        id: "group-1",
        kind: "event_group",
        events: [
          { index: 0, event: { eventKind: "agent_thought" } },
          { index: 1, event: { toolCallId: "read-1" } },
          { index: 2, event: { eventKind: "agent_thought" } },
          { index: 3, event: { toolCallId: "read-2" } },
        ],
      });
      expect(state.grouped[1]).toMatchObject({
        kind: "event",
        event: { eventKind: "agent_message", content: [{ text: "Done" }] },
      });
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    it("keeps a steer prompt visible between live compact tool spans", () => {
      const state = new SessionEventsState({
        events: [
          { eventKind: "user_message", messageId: "u1", content: [] },
          tool("read-1", "read", "completed"),
          tool("run-1", "execute", "completed"),
          steerMessage("Run only the focused test"),
          tool("edit-1", "edit", "completed"),
          tool("edit-2", "edit", "completed"),
          tool("run-2", "execute", "in_progress"),
        ],
        isPrompting: true,
        toolActivity: "compact",
      });

      expect(state.grouped).toHaveLength(6);
      expect(state.grouped[1]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 1 }, { index: 2 }],
      });
      expect(state.grouped[2]).toMatchObject({
        kind: "event",
        index: 3,
        event: { eventKind: "user_message", steer: true },
      });
      expect(state.grouped[3]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 4 }],
      });
      expect(state.grouped[4]).toMatchObject({ event: { toolCallId: "edit-2" } });
      expect(state.grouped[5]).toMatchObject({ event: { toolCallId: "run-2" } });
    });

    it("renders a trailing steer prompt after compact mode's active tools", () => {
      const state = new SessionEventsState({
        events: [
          { eventKind: "user_message", messageId: "u1", content: [] },
          tool("read-1", "read", "completed"),
          tool("run-1", "execute", "completed"),
          tool("edit-1", "edit", "completed"),
          tool("edit-2", "edit", "completed"),
          tool("run-2", "execute", "in_progress"),
          steerMessage("Stop the remaining wait"),
        ],
        isPrompting: true,
        toolActivity: "compact",
      });

      expect(state.grouped).toHaveLength(5);
      expect(state.grouped[1]).toMatchObject({
        kind: "event_group",
        live: true,
        events: [{ index: 1 }, { index: 2 }, { index: 3 }],
      });
      expect(state.grouped[2]).toMatchObject({ event: { toolCallId: "edit-2" } });
      expect(state.grouped[3]).toMatchObject({ event: { toolCallId: "run-2" } });
      expect(state.grouped[4]).toMatchObject({
        kind: "event",
        index: 6,
        event: { eventKind: "user_message", steer: true },
      });
    });

    it("folds completed reasoning between live tool calls", () => {
      const state = new SessionEventsState({
        events: [
          { eventKind: "user_message", messageId: "u1", content: [] },
          thought("Planning the read"),
          tool("read-1", "read", "completed"),
          thought("Checking another file"),
          tool("read-2", "read", "completed"),
          thought("Preparing the edit"),
          tool("edit-1", "edit", "completed"),
          tool("run-1", "execute", "in_progress"),
        ],
        isPrompting: true,
        toolActivity: "compact",
      });

      expect(state.grouped).toHaveLength(4);
      expect(state.grouped[1]).toMatchObject({
        id: "group-2",
        kind: "event_group",
        live: true,
        events: [
          { index: 1, event: { eventKind: "agent_thought" } },
          { index: 2, event: { toolCallId: "read-1" } },
          { index: 3, event: { eventKind: "agent_thought" } },
          { index: 4, event: { toolCallId: "read-2" } },
          { index: 5, event: { eventKind: "agent_thought" } },
        ],
      });
      expect(state.grouped[2]).toMatchObject({ kind: "event", index: 6 });
      expect(state.grouped[3]).toMatchObject({ kind: "event", index: 7 });
    });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("routes tool events to the correct turn using the memoized index lookup", () => {
    // Two turns covering distinct index ranges; events span both.
    const events = [
      tool("edit-1", "edit", "completed"), // index 0 → turn 1
      tool("run-1", "execute", "completed"), // index 1 → turn 1
      { eventKind: "user_message", messageId: "u2", content: [] }, // index 2 → turn 2
      tool("read-1", "read", "completed"), // index 3 → turn 2
      tool("read-2", "read", "completed"), // index 4 → turn 2
    ] satisfies SessionEvent[];

    const state = new SessionEventsState({
      events,
      isPrompting: false,
      turns: [
        {
          startedAt: "2026-06-02T10:00:00.000Z",
          endedAt: "2026-06-02T10:01:00.000Z",
          startIndex: 0,
          endIndex: 1,
        },
        {
          startedAt: "2026-06-02T10:02:00.000Z",
          endedAt: "2026-06-02T10:03:00.000Z",
          startIndex: 2,
          endIndex: 4,
        },
      ],
    });

    const groups = state.grouped.filter((item) => item.kind === "event_group");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ turn: { startIndex: 0, endIndex: 1 } });
    expect(groups[1]).toMatchObject({ turn: { startIndex: 2, endIndex: 4 } });
  });

  it("hides the initial mode echo that precedes the first prompt", () => {
    // Agents echo the session's starting mode at session start; the user just
    // picked it, so the row is noise.
    const state = new SessionEventsState({
      events: [
        { eventKind: "mode_change", currentModeId: "plan" },
        { eventKind: "user_message", messageId: "u1", content: [] },
        agentMessage("Done"),
      ],
      isPrompting: false,
    });

    expect(state.grouped).toHaveLength(2);
    expect(
      state.grouped.some((item) => item.kind === "event" && item.event.eventKind === "mode_change"),
    ).toBe(false);
  });

  it("hides the initial mode echo that lands just after the first prompt", () => {
    // Some agents send the initial mode update only once the first prompt
    // arrives: [user "hi", mode_change, reply].
    const state = new SessionEventsState({
      events: [
        { eventKind: "user_message", messageId: "u1", content: [] },
        { eventKind: "mode_change", currentModeId: "code" },
        agentMessage("Applying configuration..."),
      ],
      isPrompting: false,
    });

    expect(state.grouped).toHaveLength(2);
    expect(
      state.grouped.some((item) => item.kind === "event" && item.event.eventKind === "mode_change"),
    ).toBe(false);
  });

  it("hides mode changes when no agent activity exists yet", () => {
    const state = new SessionEventsState({
      events: [{ eventKind: "mode_change", currentModeId: "plan" }],
      isPrompting: false,
    });

    expect(state.grouped).toHaveLength(0);
  });

  it("keeps mode changes that follow agent activity", () => {
    const state = new SessionEventsState({
      events: [
        { eventKind: "mode_change", currentModeId: "plan" },
        { eventKind: "user_message", messageId: "u1", content: [] },
        agentMessage("Here is a plan"),
        { eventKind: "user_message", messageId: "u2", content: [] },
        { eventKind: "mode_change", currentModeId: "code" },
        agentMessage("Done"),
      ],
      isPrompting: false,
    });

    expect(state.grouped).toHaveLength(5);
    expect(state.grouped[3]).toMatchObject({
      kind: "event",
      event: { eventKind: "mode_change", currentModeId: "code" },
    });
  });

  it("folds a thought into the summary group with the reads around it", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        thought("interjection"),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(state.grouped).toHaveLength(2);
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      events: [{ index: 0 }, { index: 1 }, { index: 2 }],
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      event: { eventKind: "agent_message", content: [{ text: "Done" }] },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("pinned expanded tools (PE-2402)", () => {
  it("holds the grouped fold boundary at a pinned tool until it is collapsed", () => {
    const events = [
      { eventKind: "user_message", messageId: "u1", content: [] },
      tool("read-1", "read", "completed"),
      tool("read-2", "read", "completed"),
      tool("read-3", "read", "completed"),
      tool("read-4", "read", "completed"),
      tool("read-5", "read", "completed"),
    ] satisfies SessionEvent[];
    const state = new SessionEventsState({ events, isPrompting: true, toolActivity: "grouped" });

    // The user expanded read-2 while it was still in the tail; the boundary
    // froze there, so only read-1 is behind it — too few to form a group.
    state.expansion.setOpen("read-2", true, { pin: true });
    expect(state.grouped.filter((item) => item.kind === "event_group")).toHaveLength(0);
    expect(state.grouped).toHaveLength(6);

    // Collapsing releases the pin: the boundary jumps to the two-slot tail
    // and the three oldest calls fold at once.
    state.expansion.setOpen("read-2", false);
    expect(state.grouped).toHaveLength(4);
    expect(state.grouped[1]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 1 }, { index: 2 }, { index: 3 }],
    });
  });

  it("keeps a pinned tool and its successors out of the compact fold", () => {
    const events = [
      { eventKind: "user_message", messageId: "u1", content: [] },
      tool("read-1", "read", "completed"),
      tool("read-2", "read", "completed"),
      tool("read-3", "read", "completed"),
      tool("read-4", "read", "completed"),
      tool("read-5", "read", "completed"),
    ] satisfies SessionEvent[];
    const state = new SessionEventsState({ events, isPrompting: true, toolActivity: "compact" });

    // Compact allows a single-tool fold, so read-1 still summarizes, but
    // read-2 onward stay expanded behind the frozen boundary.
    state.expansion.setOpen("read-2", true, { pin: true });
    expect(state.grouped).toHaveLength(6);
    expect(state.grouped[1]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 1 }],
    });

    state.expansion.setOpen("read-2", false);
    expect(state.grouped).toHaveLength(4);
    expect(state.grouped[1]).toMatchObject({
      kind: "event_group",
      events: [{ index: 1 }, { index: 2 }, { index: 3 }],
    });
  });

  it("keeps a pinned think step out of the fold without moving the boundary", () => {
    const events = [
      { eventKind: "user_message", messageId: "u1", content: [] },
      tool("think-1", "think", "completed"),
      tool("read-1", "read", "completed"),
      tool("read-2", "read", "completed"),
      tool("read-3", "read", "completed"),
    ] satisfies SessionEvent[];
    const state = new SessionEventsState({ events, isPrompting: true, toolActivity: "grouped" });

    // Unpinned, the think step folds with read-1 behind the two-slot tail.
    expect(state.grouped.filter((item) => item.kind === "event_group")).toMatchObject([
      { events: [{ index: 1 }, { index: 2 }] },
    ]);

    // Think steps hold no tail slot, so pinning one keeps only it out; read-1
    // stays behind the boundary but is now too few to form a group.
    state.expansion.setOpen("think-1", true, { pin: true });
    expect(state.grouped.filter((item) => item.kind === "event_group")).toHaveLength(0);
    expect(state.grouped).toHaveLength(5);
  });

  it("keeps a pinned tool out of an interrupted grouped turn's fold", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("edit-1", "edit", "completed"),
        tool("run-1", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "grouped",
      turns: [interruptedTurn(0, 3)],
    });

    // Without the pin the whole turn folds. Pinning read-2 holds it and every
    // later tool outside the fold; read-1 alone is too small to form a group.
    state.expansion.setOpen("read-2", true, { pin: true });
    expect(state.grouped).toHaveLength(4);
    expect(state.grouped.every((item) => item.kind === "event")).toBe(true);
  });

  it("recomputes an interrupted compact fold when a pin changes", () => {
    const state = new SessionEventsState({
      events: [
        tool("read-1", "read", "completed"),
        tool("read-2", "read", "completed"),
        tool("edit-1", "edit", "completed"),
        tool("run-1", "execute", "cancelled"),
      ],
      isPrompting: false,
      toolActivity: "compact",
      turns: [interruptedTurn(0, 3)],
    });

    // First computation caches the fully settled interrupted fold.
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }],
    });

    // The pin must invalidate the per-turn fold cache, not serve the stale
    // membership computed above.
    state.expansion.setOpen("read-2", true, { pin: true });
    expect(state.grouped[0]).toMatchObject({
      kind: "event_group",
      live: true,
      events: [{ index: 0 }],
    });
  });

  it("only pins explicit standalone expands and unpins on collapse", () => {
    const expansion = new ToolCallExpansionState();

    expect(expansion.openStateFor("t-1")).toBeUndefined();

    expansion.setOpen("t-1", true, { pin: true });
    expect(expansion.openStateFor("t-1")).toBe(true);
    expect(expansion.pinnedToolCallIds.has("t-1")).toBe(true);

    // Expanding inside an open group keeps the choice but never pins.
    expansion.setOpen("t-2", true);
    expect(expansion.openStateFor("t-2")).toBe(true);
    expect(expansion.pinnedToolCallIds.has("t-2")).toBe(false);

    expansion.setOpen("t-1", false);
    expect(expansion.openStateFor("t-1")).toBe(false);
    expect(expansion.pinnedToolCallIds.has("t-1")).toBe(false);
  });
});

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function interruptedTurn(startIndex: number, endIndex: number) {
  return {
    startedAt: "2026-06-02T10:00:00.000Z",
    endedAt: "2026-06-02T10:01:00.000Z",
    startIndex,
    endIndex,
    interrupted: true,
  };
}

function steerMessage(text: string): SessionEvent {
  return {
    eventKind: "user_message",
    messageId: "steer-1",
    content: [{ type: "text", text }],
    steer: true,
  };
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
