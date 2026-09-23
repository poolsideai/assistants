import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import SidebarNavButton from "./SidebarNavButton.svelte";

describe("SidebarNavButton", () => {
  it("renders a vibrant update pill as part of the navigation label", () => {
    render(SidebarNavButton, {
      props: {
        icon: "sparkles",
        label: "Agents",
        pill: "Update",
        pillAppearance: "vibrant",
      },
    });

    expect(screen.getByRole("button", { name: "Agents Update" })).toBeVisible();
    expect(screen.getByText("Update")).toHaveClass("text-psx-vibrant");
  });
});
