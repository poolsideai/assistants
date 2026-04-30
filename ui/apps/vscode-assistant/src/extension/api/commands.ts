import type { ArrayTail } from "type-fest";
import vscode from "vscode";
import { POOLSIDE } from "../extensionIdentity";
import type { PoolsideCommand, PoolsideContextKey, PoolsideContextKeys } from "../types/manifest";

export type PoolsideCommandName = PoolsideCommand extends `poolside.${infer Command}`
  ? Command
  : never;

export function poolsideCommand(command: PoolsideCommandName): string {
  return `${POOLSIDE}.${command}`;
}

export function registerCommand(
  command: PoolsideCommandName,
  ...args: ArrayTail<Parameters<typeof vscode.commands.registerCommand>>
) {
  return vscode.commands.registerCommand(poolsideCommand(command), ...args);
}

export function executeCommand(
  command: PoolsideCommandName,
  ...args: ArrayTail<Parameters<typeof vscode.commands.executeCommand>>
) {
  return vscode.commands.executeCommand(poolsideCommand(command), ...args);
}

export function executeSetContextCommand<K extends PoolsideContextKey | string>(
  key: K,
  value: K extends PoolsideContextKey ? PoolsideContextKeys[K] : unknown,
) {
  return vscode.commands.executeCommand("setContext", key, value);
}
