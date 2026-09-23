import path from "node:path";

export interface AssistantTerminalCommandLaunch {
  shellPath: string;
  shellArgs: string[];
}

// Shells known to parse the shared POSIX completion wrapper (`( ... )`
// grouping plus `"$?"`). fish is deliberately absent: it rejects `( ... )` in
// command position and treats `$?` as a parse error, so it keeps the sendText
// fallback.
const POSIX_SHELLS = new Set(["bash", "dash", "sh", "zsh"]);

/**
 * Builds a terminal launch that passes an internal command as a shell argument
 * instead of typing it into the PTY. The legacy `nonInteractive` RPC mode is
 * named after this delivery distinction; bash and zsh are still deliberately
 * interactive so setup scripts see the same startup configuration as a user
 * terminal.
 *
 * Keep the shell→argv mapping in sync with `shell_for_terminal` in
 * ui/apps/desktop-assistant/src-tauri/src/terminal.rs, which implements the
 * same `nonInteractive` contract for the desktop host (with one intentional
 * divergence: the desktop host runs cmd/PowerShell commands natively, while
 * this host falls back to sendText for them).
 */
export function assistantTerminalCommandLaunch(
  shellPath: string,
  command: string,
  platform: NodeJS.Platform = process.platform,
): AssistantTerminalCommandLaunch | undefined {
  const trimmedCommand = command.trim();
  if (!shellPath || !trimmedCommand) return undefined;

  const shellName = (
    platform === "win32" ? path.win32.basename(shellPath) : path.basename(shellPath)
  )
    .toLowerCase()
    .replace(/\.exe$/, "");
  // The shared completion wrapper is POSIX shell syntax, so argv delivery is
  // limited to shells known to parse it — on every platform, not just
  // Windows. Anything else (cmd, PowerShell, fish, nushell, ...) keeps the
  // sendText fallback rather than being handed an argv its parser rejects.
  if (!POSIX_SHELLS.has(shellName)) return undefined;

  return {
    shellPath,
    shellArgs:
      shellName === "bash" || shellName === "zsh"
        ? ["-ilc", trimmedCommand]
        : ["-ic", trimmedCommand],
  };
}
