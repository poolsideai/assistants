import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ACPLogCaptureConfirmation from "./ACPLogCaptureConfirmation.svelte";

describe("ACPLogCaptureConfirmation", () => {
  it("uses conversation-focused copy with a memory-usage warning", () => {
    render(ACPLogCaptureConfirmation, {
      props: {
        target: {
          agentServer: "codex",
          conversationId: "conversation-1",
          sessionId: null,
        },
        onClose: vi.fn(),
      },
    });

    expect(screen.getByRole("dialog", { name: "Collect ACP events?" })).toBeVisible();
    expect(
      screen.getByText(
        "Collect new ACP events for this conversation until the app quits. Warning: collection increases memory use and may retain up to 32 MB per agent.",
      ),
    ).toBeVisible();
  });
});
