<script lang="ts">
  import type { PermissionOption, ToolKind } from "@agentclientprotocol/sdk";
  import type { ToolCall } from "../../types";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { Button } from "@poolsideai/components/button";
  import Icon from "@poolsideai/components/icon";
  import Kbd from "@poolsideai/components/kbd";
  import { createDropdownMenu, melt } from "@melt-ui/svelte";
  import { HighlightedShellCommand } from "@poolsideai/components/assistant-ui";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { ACP_PERMISSION_SUGGESTED_RULES_META_KEY } from "../../permissionMeta";
  import { getToolCommand, getToolCommandLabel, getToolDescription } from "../shared/toolStatus";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import ToolCallContentRenderer from "../shared/ToolCallContentRenderer.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { supportsNativeMenus } from "../chat/desktopContextMenu";
  import { presentNativeMenu, type MenuSpecItem } from "../ui/menuSpec";
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

  type ApprovalOptionKind = "allow_once" | "allow_always" | "reject_once" | "reject_always";

  const LABELS: Record<Exclude<ToolKind, "other">, string> = {
    read: "Read",
    edit: "Edit",
    delete: "Delete",
    move: "Move",
    search: "Search",
    execute: "Run",
    think: "Think",
    fetch: "Fetch",
    switch_mode: "Switch mode",
  };

  interface Props {
    request: ACPPendingPermissionRequest;
    toolCallContext?: ToolCall;
  }

  let { request, toolCallContext }: Props = $props();

  const acp = getACPContext();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  let isSubmitting = $state(false);
  let containerDiv: HTMLDivElement | undefined = $state();
  let focusIndex = $state(0);
  let allowShortcutOption = $derived(findOptionByKinds(["allow_once"]));
  let denyShortcutOption = $derived(findOptionByKinds(["reject_once", "reject_always"]));
  let alwaysAllowOption = $derived(findOptionByKinds(["allow_always"]));
  let suggestedRules = $derived(alwaysAllowOption ? getSuggestedRules(alwaysAllowOption) : []);
  let showAllSubCommandsButton = $derived(suggestedRules.length > 4);
  let displayToolCall = $derived(toolCallContext ?? request.toolCall);
  let command = $derived(getToolCommand(displayToolCall));
  let hasContent = $derived((displayToolCall.content?.length ?? 0) > 0);
  let actionLabel = $derived(command ? "execute" : getActionLabel(request.toolCall.kind));
  let description = $derived(getToolDescription(displayToolCall));
  let headerSubject = $derived(
    getToolCommandLabel(request.toolCall) ??
      getToolCommandLabel(displayToolCall) ??
      request.toolCall.title,
  );
  let rawInput = $derived(
    request.toolCall.rawInput == null
      ? undefined
      : typeof request.toolCall.rawInput === "string"
        ? request.toolCall.rawInput
        : JSON.stringify(request.toolCall.rawInput, null, 2),
  );

  // Broader glob variants for each suggested rule (e.g. "gh pr checks 31268 *"
  // -> ["gh pr checks *", "gh pr *", "gh *"]). Poolside ACP can persist the
  // selected override via RequestPermissionOutcomeSelected._meta.
  let suggestedRuleAlternatives = $derived.by(() => {
    const seen = new Set<string>(suggestedRules);
    const out: string[] = [];
    for (const rule of suggestedRules) {
      for (const variant of progressiveGlobVariants(rule)) {
        if (!seen.has(variant)) {
          seen.add(variant);
          out.push(variant);
        }
      }
    }
    return out;
  });

  const alternativesMenu = createDropdownMenu({
    positioning: { placement: "bottom-end" },
    forceVisible: true,
  });
  const {
    elements: { trigger: alternativesTrigger, menu: alternativesMenuEl },
    states: { open: alternativesOpen },
  } = alternativesMenu;

  // Native menu path for the "Instead, always allow" alternatives list. Built
  // from the same `suggestedRuleAlternatives` the DOM popover renders, so the
  // set of variants and their order always match.
  const nativeMenus = $derived(supportsNativeMenus($appState.environment));
  const alternativesMenuItems = $derived<MenuSpecItem[]>(
    suggestedRuleAlternatives.map((variant) => ({ kind: "action", id: variant, label: variant })),
  );
  const alternativesTriggerClass =
    "bg-psx-button-secondary-background text-psx-button-secondary-foreground hover:bg-psx-button-secondary-hover-background focus-visible:outline-psx-focus ui-xs:min-h-6 ui-sm:min-h-7 ui-md:min-h-8 ui-lg:min-h-9 flex items-center justify-center rounded-r px-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 active:brightness-110 disabled:pointer-events-none disabled:opacity-50";

  let alternativesTriggerButton: HTMLButtonElement | undefined = $state();
  let nativeAlternativesOpen = $state(false);

  async function openAlternativesNativeMenu(optionId: string): Promise<void> {
    if (!alternativesTriggerButton || nativeAlternativesOpen || isSubmitting) return;
    const rect = alternativesTriggerButton.getBoundingClientRect();
    nativeAlternativesOpen = true;
    try {
      const variant = await presentNativeMenu(alternativesMenuItems, {
        x: rect.right,
        y: rect.bottom + 4,
        align: "end",
      });
      if (variant !== undefined) selectOption(optionId, overrideRulesForVariant(variant));
    } finally {
      nativeAlternativesOpen = false;
    }
  }

  function findOptionByKinds(kinds: ApprovalOptionKind[]): PermissionOption | undefined {
    for (const kind of kinds) {
      const option = request.options.find((candidate) => candidate.kind === kind);
      if (option) {
        return option;
      }
    }

    return undefined;
  }

  function getActionLabel(kind: ToolKind | null | undefined): string {
    if (!kind || kind === "other") return "use";
    return kind === "execute" ? "execute" : LABELS[kind].toLowerCase();
  }

  function optionLabel(option: PermissionOption): string {
    switch (option.kind) {
      case "allow_once":
        return "Allow Once";
      case "reject_once":
      case "reject_always":
        return "Deny";
      default:
        return option.name;
    }
  }

  function getSuggestedRules(option: PermissionOption): string[] {
    const raw = option._meta?.[ACP_PERMISSION_SUGGESTED_RULES_META_KEY];
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.every((item): item is string => typeof item === "string") ? raw : [];
  }

  function progressiveGlobVariants(rule: string): string[] {
    if (!rule.endsWith(" *")) return [];
    const prefix = rule.slice(0, -2);
    const tokens = prefix.split(/\s+/).filter(Boolean);
    if (tokens.length <= 1) return [];
    const variants: string[] = [];
    for (let i = tokens.length - 1; i >= 1; i--) {
      variants.push(tokens.slice(0, i).join(" ") + " *");
    }
    return variants;
  }

  function ruleTokens(rule: string): string[] | null {
    if (!rule.endsWith(" *")) return null;
    return rule.slice(0, -2).split(/\s+/).filter(Boolean);
  }

  function variantSubsumes(variant: string, rule: string): boolean {
    const v = ruleTokens(variant);
    const r = ruleTokens(rule);
    if (!v || !r || v.length > r.length) return false;
    return v.every((tok, i) => tok === r[i]);
  }

  function overrideRulesForVariant(variant: string): string[] {
    const kept = suggestedRules.filter((rule) => !variantSubsumes(variant, rule));
    return [variant, ...kept];
  }

  function selectOption(optionId: string, overrideRules?: string[]): void {
    if (isSubmitting) return;
    isSubmitting = true;
    if (overrideRules && overrideRules.length > 0) {
      acp.selectPermissionOption(request.id, optionId, overrideRules);
      return;
    }
    acp.selectPermissionOption(request.id, optionId);
  }

  function handleKeydown(e: KeyboardEvent): void {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      e.preventDefault();
      e.stopImmediatePropagation();
      selectOption(denyShortcutOption.optionId);
      return;
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
      e.preventDefault();
      selectOption(allowShortcutOption.optionId);
      return;
    }

    if (e.code === "ArrowDown" || e.code === "ArrowUp") {
      e.preventDefault();

      if (!containerDiv) return;

      const buttons = Array.from(containerDiv.querySelectorAll("button:not([disabled])"));
      if (buttons.length === 0) return;

      const currentIndex = buttons.findIndex((btn) => btn === document.activeElement);
      if (currentIndex !== -1) {
        focusIndex = currentIndex;
      }

      if (e.code === "ArrowDown") {
        focusIndex = (focusIndex + 1) % buttons.length;
      } else {
        focusIndex = (focusIndex - 1 + buttons.length) % buttons.length;
      }

      (buttons[focusIndex] as HTMLElement)?.focus();
    }
  }
