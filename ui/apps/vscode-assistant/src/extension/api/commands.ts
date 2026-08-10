__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { POOLSIDE } from "../extensionIdentity";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export type PoolsideCommandName = PoolsideCommand extends `poolside.${infer Command}`
  ? Command
  : never;

export function poolsideCommand(command: PoolsideCommandName): string {
  return `${POOLSIDE}.${command}`;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  command: PoolsideCommandName,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  return vscode.commands.registerCommand(poolsideCommand(command), ...args);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  command: PoolsideCommandName,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  return vscode.commands.executeCommand(poolsideCommand(command), ...args);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function executeSetContextCommand<K extends PoolsideContextKey | string>(
__POOL_SYNTHETIC_IMPORT_BASELINE__
  value: K extends PoolsideContextKey ? PoolsideContextKeys[K] : unknown,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
