<script module lang="ts">
  const draftPrompts = new Map<string, string>();
</script>

<script lang="ts">
  import type { ContentBlock } from "@agentclientprotocol/sdk";
  import { InfoMessageType } from "@poolsideai/rpc";
  import Icon from "@poolsideai/components/icon";
  import * as Prompt from "@poolsideai/components/prompt";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { appState, resolveSessionCwd } from "../../hostAdapter";
  import { DEFAULT_AGENT_SERVER, LOCAL_AGENT_SERVER } from "../../agentServers";
  import { enableClaudeSessionFeatures } from "../../claudePromptSuggestions";
  import { getLocalInferenceRepo } from "../../features/LocalInferenceRepository.svelte";
  import { localInferenceModelMissing } from "../../localInferenceModelOptions";
  import { agentName as getAgentName, isClaudeAgent } from "./menus/config/agentConfig";
  import CommandMenu from "./menus/command/CommandMenu.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import ConfigValueMenus from "./menus/config/ConfigValueMenus.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import PlanModeIndicator from "./PlanModeIndicator.svelte";
  import GoalIndicator from "./GoalIndicator.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { AcpSlashCommand } from "./menus/command/commands";
  import {
    AGENT_CONFIG_OPTION_ID,
    AGENT_CONFIG_OPTION_LABEL,
    acpMenus,
    configMenuValue,
  } from "./menus/menus";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { menus } from "../../prompt/menus/menus";
  import FilesMenu from "../../prompt/menus/files/FilesMenu.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import SecretsMenu from "../../prompt/menus/secrets/SecretsMenu.svelte";
  import SecretEditMenu from "../../prompt/menus/secrets/SecretEditMenu.svelte";
  import DesktopFilePromptChipInserter from "./DesktopFilePromptChipInserter.svelte";
  import PastedAttachments from "./PastedAttachments.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { rpc } from "../../hostRpc";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { installedSkills } from "./menus/command/InstalledSkillsRepository.svelte";
  import { showDesktopContextMenu } from "./desktopContextMenu";
  import {
    buildPromptSubmitContextMenuItems,
    performPromptSubmitContextMenuAction,
    supportsNativePromptSubmitContextMenu,
  } from "./promptSubmitContextMenu";
  import { getKeybindingService, withShortcut } from "../../../keybindings";
  import ActivePromptSubmit from "./ActivePromptSubmit.svelte";

  interface Props extends ComponentProps<typeof Prompt.Root> {
    onConfigureAgents?: () => void;
    onInterrupt?: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onSubmit?: (value: string) => void;
    submitDisabled?: boolean;
    disabled?: boolean;
    draftKey?: string | null;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    desktopFilePromptChipTarget?: boolean;
    showConfigControls?: boolean;
    /** Focus the editor once it mounts (e.g. a freshly opened conversation). */
    autofocus?: boolean;
  }

  let {
    onConfigureAgents,
    onInterrupt,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onSubmit,
    submitDisabled = false,
    disabled = false,
    draftKey = null,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    desktopFilePromptChipTarget = true,
    showConfigControls = true,
    autofocus = false,
    ...rest
  }: Props = $props();

  // The editor mounts with this component (child-first), so it is ready by the
  // time this runs. iOS only reliably raises the keyboard from within a user
  // gesture, so on a phone this focuses the field but may not open the keyboard
  // until the field is tapped.
  onMount(() => {
    if (autofocus) prompt?.focus();
    void installedSkills.refresh();
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const keybindings = getKeybindingService();
  const isTurnActive = $derived(chatSession.isPrompting || chatSession.isRemoteWorking);
  const steerWithEnter = $derived(
    chatSession.canSteerPrompt && $appState.environment.desktopSteerWithEnter === true,
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // The local agent with no downloaded model has nothing to serve a prompt
  // with, so the composer locks rather than letting a send fail opaquely. The
  // config controls in the footer stay interactive — the user can still switch
  // agents or pick a model once one lands (the menu says "No model
  // available"), and the composer unlocks reactively when either happens. The
  // context is app-wide but optional; hosts without it never lock.
  function optionalLocalInferenceRepo(): ReturnType<typeof getLocalInferenceRepo> | null {
    try {
      return getLocalInferenceRepo();
    } catch {
      return null;
    }
  }
  const localInference = optionalLocalInferenceRepo();
  const localModelMissing = $derived(
    currentAgentServer === LOCAL_AGENT_SERVER &&
      !!localInference &&
      localInferenceModelMissing(localInference.state),
  );
  const resolvedDisabled = $derived(disabled || localModelMissing);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        localModelMissing ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let prompt: Prompt.Root;
  let pastedAttachments = $state<
    | {
        contentBlocks: () => ContentBlock[];
        clear: () => void;
      }
    | undefined
  >();
  let activeSessionCwd = $derived(
__POOL_SYNTHETIC_IMPORT_BASELINE__
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  $effect(() => {
    if (!isTurnActive || !onInterrupt) return;
    return keybindings?.register("interrupt", onInterrupt);
  });

  // Progressive overflow handling for the footer: when the leading (slash/mode)
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  async function sendPrompt(value: string, { sendNow = false } = {}): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const content = promptContent(value);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const conversationId = chatSession.pendingConversationId ?? chatSession.conversationId;
    if (conversationId) {
      // Chats use the latest submitted user message as their sidebar label.
      // Apply it synchronously so a quick paste-and-send cannot skip the update.
      if (chatSession.isChat) {
        conversations.setDraftTitle(conversationId, value);
      }
      // The editor clears after submit starts, when isSending suppresses draft updates.
      conversations.setDraftPromptPresence(conversationId, false);
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
    pastedAttachments?.clear();
    onSubmit?.(value);
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (sendNow && chatSession.canSteerPrompt) {
        await chatSession.steerPrompt(value, content);
        return;
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (sendNow) onInterrupt?.();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const newSessionMeta = isClaudeAgent(registry, currentAgentServer)
      ? enableClaudeSessionFeatures()
      : undefined;
    await chatSession.send(value, undefined, newSessionMeta, activeSessionCwd, content);
  }

  const submit: Prompt.PromptProps["onSubmit"] = async (value) => {
    if (handleTypedLocalCommand(value)) return;
    await sendPrompt(value, { sendNow: steerWithEnter });
  };

  const submitNow: Prompt.PromptProps["onSubmitNow"] = async (value) => {
    if (handleTypedLocalCommand(value)) return;
    await sendPrompt(value, { sendNow: !steerWithEnter });
  };

  function openPromptSubmitContextMenu(event: MouseEvent): void {
    if (!supportsNativePromptSubmitContextMenu($appState.environment)) return;
    event.preventDefault();
    event.stopPropagation();

    void showDesktopContextMenu(
      buildPromptSubmitContextMenuItems(chatSession.canSteerPrompt, steerWithEnter),
      {
        x: event.clientX,
        y: event.clientY,
      },
    ).then((actionId) =>
      performPromptSubmitContextMenuAction(actionId, {
        enqueue: () => (steerWithEnter ? prompt.submitNow() : prompt.submit()),
        sendNow: () => (steerWithEnter ? prompt.submit() : prompt.submitNow()),
      }),
    );
  }

  function handleCommand(command: AcpSlashCommand) {
    switch (command) {
      case AcpSlashCommand.new: {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        const cwd = activeSessionCwd;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        break;
      }

      case AcpSlashCommand.dump: {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        break;
      }

      case AcpSlashCommand.load: {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        break;
      }

      case AcpSlashCommand.secrets: {
        pushPromptMenu(menus.secrets.value);
        break;
      }

      case AcpSlashCommand.plan: {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        break;
      }
    }
  }

  function handleTypedLocalCommand(value: string): boolean {
    const command = slashCommandName(value);
    if (command === AGENT_CONFIG_OPTION_LABEL) {
      return openAgentConfigMenu();
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__

    if (matchingConfigOption) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      setTimeout(() => pushPromptMenu(configMenuValue(matchingConfigOption.id)), 0);
      return true;
    }

    switch (command) {
      case AcpSlashCommand.new:
        handleCommand(AcpSlashCommand.new);
        return true;
      case AcpSlashCommand.plan:
        handleCommand(AcpSlashCommand.plan);
        return true;
      case AcpSlashCommand.dump:
        handleCommand(AcpSlashCommand.dump);
        return true;
      case AcpSlashCommand.load:
        handleCommand(AcpSlashCommand.load);
        return true;
      case AcpSlashCommand.secrets:
        setTimeout(() => handleCommand(AcpSlashCommand.secrets), 0);
        return true;
      default:
        return false;
    }
  }

  function slashCommandName(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed.startsWith("/")) return null;
    return trimmed.slice(1).split(/\s+/, 1)[0] ?? null;
  }

  function openAgentConfigMenu(): boolean {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      setTimeout(() => pushPromptMenu(configMenuValue(AGENT_CONFIG_OPTION_ID)), 0);
    }
    return true;
  }

  function pushPromptMenu(value: string): void {
    (
      prompt as Prompt.Root & {
        menus?: {
          push(value: string): void;
        };
      }
    )?.menus?.push(value);
  }

  function promptContent(value: string): ContentBlock[] {
    return buildACPPromptContent(
      value,
      pastedAttachments?.contentBlocks() ?? [],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  }

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
      return;
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        const entries = normalizeDumpEntries(JSON.parse(await file.text()));
__POOL_SYNTHETIC_IMPORT_BASELINE__
        rpc.showInfoMessage("ACP dump loaded", InfoMessageType.info);
      } catch (error) {
        console.error("Failed to load ACP dump", error);
        rpc.showInfoMessage("Failed to load ACP dump", InfoMessageType.error);
      }
    };
    input.click();
  }

  let capabilities = $derived($appState.environment.capabilities);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let draftPrompt = $derived(draftKey ? (draftPrompts.get(draftKey) ?? "") : "");

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
  function handleDraftPromptChange(value: string): void {
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
    if (!draftKey) return;
    if (value) {
      draftPrompts.set(draftKey, value);
    } else {
      draftPrompts.delete(draftKey);
    }
  }
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
</script>

<Prompt.Root
  onInterrupt={isTurnActive ? onInterrupt : undefined}
  value={draftPrompt}
  suggestion={isTurnActive || resolvedDisabled ? null : chatSession.promptSuggestion?.text}
  onSuggestionAccepted={() => chatSession.clearPromptSuggestion()}
  onValueChange={handleDraftPromptChange}
  onSubmit={submit}
  onSubmitNow={submitNow}
  submitDisabled={resolvedSubmitDisabled}
  disabled={resolvedDisabled}
  bind:this={prompt}
  {...rest}
>
  <DesktopFilePromptChipInserter enabled={desktopFilePromptChipTarget} />
  <PastedAttachments bind:this={pastedAttachments} enabled={desktopFilePromptChipTarget} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <ConfigValueMenus {onConfigureAgents} />

  <Prompt.Menu.Root {...acpMenus.command}>
    <CommandMenu
      onCommand={handleCommand}
      {promptCommandItems}
      fallbackSkills={installedSkills.commands}
    />
  </Prompt.Menu.Root>

__POOL_SYNTHETIC_IMPORT_BASELINE__
    <SkillsMenu fallbackSkills={installedSkills.commands} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <Prompt.Menu.Root {...menus.secrets}>
    <SecretsMenu />
  </Prompt.Menu.Root>

  <Prompt.Menu.Root {...menus["secret-edit"]}>
    <SecretEditMenu />
  </Prompt.Menu.Root>

  {#if capabilities.fileContext}
    <Prompt.Menu.Root {...menus.files}>
      <FilesMenu />
    </Prompt.Menu.Root>
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
  {/if}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {#if isMobile && (chatSession.configOptions.length > 0 || chatSession.goal)}
    <!-- Accessory strip above the pill composer: permission mode (with the
         plan chip beside it) leading, the consolidated agent/model/options
         trigger trailing. The pill's shrunken footer (see mobile-remote
         app.css) has no room for them. -->
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <div class="flex min-w-0 items-center gap-1">
        <PromptModeControl />
        <PromptModeControl kind="collaboration" />
        <PlanModeIndicator />
        <GoalIndicator />
      </div>
      <div
        class="prompt-config-controls-visibility flex min-w-0"
        class:prompt-config-controls-hidden={!showConfigControls}
        aria-hidden={!showConfigControls}
        inert={!showConfigControls}
      >
        <PromptConfigControls />
      </div>
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
          <Prompt.Form.Field.Editor.Suggestion />
__POOL_SYNTHETIC_IMPORT_BASELINE__
            {#if localModelMissing}
              No model available
            {:else}
              Ask {currentAgentName} something...
            {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <!-- Leading cluster: slash command, permission mode, and — while a
             collaboration-mode agent is planning — the plan chip. The slash
             trigger is sized to match the mode control (h-7) so the row keeps
             an even rhythm. -->
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            class="!text-psx-icon !m-0 flex !size-7 items-center justify-center rounded-md"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            <PromptModeControl kind="collaboration" />
            <PlanModeIndicator />
            <GoalIndicator />
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
            <div
              class="prompt-config-controls-visibility flex min-w-0"
              class:prompt-config-controls-hidden={!showConfigControls}
              aria-hidden={!showConfigControls}
              inert={!showConfigControls}
            >
              <PromptConfigControls hiddenCount={configHiddenCount} />
            </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            <SpeechButton disabled={resolvedDisabled} />
            {#if isTurnActive}
__POOL_SYNTHETIC_IMPORT_BASELINE__
                <ActivePromptSubmit
                  canSteerPrompt={chatSession.canSteerPrompt}
                  {steerWithEnter}
                  oncontextmenu={openPromptSubmitContextMenu}
                />
__POOL_SYNTHETIC_IMPORT_BASELINE__
              <Prompt.Form.SubmitButton
                icon="stop"
                label="Stop"
                title={withShortcut("Stop", "interrupt")}
                onclick={onInterrupt}
              />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
</Prompt.Root>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .prompt-config-controls-visibility {
    opacity: 1;
    transition: opacity 180ms ease-out;
  }

  .prompt-config-controls-hidden {
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /* ChatPane publishes the composer's text size so the elicitation form
       above the prompt can match it. The fallback keeps this rule standing on
       its own wherever the prompt renders outside that column. */
    font-size: var(--psx-composer-font-size, 15px);
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

  @media (prefers-reduced-motion: reduce) {
    .prompt-config-controls-visibility {
      transition-duration: 0ms;
    }
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
