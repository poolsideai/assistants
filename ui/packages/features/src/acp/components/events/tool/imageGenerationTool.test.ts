import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../../types";
import {
  getImageGenerationPreview,
  getImageGenerationPrompt,
  isImageGenerationPending,
  isImageGenerationToolCall,
} from "./imageGenerationTool";

describe("image generation ACP tool override", () => {
  it("matches Codex image generation tool calls", () => {
    expect(
      isImageGenerationToolCall({
        eventKind: "tool_call",
        toolCallId: "call_123",
        title: "Image generation",
        status: "completed",
      } satisfies ToolCall),
    ).toBe(true);

    expect(
      isImageGenerationToolCall({
        eventKind: "tool_call",
        toolCallId: "call_123",
        title: "Read README.md",
        status: "completed",
      } satisfies ToolCall),
    ).toBe(false);
  });

  it("extracts the revised prompt from tool content for tooltip display", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Image generation",
      status: "completed",
      content: [
        {
          type: "content",
          content: {
            type: "text",
            text: '"Revised prompt: A photorealistic cat by a sunlit window"',
          },
        },
      ],
    } satisfies ToolCall;

    expect(getImageGenerationPrompt(tool)).toBe("A photorealistic cat by a sunlit window");
  });

  it("extracts inline image content as the visible preview", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Image generation",
      status: "completed",
      content: [
        {
          type: "content",
          content: {
            type: "image",
            data: "abc123",
            mimeType: "image/png",
            uri: "/tmp/cat.png",
          },
        },
      ],
    } satisfies ToolCall;

    expect(getImageGenerationPreview(tool)).toEqual({
      kind: "data",
      data: "abc123",
      mimeType: "image/png",
      title: "/tmp/cat.png",
      uri: "/tmp/cat.png",
    });
  });

  it("treats image resource links as previewable generated images", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Image generation",
      status: "completed",
      content: [
        {
          type: "content",
          content: {
            type: "resource_link",
            name: "cat.png",
            uri: "file:///tmp/cat.png",
            mimeType: "image/png",
          },
        },
      ],
    } satisfies ToolCall;

    expect(getImageGenerationPreview(tool)).toEqual({
      kind: "file",
      path: "/tmp/cat.png",
      title: "cat.png",
    });
  });

  it("does not treat non-file image URLs as files to open", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Image generation",
      status: "completed",
      content: [
        {
          type: "content",
          content: {
            type: "resource_link",
            name: "cat.png",
            uri: "https://example.com/cat.png",
            mimeType: "image/png",
          },
        },
      ],
    } satisfies ToolCall;

    expect(getImageGenerationPreview(tool)).toEqual({
      kind: "url",
      title: "cat.png",
      url: "https://example.com/cat.png",
    });
  });

  it("does not preview unsupported image resource URI schemes as files", () => {
    const tool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Image generation",
      status: "completed",
      content: [
        {
          type: "content",
          content: {
            type: "resource_link",
            name: "cat.png",
            uri: "memory://cat.png",
            mimeType: "image/png",
          },
        },
      ],
    } satisfies ToolCall;

    expect(getImageGenerationPreview(tool)).toBeUndefined();
  });

  it("shows the loading preview only while no image is available", () => {
    const pendingTool = {
      eventKind: "tool_call",
      toolCallId: "call_123",
      title: "Image generation",
      status: "in_progress",
    } satisfies ToolCall;

    expect(isImageGenerationPending(pendingTool)).toBe(true);
  });
});
