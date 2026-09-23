import { render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InteractiveLogo from "./InteractiveLogo.svelte";

const logoMocks = vi.hoisted(() => ({
  dispose: vi.fn(),
  initLogoScene: vi.fn(),
  updateColors: vi.fn(),
}));

vi.mock("./Logo3D.js", () => ({
  initLogoScene: logoMocks.initLogoScene,
}));

beforeEach(() => {
  vi.clearAllMocks();
  logoMocks.initLogoScene.mockReturnValue({
    dispose: logoMocks.dispose,
    updateColors: logoMocks.updateColors,
  });
});

describe("InteractiveLogo", () => {
  it("loads its renderer on mount and disposes it on unmount", async () => {
    const result = render(InteractiveLogo);

    await waitFor(() => expect(logoMocks.initLogoScene).toHaveBeenCalledOnce());
    expect(logoMocks.initLogoScene).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.any(Object),
      { scale: 1, anchorCenter: false },
    );
    expect(result.container.firstElementChild).toHaveClass("items-center", "justify-center");

    result.unmount();

    expect(logoMocks.dispose).toHaveBeenCalledOnce();
  });
});
