<script lang="ts">
  import { SettingsSectionCard as SettingsSection } from "../acp";
  import { chordFromEvent, formatChord, type Platform } from "./chord";
  import { COMMAND_GROUPS, defaultChord, type CommandId, type KeybindingHost } from "./commands";
  import { getKeybindingService } from "./context";

  interface Props {
    /** Which host's bindings to show. Filters commands and resolves defaults. */
    host?: KeybindingHost;
    /** Platform for the no-service fallback (stories/tests); ignored when a service is present. */
    platform?: Platform;
  }

  let { host = "desktop", platform = "mac" }: Props = $props();

  // The page is authored entirely by COMMAND_GROUPS — order, grouping and titles
  // all come from the registry. This component never names a command directly.
  // Hints come from the service (which knows the real platform); the registry
  // default + `platform` prop is only a fallback when no service is provided.
  const service = getKeybindingService();
  const editable = service?.editable ?? false;

  // Bumped after every override so derived hints recompute (the service is not a store).
  let revision = $state(0);
  let recordingId = $state<CommandId | null>(null);

  const groups = $derived(
    COMMAND_GROUPS.map((group) => ({
      category: group.category,
      commands: group.commands.filter((command) => command.hosts.includes(host)),
    })).filter((group) => group.commands.length > 0),
  );

  function hintFor(id: CommandId): string | null {
    void revision; // dependency: re-resolve after edits
    if (service) return service.hint(id);
    const chord = defaultChord(id, host);
    return chord ? formatChord(chord, platform) : null;
  }

  function startRecording(id: CommandId) {
    if (!service?.editable) return;
    recordingId = id;
    service.beginRecording();
  }

  function stopRecording() {
    recordingId = null;
    service?.endRecording();
  }

  // While recording, capture the next chord and apply it. Escape cancels; Backspace
  // clears the binding back to its default.
  function onRecordKeydown(event: KeyboardEvent) {
    if (recordingId === null || !service) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Escape") {
      stopRecording();
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      service.resetBinding(recordingId);
      revision += 1;
      stopRecording();
      return;
    }

    const chord = chordFromEvent(event, platform);
    if (!chord) return; // lone modifier — keep waiting
    service.setBinding(recordingId, chord);
    revision += 1;
    stopRecording();
  }
</script>

<svelte:window onkeydowncapture={onRecordKeydown} />

{#each groups as group (group.category)}
  <SettingsSection title={group.category}>
    <ul class="divide-psx-border/70 flex flex-col divide-y">
      {#each group.commands as command (command.id)}
        {@const hint = hintFor(command.id)}
        {@const recording = recordingId === command.id}
        <li
          class={[
            "grid min-h-14 grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] items-center gap-3 px-3 py-2.5 transition-colors",
            recording ? "bg-psx-menu-hover-background/50" : "hover:bg-psx-editor-background/35",
          ]}
        >
          <div class="flex min-w-0 flex-col">
            <span class="text-psx-foreground-primary truncate text-sm/[18px] font-medium"
              >{command.title}</span
            >
            {#if command.description}
              <span class="text-psx-foreground-secondary mt-0.5 truncate text-[13px]/[17px]"
                >{command.description}</span
              >
            {/if}
          </div>
          {#if editable}
            <button
              type="button"
              data-keybinding-row={command.id}
              aria-label={`Change shortcut for ${command.title}`}
              onclick={() => (recording ? stopRecording() : startRecording(command.id))}
              class={[
                "focus-visible:outline-psx-focus justify-self-end rounded-[6px] px-2 py-1 text-sm/[16px] shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.05),_0_1px_3px_rgba(0,0,0,0.05)] outline transition-colors",
                recording
                  ? "outline-psx-focus bg-psx-editor-background text-psx-foreground-secondary ring-3 ring-psx-focus/20"
                  : "outline-psx-border bg-psx-background text-psx-foreground-secondary hover:border-psx-button-secondary-hover-border hover:bg-psx-menu-hover-background hover:text-psx-foreground-primary",
              ]}
            >
              {#if recording}
                Recording...
              {:else if hint}
                {hint}
              {:else}
                Not set
              {/if}
            </button>
          {:else if hint}
            <kbd
              class="border-psx-border bg-psx-background text-psx-foreground-secondary justify-self-end rounded-[6px] border px-2 py-1 font-mono text-xs/[16px] shadow-sm"
              >{hint}</kbd
            >
          {:else}
            <span
              class="text-psx-foreground-tertiary justify-self-end rounded-[6px] px-2 py-1 font-mono text-xs/[16px]"
              >Not set</span
            >
          {/if}
        </li>
      {/each}
    </ul>
  </SettingsSection>
{/each}
