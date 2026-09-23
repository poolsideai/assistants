import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
import { appState } from "../../hostAdapter";
import { initializeStatefulModule, type HostMessageSender } from "../../hostRpc";
import Harness from "./ConversationHeader.test.svelte";

function makeRepo(): ACPSessionRepository {
  return {
    getSessionByConversationId: () => ({
      sessionId: "session-test",
      conversationId: "conversation-test",
      agentServer: "poolside",
      pendingCwd: null,
      pendingConversationId: null,
      isChat: false,
      handoffTargetAgentServer: null,
    }),
    agents: { defaultAgentServer: "poolside" },
  } as unknown as ACPSessionRepository;
}

function setEnvironment(assistantHost: string, operatingSystem?: string): void {
  appState.update((state) => ({
    ...state,
    environment: { ...state.environment, assistantHost, operatingSystem },
  }));
}

describe("ConversationHeader kebab menu", () => {
  afterEach(() => {
    setEnvironment("", undefined);
  });

  describe("DOM fallback", () => {
    it("renders the dropdown items and reports the selection", async () => {
      const onViewTrajectory = vi.fn();
      const onSaveTrajectory = vi.fn();
      render(Harness, { props: { repo: makeRepo(), onViewTrajectory, onSaveTrajectory } });

      await fireEvent.click(screen.getByRole("button", { name: "More actions" }));

      expect(screen.getByRole("menuitem", { name: "View ACP Events" })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: "Save ACP events" })).toBeInTheDocument();

      await fireEvent.click(screen.getByRole("menuitem", { name: "Save ACP events" }));

      expect(onSaveTrajectory).toHaveBeenCalledOnce();
      expect(onViewTrajectory).not.toHaveBeenCalled();
    });
  });

  describe("native menu host", () => {
    function mockSender(selection: string | null) {
      return vi.fn<HostMessageSender>((method) => {
        if (method === "showDesktopContextMenu") return Promise.resolve(selection);
        return Promise.resolve(undefined);
      });
    }

    beforeEach(() => {
      // "View ACP Events" has no SF Symbol mapping, so it rasterizes its
      // glyph. jsdom never fires Image load callbacks: fail fast instead of
      // hanging (matches nativeMenuIcons.test.ts's approach). Item selection
      // does not depend on the resolved icon.
      vi.stubGlobal(
        "Image",
        class {
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
          set src(_value: string) {
            queueMicrotask(() => this.onerror?.());
          }
        },
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("presents the native menu from the trigger and reports the selection", async () => {
      setEnvironment("desktop", "darwin");
      const sender = mockSender("save-trajectory");
      initializeStatefulModule(sender);
      const onViewTrajectory = vi.fn();
      const onSaveTrajectory = vi.fn();

      render(Harness, { props: { repo: makeRepo(), onViewTrajectory, onSaveTrajectory } });

      await fireEvent.click(screen.getByRole("button", { name: "More actions" }));
      await waitFor(() => expect(onSaveTrajectory).toHaveBeenCalledOnce());
      expect(onViewTrajectory).not.toHaveBeenCalled();

      // No DOM menu renders; the OS owns the surface.
      expect(screen.queryByRole("menuitem")).toBeNull();

      const call = sender.mock.calls.find(([method]) => method === "showDesktopContextMenu");
      expect(call).toBeDefined();
      const [, args] = call!;
      expect(args[0]).toMatchObject({
        align: "end",
        items: [
          { kind: "action", id: "view-trajectory", label: "View ACP Events" },
          { kind: "action", id: "save-trajectory", label: "Save ACP events" },
        ],
      });
    });

    it("does not report a selection when the native menu is dismissed", async () => {
      setEnvironment("desktop", "darwin");
      const sender = mockSender(null);
      initializeStatefulModule(sender);
      const onViewTrajectory = vi.fn();
      const onSaveTrajectory = vi.fn();

      render(Harness, { props: { repo: makeRepo(), onViewTrajectory, onSaveTrajectory } });

      await fireEvent.click(screen.getByRole("button", { name: "More actions" }));
      await waitFor(() =>
        expect(sender).toHaveBeenCalledWith("showDesktopContextMenu", expect.anything()),
      );
      await Promise.resolve();
      await Promise.resolve();

      expect(onViewTrajectory).not.toHaveBeenCalled();
      expect(onSaveTrajectory).not.toHaveBeenCalled();
    });
  });
});
