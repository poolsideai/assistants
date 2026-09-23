import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ChipNodeFileIconHarness from "./ChipNodeFileIcon.test.svelte";

describe("ChipNode", () => {
  it("renders file chips with the themed file icon", async () => {
    render(ChipNodeFileIconHarness);

    const icon = await screen.findByTestId("theme-file-icon");

    expect(icon).toHaveAttribute("data-path", "/repo/src/app.ts");
    await waitFor(() => {
      expect(screen.getByText("app.ts")).toBeInTheDocument();
    });
  });
});
