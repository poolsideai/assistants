import { describe, expect, it, vi } from "vitest";
import {
  buildPromptSubmitContextMenuItems,
  performPromptSubmitContextMenuAction,
  supportsNativePromptSubmitContextMenu,
} from "./promptSubmitContextMenu";

describe("prompt submit context menu", () => {
  it("is available only in the macOS desktop host", () => {
    expect(
      supportsNativePromptSubmitContextMenu({
        assistantHost: "desktop",
        operatingSystem: "darwin",
      }),
    ).toBe(true);
    expect(
      supportsNativePromptSubmitContextMenu({
        assistantHost: "desktop",
        operatingSystem: "win32",
      }),
    ).toBe(false);
    expect(
      supportsNativePromptSubmitContextMenu({
        assistantHost: "vscode",
        operatingSystem: "darwin",
      }),
    ).toBe(false);
  });

  it("offers enqueue and interrupt-and-send-now actions by default", () => {
    expect(buildPromptSubmitContextMenuItems()).toEqual([
      {
        kind: "action",
        id: "enqueue",
        label: "Enqueue",
        accelerator: "Enter",
      },
      {
        kind: "action",
        id: "interrupt-and-send-now",
        label: "Interrupt & Send Now",
        accelerator: "Cmd+Enter",
      },
    ]);
  });

  it("labels send-now as steer when the active agent supports it", () => {
    expect(buildPromptSubmitContextMenuItems(true)[1]).toEqual({
      kind: "action",
      id: "interrupt-and-send-now",
      label: "Steer",
      accelerator: "Cmd+Enter",
    });
  });

  it("swaps the steering and enqueue shortcuts when steer-with-enter is enabled", () => {
    expect(buildPromptSubmitContextMenuItems(true, true)).toEqual([
      {
        kind: "action",
        id: "interrupt-and-send-now",
        label: "Steer",
        accelerator: "Enter",
      },
      {
        kind: "action",
        id: "enqueue",
        label: "Enqueue",
        accelerator: "Cmd+Enter",
      },
    ]);
  });

  it("dispatches the selected action", () => {
    const enqueue = vi.fn();
    const sendNow = vi.fn();
    const actions = { enqueue, sendNow };

    performPromptSubmitContextMenuAction("enqueue", actions);
    expect(enqueue).toHaveBeenCalledOnce();
    expect(sendNow).not.toHaveBeenCalled();

    performPromptSubmitContextMenuAction("interrupt-and-send-now", actions);
    expect(sendNow).toHaveBeenCalledOnce();

    performPromptSubmitContextMenuAction(undefined, actions);
    expect(enqueue).toHaveBeenCalledOnce();
    expect(sendNow).toHaveBeenCalledOnce();
  });
});
