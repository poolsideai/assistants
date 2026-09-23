import { fireEvent, render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rpc } from "../../../hostRpc";
import type { ToolCall } from "../../../types";
import ToolCallHarness from "./ImageGenerationToolCall.test.svelte";
import { getViewImagePreview, isViewImageToolCall } from "./viewImageTool";

vi.mock("../../../hostRpc", () => ({
  rpc: {
    openFile: vi.fn(),
__POOL_SYNTHETIC_IMPORT_BASELINE__
  },
}));

describe("viewImageTool", () => {
  it("matches view_image calls with image output", () => {
    const tool = makeTool();

    expect(isViewImageToolCall(tool)).toBe(true);
    expect(getViewImagePreview(tool)).toEqual({
      src: `data:image/png;base64,${imageData}`,
      path: "/tmp/cat.png",
    });
  });

  it("does not match non-image view_image output", () => {
    expect(
      isViewImageToolCall({
        ...makeTool(),
        rawOutput: [{ type: "text", text: "not an image" }],
      }),
    ).toBe(false);
  });
});

describe("ViewImageToolCall", () => {
  beforeEach(() => {
    vi.mocked(rpc.openFile).mockReset();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  it("renders viewed images inline without raw output JSON", async () => {
    render(ToolCallHarness, {
      props: {
        event: makeTool(),
      },
    });

    expect(screen.getByText("View image")).toBeInTheDocument();
    expect(screen.queryByText(/image_url/)).not.toBeInTheDocument();
    const image = screen.getByAltText("Viewed image cat.png");
    expect(image).toHaveAttribute("src", `data:image/png;base64,${imageData}`);
    expect(image).toHaveAttribute("data-poolside-image-path", "/tmp/cat.png");
    expect(image).toHaveAttribute("data-poolside-image-name", "cat.png");

    await fireEvent.click(screen.getByRole("button", { name: "Open image file cat.png" }));

    expect(rpc.openFile).toHaveBeenCalledWith("/tmp/cat.png");
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
});

function makeTool(): ToolCall {
  return {
    eventKind: "tool_call",
    toolCallId: "call_123",
    title: "view_image",
    kind: "other",
    status: "completed",
    rawInput: { path: "/tmp/cat.png", detail: "original" },
    rawOutput: [
      {
        type: "input_image",
        detail: "original",
        image_url: `data:image/png;base64,${imageData}`,
      },
    ],
  };
}

const imageData =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s8vH4QAAAAASUVORK5CYII=";
