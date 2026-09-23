import { describe, expect, it } from "vitest";
import { mcpFormStateWithDefaults } from "./McpServerForm.svelte";

describe("mcpFormStateWithDefaults", () => {
  it("does not let undefined preset values replace string defaults", () => {
    const form = mcpFormStateWithDefaults({
      name: "notion",
      authMode: "oauth",
      oauthScopes: undefined,
    });

    expect(form.name).toBe("notion");
    expect(form.authMode).toBe("oauth");
    expect(form.oauthScopes).toBe("");
    expect(form.oauthClientID).toBe("");
    expect(form.oauthCallbackPort).toBe(0);
    expect(form.oauthDeepLink).toBe(false);
  });

  it("carries the catalog deep-link opt-in through", () => {
    const form = mcpFormStateWithDefaults({
      name: "slack",
      authMode: "oauth",
      oauthDeepLink: true,
    });

    expect(form.oauthDeepLink).toBe(true);
  });
});