</script>

<svelte:window onkeydowncapture={handleKeydown} />

<div
  data-testid="acp-permission-request"
__POOL_SYNTHETIC_IMPORT_BASELINE__
>
  <div
    class="group/header text-auto relative isolate flex items-center justify-between gap-1.5 truncate px-3 py-2.5"
  >
    <div class="inline-flex min-w-0 items-center gap-1 truncate">
      <Icon class="text-psx-icon self-center" name="pause" />

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    </div>
  </div>

__POOL_SYNTHETIC_IMPORT_BASELINE__
    <div
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    >
      {#if description}
        <div class="text-psx-foreground-secondary px-2.5 pt-2 text-xs italic">
          {description}
        </div>
      {/if}
      <div class="font-(family-name:--editor-font-size) block min-h-4 px-2.5 py-2 text-sm">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            >$ </span><HighlightedShellCommand {command} /></pre>
      </div>
    </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <ToolCallContentRenderer {content} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {:else if rawInput}
    <div
      class="border-psx-border font-(family-name:--editor-font-size) block max-h-56 min-h-4 overflow-auto overscroll-contain border-t px-2.5 py-2 text-sm"
    >
      <pre class="whitespace-pre-wrap break-all">{rawInput}</pre>
    </div>
  {/if}

  <div bind:this={containerDiv} class="border-psx-border flex flex-col gap-1.5 border-t p-2">
    {#each request.options as option}
      {#if option.kind === "allow_always" && suggestedRules.length > 0}
        <div class="flex items-stretch gap-px">
          <Button
            aria-label={showAllSubCommandsButton
              ? "Auto-allow all sub-commands"
              : "Auto-allow action"}
            onclick={() => selectOption(option.optionId)}
            disabled={isSubmitting}
            class={[
              "flex-1 justify-start text-start",
              suggestedRuleAlternatives.length > 0 && "rounded-r-none",
            ]}
          >
            {#if showAllSubCommandsButton}
              <span>Always allow all commands used here</span>
            {:else}
              <span>
                Always Allow
                {#each suggestedRules as suggestion, i}
                  <span class="rounded-xs bg-black/5 px-1 py-0.5 align-middle font-mono text-xs"
                    >{suggestion}</span
                  >{#if i < suggestedRules.length - 1}{", "}{/if}
                {/each}
              </span>
            {/if}
          </Button>
          {#if suggestedRuleAlternatives.length > 0}
            {#if nativeMenus}
              <button
                type="button"
                bind:this={alternativesTriggerButton}
                aria-label="Pick a broader allow rule"
                data-testid="always-allow-alternatives-trigger"
                aria-haspopup="menu"
                aria-expanded={nativeAlternativesOpen}
                disabled={isSubmitting}
                onclick={() => openAlternativesNativeMenu(option.optionId)}
                class={alternativesTriggerClass}
              >
                <Icon name="chevron" size={14} aria-hidden="true" />
              </button>
            {:else}
              <button
                type="button"
                use:melt={$alternativesTrigger}
                aria-label="Pick a broader allow rule"
                data-testid="always-allow-alternatives-trigger"
                disabled={isSubmitting}
                class={alternativesTriggerClass}
              >
                <Icon name="chevron" size={14} aria-hidden="true" />
              </button>
            {/if}
          {/if}
        </div>
        {#if !nativeMenus && $alternativesOpen && suggestedRuleAlternatives.length > 0}
          <div
            use:melt={$alternativesMenuEl}
            class="menu-surface z-50 w-[min(calc(100vw-2rem),320px)] overflow-hidden p-1"
          >
            <div
              class="text-psx-foreground-secondary px-2 py-1 text-[11px] uppercase tracking-wide"
            >
              Instead, always allow
            </div>
            {#each suggestedRuleAlternatives as variant}
              <button
                type="button"
                onclick={() => selectOption(option.optionId, overrideRulesForVariant(variant))}
                disabled={isSubmitting}
                class="text-psx-foreground-primary outline-hidden hover:bg-psx-menu-hover-background flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
              >
                <span
                  class="rounded-xs truncate bg-black/5 px-1 py-0.5 align-middle font-mono text-xs"
                  >{variant}</span
                >
              </button>
            {/each}
          </div>
        {/if}
      {:else}
        <Button
          aria-label={option.name}
          onclick={() => selectOption(option.optionId)}
          prominence={option.kind === "allow_once" ? "increased" : "standard"}
          disabled={isSubmitting}
          class="justify-between text-start"
        >
          <span>{optionLabel(option)}</span>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          {/if}
        </Button>
      {/if}
    {/each}
  </div>
</div>
