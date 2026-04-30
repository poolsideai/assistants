import vscode from "vscode";
import { poolsideConfigurationKey, poolsideConfigurationSection } from "../extensionIdentity";
import type {
  PoolsideConfigurationProperties,
  PoolsideConfigurationProperty,
} from "../types/manifest";

function getConfigurationSections(key: PoolsideConfigurationProperty | string) {
  const resolvedKey = poolsideConfigurationKey(key);
  const lastDotIndex = resolvedKey.lastIndexOf(".");
  if (lastDotIndex === -1) return undefined;
  return [resolvedKey.substring(0, lastDotIndex), resolvedKey.substring(lastDotIndex + 1)] as const;
}

export function getConfiguration<K extends PoolsideConfigurationProperty>(
  key: K,
): PoolsideConfigurationProperties[K] | undefined;
export function getConfiguration<K extends PoolsideConfigurationProperty>(
  key: K,
  defaultValue: PoolsideConfigurationProperties[K],
): PoolsideConfigurationProperties[K];
export function getConfiguration<K extends PoolsideConfigurationProperty>(
  key: K,
  defaultValue?: PoolsideConfigurationProperties[K],
) {
  const sections = getConfigurationSections(key);
  if (!sections) return defaultValue;
  const [base, section] = sections;
  return vscode.workspace
    .getConfiguration(base)
    .get(section, defaultValue) as PoolsideConfigurationProperties[K];
}

export function affectsConfiguration(
  event: vscode.ConfigurationChangeEvent,
  key: PoolsideConfigurationProperty | string,
  scope?: vscode.ConfigurationScope,
) {
  return event.affectsConfiguration(poolsideConfigurationKey(key), scope);
}

export function getPoolsideConfigurationSection(): vscode.WorkspaceConfiguration {
  return poolsideConfigurationSection();
}
