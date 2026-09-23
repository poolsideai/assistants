import { cleanup, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import IdentityManagerTestWrapper from "./IdentityManagerTestWrapper.svelte";
import { appState, type Environment } from "./store";

describe("IdentityManager", () => {
  let defaultEnvironment: Environment;
  let defaultUri: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
    appState.update((current) => ({
      ...current,
      userSettings: {
        ...current.userSettings,
        uri: "https://api.poolsi.de",
      },
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
      environment: defaultEnvironment,
    }));
  });

  afterAll(() => {
    vi.unstubAllGlobals();
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
  });

  it("does not overlay signed-in app content with the identity drag region", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__

    expect(component.queryByTestId("identity-manager-desktop-drag-region")).not.toBeInTheDocument();
    expect(component.getByTestId("identity-manager-child")).toBeInTheDocument();
  });
});
