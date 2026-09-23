import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rpc } from "../../../hostRpc";
import type { ToolCall } from "../../../types";
import ToolCallHarness from "./ImageGenerationToolCall.test.svelte";

vi.mock("../../../hostRpc", () => ({
  rpc: {
    getImageFileData: vi.fn(),
    openFile: vi.fn(),
  },
}));

describe("ReadImageToolCall", () => {
  beforeEach(() => {
    vi.mocked(rpc.getImageFileData).mockReset();
    vi.mocked(rpc.openFile).mockReset();
  });

  it("loads and renders read image files inline", async () => {
    vi.mocked(rpc.getImageFileData).mockResolvedValue({
      data: imageData,
      mimeType: "image/png",
      path: "/tmp/cat.png",
    });

    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_123",
          title: "Read /tmp/cat.png",
          kind: "read",
          status: "completed",
          rawInput: { path: "/tmp/cat.png" },
        } satisfies ToolCall,
      },
    });

    expect(screen.getByText("Read image")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading image" })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByAltText("Read image cat.png")).toHaveAttribute(
        "src",
        `data:image/png;base64,${imageData}`,
      ),
    );

    await fireEvent.click(screen.getByRole("button", { name: "Open image file cat.png" }));

    expect(rpc.openFile).toHaveBeenCalledWith("/tmp/cat.png");
  });

  it("falls back to the unavailable message when the host read rejects", async () => {
    vi.mocked(rpc.getImageFileData).mockRejectedValue(new Error("file not readable"));

    render(ToolCallHarness, {
      props: {
        event: {
          eventKind: "tool_call",
          toolCallId: "call_456",
          title: "Read /tmp/missing.png",
          kind: "read",
          status: "completed",
          rawInput: { path: "/tmp/missing.png" },
        } satisfies ToolCall,
      },
    });

    await waitFor(() => expect(screen.getByText("Unable to preview image")).toBeInTheDocument());
    expect(screen.queryByRole("status", { name: "Loading image" })).not.toBeInTheDocument();
  });
});

const imageData =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s8vH4QAAAAASUVORK5CYII=";
