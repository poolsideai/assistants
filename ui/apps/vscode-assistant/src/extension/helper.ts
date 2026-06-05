import { initializeStatefulModule as initializeHelperClientRPC } from "@poolsideai/helperapi";
import type {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACPNavDidChangeParams,
} from "@poolsideai/helperapi/schemas";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import path from "path";
import vscode, { env } from "vscode";
import {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type CloseHandlerResult,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ErrorHandlerResult,
  type Executable,
  LanguageClient,
  type LanguageClientOptions,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { getPoolsideConfig } from "./configuration";
import { getExtensionIdentity } from "./extensionIdentity";
import { _getValidHelperTarget } from "./helperUtils";
import { getDiagnostics } from "./lsp/handlers/getDiagnostics";
import { searchSymbolDefinitions } from "./lsp/handlers/searchSymbolDefinitions";
import { getEnvironment } from "./state";
import { System } from "./system";

/**
 * start launches an instance of the poolside-helper binary and initializes communication via stdio.
 */
async function startHelper(system: System) {
  const { context } = system;
  const identity = getExtensionIdentity();

  let goRunDebug = {
    command: "go",
    args: ["run", "-tags=fts5", "./cmd/poolside-helper/...", "--pprof"],
    transport: TransportKind.stdio,
    options: {
      cwd: context.asAbsolutePath("../../../"),
      env: process.env,
    },
  } satisfies Executable;

  const dlvBinary = vscode.workspace.getConfiguration("poolsideHelper").get("dlvBinary", "");
  if (dlvBinary) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    goRunDebug = {
      ...goRunDebug,
      command: dlvBinary,
      args: [
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "debug",
        "--continue",
        "--headless",
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "--api-version=2",
        "--accept-multiclient",
        "--build-flags=-tags=fts5",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // If you're having issues with delve itself, you can enable logging by uncommenting
        // the following lines:
        // "--log",
        // "--log-output=rpc",
        "./cmd/poolside-helper",
        "--",
      ],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          ...goRunDebug.options.env,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
    run: {
      command: helperBinary(system),
      transport: TransportKind.stdio,
      options: {
        cwd: context.extensionPath,
      },
    },
    debug: goRunDebug,
  };

  const environment = getEnvironment(system);

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file" }],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    initializationOptions: {
      ...(await getRuntimeSettings()),
__POOL_SYNTHETIC_IMPORT_BASELINE__
      assistantHost: environment.assistantHost,
      assistantEnvironment: environment.assistantEnv,
    },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        count: number | undefined,
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
    outputChannelName: identity.helperOutputChannelName,
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Set the following option in your settings.json to enable LSP tracing in the helper:
  //
  //     "poolsideHelper.trace.server": "verbose",
  if (vscode.workspace.getConfiguration("poolsideHelper").get("trace.server")) {
    clientOptions.traceOutputChannel = vscode.window.createOutputChannel(
      "poolsideHelper Language Server - Protocol Trace",
    );
  }

  const lspID = "poolsideHelper";
  const isDev = context.extensionMode === vscode.ExtensionMode.Development;
  const client = new LanguageClient(
    lspID,
    identity.helperOutputChannelName,
    serverOptions,
    clientOptions,
    isDev,
  );

  client.registerProposedFeatures();

  client.onRequest("poolside/searchSymbolDefinitions", searchSymbolDefinitions);
  client.onRequest("poolside/getDiagnostics", getDiagnostics);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      return system.acpChatPanels.routeInbound(
        "poolside/acp/elicitation/create",
        params,
      ) as Promise<ACPElicitationOutput>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  client.onNotification(
    "poolside/mcpOAuthURL",
    async (params: { serverID: string; authURL: string }) => {
      await vscode.env.openExternal(vscode.Uri.parse(params.authURL));
    },
  );
  client.onNotification("poolside/acpNav/didChange", (params: ACPNavDidChangeParams) => {
    system.assistant.updateAttentionCount(params.state.conversations);
    system.acpChatPanels.acpNavDidChange(params.state);
    if (system.assistant.isReady) {
      void system.assistant.rpc.acpNavDidChange(params);
    }
  });

  client.onNotification("poolside/jsonrpc/notify", (params: any) => {
    void system.acpChatPanels.routeInbound("poolside/jsonrpc/notify", params);
  });

  client.onNotification("poolside/acp/serverDidExit", (params: any) => {
    void system.acpChatPanels.routeInbound("poolside/acp/serverDidExit", params);
  });

  client.onNotification("poolside/acp/approvals/didChange", (params: any) => {
    void system.acpChatPanels.routeInbound("poolside/acp/approvals/didChange", params);
  });

  client.onNotification("poolside/mcpServers/didChange", (params: any) => {
    // Both the chat panels (live sessions to re-inject) and the sidebar (the
    // connectors UI) care about connector-store changes.
    void system.acpChatPanels.routeInbound("poolside/mcpServers/didChange", params);
    if (system.assistant.isReady) {
      void system.assistant.rpc.mcpServersDidChange();
    }
  });

  client.onRequest("poolside/jsonrpc/request", (params: any) => {
    return system.acpChatPanels.routeInbound("poolside/jsonrpc/request", params);
  });

  await client.start();
  return client;
}

let running: LanguageClient | undefined;
let starting: Promise<LanguageClient> | undefined;
export async function getHelperSingleton(system: System): Promise<LanguageClient> {
  if (running) {
    return running;
  }
  if (!starting) {
    starting = startHelper(system);
    starting.then(
      (client) => {
        running = client;
      },
      (err) => {
        system.telemetry.reportError(new Error("failed to start daemon", { cause: err }));
      },
    );
  }
  return await starting;
}

function helperBinary(system: System) {
  const { platform, arch } = _getValidHelperTarget();
  const suffix = platform === "windows" ? ".exe" : "";
  return path.join(
    system.context.extensionPath,
    "dist",
    `poolside-helper-${platform}-${arch}${suffix}`,
  );
}

// Based on /pkg/poolside-helper/handler/config.go#Config. The assistant is
// ACP-chat-only, so the legacy auth/apiUrl/completion-model fields are gone.
async function getRuntimeSettings() {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  return {
    agentServers: poolsideConfig.agentServers,
  };
}

/**
 * Notifies helper when configuration changes
 */
export async function updateHelperConfig(system: System) {
  try {
    const client = await getHelperSingleton(system);

    await client.sendRequest("workspace/didChangeConfiguration", {
      settings: {
        ...(await getRuntimeSettings()),
      },
    });
  } catch (e) {
    system.telemetry.reportError(
      new Error("failed to update config", {
        cause: e,
      }),
    );
  }
}

export function initializeHelperClient(system: System) {
  initializeHelperClientRPC({
    jsonrpcCall: async (method, params) => {
      const client = await getHelperSingleton(system);
      return await client.sendRequest(method, params);
    },
    jsonrpcNotify: async (method, params) => {
      const client = await getHelperSingleton(system);
      await client.sendNotification(method, params);
    },
  });
}
