import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AgentThought as AgentThoughtEvent } from "../../types";
import AgentThought from "./AgentThought.svelte";

function thought(text: string, truncated = false): AgentThoughtEvent {
  return {
    eventKind: "agent_thought",
    messageId: "thought-1",
    content: [{ type: "text", text }],
    ...(truncated ? { truncated: true } : {}),
  };
}

async function renderExpandedThought(text = "Initial thought") {
  const result = render(AgentThought, {
    props: { event: thought(text), complete: false },
  });
  const scrollElement = result.container.querySelector<HTMLDivElement>(".thinking-container")!;
  scrollElement.scrollTo = vi.fn();
  await fireEvent.click(result.getByRole("button", { name: /think/i }));
  await tick();
  return result;
}

describe("AgentThought", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps collapsed content current without scheduling renders", async () => {
    vi.useFakeTimers();
    const result = render(AgentThought, {
      props: { event: thought("Initial thought"), complete: false },
    });

    await result.rerender({ event: thought("Updated while collapsed"), complete: false });
    await tick();

    expect(vi.getTimerCount()).toBe(0);

    const scrollElement = result.container.querySelector<HTMLDivElement>(".thinking-container")!;
    scrollElement.scrollTo = vi.fn();
    await fireEvent.click(result.getByRole("button", { name: /think/i }));
    await tick();
    expect(result.container).toHaveTextContent("Updated while collapsed");
  });

  it("batches expanded streaming text and renders the latest snapshot", async () => {
    const result = await renderExpandedThought();
    vi.useFakeTimers();

    await result.rerender({ event: thought("First update"), complete: false });
    await result.rerender({ event: thought("Latest update"), complete: false });

    expect(result.container).toHaveTextContent("Initial thought");
    expect(result.container).not.toHaveTextContent("First update");
    expect(result.container).not.toHaveTextContent("Latest update");

    await vi.advanceTimersByTimeAsync(99);
    await tick();
    expect(result.container).toHaveTextContent("Initial thought");

    await vi.advanceTimersByTimeAsync(1);
    await tick();
    expect(result.container).toHaveTextContent("Latest update");
    expect(result.container).not.toHaveTextContent("First update");
  });

  it("flushes immediately when streaming completes", async () => {
    const result = await renderExpandedThought();
    vi.useFakeTimers();

    await result.rerender({ event: thought("Finished thought"), complete: false });
    expect(result.container).not.toHaveTextContent("Finished thought");

    await result.rerender({ event: thought("Finished thought"), complete: true });
    await tick();

    expect(result.container).toHaveTextContent("Finished thought");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("flushes and cancels a pending render when collapsed", async () => {
    const result = await renderExpandedThought();
    vi.useFakeTimers();

    await result.rerender({ event: thought("Newest hidden thought"), complete: false });
    await fireEvent.click(result.getByRole("button", { name: /think/i }));
    await tick();

    expect(vi.getTimerCount()).toBe(0);

    await fireEvent.click(result.getByRole("button", { name: /think/i }));
    await tick();
    expect(result.container).toHaveTextContent("Newest hidden thought");
  });

  it("explains truncated thoughts in a borderless inline notice", async () => {
    const result = render(AgentThought, {
      props: { event: thought("Retained tail", true), complete: true },
    });
    await fireEvent.click(result.getByRole("button", { name: /thought/i }));
    await tick();

    const label = result.getByText("Truncated:");
    const notice = label.parentElement?.parentElement;
    expect(label).toHaveClass("font-medium");
    expect(notice).toHaveTextContent(
      "Truncated: long thought traces are not rendered for performance reasons.",
    );
    expect(notice).not.toHaveClass("border");
    expect(notice?.querySelector("svg")).not.toBeNull();
    expect(result.container).toHaveTextContent("Retained tail");
  });
});
