import { describe, expect, it } from "vitest";
import {
  getPermissionDeniedObservation,
  getToolCommand,
  getToolCommandHead,
  getToolCommandHeads,
  getToolCommandLabel,
  getToolDescription,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  isPermissionDeniedToolCall,
} from "./toolStatus";

describe("ACP tool status helpers", () => {
  it("identifies rejected permission tool updates", () => {
    const tool = {
      status: "failed",
      rawOutput: {
        error: true,
        observation: "user denied tool",
      },
    } as const;

    expect(isPermissionDeniedToolCall(tool)).toBe(true);
    expect(getPermissionDeniedObservation(tool)).toBe("user denied tool");
  });

  it("does not classify ordinary failed tool updates as denied", () => {
    expect(
      isPermissionDeniedToolCall({
        status: "failed",
        rawOutput: {
          error: true,
          observation: "command exited with status 1",
        },
      }),
    ).toBe(false);
  });

  it("extracts shell approval display details from ACP raw input", () => {
    const tool = {
      kind: "execute",
      title: "Run",
      rawInput: {
        cmd: 'gh pr create --title "test"',
        description: "Create a test PR",
      },
    } as const;

    expect(getToolCommand(tool)).toBe('gh pr create --title "test"');
    expect(getToolCommandHead(tool)).toBe("gh");
    expect(getToolDescription(tool)).toBe("Create a test PR");
  });

  it("extracts shell approval display details from ACP title fallback", () => {
    const tool = {
      kind: "execute",
      title: "Create a test PR: gh pr create --title test",
      rawInput: undefined,
    } as const;

    expect(getToolCommand(tool)).toBe("gh pr create --title test");
    expect(getToolCommandHead(tool)).toBe("gh");
    expect(getToolDescription(tool)).toBe("Create a test PR");
  });

  it("extracts shell approval command heads from ACP raw input commands", () => {
    const tool = {
      kind: "execute",
      title: "Run shell command",
      rawInput: { cmd: 'cd ./ && echo "hello"', commands: ["cd", "echo"] },
    } as const;

    expect(getToolCommandHeads(tool)).toEqual(["cd", "echo"]);
    expect(getToolCommandHead(tool)).toBe("cd");
    expect(getToolCommandLabel(tool)).toBe("cd, echo");
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("prefers Poolside command head metadata over raw input and title fallbacks", () => {
    const tool = {
      kind: "execute",
      title: 'Change directory and greet: cd ./ && echo "hello"',
      _meta: { "poolside/permission_command_heads": ["cd", "echo"] },
      rawInput: { cmd: 'cd ./ && echo "hello"', commands: ["cd"] },
    } as const;

    expect(getToolCommandHeads(tool)).toEqual(["cd", "echo"]);
    expect(getToolCommandLabel(tool)).toBe("cd, echo");
  });

  it("summarizes long shell approval command head lists like classic shell approvals", () => {
    const tool = {
      kind: "execute",
      title: "Run shell command",
      rawInput: { commands: ["cd", "npm", "git"] },
    } as const;

    expect(getToolCommandLabel(tool)).toBe("cd, npm and 1 more command");
  });

  it("uses compact command labels from ACP titles", () => {
    expect(getToolCommandLabel({ kind: "execute", title: "cd, echo" })).toBe("cd, echo");
    expect(getToolCommandLabel({ kind: "execute", title: "cd, npm and 1 more command" })).toBe(
      "cd, npm and 1 more command",
    );
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
});
