import { createVSCodeMock } from "jest-mock-vscode";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import { configureExtensionIdentity, POOLSIDE_EXTENSION_ID } from "./extensionIdentity";
import { createStatusBarItem } from "./statusBar";

vi.mock("vscode", () => createVSCodeMock(vi));

describe("createStatusBarItem", () => {
  afterEach(() => {
    configureExtensionIdentity(POOLSIDE_EXTENSION_ID);
  });

  it("shows a right-aligned launch button wired to focusInput", () => {
    const statusBarItem = createStatusBarItem();

    expect(statusBarItem.text).toBe("$(poolside-roundel)");
    expect(statusBarItem.tooltip).toBe("Open Poolside Assistant");
    expect(statusBarItem.command).toBe("poolside.focusInput");
    expect(statusBarItem.alignment).toBe(vscode.StatusBarAlignment.Right);
    expect(statusBarItem.show).toHaveBeenCalled();
  });

  it("namespaces the icon and command for the dev variant", () => {
    configureExtensionIdentity("poolside-ai.poolside-assistant-dev");

    const statusBarItem = createStatusBarItem();

    expect(statusBarItem.text).toBe("$(poolside-dev-roundel)");
    expect(statusBarItem.command).toBe("poolside-dev.focusInput");
  });
});
