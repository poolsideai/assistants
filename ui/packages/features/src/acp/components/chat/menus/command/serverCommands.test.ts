import { describe, expect, it } from "vitest";
import {
  installedSkillsAsCommands,
  isSkillCommand,
  resolvedSkillCommands,
  resolvedSlashCommandNames,
  skillInvocation,
  sortedServerCommandEntries,
  visibleServerCommandEntries,
} from "./serverCommands";

describe("skill commands", () => {
  it("recognizes published skills by prefix or ACP metadata", () => {
    expect(isSkillCommand({ name: "$uv", description: "Use uv" })).toBe(true);
    expect(
      isSkillCommand({
        name: "piano",
        description: "Compose music",
        _meta: { "poolside/slash_command_category": "skill" },
      }),
    ).toBe(true);
    expect(isSkillCommand({ name: "help", description: "Show help" })).toBe(false);
  });

  it("merges published skills with helper-discovered skills", () => {
    const installed = installedSkillsAsCommands([
      { name: "uv", description: "Use uv" },
      { name: "$slides", description: "Create slides" },
    ]);

    expect(installed.map(({ name }) => name)).toEqual(["$uv", "$slides"]);
    expect(resolvedSkillCommands([{ name: "help", description: "Show help" }], installed)).toEqual(
      installed,
    );
    expect(
      resolvedSkillCommands([{ name: "$agent-skill", description: "Agent skill" }], installed).map(
        ({ name }) => name,
      ),
    ).toEqual(["$agent-skill", "$uv", "$slides"]);
  });

  it("prefers the published entry when a skill appears in both sources", () => {
    const installed = installedSkillsAsCommands([
      { name: "uv", description: "Helper description" },
      { name: "slides", description: "Create slides" },
    ]);

    const resolved = resolvedSkillCommands(
      [{ name: "$UV", description: "Published description" }],
      installed,
    );

    expect(resolved.map(({ name }) => name)).toEqual(["$UV", "$slides"]);
    expect(resolved[0]?.description).toBe("Published description");
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(skillInvocation("$uv")).toBe("$uv");
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  it("includes helper-discovered skills in the names used by transcript markdown", () => {
    const installed = installedSkillsAsCommands([
      { name: "helper-only", description: "Only discovered by the helper" },
    ]);

    expect(
      resolvedSlashCommandNames([{ name: "plan", description: "Plan work" }], installed),
    ).toEqual({
      skills: ["$helper-only"],
      commands: ["plan"],
    });
  });
});

describe("sortedServerCommandEntries", () => {
  it("sorts commands alphabetically and keeps duplicate names addressable", () => {
    const entries = sortedServerCommandEntries([
      { name: "usage", description: "Usage" },
      { name: "debug", description: "Debug logging" },
      { name: "Debug", description: "Alternate debug command" },
      { name: "batch", description: "Batch work" },
    ]);

    expect(entries.map(({ command }) => command.name)).toEqual([
      "batch",
      "Debug",
      "debug",
      "usage",
    ]);
    expect(new Set(entries.map(({ key }) => key)).size).toBe(entries.length);
  });

  it("renders every command before search so the menu is discoverable", () => {
    const entries = visibleServerCommandEntries(
      Array.from({ length: 20 }, (_, index) => ({
        name: `command-${String(index).padStart(2, "0")}`,
        description: `Description ${index}`,
      })),
      undefined,
    );

    expect(entries).toHaveLength(20);
    expect(entries.map(({ command }) => command.name).slice(0, 4)).toEqual([
      "command-00",
      "command-01",
      "command-02",
      "command-03",
    ]);
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
    const entries = visibleServerCommandEntries(
      [
        { name: "batch", description: "Run parallel work" },
        { name: "usage", description: "Contains batch only in the description" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
        { name: "debug", description: "Enable debug logging" },
      ],
      "bat",
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });
});
