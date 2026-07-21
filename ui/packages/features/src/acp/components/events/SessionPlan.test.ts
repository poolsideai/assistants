import type { Plan } from "@agentclientprotocol/sdk";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Harness from "./SessionPlan.test.svelte";

describe("SessionPlan", () => {
  it("uses the translucent popover treatment on desktop", () => {
    const plan = {
      entries: [{ content: "alpha", priority: "medium", status: "pending" }],
    } satisfies Plan;

    const { container } = render(Harness, {
      props: { plan, isPrompting: false, desktop: true },
    });

    expect(container.querySelector("[data-session-plan]")).toHaveClass(
      "desktop-tinted-glass",
      "backdrop-blur-sm",
    );
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
  it("shows the running-segment gradient only while an incomplete plan is running", () => {
    const incompletePlan = {
      entries: [
        { content: "alpha", priority: "medium", status: "completed" },
        { content: "beta", priority: "medium", status: "in_progress" },
      ],
    } satisfies Plan;

    const running = render(Harness, { props: { plan: incompletePlan, isPrompting: true } });
    expect(running.container.querySelector(".animate-pulse-gradient")).not.toBeNull();
    running.unmount();

    const idle = render(Harness, { props: { plan: incompletePlan, isPrompting: false } });
    expect(idle.container.querySelector(".animate-pulse-gradient")).toBeNull();
    idle.unmount();

    const completedPlan = {
      entries: [
        { content: "alpha", priority: "medium", status: "completed" },
        { content: "beta", priority: "medium", status: "completed" },
      ],
    } satisfies Plan;

    const completed = render(Harness, { props: { plan: completedPlan, isPrompting: true } });
    expect(completed.container.querySelector(".animate-pulse-gradient")).toBeNull();
  });

  it("marks in-progress entries with a pulsing dot and a status for screen readers", () => {
    const plan = {
      entries: [
        { content: "alpha", priority: "medium", status: "in_progress" },
        { content: "beta", priority: "medium", status: "pending" },
      ],
    } satisfies Plan;

    const { container } = render(Harness, { props: { plan, isPrompting: false } });

    expect(container.querySelectorAll(".pulsing-dot")).toHaveLength(1);
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("dismisses the current plan until the plan changes", async () => {
    const plan = {
      entries: [
        { content: "alpha", priority: "medium", status: "completed" },
        { content: "beta", priority: "medium", status: "pending" },
      ],
    } satisfies Plan;

    const { rerender } = render(Harness, { props: { plan, isPrompting: false } });

    await fireEvent.click(screen.getByRole("button", { name: "Dismiss todo list" }));

    expect(screen.queryByText("Completed 1 of 2 steps")).not.toBeInTheDocument();
    expect(screen.queryByText("alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("beta")).not.toBeInTheDocument();

    await rerender({
      plan: {
        entries: [
          { content: "alpha", priority: "medium", status: "completed" },
          { content: "beta", priority: "medium", status: "completed" },
        ],
      } satisfies Plan,
      isPrompting: false,
    });

    expect(screen.getByText("Completed 2 of 2 steps")).toBeInTheDocument();
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
  });
});
