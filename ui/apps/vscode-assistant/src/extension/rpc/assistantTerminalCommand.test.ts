import { describe, expect, it } from "vitest";
import { assistantTerminalCommandLaunch } from "./assistantTerminalCommand";

describe("assistantTerminalCommandLaunch", () => {
  it("passes zsh and bash commands as interactive login-shell arguments", () => {
    expect(assistantTerminalCommandLaunch("/bin/zsh", "  pnpm clean  ", "darwin")).toEqual({
      shellPath: "/bin/zsh",
      shellArgs: ["-ilc", "pnpm clean"],
    });
    expect(assistantTerminalCommandLaunch("/bin/bash", "pnpm clean", "linux")).toEqual({
      shellPath: "/bin/bash",
      shellArgs: ["-ilc", "pnpm clean"],
    });
  });

  it("uses command-argument mode for other POSIX shells", () => {
    expect(assistantTerminalCommandLaunch("/bin/dash", "pnpm clean", "linux")).toEqual({
      shellPath: "/bin/dash",
      shellArgs: ["-ic", "pnpm clean"],
    });
    expect(assistantTerminalCommandLaunch("/bin/sh", "pnpm clean", "darwin")).toEqual({
      shellPath: "/bin/sh",
      shellArgs: ["-ic", "pnpm clean"],
    });
  });

  it("falls back for shells that cannot parse the POSIX wrapper on any platform", () => {
    // fish rejects `( ... )` command grouping and `$?`.
    expect(
      assistantTerminalCommandLaunch("/usr/local/bin/fish", "pnpm clean", "darwin"),
    ).toBeUndefined();
    // Non-POSIX default shells exist off-Windows too.
    expect(
      assistantTerminalCommandLaunch("/opt/homebrew/bin/pwsh", "pnpm clean", "darwin"),
    ).toBeUndefined();
    expect(assistantTerminalCommandLaunch("/usr/bin/nu", "pnpm clean", "linux")).toBeUndefined();
  });

  it("supports POSIX shells on Windows but falls back for native Windows shells", () => {
    expect(
      assistantTerminalCommandLaunch(
        "C:\\Program Files\\Git\\bin\\bash.exe",
        "pnpm clean",
        "win32",
      ),
    ).toEqual({
      shellPath: "C:\\Program Files\\Git\\bin\\bash.exe",
      shellArgs: ["-ilc", "pnpm clean"],
    });
    expect(
      assistantTerminalCommandLaunch("C:\\Windows\\System32\\cmd.exe", "pnpm clean", "win32"),
    ).toBeUndefined();
    expect(
      assistantTerminalCommandLaunch(
        "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
        "pnpm clean",
        "win32",
      ),
    ).toBeUndefined();
  });
});
