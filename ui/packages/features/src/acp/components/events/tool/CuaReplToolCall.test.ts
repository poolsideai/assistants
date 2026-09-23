import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import ToolCallHarness from "./McpToolCall.test.svelte";
import { findToolOverride } from "./toolOverrides";

const code = 'await tab.playwright.getByRole("button", { name: "Continue" }).click();';
const imageData =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s8vH4QAAAAASUVORK5CYII=";

function tool(overrides: Partial<ToolCall> = {}): ToolCall {
  return {
    eventKind: "tool_call",
    toolCallId: "cua-1",
    title: "mcp.cua_repl.js",
    kind: "execute",
    status: "completed",
    _meta: { is_mcp_tool_call: true },
    rawInput: {
      server: "cua_repl",
      tool: "js",
      arguments: { title: "Continue to checkout", code },
    },
    ...overrides,
  };
}

describe("CuaReplToolCall", () => {
  it("takes precedence over MCP and shell rendering, revealing code on expansion", async () => {
    render(ToolCallHarness, { event: tool() });

    expect(screen.getByText("Computer use")).toBeInTheDocument();
    expect(screen.getByText("Continue to checkout")).toBeInTheDocument();
    expect(screen.queryByText(code)).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Expand computer use" }));
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(document.querySelector("pre")?.textContent).toBe(code);

    await fireEvent.click(screen.getByRole("button", { name: "Collapse computer use" }));
    expect(screen.queryByText("JavaScript")).not.toBeInTheDocument();
  });

  it("keeps literal snapshots and screenshots in output order without repeating raw output", async () => {
    const snapshot = '- heading "Checkout"\n  - button "<Continue>"';
    render(ToolCallHarness, {
      event: tool({
        content: [
          { type: "content", content: { type: "text", text: snapshot } },
          {
            type: "content",
            content: { type: "image", mimeType: "image/png", data: imageData },
          },
          { type: "content", content: { type: "text", text: "After screenshot" } },
        ],
        rawOutput: "Duplicated raw output",
      }),
    });
    await fireEvent.click(screen.getByRole("button", { name: "Expand computer use" }));

    const output = [...document.querySelectorAll("pre, img")];
    expect(output.map((element) => element.tagName)).toEqual(["PRE", "PRE", "IMG", "PRE"]);
    expect(output[1].textContent).toBe(snapshot);
    expect(output[2]).toHaveAttribute("src", `data:image/png;base64,${imageData}`);
    expect(output[3].textContent).toBe("After screenshot");
    expect(screen.queryByText("Duplicated raw output")).not.toBeInTheDocument();
  });

  it("shows reset calls without an empty input payload", async () => {
    render(ToolCallHarness, {
      event: tool({ title: "mcp.cua_repl.js_reset", rawInput: {}, rawOutput: "Session reset." }),
    });
    expect(screen.getByText("Reset session")).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Expand computer use" }));
    expect(screen.getByText("Session reset.")).toBeInTheDocument();
    expect(screen.queryByText("Input")).not.toBeInTheDocument();
  });

  it.each(["live", "restored", "restored array"])(
    "renders screenshots and literal text from %s Codex envelopes",
    async (source) => {
      const snapshot = '- heading "Checkout"\n  - button "<Continue>"';
      const content = [
        { type: "text", text: snapshot },
        { type: "image", mimeType: "image/png", data: imageData },
        { type: "text", text: "After screenshot" },
      ];
      const historyContent = [
        { type: "input_text", text: snapshot },
        { type: "input_image", image_url: `data:image/png;base64,${imageData}` },
        { type: "input_text", text: "After screenshot" },
      ];
      const rawOutput =
        source === "live"
          ? { result: { content }, error: null }
          : { output: source === "restored" ? JSON.stringify({ content }) : historyContent };
      render(ToolCallHarness, { event: tool({ rawOutput }) });
      await fireEvent.click(screen.getByRole("button", { name: "Expand computer use" }));

      const output = [...document.querySelectorAll("pre, img")];
      expect(output.map((element) => element.tagName)).toEqual(["PRE", "PRE", "IMG", "PRE"]);
      expect(output[0].textContent).toBe(code);
      expect(output[1].textContent).toBe(snapshot);
      expect(output[2]).toHaveAttribute("src", `data:image/png;base64,${imageData}`);
      expect(output[3].textContent).toBe("After screenshot");
      expect(document.querySelectorAll("pre")[1].textContent).not.toContain(imageData);
    },
  );

  it("shows failure status and raw error output", async () => {
    render(ToolCallHarness, {
      event: tool({ status: "failed", rawOutput: { result: null, error: "Tab was closed" } }),
    });
    expect(screen.getByText("error")).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Expand computer use" }));
    expect(document.querySelectorAll("pre")[1]?.textContent).toContain("Tab was closed");
  });

  it("updates the action title as input arrives and preserves cancellation status", async () => {
    const { rerender } = render(ToolCallHarness, {
      event: tool({ rawInput: undefined, status: "in_progress" }),
    });
    expect(screen.getByText("Computer use")).toBeInTheDocument();
    await rerender({ event: tool({ status: "cancelled" }) });
    expect(screen.getByText("Continue to checkout")).toBeInTheDocument();
    expect(screen.getByText("cancelled")).toBeInTheDocument();
  });

  it("keeps malformed input available for inspection", async () => {
    render(ToolCallHarness, { event: tool({ rawInput: "{incomplete" }) });
    await fireEvent.click(screen.getByRole("button", { name: "Expand computer use" }));
    expect(screen.getByText("{incomplete")).toBeInTheDocument();
  });

  it("preserves generic permission denials and unrelated MCP rendering", () => {
    expect(
      findToolOverride(
        tool({ status: "failed", rawOutput: { observation: "user denied computer use" } }),
      ),
    ).toBeUndefined();
    expect(findToolOverride(tool({ title: "mcp.other.js" }))?.id).toBe("acp.mcp");
  });
});
