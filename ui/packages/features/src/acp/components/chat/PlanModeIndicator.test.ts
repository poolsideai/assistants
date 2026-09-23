import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
import type { ACPCollaborationModeSurface } from "../../features/session/types";
import Harness from "./PlanModeIndicator.test.svelte";

function makeRepo(session: {
  isPlanModeActive: boolean;
  collaborationModeSurface: ACPCollaborationModeSurface;
  togglePlanMode?: () => Promise<void>;
}): ACPSessionRepository {
  return {
    getSessionByConversationId: () => ({
      togglePlanMode: vi.fn().mockResolvedValue(undefined),
      ...session,
    }),
  } as unknown as ACPSessionRepository;
}

describe("PlanModeIndicator", () => {
  it("renders nothing while the collaboration agent is building", () => {
    render(Harness, {
      props: {
        repo: makeRepo({ isPlanModeActive: false, collaborationModeSurface: "plan-toggle" }),
      },
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("stays hidden for plan-as-permission-mode agents, which keep the banner", () => {
    render(Harness, {
      props: { repo: makeRepo({ isPlanModeActive: true, collaborationModeSurface: "none" }) },
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("stays hidden when the collaboration option is rich enough to need a picker", () => {
    render(Harness, {
      props: { repo: makeRepo({ isPlanModeActive: true, collaborationModeSurface: "picker" }) },
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the plan chip and toggles back to build on click", async () => {
    const togglePlanMode = vi.fn().mockResolvedValue(undefined);
    render(Harness, {
      props: {
        repo: makeRepo({
          isPlanModeActive: true,
          collaborationModeSurface: "plan-toggle",
          togglePlanMode,
        }),
      },
    });

    const chip = screen.getByRole("button", { name: "Disable Plan Mode" });
    expect(chip).toHaveTextContent("Plan");
    await fireEvent.click(chip);

    expect(togglePlanMode).toHaveBeenCalledTimes(1);
  });
});
