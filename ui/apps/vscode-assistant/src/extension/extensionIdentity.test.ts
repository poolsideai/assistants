import { createVSCodeMock } from "jest-mock-vscode";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureExtensionIdentity,
  getExtensionIdentity,
  POOLSIDE,
  POOLSIDE_EXTENSION_ID,
  poolsideConfigurationKey,
} from "./extensionIdentity";

vi.mock("vscode", () => createVSCodeMock(vi));

describe("extensionIdentity", () => {
  afterEach(() => {
    configureExtensionIdentity(POOLSIDE_EXTENSION_ID);
  });

  it("keeps normal Poolside IDs unchanged", () => {
    configureExtensionIdentity(POOLSIDE_EXTENSION_ID);

    expect(getExtensionIdentity().poolsideName).toBe("poolside");
    expect(getExtensionIdentity().isDev).toBe(false);
    expect(`${POOLSIDE}.open`).toBe("poolside.open");
    expect(`${POOLSIDE}.webviewFocus`).toBe("poolside.webviewFocus");
    expect(poolsideConfigurationKey("poolside.uri")).toBe("poolside.uri");
    expect(`${POOLSIDE}-roundel`).toBe("poolside-roundel");
    expect(`${POOLSIDE}-webview.focus`).toBe("poolside-webview.focus");
    expect(getExtensionIdentity().helperOutputChannelName).toBe("poolside Helper");
    expect(getExtensionIdentity().telemetryOutputChannelName).toBe("poolside");
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("maps dev Poolside IDs to the dev namespace", () => {
    configureExtensionIdentity("poolside-ai.poolside-assistant-dev");

    expect(getExtensionIdentity().poolsideName).toBe("poolside-dev");
    expect(getExtensionIdentity().isDev).toBe(true);
    expect(`${POOLSIDE}.open`).toBe("poolside-dev.open");
    expect(`${POOLSIDE}.webviewFocus`).toBe("poolside-dev.webviewFocus");
    expect(poolsideConfigurationKey("poolside.uri")).toBe("poolside-dev.uri");
    expect(`${POOLSIDE}-roundel`).toBe("poolside-dev-roundel");
    expect(`${POOLSIDE}-webview.focus`).toBe("poolside-dev-webview.focus");
    expect(getExtensionIdentity().helperOutputChannelName).toBe("poolside Helper-dev");
    expect(getExtensionIdentity().telemetryOutputChannelName).toBe("poolside-dev");
  });
});
