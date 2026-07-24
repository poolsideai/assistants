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

  it("passes a renamed production id through unchanged and keeps the poolside namespace", () => {
    // Publishing under a new marketplace name must not break `@ext:` / marketplace
    // deep-links, and the static `contributes` namespace stays `poolside.*`.
    configureExtensionIdentity("poolside-ai.poolside");

    expect(getExtensionIdentity().extensionId).toBe("poolside-ai.poolside");
    expect(getExtensionIdentity().isDev).toBe(false);
    expect(getExtensionIdentity().poolsideName).toBe("poolside");
    expect(`${POOLSIDE}.open`).toBe("poolside.open");
  });

  it("treats any -dev suffixed id as the dev variant", () => {
    configureExtensionIdentity("poolside-ai.poolside-dev");

    expect(getExtensionIdentity().extensionId).toBe("poolside-ai.poolside-dev");
    expect(getExtensionIdentity().isDev).toBe(true);
    expect(getExtensionIdentity().poolsideName).toBe("poolside-dev");
  });

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
