import { initializeStatefulModule as initializeHelperClientRPC } from "@poolsideai/helperapi";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ACPNavDidChangeParams,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import path from "path";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  LanguageClient,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  TransportKind,
} from "vscode-languageclient/node";
import { getPoolsideConfig } from "./configuration";
import { getExtensionIdentity } from "./extensionIdentity";
import { _getValidHelperTarget } from "./helperUtils";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

/**
 * start launches an instance of the poolside-helper binary and initializes communication via stdio.
 */
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const { context } = system;
  const identity = getExtensionIdentity();

__POOL_SYNTHETIC_IMPORT_BASELINE__
    command: "go",
__POOL_SYNTHETIC_IMPORT_BASELINE__
    transport: TransportKind.stdio,
    options: {
      cwd: context.asAbsolutePath("../../../"),
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
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

__POOL_SYNTHETIC_IMPORT_BASELINE__

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
    outputChannelName: identity.helperOutputChannelName,
  };
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Set the following option in your settings.json to enable LSP tracing in the helper:
  //
  //     "poolsideHelper.trace.server": "verbose",
  if (vscode.workspace.getConfiguration("poolsideHelper").get("trace.server")) {
    clientOptions.traceOutputChannel = vscode.window.createOutputChannel(
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
  client.onNotification("poolside/acpNav/didChange", (params: ACPNavDidChangeParams) => {
    system.assistant.updateAttentionCount(params.state.conversations);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (system.assistant.isReady) {
      void system.assistant.rpc.acpNavDidChange(params);
    }
  });

  client.onNotification("poolside/jsonrpc/notify", (params: any) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  client.onNotification("poolside/acp/serverDidExit", (params: any) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });

  await client.start();
  return client;
}

let running: LanguageClient | undefined;
let starting: Promise<LanguageClient> | undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if (running) {
    return running;
  }
  if (!starting) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    starting.then(
      (client) => {
        running = client;
      },
      (err) => {
        system.telemetry.reportError(new Error("failed to start daemon", { cause: err }));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  }
  return await starting;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  const { platform, arch } = _getValidHelperTarget();
  const suffix = platform === "windows" ? ".exe" : "";
  return path.join(
    system.context.extensionPath,
    "dist",
    `poolside-helper-${platform}-${arch}${suffix}`,
  );
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
async function getRuntimeSettings() {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  return {
    agentServers: poolsideConfig.agentServers,
  };
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Notifies helper when configuration changes
 */
__POOL_SYNTHETIC_IMPORT_BASELINE__
  try {
__POOL_SYNTHETIC_IMPORT_BASELINE__

    await client.sendRequest("workspace/didChangeConfiguration", {
      settings: {
        ...(await getRuntimeSettings()),
      },
    });
  } catch (e) {
    system.telemetry.reportError(
      new Error("failed to update config", {
        cause: e,
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
