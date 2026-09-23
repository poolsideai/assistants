import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DesktopSidebarViewSlider from "./DesktopSidebarViewSlider.svelte";

describe("DesktopSidebarViewSlider", () => {
  it("keeps the same track while updating its semantic view state", async () => {
    const rendered = render(DesktopSidebarViewSlider, { view: "main" });
    const track = rendered.container.querySelector<HTMLElement>(".desktop-sidebar-view-track");

    expect(track).not.toBeNull();
    expect(track).toHaveAttribute("data-view", "main");

    await rendered.rerender({ view: "settings" });

    expect(rendered.container.querySelector(".desktop-sidebar-view-track")).toBe(track);
    expect(track).toHaveAttribute("data-view", "settings");

    await rendered.rerender({ view: "main" });

    expect(rendered.container.querySelector(".desktop-sidebar-view-track")).toBe(track);
    expect(track).toHaveAttribute("data-view", "main");
  });
});
