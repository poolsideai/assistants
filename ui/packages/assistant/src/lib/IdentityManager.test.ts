import { cleanup, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import IdentityManagerTestWrapper from "./IdentityManagerTestWrapper.svelte";
import { appState, type Environment } from "./store";

describe("IdentityManager", () => {
  let defaultEnvironment: Environment;
  let defaultUri: string;
  let defaultIsHelperSupported: boolean;

  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  beforeEach(() => {
    const state = get(appState);
    defaultEnvironment = state.environment;
    defaultUri = state.userSettings.uri;
    defaultIsHelperSupported = state.isHelperSupported;
    appState.update((current) => ({
      ...current,
      userSettings: {
        ...current.userSettings,
        uri: "https://api.poolsi.de",
      },
      isHelperSupported: true,
      environment: {
        ...current.environment,
        assistantHost: "desktop",
      },
    }));
  });

  afterEach(() => {
    cleanup();
    appState.update((current) => ({
      ...current,
      userSettings: {
        ...current.userSettings,
        uri: defaultUri,
      },
      isHelperSupported: defaultIsHelperSupported,
      environment: defaultEnvironment,
    }));
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders desktop app content without platform auth", () => {
    const component = render(IdentityManagerTestWrapper);

    expect(component.queryByTestId("identity-manager-desktop-drag-region")).not.toBeInTheDocument();
    expect(component.getByTestId("identity-manager-child")).toBeInTheDocument();
  });

  it("renders vscode app content without platform auth", () => {
    appState.update((current) => ({
      ...current,
      environment: {
        ...current.environment,
        assistantHost: "vscode",
      },
    }));

    const component = render(IdentityManagerTestWrapper);

    expect(component.getByTestId("identity-manager-child")).toBeInTheDocument();
  });

  it("does not overlay signed-in app content with the identity drag region", () => {
    const component = render(IdentityManagerTestWrapper);

    expect(component.queryByTestId("identity-manager-desktop-drag-region")).not.toBeInTheDocument();
    expect(component.getByTestId("identity-manager-child")).toBeInTheDocument();
  });
});
