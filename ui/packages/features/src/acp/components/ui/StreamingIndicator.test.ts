import { render, screen } from "@testing-library/svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";
import StreamingIndicator from "./StreamingIndicator.svelte";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  );
});

describe("StreamingIndicator", () => {
  it("exposes the working state for both text and icon variants", () => {
    const textOnly = render(StreamingIndicator, { props: { label: "Thinking" } });
    expect(screen.getByRole("status", { name: "Thinking" })).toBeInTheDocument();
    textOnly.unmount();

    render(StreamingIndicator, {
      props: { label: "Working", iconUrl: "data:image/svg+xml,%3Csvg/%3E" },
    });
    expect(screen.getByRole("status", { name: "Working" })).toBeInTheDocument();
  });
});
