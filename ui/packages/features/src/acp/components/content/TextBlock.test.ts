import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appState } from "../../hostAdapter";
import { initializeStatefulModule } from "../../hostRpc";
import TextBlock from "./TextBlock.svelte";
import TextBlockSession from "./TextBlockSession.test.svelte";

describe("ACP TextBlock", () => {
  it("renders text content as markdown", async () => {
    const { container } = render(TextBlock, {
      props: {
        text: "**strong** and `inlineCode`\n\n- list item",
      },
    });

    await waitFor(() => expect(container.querySelector("strong")?.textContent).toBe("strong"));
    expect(container.querySelector("code")?.textContent).toBe("inlineCode");
    expect(container.querySelector("li")?.textContent).toBe("list item");
  });

  it("renders fenced code through the shared assistant code block", async () => {
    const { container } = render(TextBlock, {
      props: {
        text: "```ts\nconst answer = 42;\n```",
      },
    });

    await waitFor(() => expect(container.querySelector(".highlightedCode")).toBeTruthy());
    expect(container.querySelector(".highlightedCode code")?.textContent).toContain(
      "const answer = 42;",
    );
  });
});

describe("ACP visualization paths", () => {
  const initialState = get(appState);

  afterEach(() => {
    appState.set(initialState);
  });

  function desktopFileReader() {
    appState.set({
      ...initialState,
      environment: { ...initialState.environment, assistantHost: "desktop" },
      workspaces: [],
    });
    const read = vi.fn(async (_method: string, [path]: string[]) => ({
      path,
      content: "<p>Conversation visualization</p>",
    }));
    initializeStatefulModule(read);
    return read;
  }

  it("resolves the same relative filename independently in separate conversation panes", async () => {
    const read = desktopFileReader();
    const text = 'visualize{"path":"chart.html"}';
    const first = render(TextBlockSession, { cwd: "/repo/worktree-a", text });
    const second = render(TextBlockSession, { cwd: "/repo/worktree-b", text });

    await waitFor(() => {
      expect(read).toHaveBeenCalledWith("getFileContents", ["/repo/worktree-a/chart.html"]);
      expect(read).toHaveBeenCalledWith("getFileContents", ["/repo/worktree-b/chart.html"]);
      expect(first.container.querySelector("iframe")).not.toBeNull();
      expect(second.container.querySelector("iframe")).not.toBeNull();
    });
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("uses the new conversation directory when a pane changes sessions", async () => {
    const read = desktopFileReader();
    const text = 'visualize{"path":"chart.html"}';
    const { rerender } = render(TextBlockSession, { cwd: "/repo/worktree-a", text });
    await waitFor(() =>
      expect(read).toHaveBeenCalledWith("getFileContents", ["/repo/worktree-a/chart.html"]),
    );

    await rerender({ cwd: "/repo/worktree-b", text });
    await waitFor(() =>
      expect(read).toHaveBeenLastCalledWith("getFileContents", ["/repo/worktree-b/chart.html"]),
    );
  });
});
