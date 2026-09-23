<script lang="ts" module>
  import type { IconName } from "@poolsideai/components/icon";
  import type { MenuSpecItem } from "../../../ui/menuSpec";

  // One picker row, shaped once so the DOM dropdown and the native menu spec
  // render the same data and cannot drift.
  interface ConfigSelectRow {
    value: string;
    label: string;
    description: string | null;
    icon: IconName;
    iconClass: string;
    selected: boolean;
    pinnedDefault: boolean;
  }

  interface ConfigSelectRowGroup {
    name?: string;
    rows: ConfigSelectRow[];
  }

  // Mirrors the DOM branch: each option row carries the same trailing star
  // accessory natively (`star`, filled on the pinned default), and titled
  // groups get a section header, untitled later groups a plain separator, and
  // the first group none (the DOM branch's DropdownSeparator). Every row
  // belongs to the option's own star radio group (`starGroup`), so the native
  // radio-with-toggle clears stars among these values only.
  function nativeMenuItems(rowGroups: ConfigSelectRowGroup[], starGroup: string): MenuSpecItem[] {
    return rowGroups.flatMap((group, index): MenuSpecItem[] => [
      ...(index > 0 || group.name ? [{ kind: "separator" as const, label: group.name }] : []),
      ...group.rows.map(
        (row): MenuSpecItem => ({
          kind: "action",
          id: row.value,
          label: row.label,
          sublabel: row.description ?? undefined,
          icon: row.icon,
          checked: row.selected,
          star: { starred: row.pinnedDefault },
          starGroup,
        }),
      ),
    ]);
  }
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { presentNativeMenu } from "../../../ui/menuSpec";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { supportsNativeMenus } from "../../desktopContextMenu";
__POOL_SYNTHETIC_IMPORT_BASELINE__
    configValueAppearance,
    hasValueDescriptions,
    modeIconClass,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    shouldPersistConfigSelection,
    valueDescription,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import DefaultStarButton from "./DefaultStarButton.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // promptbox controls: mode icon and label, plain model text, effort bars).
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
  // Only widen the menu when there is subtext to fit: agents that describe
  // nothing keep the standard, tighter list.
  const describedValues = $derived(hasValueDescriptions(groups.flatMap((group) => group.options)));
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // The DOM Dropdown's panel widths (w-[450px] wide / w-[300px] standard).
  // The native menu takes the matching value as its minimum width so
  // sublabels wrap at the same measure instead of the menu growing to the
  // longest description.
  const DROPDOWN_WIDE_W = 450;
  const DROPDOWN_STANDARD_W = 300;
  const nativeMinWidth = $derived(describedValues ? DROPDOWN_WIDE_W : DROPDOWN_STANDARD_W);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // macOS desktop presents the picker as an OS-native menu; every other
  // desktop-class host keeps the DOM dropdown.
  const isNative = $derived(supportsNativeMenus($appState.environment));
  let nativeTriggerButton: HTMLButtonElement | undefined = $state();
  let nativeOpen = $state(false);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      .map((value) => {
        const appearance = configValueAppearance(option, value.value);
        return {
          id: value.value,
          label: value.name,
          caption: valueDescription(value) ?? undefined,
          icon: appearance.icon,
          iconClass: modeIconClass(appearance),
          selected: option.type === "select" && value.value === option.currentValue,
        };
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
  // A pressed star means PINNED: the option's default is fixed to that value
  // and the last-used auto-follow leaves it alone until unpinned.
  function isPinnedDefault(value: string): boolean {
    const agentServer = chatSession.activeAgentServer;
    return (
      repo.agents.isPinnedConfigOption(agentServer, option.id) &&
      repo.agents.defaultConfigOptionsFor(agentServer)[option.id] === value
    );
  }

  // The shared row data both presentations render: the DOM dropdown consumes
  // it directly, the native path converts it with `nativeMenuItems`.
  function selectRowGroups(source: SelectOptionGroup[]): ConfigSelectRowGroup[] {
    return source.map((group) => ({
      name: group.name,
      rows: group.options.map((value) => {
        const appearance = configValueAppearance(option, value.value);
        return {
          value: value.value,
          label: value.name,
          description: valueDescription(value),
          icon: appearance.icon,
          iconClass: modeIconClass(appearance),
          selected: option.type === "select" && value.value === option.currentValue,
          pinnedDefault: isPinnedDefault(value.value),
        };
      }),
    }));
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
  const triggerValue = $derived.by(() => {
    if (option.type !== "select") return "";
    const pending = chatSession.pendingConfigOption(option.id);
    return pending && !pending.error ? pending.value : option.currentValue;
  });
  const triggerAppearance = $derived(configValueAppearance(option, triggerValue));
  const triggerIconClass = $derived(modeIconClass(triggerAppearance));

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Star clicks: pinning fixes the default to `value`; unpinning keeps the
  // value but lets the last-used auto-follow overwrite it again.
  async function setPinnedDefault(value: string, pinned: boolean): Promise<void> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (pinned) {
        await repo.agents.setPinnedDefaultConfigOption(
          chatSession.activeAgentServer,
          option.id,
          value,
        );
      } else {
        await repo.agents.unpinDefaultConfigOption(chatSession.activeAgentServer, option.id, {
          // Follow-managed options (model/effort/fast and the other
          // persistable categories) keep their value on unpin — the
          // last-used auto-follow overwrites it. For anything else (this
          // dropdown fronts ModeControl's behavioral modes in particular)
          // the follow never writes the key, yet applyDefaultConfigOptions
          // would keep seeding every new session with it — an invisible
          // default with no UI left to clear — so the unpin removes the
          // stored value too.
          clearValue: !shouldPersistConfigSelection(option),
        });
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__
      console.error("Failed to update pinned ACP config option", error);
    }
  }

  // The OS positions the menu itself: anchored just under the trigger and
  // flipped near screen edges by the system.
  // In-menu search is dropped here: macOS type-select covers it.
  async function openNativeMenu(): Promise<void> {
    if (!nativeTriggerButton || nativeOpen) return;
    const rect = nativeTriggerButton.getBoundingClientRect();
    const align = placement.endsWith("-end") ? ("end" as const) : ("start" as const);
    nativeOpen = true;
    try {
      const id = await presentNativeMenu(
        // The opt: prefix matches PromptConfigControls' star-group
        // namespacing for config options — single-group menu here, so this
        // is consistency, not collision avoidance.
        nativeMenuItems(selectRowGroups(hoistSelected(groups)), `opt:${option.id}`),
        {
          x: align === "end" ? rect.right : rect.left,
          y: rect.bottom + 4,
          align,
        },
        {
          minWidth: nativeMinWidth,
          // Same pin handler the DOM star calls; `starred` is the row's NEW
          // state (the native star is a radio-with-toggle).
          onSetDefault: (value, starred) => void setPinnedDefault(value, starred),
        },
      );
      if (id !== undefined) void selectConfigOption(id);
    } finally {
      nativeOpen = false;
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
      <Icon
        name={triggerAppearance.icon}
        size={14}
        class={["shrink-0", triggerIconClass]}
        aria-hidden="true"
      />
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
{:else if isNative}
  <!-- Trigger-only rendering: same visuals as the DOM branch, with the menu
       itself presented by the OS. -->
  {#if trigger}
    <button
      bind:this={nativeTriggerButton}
      type="button"
      aria-label={triggerLabel ?? `${option.name}: ${label}`}
      aria-haspopup="menu"
      aria-expanded={nativeOpen}
      onclick={openNativeMenu}
      class={triggerClass ??
        "focus:outline-psx-focus flex min-w-0 max-w-full items-center rounded-md focus-visible:outline-2 active:outline-0"}
    >
      {@render trigger({ open: nativeOpen })}
    </button>
  {:else}
    <button
      bind:this={nativeTriggerButton}
      type="button"
      aria-label={triggerLabel ?? `${option.name}: ${label}`}
      aria-haspopup="menu"
      aria-expanded={nativeOpen}
      onclick={openNativeMenu}
      class="text-psx-foreground-secondary shadow-low focus:outline-psx-focus dark:shadow-low-dark relative flex min-w-0 max-w-full items-center gap-0.5 truncate rounded-xl py-1 pl-2 pr-1 text-sm transition-all focus-visible:outline-2 active:outline-0 {nativeOpen
        ? 'bg-psx-chrome-active/50'
        : 'bg-psx-chrome'}"
    >
      <Icon
        name={triggerAppearance.icon}
        size={14}
        class={["shrink-0", triggerIconClass]}
        aria-hidden="true"
      />
      <span class="truncate">{label}</span>
      <Icon name="chevron" aria-hidden="true" />
    </button>
  {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    icon={triggerAppearance.icon}
    iconClass={triggerIconClass}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    wide={describedValues}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {#each selectRowGroups(rankedGroups(query)) as group, groupIndex (group.name ?? option.id)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {#each group.rows as row (row.value)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
            <DefaultStarButton
              label="Use {row.label} by default"
              pressed={row.pinnedDefault}
              onPress={() => void setPinnedDefault(row.value, !row.pinnedDefault)}
            />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            icon={row.icon}
            iconClass={row.iconClass}
            label={row.label}
            description={row.description}
            selected={row.selected}
__POOL_SYNTHETIC_IMPORT_BASELINE__
            onclick={() => selectConfigOption(row.value)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
