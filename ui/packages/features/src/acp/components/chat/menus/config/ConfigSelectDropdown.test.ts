import type { SessionConfigOption } from "@agentclientprotocol/sdk";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ACPSessionRepository } from "../../../../features/SessionRepository.svelte";
import { appState } from "../../../../hostAdapter";
import { presentNativeMenu } from "../../../ui/menuSpec";
import ConfigSelectDropdownTest from "./ConfigSelectDropdown.test.svelte";

vi.mock("../../../ui/menuSpec", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../ui/menuSpec")>()),
  presentNativeMenu: vi.fn(),
}));

const presentNativeMenuMock = vi.mocked(presentNativeMenu);

function setEnvironment(assistantHost: string, operatingSystem?: string): void {
  appState.update((state) => ({
    ...state,
    environment: { ...state.environment, assistantHost, operatingSystem },
  }));
}

// Minimal repo + session pair backing the chat session scope the dropdown
// reads its session from. `pinned` maps option id -> the value its default is
// pinned to (a pressed star = pinned, not merely is-current-default).
function makeRepo(pinned: Record<string, string> = {}) {
  const setConfigOption = vi.fn().mockResolvedValue(undefined);
  const setPinnedDefaultConfigOption = vi.fn().mockResolvedValue(undefined);
  const unpinDefaultConfigOption = vi.fn().mockResolvedValue(undefined);
  const session = {
    sessionId: "session-test",
    conversationId: "conversation-test",
    agentServer: "poolside",
    pendingConfigOption: () => null,
    setConfigOption,
  };
  const repo = {
    getSessionByConversationId: () => session,
    agents: {
      defaultAgentServer: "poolside",
      defaultConfigOptionsFor: () => ({ ...pinned }),
      isPinnedConfigOption: (_agentServer: string, configId: string) => configId in pinned,
      setPinnedDefaultConfigOption,
      unpinDefaultConfigOption,
    },
  } as unknown as ACPSessionRepository;
  return { repo, setConfigOption, setPinnedDefaultConfigOption, unpinDefaultConfigOption };
}

const modeOption: SessionConfigOption = {
  id: "permission_mode",
  name: "Mode",
  type: "select",
  currentValue: "auto",
  options: [
    { value: "always_ask", name: "Always ask", description: "Prompt before each action" },
    { value: "auto", name: "Auto", description: "Auto-approve safe actions" },
    { value: "yolo", name: "Danger", description: "No permission gates" },
  ],
};

const modelOption: SessionConfigOption = {
  id: "model",
  name: "Model",
  type: "select",
  currentValue: "opus",
  options: [
    {
      group: "recommended",
      name: "Recommended",
      options: [
        { value: "sonnet", name: "Sonnet", description: "Balanced" },
        { value: "opus", name: "Opus", description: "Most capable" },
      ],
    },
    {
      group: "other",
      name: "Other",
      options: [{ value: "haiku", name: "Haiku", description: "Fastest" }],
    },
  ],
};

