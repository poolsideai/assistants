import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Harness from "./DefaultStarButton.test.svelte";

describe("DefaultStarButton", () => {
  it("places the default star before the selected pill", async () => {
    render(Harness);
    await fireEvent.click(screen.getByRole("button", { name: "Picker" }));

    const star = screen.getByRole("button", { name: "Use option by default" });
    const trailingControls = star.closest(".ml-auto");
    const pill = screen.getByText("Selected");

    expect(trailingControls?.firstElementChild).toContainElement(star);
    expect(trailingControls?.lastElementChild).toBe(pill);
  });

  it("runs the default action without selecting its containing menu item", async () => {
    render(Harness);
    await fireEvent.click(screen.getByRole("button", { name: "Picker" }));
    const star = screen.getByRole("button", { name: "Use option by default" });
    expect(star).toHaveAttribute("title", "Make default");

    await fireEvent.pointerDown(star);
    await fireEvent.pointerUp(star);
    await fireEvent.click(star);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(screen.getByRole("menuitem", { name: /Option/ })).toBeInTheDocument();
    expect(screen.getByTestId("presses")).toHaveTextContent("1");
    expect(screen.getByTestId("selections")).toHaveTextContent("0");
    expect(star).toHaveAttribute("title", "Default");
  });

  it("does not interfere with outside dismissal", async () => {
    render(Harness);
    await fireEvent.click(screen.getByRole("button", { name: "Picker" }));

    const outside = screen.getByRole("button", { name: "Outside" });
    await fireEvent.pointerDown(outside);
    await fireEvent.click(outside);

    await waitFor(() =>
      expect(screen.queryByRole("menuitem", { name: /Option/ })).not.toBeInTheDocument(),
    );
  });

  it("does not interfere with regular option selection", async () => {
    render(Harness);
    await fireEvent.click(screen.getByRole("button", { name: "Picker" }));

    await fireEvent.click(screen.getByRole("menuitem", { name: /Option/ }));

    await waitFor(() =>
      expect(screen.queryByRole("menuitem", { name: /Option/ })).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("selections")).toHaveTextContent("1");
  });
});
