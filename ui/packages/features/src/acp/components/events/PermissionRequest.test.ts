import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ACPPendingPermissionRequest } from "../../features/Session.svelte";
import { appState } from "../../hostAdapter";
import { initializeStatefulModule } from "../../hostRpc";
import { ACP_PERMISSION_SUGGESTED_RULES_META_KEY } from "../../permissionMeta";
import Harness from "./PermissionRequest.test.svelte";

function makeRequest(): ACPPendingPermissionRequest {
  return {
    id: "perm-1",
    agentServer: "poolside",
    sessionId: "session-test",
    toolCall: { toolCallId: "tc-1", title: "Run command", kind: "execute" },
    options: [
      {
        optionId: "allow-always",
        kind: "allow_always",
        name: "Always Allow",
        _meta: { [ACP_PERMISSION_SUGGESTED_RULES_META_KEY]: ["git commit --amend *"] },
      },
      { optionId: "reject-once", kind: "reject_once", name: "Deny" },
    ],
  } as unknown as ACPPendingPermissionRequest;
}

function setEnvironment(assistantHost: string, operatingSystem?: string): void {
  appState.update((state) => ({
    ...state,
    environment: { ...state.environment, assistantHost, operatingSystem },
  }));
}

describe("PermissionRequest always-allow alternatives", () => {
  afterEach(() => {
    setEnvironment("", undefined);
  });

  describe("DOM fallback", () => {
    it("lists the broader glob variants and reports the selected override", async () => {
      const selectPermissionOption = vi.fn();
      render(Harness, { props: { request: makeRequest(), selectPermissionOption } });

      await fireEvent.click(screen.getByTestId("always-allow-alternatives-trigger"));

      expect(screen.getByRole("button", { name: "git commit *" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "git *" })).toBeInTheDocument();

      await fireEvent.click(screen.getByRole("button", { name: "git commit *" }));

      expect(selectPermissionOption).toHaveBeenCalledExactlyOnceWith("perm-1", "allow-always", [
        "git commit *",
      ]);
    });
  });

  describe("native menu host", () => {
    it("presents the native menu and reports the selected override", async () => {
      setEnvironment("desktop", "darwin");
      const sender = vi.fn().mockResolvedValue("git *");
      initializeStatefulModule(sender);
      const selectPermissionOption = vi.fn();

      render(Harness, { props: { request: makeRequest(), selectPermissionOption } });

      await fireEvent.click(screen.getByTestId("always-allow-alternatives-trigger"));
      await waitFor(() =>
        expect(selectPermissionOption).toHaveBeenCalledExactlyOnceWith("perm-1", "allow-always", [
          "git *",
        ]),
      );

      // No DOM popover renders; the OS owns the surface.
      expect(screen.queryByText("git commit *")).toBeNull();

      expect(sender).toHaveBeenCalledTimes(1);
      const [method, args] = sender.mock.calls[0];
      expect(method).toBe("showDesktopContextMenu");
      expect(args[0]).toMatchObject({
        align: "end",
        items: [
          { kind: "action", id: "git commit *", label: "git commit *" },
          { kind: "action", id: "git *", label: "git *" },
        ],
      });
    });

    it("does not report a selection when the native menu is dismissed", async () => {
      setEnvironment("desktop", "darwin");
      const sender = vi.fn().mockResolvedValue(null);
      initializeStatefulModule(sender);
      const selectPermissionOption = vi.fn();

      render(Harness, { props: { request: makeRequest(), selectPermissionOption } });

      await fireEvent.click(screen.getByTestId("always-allow-alternatives-trigger"));
      await waitFor(() => expect(sender).toHaveBeenCalledTimes(1));
      await Promise.resolve();
      await Promise.resolve();

      expect(selectPermissionOption).not.toHaveBeenCalled();
    });
  });
});
