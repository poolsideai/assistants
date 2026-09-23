import type { AvailableCommand } from "@agentclientprotocol/sdk";

const commandNameCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

export interface ServerCommandEntry {
  command: AvailableCommand;
  key: string;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export interface InstalledSkill {
  name: string;
  description: string;
}

export function installedSkillsAsCommands(
  skills: ReadonlyArray<InstalledSkill>,
): AvailableCommand[] {
  return skills.map((skill) => ({
    name: skill.name.startsWith("$") ? skill.name : `$${skill.name}`,
    description: skill.description,
    _meta: { "poolside/slash_command_category": "skill" },
  }));
}

// Agents that don't mark skill commands (e.g. claude-agent-acp) publish none
// that isSkillCommand recognizes, and the helper scan only covers directories
// it knows about — so neither source alone is complete. Merge them, letting a
// published entry win a name collision since its description is authoritative.
export function resolvedSkillCommands(
  availableCommands: ReadonlyArray<AvailableCommand>,
  installedSkills: ReadonlyArray<AvailableCommand>,
): AvailableCommand[] {
  const publishedSkills = availableCommands.filter(isSkillCommand);
  const publishedNames = new Set(
    publishedSkills.map((command) => normalizedSkillName(command.name)),
  );
  return [
    ...publishedSkills,
    ...installedSkills.filter((command) => !publishedNames.has(normalizedSkillName(command.name))),
  ];
}

function normalizedSkillName(name: string): string {
  return (name.startsWith("$") ? name.slice(1) : name).toLocaleLowerCase();
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function skillInvocation(name: string): string {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

export function resolvedSlashCommandNames(
  availableCommands: ReadonlyArray<AvailableCommand>,
  installedSkills: ReadonlyArray<AvailableCommand>,
): { skills: string[]; commands: string[] } {
  return {
    skills: resolvedSkillCommands(availableCommands, installedSkills).map((skill) =>
      skillInvocation(skill.name),
    ),
    commands: availableCommands
      .filter((command) => !isSkillCommand(command))
      .map(({ name }) => name),
  };
}

const FILTERED_COMMAND_LIMIT = 30;
const sortedEntriesCache = new WeakMap<ReadonlyArray<AvailableCommand>, ServerCommandEntry[]>();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function sortedServerCommandEntries(
  commands: ReadonlyArray<AvailableCommand>,
): ServerCommandEntry[] {
  const cached = sortedEntriesCache.get(commands);
  if (cached) return cached;

  const entries = commands
    .map((command, index) => ({ command, index }))
    .sort((left, right) => {
      const name = commandNameCollator.compare(left.command.name, right.command.name);
      if (name !== 0) return name;

      const description = commandNameCollator.compare(
        left.command.description ?? "",
        right.command.description ?? "",
      );
      if (description !== 0) return description;

      return left.index - right.index;
    })
    .map(({ command, index }) => ({
      command,
      key: `${command.name}:${command.description ?? ""}:${index}`,
    }));

  sortedEntriesCache.set(commands, entries);
  return entries;
}

export function visibleServerCommandEntries(
  commands: ReadonlyArray<AvailableCommand>,
  search: string | undefined,
): ServerCommandEntry[] {
  const entries = sortedServerCommandEntries(commands);
  const query = search?.trim().toLocaleLowerCase();

  if (!query) return entries;

  return entries
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    .slice(0, FILTERED_COMMAND_LIMIT);
}
