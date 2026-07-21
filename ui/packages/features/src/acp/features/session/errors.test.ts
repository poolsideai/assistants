import { describe, expect, it } from "vitest";
import { ACP_AUTH_REQUIRED_ERROR_CODE } from "../../authMethods";
import { ACPError } from "../../errors";
import { isAuthRequiredError, isStaleSessionError, isUnresumableSessionError } from "./errors";

describe("isAuthRequiredError", () => {
  it("recognizes the protocol auth-required error code", () => {
    expect(
      isAuthRequiredError(
        new ACPError({
          code: ACP_AUTH_REQUIRED_ERROR_CODE,
          message: "Authentication required",
        }),
      ),
    ).toBe(true);
  });

  it("recognizes nested 401 ACP failures from agents", () => {
    expect(
      isAuthRequiredError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: {
            error: "starting conversation: API request failed with status 401",
          },
        }),
      ),
    ).toBe(true);
  });

  it("recognizes unauthorized ACP failures", () => {
    expect(
      isAuthRequiredError(
        new ACPError({
          code: -32603,
          message: "Unauthorized",
        }),
      ),
    ).toBe(true);
  });

  it("recognizes 401 Error instances thrown by the ACP SDK", () => {
    expect(
      isAuthRequiredError(
        new Error(
          "Internal error: Failed to authenticate. API Error: 401 Invalid authentication credentials",
        ),
      ),
    ).toBe(true);
  });

  it("recognizes structured authentication_failed errors", () => {
    expect(
      isAuthRequiredError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: { errorKind: "authentication_failed" },
        }),
      ),
    ).toBe(true);
  });

  it("recognizes protocol auth_required errors", () => {
    expect(
      isAuthRequiredError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: { error: "auth_required" },
        }),
      ),
    ).toBe(true);
  });

  it("recognizes could-not-authenticate errors", () => {
    expect(isAuthRequiredError(new Error("Could not authenticate"))).toBe(true);
  });

  it("does not treat unrelated ACP failures as auth-required", () => {
    expect(
      isAuthRequiredError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: {
            error: "model unavailable",
          },
        }),
      ),
    ).toBe(false);
  });

  it("does not mistake MCP connector credentials for agent authentication", () => {
    expect(
      isAuthRequiredError(
        new ACPError({
          code: -32603,
          message:
            "MCP connector credentials were rejected; reconnect the connector in Settings, then retry",
        }),
      ),
    ).toBe(false);
  });
});

describe("isStaleSessionError", () => {
  it("recognizes resource-not-found ACP failures for stale sessions", () => {
    expect(
      isStaleSessionError(
        new ACPError({
          code: -32002,
          message: "Resource not found",
        }),
      ),
    ).toBe(true);
  });

  it("recognizes a closed session reported in the error message", () => {
    expect(
      isStaleSessionError(
        new ACPError({
          code: -32603,
          message: "Session not found",
        }),
      ),
    ).toBe(true);
  });

  it("recognizes a closed session reported in the error data", () => {
    expect(
      isStaleSessionError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: { details: "Session not found" },
        }),
      ),
    ).toBe(true);
  });

  it("does not treat plain Error instances as stale-session ACP failures", () => {
    expect(isStaleSessionError(new Error("Resource not found"))).toBe(false);
  });

  it("does not treat other ACP failures as stale-session errors", () => {
    expect(
      isStaleSessionError(
        new ACPError({
          code: -32603,
          message: "Resource not found",
        }),
      ),
    ).toBe(false);
  });
});

describe("isUnresumableSessionError", () => {
  // Verbatim shape of the helper's error_data from PE-2460.
  const duplicateAgentSession = new ACPError({
    code: -32603,
    message: "Internal error",
    data: {
      error:
        'starting conversation: failed to create agent session: API request failed with status 500: {"title":"Internal Server Error","status":500,"detail":"unexpected error occurred","errors":[{"message":"failed to create agent session: failed to create agent session: inserting new agent session: ERROR: duplicate key value violates unique constraint \\"agent_session_pkey\\" (SQLSTATE 23505)"}]}',
    },
  });

  it("recognizes an agent that cannot recreate its backend session", () => {
    expect(isUnresumableSessionError(duplicateAgentSession)).toBe(true);
  });

  it("recognizes a duplicate agent session reported without the constraint name", () => {
    expect(
      isUnresumableSessionError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: { error: "failed to create agent session: duplicate key value" },
        }),
      ),
    ).toBe(true);
  });

  it("does not treat other server failures as unresumable", () => {
    expect(
      isUnresumableSessionError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: { error: "starting conversation: API request failed with status 500" },
        }),
      ),
    ).toBe(false);
  });

  it("does not treat a duplicate key from elsewhere as unresumable", () => {
    expect(
      isUnresumableSessionError(
        new ACPError({
          code: -32603,
          message: "Internal error",
          data: { error: "inserting message: duplicate key value violates unique constraint" },
        }),
      ),
    ).toBe(false);
  });

  it("does not treat plain Error instances as unresumable", () => {
    expect(isUnresumableSessionError(new Error("agent_session_pkey"))).toBe(false);
  });
});
