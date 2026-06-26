import type { DebugRPCHandler } from "./debugRPC.js";

interface ACPDebugAPI {
  dumpJSON(agentServer?: string): string;
  load(entries: string, agentServer?: string): Promise<void>;
  restartServer(agentServer?: string): Promise<void>;
}

export const ACP_DEBUG_RPC_METHODS = {
  dumpJSON: "acp.dumpJSON",
  loadDump: "acp.loadDump",
  restartServer: "acp.restartServer",
} as const;

export function acpDebugRPCHandlers(debug: ACPDebugAPI): Record<string, DebugRPCHandler> {
  return {
    [ACP_DEBUG_RPC_METHODS.dumpJSON]: (params) => debug.dumpJSON(agentServerParam(params)),
    [ACP_DEBUG_RPC_METHODS.loadDump]: (params) => {
      const { entries, agentServer } = loadDumpParams(params);
      return debug.load(entries, agentServer);
    },
    [ACP_DEBUG_RPC_METHODS.restartServer]: (params) =>
      debug.restartServer(agentServerParam(params)),
  };
}

function agentServerParam(params: unknown): string | undefined {
  return typeof params === "object" &&
    params !== null &&
    typeof (params as { agentServer?: unknown }).agentServer === "string"
    ? (params as { agentServer: string }).agentServer
    : undefined;
}

function loadDumpParams(params: unknown): { entries: string; agentServer?: string } {
  if (
    typeof params !== "object" ||
    params === null ||
    typeof (params as { entries?: unknown }).entries !== "string"
  ) {
    throw new Error("acp.loadDump requires string entries");
  }

  return {
    entries: (params as { entries: string }).entries,
    agentServer: agentServerParam(params),
  };
}
