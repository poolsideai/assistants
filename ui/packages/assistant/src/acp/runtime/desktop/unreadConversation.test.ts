import { describe, expect, it } from "vitest";
import { findNextUnreadConversation } from "./unreadConversation";

const conv = (id: string, unread = false) => ({ id, liveStatus: { unread } });

describe("findNextUnreadConversation", () => {
  it("returns undefined when nothing is unread", () => {
    const list = [conv("a"), conv("b"), conv("c")];
    expect(findNextUnreadConversation(list, "a")).toBeUndefined();
  });

  it("returns undefined for an empty list", () => {
    expect(findNextUnreadConversation([], "a")).toBeUndefined();
  });

  it("scans forward from the current conversation", () => {
    const list = [conv("a"), conv("b", true), conv("c", true)];
    expect(findNextUnreadConversation(list, "a")?.id).toBe("b");
  });

  it("wraps around past the end", () => {
    const list = [conv("a", true), conv("b"), conv("c")];
    // Current is the last item; the only unread is at the front.
    expect(findNextUnreadConversation(list, "c")?.id).toBe("a");
  });

  it("never returns the current conversation even if it is unread", () => {
    const list = [conv("a", true), conv("b"), conv("c")];
    expect(findNextUnreadConversation(list, "a")).toBeUndefined();
  });

  it("starts at the beginning when the current id is not present", () => {
    const list = [conv("a"), conv("b", true)];
    expect(findNextUnreadConversation(list, null)?.id).toBe("b");
  });
});
