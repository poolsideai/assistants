__POOL_SYNTHETIC_IMPORT_BASELINE__
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appState, type AppState } from "../../hostAdapter";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("ToolHeader", () => {
  let previousAppState: AppState;

  beforeEach(() => {
    previousAppState = get(appState);
  });

  afterEach(() => {
    appState.set(previousAppState);
  });

  it("baseline-aligns mixed sans-serif and monospace shell command text", () => {
    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_shell",
          title: "Run",
          kind: "execute",
          status: "completed",
          rawInput: { cmd: "uv run pytest" },
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("Run Shell Command:").parentElement).toHaveClass("items-baseline");
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
  // A multi-hunk edit arrives as several diff content blocks; the header's
  // ambient Diff context only covers the first block, so without aggregation
  // the stats badge would report that hunk alone.
  it("aggregates diff stats across all diff content blocks", () => {
    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_edit_hunks",
          title: "Edit `window`",
          kind: "edit",
          status: "completed",
          content: [
            {
              type: "diff",
              path: "/repo/window",
              oldText: "keep\nstaleOne\nstaleTwo",
              newText: "keep\naddOne\naddTwo\naddThree\naddFour\naddFive",
            },
            {
              type: "diff",
              path: "/repo/window",
              oldText: "anchor\n",
              newText: "anchor\naddSix\naddSeven\naddEight\naddNine\n",
            },
          ],
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
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

  it("renders files in the host-provided home directory with a tilde", () => {
    appState.update((state) => ({ ...state, homeDirectory: "/Users/andy" }));

    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_home_file",
          title: "Read config",
          kind: "read",
          status: "completed",
          rawInput: { path: "/Users/andy/.codex/config.toml" },
        } satisfies ToolCall,
        workspaceFolders: [{ path: "/Users/andy/project", name: "project", index: 0 }],
      },
    });

    expect(screen.getByText("~/.codex/config.toml")).toBeInTheDocument();
  });

  it("shortens a home path when a read call only exposes it in the title", () => {
    appState.update((state) => ({ ...state, homeDirectory: "/Users/andy" }));

    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_title_only_home_file",
          title: "Read /Users/andy/.codex/config.toml",
          kind: "read",
          status: "completed",
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("Read ~/.codex/config.toml")).toBeInTheDocument();
    expect(screen.queryByText("Read /Users/andy/.codex/config.toml")).not.toBeInTheDocument();
  });

  // When an MCP tool returns oversized output, the Pool agent binary spills it
  // to `$TMPDIR/pool_mcp_output_<tool call id>` and reads it back with a
  // `read` tool call. The raw temp path reads as alarming, so it should
  // render with a friendly name instead.
  it("shows a friendly name for a read of an MCP output temp file", () => {
    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_mcp_output",
          title: "Read",
          kind: "read",
          status: "completed",
          locations: [
            {
              path: "/var/folders/3n/w6y_g82x13n969zh71kmp6sw0000gn/T/pool_mcp_output_chatcmpl-tool-b0e6a036fbe57d29",
            },
          ],
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("MCP tool output")).toBeInTheDocument();
    expect(screen.queryByText(/pool_mcp_output/)).not.toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("still shows the full path for other reads outside the workspace", () => {
    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_other_temp_file",
          title: "Read",
          kind: "read",
          status: "completed",
          locations: [{ path: "/var/folders/xx/T/some_other_file.json" }],
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("/var/folders/xx/T/some_other_file.json")).toBeInTheDocument();
  });

  it("shortens home paths in shell-command headers while preserving the raw body", () => {
    appState.update((state) => ({ ...state, homeDirectory: "/Users/andy" }));

    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_shell_home_file",
          title: "Run",
          kind: "execute",
          status: "completed",
          rawInput: { cmd: "wc -l /Users/andy/notes.txt" },
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("wc -l ~/notes.txt")).toBeInTheDocument();
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
