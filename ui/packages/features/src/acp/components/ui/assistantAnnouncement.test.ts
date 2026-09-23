import { describe, expect, it } from "vitest";
import { getAssistantAnnouncement, getAssistantTurnState } from "./assistantAnnouncement";

describe("getAssistantTurnState", () => {
  it("returns idle when turn is not active", () => {
    expect(getAssistantTurnState(false, false)).toBe("idle");
  });

  it("returns idle when turn is not active even if permission flag set", () => {
    // hasPendingPermissionRequests is irrelevant when the turn is not active
    expect(getAssistantTurnState(false, true)).toBe("idle");
  });

  it("returns working when turn is active with no pending permission requests", () => {
    expect(getAssistantTurnState(true, false)).toBe("working");
  });

  it("returns awaiting-approval when turn is active with pending permission requests", () => {
    expect(getAssistantTurnState(true, true)).toBe("awaiting-approval");
  });
});

describe("getAssistantAnnouncement", () => {
  it("announces working state", () => {
    expect(getAssistantAnnouncement("working")).toBe("Assistant is responding");
  });

  it("announces awaiting-approval state", () => {
    expect(getAssistantAnnouncement("awaiting-approval")).toBe("Assistant is requesting approval");
  });

  it("announces idle (finished) state", () => {
    expect(getAssistantAnnouncement("idle")).toBe("Assistant finished responding");
  });
});
