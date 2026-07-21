import type { ContentBlock } from "@agentclientprotocol/sdk";
import { describe, expect, it } from "vitest";
import {
  USER_MESSAGE_END_BOUNDARY,
  USER_MESSAGE_START_BOUNDARY,
  unwrapUserMessageBlock,
  unwrapUserMessageText,
} from "./userMessageBoundary";

describe("userMessageBoundary", () => {
  it("unwraps text blocks without changing non-text content", () => {
    const image = { type: "image", data: "abc", mimeType: "image/png" } as ContentBlock;
    expect(
      unwrapUserMessageBlock({
        type: "text",
        text: `${USER_MESSAGE_START_BOUNDARY}hello${USER_MESSAGE_END_BOUNDARY}`,
      }),
    ).toEqual({ type: "text", text: "hello" });
    expect(unwrapUserMessageBlock(image)).toBe(image);
  });

  it("unwraps content between the first and last boundary", () => {
    expect(
      unwrapUserMessageText(
        `before ${USER_MESSAGE_START_BOUNDARY}hello${USER_MESSAGE_END_BOUNDARY} after`,
      ),
    ).toBe("hello");
  });

  it("leaves text unchanged without two boundaries", () => {
    expect(unwrapUserMessageText("hello")).toBe("hello");
    expect(unwrapUserMessageText(`${USER_MESSAGE_START_BOUNDARY}hello`)).toBe(
      `${USER_MESSAGE_START_BOUNDARY}hello`,
    );
    expect(unwrapUserMessageText(`hello${USER_MESSAGE_END_BOUNDARY}`)).toBe(
      `hello${USER_MESSAGE_END_BOUNDARY}`,
    );
  });
});
