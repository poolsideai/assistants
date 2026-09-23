import { render, screen } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appState, type AppState } from "../../hostAdapter";
import ToolCallContentRenderer from "./ToolCallContentRenderer.svelte";

describe("ToolCallContentRenderer", () => {
  let previousAppState: AppState;

  beforeEach(() => {
    previousAppState = get(appState);
  });

  afterEach(() => {
    appState.set(previousAppState);
  });

  it("renders ACP image content blocks from tool results", () => {
    render(ToolCallContentRenderer, {
      props: {
        content: {
          type: "content",
          content: {
            type: "image",
            mimeType: "image/png",
            data: imageData,
            uri: "/workspace/tool-screenshot.png",
          },
        },
      },
    });

    expect(screen.getByAltText("Image")).toHaveAttribute(
      "src",
      `data:image/png;base64,${imageData}`,
    );
    expect(
      screen.queryByRole("button", {
        name: "Preview /workspace/tool-screenshot.png",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders previewable image resource links from tool results", () => {
    render(ToolCallContentRenderer, {
      props: {
        content: {
          type: "content",
          content: {
            type: "resource_link",
            name: "generated.png",
            uri: "/workspace/generated.png",
            mimeType: "image/png",
          },
        },
      },
    });

    expect(screen.getByText("generated.png")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Preview generated.png" })).not.toBeInTheDocument();
  });

  it("renders embedded resources from tool results as file pills", () => {
    render(ToolCallContentRenderer, {
      props: {
        content: {
          type: "content",
          content: {
            type: "resource",
            resource: {
              uri: "/workspace/src/app.ts",
              mimeType: "text/plain",
              text: "const value = 1;",
            },
          },
        },
      },
    });

    expect(screen.getByText("app.ts")).toBeInTheDocument();
    expect(screen.queryByText("const value = 1;")).not.toBeInTheDocument();
  });

  it("shortens local image and resource paths with the host-provided home directory", async () => {
    appState.update((state) => ({
      ...state,
      homeDirectory: "/Users/andy",
      workspaces: [{ path: "/Users/andy/project", name: "project", index: 0 }],
    }));

    const { rerender } = render(ToolCallContentRenderer, {
      props: {
        workspaceFolders: [{ path: "/Users/andy/project", name: "project", index: 0 }],
        content: {
          type: "content",
          content: {
            type: "image",
            mimeType: "image/png",
            data: imageData,
            uri: "file:///Users/andy/generated/cat.png",
          },
        },
      },
    });

    expect(screen.getByText("~/generated/cat.png")).toBeInTheDocument();

    await rerender({
      workspaceFolders: [{ path: "/Users/andy/project", name: "project", index: 0 }],
      content: {
        type: "content",
        content: {
          type: "resource_link",
          name: "/Users/andy/generated/result.json",
          uri: "/Users/andy/generated/result.json",
        },
      },
    });

    expect(screen.getByText("~/generated/result.json")).toBeInTheDocument();

    await rerender({
      workspaceFolders: [{ path: "/Users/andy/project", name: "project", index: 0 }],
      content: {
        type: "content",
        content: {
          type: "resource_link",
          name: "/Users/andy/project/src/result.json",
          uri: "/Users/andy/project/src/result.json",
        },
      },
    });

    expect(screen.getByText("./src/result.json")).toBeInTheDocument();
  });
});

const imageData =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s8vH4QAAAAASUVORK5CYII=";
