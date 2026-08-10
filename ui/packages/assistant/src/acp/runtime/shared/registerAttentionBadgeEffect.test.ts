import { render, waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { attentionCount } from "./registerAttentionBadgeEffect.svelte";
import Harness from "./registerAttentionBadgeEffect.test.svelte";
import type { Repositories } from "./Repositories.svelte";

describe("registerAttentionBadgeEffect", () => {
  it("counts conversations whose shared live status awaits the user", () => {
    const repositories = repositoriesWithConversations([
      conversation("s-waiting", { working: true, waitingForUser: true, unread: false }),
      conversation("s-unread", { working: false, waitingForUser: false, unread: true }),
      conversation("s-working", { working: true, waitingForUser: false, unread: false }),
      conversation("s-idle", { working: false, waitingForUser: false, unread: false }),
      { id: "pending-conversation", sessionId: null, agentServer: "poolside" },
    ]);

    expect(attentionCount(repositories)).toBe(2);
  });

  it("ignores archived and inactive conversations", () => {
    const repositories = repositoriesWithConversations([
      { ...conversation("s-archived", unreadStatus()), archived: true },
      { ...conversation("s-inactive", unreadStatus()), active: false },
    ]);

    expect(attentionCount(repositories)).toBe(0);
  });

  it("ignores the local status repository so the badge matches the sidebar dots", () => {
    const getConversationStatus = vi.fn(() => unreadStatus());
    const repositories = {
      ...repositoriesWithConversations([
        conversation("s-read-elsewhere", { working: false, waitingForUser: false, unread: false }),
      ]),
      acpRepo: { getConversationStatus },
    } as unknown as Repositories;

    expect(attentionCount(repositories)).toBe(0);
    expect(getConversationStatus).not.toHaveBeenCalled();
  });

  it("reports attention count changes without repeating the same count", async () => {
    const onChange = vi.fn();
    const rendered = render(Harness, {
      props: {
        unread: false,
        onChange,
      },
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(0));
    expect(onChange).toHaveBeenCalledTimes(1);

    await rendered.rerender({ unread: true, onChange });

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(1));
    expect(onChange).toHaveBeenCalledTimes(2);

    await rendered.rerender({ unread: true, onChange });

    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

function repositoriesWithConversations(conversations: unknown[]) {
  return {
    acpConversationRepo: { sessions: conversations },
  } as unknown as Repositories;
}

function conversation(
  sessionId: string,
  liveStatus: { working: boolean; waitingForUser: boolean; unread: boolean },
) {
  return {
    id: sessionId,
    sessionId,
    agentServer: "poolside",
    liveStatus,
  };
}

function unreadStatus() {
  return { working: false, waitingForUser: false, unread: true };
}
