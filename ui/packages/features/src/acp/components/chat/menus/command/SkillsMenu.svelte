__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { AvailableCommand } from "@agentclientprotocol/sdk";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { resolvedSkillCommands, visibleServerCommandEntries } from "./serverCommands";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  interface Props {
    fallbackSkills?: AvailableCommand[];
  }

  let { fallbackSkills = [] }: Props = $props();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const skills = $derived(
    visibleServerCommandEntries(
      resolvedSkillCommands(chatSession.availableCommands, fallbackSkills),
      $search,
    ),
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
