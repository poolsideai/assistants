import * as vscode from "vscode";

export enum ExtensionEnv {
  development = "development",
  test = "test",
  production = "production",
}

const mapping = {
  [vscode.ExtensionMode.Development]: ExtensionEnv.development,
  [vscode.ExtensionMode.Test]: ExtensionEnv.test,
  [vscode.ExtensionMode.Production]: ExtensionEnv.production,
};

/**
 * Returns a stringified version of the current extension mode
 * @param ctx {vscode.ExtensionContext}
 * @returns {ExtensionEnv}
 */
export function mapContextToExtensionMode(ctx: vscode.ExtensionContext) {
  return mapping[ctx.extensionMode];
}
