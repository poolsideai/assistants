import type { ContentBlock } from "@agentclientprotocol/sdk";
import { describe, expect, it } from "vitest";
import { buildACPPromptContent } from "./promptContent";

describe("buildACPPromptContent", () => {
  const embedded = { supportsEmbeddedContext: true, supportsImages: true };
  const baseline = { supportsEmbeddedContext: false, supportsImages: false };

  it("prefixes the text block, then pasted attachments, then context content blocks", () => {
    const pasted: ContentBlock[] = [
      {
        type: "resource",
        resource: {
          uri: "clipboard://notes.txt",
          mimeType: "text/plain",
          text: "pasted text",
        },
      },
    ];
    const context: ContentBlock[] = [
      {
        type: "resource",
        resource: {
          uri: "/workspace/src/app.ts",
          mimeType: "text/plain",
          text: "const active = true;",
        },
      },
    ];

    expect(buildACPPromptContent("hello", pasted, context, embedded)).toEqual([
      { type: "text", text: "hello" },
      ...pasted,
      ...context,
    ]);
  });

  it("passes context content blocks through unchanged regardless of capabilities", () => {
    const context: ContentBlock[] = [
      {
        type: "resource",
        resource: {
          uri: "/workspace/src/app.ts",
          mimeType: "text/plain",
          text: "const active = true;",
        },
      },
      {
        type: "resource_link",
        name: "README.md",
        title: "/workspace/README.md",
        uri: "/workspace/README.md",
      },
    ];

    expect(buildACPPromptContent("hello", [], context, baseline)).toEqual([
      { type: "text", text: "hello" },
      ...context,
    ]);
  });

  it("converts pasted text and blob resources to links when embedded context is unsupported, and drops images when image support is unsupported", () => {
    const pasted: ContentBlock[] = [
      {
        type: "resource",
        resource: {
          uri: "clipboard://notes.txt",
          mimeType: "text/plain",
          text: "pasted text",
        },
      },
      {
        type: "resource",
        resource: {
          uri: "clipboard://archive.zip",
          mimeType: "application/zip",
          blob: "AAAA",
        },
      },
      { type: "image", mimeType: "image/png", data: "abc123" },
    ];

    expect(buildACPPromptContent("hello", pasted, [], baseline)).toEqual([
      { type: "text", text: "hello" },
      {
        type: "resource_link",
        name: "notes.txt",
        title: "clipboard://notes.txt",
        uri: "clipboard://notes.txt",
        mimeType: "text/plain",
      },
      {
        type: "resource_link",
        name: "archive.zip",
        title: "clipboard://archive.zip",
        uri: "clipboard://archive.zip",
        mimeType: "application/zip",
      },
    ]);
  });

  it("keeps pasted resources and images intact when both capabilities are supported", () => {
    const pasted: ContentBlock[] = [
      {
        type: "resource",
        resource: {
          uri: "clipboard://notes.txt",
          mimeType: "text/plain",
          text: "pasted text",
        },
      },
      { type: "image", mimeType: "image/png", data: "abc123" },
    ];

    expect(buildACPPromptContent("hello", pasted, [], embedded)).toEqual([
      { type: "text", text: "hello" },
      ...pasted,
    ]);
  });
});
