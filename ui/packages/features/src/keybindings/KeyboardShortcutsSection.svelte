<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
              class={[
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              ]}
            >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              {:else if hint}
__POOL_SYNTHETIC_IMPORT_BASELINE__
              {:else}
__POOL_SYNTHETIC_IMPORT_BASELINE__
              {/if}
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
