import { currentACPHostState } from "../../hostAdapter";
import { rpc, type RPCClient } from "../../hostRpc";

export interface NativeConfirmationRequest {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
}

export interface NativeErrorRequest {
  title: string;
  message: string;
}

export type NativeConfirmationRPC = RPCClient & {
  showNativeConfirmDialog(request: NativeConfirmationRequest): Promise<boolean>;
  showNativeErrorDialog(request: NativeErrorRequest): Promise<void>;
};

/**
 * The host RPC for native OS confirmation dialogs, or undefined when the host
 * does not provide them (IDEs, mobile) and the DOM modal should render
 * instead. See `ConfirmationDialog.svelte` for the single entry point.
 */
export function nativeConfirmationRpc(): NativeConfirmationRPC | undefined {
  if (!currentACPHostState().environment.capabilities.nativeConfirmDialog) return undefined;
  return rpc as NativeConfirmationRPC;
}
