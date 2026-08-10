import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import BoundaryHarness from "./Boundary.test.svelte";

describe("Boundary", () => {
  it("renders the failed snippet instead of rethrowing when rethrowInDev is false", () => {
    const onError = vi.fn();

    render(BoundaryHarness, {
      props: {
        environmentName: "development",
        onError,
        rethrowInDev: false,
        throwChild: true,
      },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Fallback rendered");
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      "error within component boundary: BoundaryTest",
      { boundary: "BoundaryTest" },
    );
  });
});
