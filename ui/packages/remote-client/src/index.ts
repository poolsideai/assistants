// Public surface of the remote client. The mobile-remote app composes these;
// a future desktop-over-WebSocket host would reuse WsRpc + SessionStreamGate
// (and most of RemoteHost) with a different auth bootstrap — see README.md.

export {
  DEVICE_TOKEN_HANDOFF_PARAM,
  DEVICE_TOKEN_STORAGE_KEY,
  adoptHandoffDeviceToken,
  deviceTokenHandoffHash,
  recoverSession,
  type SessionRecovery,
} from "./deviceSession";
export {
  RemoteHost,
  type ConnectionStatus,
  type RemoteHostCallbacks,
  type StaleSession,
  type WebviewRPCListener,
} from "./remoteHost";
export { SessionStreamGate } from "./sessionStreamGate";
export { CONNECTION_LOST_MESSAGE, WsRpc, type WsRpcStatus } from "./wsRpc";
