export interface AgentSettingsOutput {
  readonly $schema?: string;
  allowCustomMCPServers: boolean;
  hasLocalMCPServers: boolean;
  localMCPServerNames: string[];
  mcpServers: MCPServerInputs[];
}

export interface InputVariable {
  description: string;
  name: string;
  value: string | null;
}

export type JSONRPCErrorCode = (typeof JSONRPCErrorCode)[keyof typeof JSONRPCErrorCode];

export const JSONRPCErrorCode = {
  Conflict: 1409,
  EntityInvalid: 1422,
  EntityNotFound: 1404,
  InternalError: 1500,
  UserConfigInvalid: 1423,
} as const;

export interface JSONRPCErrorData {
  entityNotFound?: unknown;
  userConfig?: unknown;
}

export interface MCPServerInputs {
  disabled: boolean;
  isAuthenticated: boolean;
  requiresOAuth: boolean;
  serverID: string;
  serverName: string;
  serverURL: string;
  variables: InputVariable[];
}
