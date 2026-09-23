import { describe, expect, it } from "vitest";
import {
  orderConversationSearchItems,
  readRecentlyViewedConversations,
  recordRecentlyViewedConversation,
  writeRecentlyViewedConversations,
  type ConversationSearchOrderState,
} from "./conversationSearchOrder";

interface Item extends ConversationSearchOrderState {
  title: string;
}

function item(
  key: string,
  updatedAt: string,
  status: Partial<Pick<Item, "waitingForUser" | "unread" | "archived">> = {},
): Item {
  return {
    key,
    title: key,
    updatedAt,
    waitingForUser: status.waitingForUser ?? false,
    unread: status.unread ?? false,
    archived: status.archived,
  };
}

describe("orderConversationSearchItems", () => {
  it("prioritizes waiting chats, then unread chats, then recently viewed chats", () => {
    const items = [
      item("normal-recent", "2026-07-14T12:00:00Z"),
      item("unread-old", "2026-07-14T08:00:00Z", { unread: true }),
      item("waiting-old", "2026-07-14T07:00:00Z", { waitingForUser: true }),
      item("unread-new", "2026-07-14T11:00:00Z", { unread: true }),
      item("waiting-new", "2026-07-14T10:00:00Z", { waitingForUser: true }),
      item("normal-viewed", "2026-07-14T06:00:00Z"),
    ];

    expect(
      orderConversationSearchItems(items, ["normal-viewed", "normal-recent"], (value) => value).map(
        ({ key }) => key,
      ),
    ).toEqual([
      "waiting-new",
      "waiting-old",
      "unread-new",
      "unread-old",
      "normal-viewed",
      "normal-recent",
    ]);
  });

  it("uses updated recency for ordinary chats without view history", () => {
    const items = [
      item("old", "2026-07-14T08:00:00Z"),
      item("new", "2026-07-14T12:00:00Z"),
      item("unknown", ""),
    ];

    expect(orderConversationSearchItems(items, [], (value) => value).map(({ key }) => key)).toEqual(
      ["new", "old", "unknown"],
    );
  });

  it("excludes archived chats regardless of their status", () => {
    const items = [
      item("normal", "2026-07-14T08:00:00Z"),
      item("archived-waiting", "2026-07-14T12:00:00Z", {
        waitingForUser: true,
        archived: true,
      }),
      item("archived-unread", "2026-07-14T11:00:00Z", {
        unread: true,
        archived: true,
      }),
    ];

    expect(orderConversationSearchItems(items, [], (value) => value).map(({ key }) => key)).toEqual(
      ["normal"],
    );
  });
});

describe("recently viewed conversation storage", () => {
  it("moves a viewed conversation to the front without duplicates", () => {
    expect(recordRecentlyViewedConversation(["one", "two", "three"], "two")).toEqual([
      "two",
      "one",
      "three",
    ]);
  });

  it("round-trips and sanitizes stored keys", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };

    writeRecentlyViewedConversations(["one", "two", "one"], storage);

    expect(readRecentlyViewedConversations(storage)).toEqual(["one", "two"]);
  });
});