describe("ConfigSelectDropdown", () => {
  beforeEach(() => {
    presentNativeMenuMock.mockReset();
  });

  afterEach(() => {
    setEnvironment("", undefined);
  });

  describe("native menu host", () => {
    it("builds one checked action per option value, each a star row filled on the pinned default", async () => {
      setEnvironment("desktop", "darwin");
      presentNativeMenuMock.mockResolvedValue(undefined);
      const { repo } = makeRepo({ permission_mode: "always_ask" });

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: "Mode: Auto" }));
      await waitFor(() => expect(presentNativeMenuMock).toHaveBeenCalledTimes(1));

      // No DOM menu renders; the OS owns the surface.
      expect(screen.queryByRole("menuitem")).toBeNull();

      const [items, anchor, options] = presentNativeMenuMock.mock.calls[0];
      expect(items).toEqual([
        {
          kind: "action",
          id: "always_ask",
          label: "Always ask",
          sublabel: "Prompt before each action",
          icon: "ask",
          checked: false,
          // The pinned default carries the filled star...
          star: { starred: true },
          // ...and every row joins the option's own star radio group, so the
          // native radio-with-toggle clears stars among these values only.
          starGroup: "opt:permission_mode",
        },
        {
          kind: "action",
          id: "auto",
          label: "Auto",
          sublabel: "Auto-approve safe actions",
          icon: "shield",
          // ...while the current value carries the checkmark.
          checked: true,
          star: { starred: false },
          starGroup: "opt:permission_mode",
        },
        {
          kind: "action",
          id: "yolo",
          label: "Danger",
          sublabel: "No permission gates",
          icon: "fast-forward",
          checked: false,
          star: { starred: false },
          starGroup: "opt:permission_mode",
        },
      ]);
      expect(anchor).toMatchObject({ align: "start" });
      // Described values render in the DOM's wide (450px) dropdown; the
      // native menu takes the same width as its minimum so sublabels wrap.
      expect(options).toEqual({ minWidth: 450, onSetDefault: expect.any(Function) });
    });

    it("shows no filled star when the default value is not pinned", async () => {
      setEnvironment("desktop", "darwin");
      presentNativeMenuMock.mockResolvedValue(undefined);
      // No pins at all: even the current value's row keeps an empty star.
      const { repo } = makeRepo();

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: "Mode: Auto" }));
      await waitFor(() => expect(presentNativeMenuMock).toHaveBeenCalledTimes(1));

      const [items] = presentNativeMenuMock.mock.calls[0];
      for (const item of items) {
        if (item.kind !== "action") continue;
        expect(item.star).toEqual({ starred: false });
      }
    });

    it("passes the standard dropdown width when no value carries a description", async () => {
      setEnvironment("desktop", "darwin");
      presentNativeMenuMock.mockResolvedValue(undefined);
      const { repo } = makeRepo();
      const undescribed: SessionConfigOption = {
        id: "permission_mode",
        name: "Mode",
        type: "select",
        currentValue: "auto",
        options: [
          { value: "always_ask", name: "Always ask" },
          { value: "auto", name: "Auto" },
        ],
      };

      render(ConfigSelectDropdownTest, { props: { option: undescribed, repo } });
      await fireEvent.click(screen.getByRole("button", { name: "Mode: Auto" }));
      await waitFor(() => expect(presentNativeMenuMock).toHaveBeenCalledTimes(1));

      expect(presentNativeMenuMock.mock.calls[0][2]).toEqual({
        minWidth: 300,
        onSetDefault: expect.any(Function),
      });
    });

    it("titles group separators and hoists the selected model, like the DOM menu", async () => {
      setEnvironment("desktop", "darwin");
      presentNativeMenuMock.mockResolvedValue(undefined);
      const { repo } = makeRepo({ model: "sonnet" });

      render(ConfigSelectDropdownTest, {
        props: { option: modelOption, repo, placement: "bottom-end" },
      });
      await fireEvent.click(screen.getByRole("button", { name: "Model: Opus" }));
      await waitFor(() => expect(presentNativeMenuMock).toHaveBeenCalledTimes(1));

      const [items, anchor, options] = presentNativeMenuMock.mock.calls[0];
      expect(items).toEqual([
        { kind: "separator", label: "Recommended" },
        {
          kind: "action",
          id: "opus",
          label: "Opus",
          sublabel: "Most capable",
          icon: "sparkles",
          checked: true,
          star: { starred: false },
          starGroup: "opt:model",
        },
        {
          kind: "action",
          id: "sonnet",
          label: "Sonnet",
          sublabel: "Balanced",
          icon: "sparkles",
          checked: false,
          star: { starred: true },
          starGroup: "opt:model",
        },
        { kind: "separator", label: "Other" },
        {
          kind: "action",
          id: "haiku",
          label: "Haiku",
          sublabel: "Fastest",
          icon: "sparkles",
          checked: false,
          star: { starred: false },
          starGroup: "opt:model",
        },
      ]);
      expect(anchor).toMatchObject({ align: "end" });
      expect(options).toEqual({ minWidth: 450, onSetDefault: expect.any(Function) });
    });

    it("dispatches the selected id to the session config option", async () => {
      setEnvironment("desktop", "darwin");
      presentNativeMenuMock.mockResolvedValue("yolo");
      const { repo, setConfigOption, setPinnedDefaultConfigOption } = makeRepo();

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: "Mode: Auto" }));

      await waitFor(() =>
        expect(setConfigOption).toHaveBeenCalledExactlyOnceWith("permission_mode", "yolo"),
      );
      expect(setPinnedDefaultConfigOption).not.toHaveBeenCalled();
    });

    it("routes star clicks to pin and unpin the agent's default config option", async () => {
      setEnvironment("desktop", "darwin");
      presentNativeMenuMock.mockResolvedValue(undefined);
      const { repo, setConfigOption, setPinnedDefaultConfigOption, unpinDefaultConfigOption } =
        makeRepo({ permission_mode: "always_ask" });

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: "Mode: Auto" }));
      await waitFor(() => expect(presentNativeMenuMock).toHaveBeenCalledTimes(1));

      // Starring an unstarred row pins its value...
      const options = presentNativeMenuMock.mock.calls[0][2];
      options?.onSetDefault?.("yolo", true);
      await waitFor(() =>
        expect(setPinnedDefaultConfigOption).toHaveBeenCalledExactlyOnceWith(
          "poolside",
          "permission_mode",
          "yolo",
        ),
      );

      // ...and un-starring the pinned row (radio-with-toggle) unpins the key.
      // The mode is behavioral session state the last-used auto-follow never
      // writes, so the unpin clears the stored value with the pin — a kept
      // "always_ask"/"bypass" would silently seed every future session.
      options?.onSetDefault?.("always_ask", false);
      await waitFor(() =>
        expect(unpinDefaultConfigOption).toHaveBeenCalledExactlyOnceWith(
          "poolside",
          "permission_mode",
          { clearValue: true },
        ),
      );
      expect(setConfigOption).not.toHaveBeenCalled();
    });

    it("does nothing when the native menu is dismissed", async () => {
      setEnvironment("desktop", "darwin");
      presentNativeMenuMock.mockResolvedValue(undefined);
      const { repo, setConfigOption, setPinnedDefaultConfigOption, unpinDefaultConfigOption } =
        makeRepo();

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      const button = screen.getByRole("button", { name: "Mode: Auto" });
      await fireEvent.click(button);

      await waitFor(() => expect(presentNativeMenuMock).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "false"));

      expect(setConfigOption).not.toHaveBeenCalled();
      expect(setPinnedDefaultConfigOption).not.toHaveBeenCalled();
      expect(unpinDefaultConfigOption).not.toHaveBeenCalled();
    });
  });

  describe("DOM fallback", () => {
    it("renders descriptions, the selected badge, and the pin star accessory", async () => {
      const { repo, setConfigOption, setPinnedDefaultConfigOption } = makeRepo({
        permission_mode: "always_ask",
      });

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: /Auto/ }));

      expect(screen.getByRole("menuitem", { name: /Always ask/ })).toBeInTheDocument();
      expect(screen.getByText("Auto-approve safe actions")).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /Auto/ })).toHaveTextContent("Selected");
      // Pressed = pinned, not merely is-current-default: Auto is selected but
      // unpressed, the pinned Always ask is pressed.
      expect(screen.getByRole("button", { name: "Use Always ask by default" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("button", { name: "Use Auto by default" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );

      await fireEvent.click(screen.getByRole("button", { name: "Use Danger by default" }));
      await waitFor(() =>
        expect(setPinnedDefaultConfigOption).toHaveBeenCalledExactlyOnceWith(
          "poolside",
          "permission_mode",
          "yolo",
        ),
      );

      await fireEvent.click(screen.getByRole("menuitem", { name: /Danger/ }));
      await waitFor(() =>
        expect(setConfigOption).toHaveBeenCalledExactlyOnceWith("permission_mode", "yolo"),
      );

      expect(presentNativeMenuMock).not.toHaveBeenCalled();
    });

    it("unpins when the pressed star is clicked again, clearing a mode's stored value", async () => {
      const { repo, unpinDefaultConfigOption } = makeRepo({ permission_mode: "always_ask" });

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: /Auto/ }));

      await fireEvent.click(screen.getByRole("button", { name: "Use Always ask by default" }));
      await waitFor(() =>
        expect(unpinDefaultConfigOption).toHaveBeenCalledExactlyOnceWith(
          "poolside",
          "permission_mode",
          // Behavioral mode: the auto-follow never writes it, so the unpin
          // clears the stored default value along with the pin.
          { clearValue: true },
        ),
      );
    });

    it("unpins a follow-managed option keeping its stored value", async () => {
      const { repo, unpinDefaultConfigOption } = makeRepo({ model: "sonnet" });

      render(ConfigSelectDropdownTest, { props: { option: modelOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: "Opus" }));

      await fireEvent.click(screen.getByRole("button", { name: "Use Sonnet by default" }));
      await waitFor(() =>
        expect(unpinDefaultConfigOption).toHaveBeenCalledExactlyOnceWith("poolside", "model", {
          // Models follow last use: the value stays for the auto-follow to
          // keep overwriting.
          clearValue: false,
        }),
      );
    });
  });

  describe("mobile host", () => {
    it("opens the bottom sheet and selects through it", async () => {
      setEnvironment("mobile");
      const { repo, setConfigOption } = makeRepo();

      render(ConfigSelectDropdownTest, { props: { option: modeOption, repo } });
      await fireEvent.click(screen.getByRole("button", { name: "Mode: Auto" }));

      expect(screen.getByRole("listbox", { name: "Mode" })).toBeInTheDocument();
      await fireEvent.click(screen.getByRole("option", { name: /Danger/ }));

      await waitFor(() =>
        expect(setConfigOption).toHaveBeenCalledExactlyOnceWith("permission_mode", "yolo"),
      );
      expect(presentNativeMenuMock).not.toHaveBeenCalled();
    });
  });
});
