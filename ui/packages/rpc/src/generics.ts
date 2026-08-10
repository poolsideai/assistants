type anyFunction = (...args: any) => any;

/**
 * Client is the interface which should be implemented to respond to messages from the host process
 */
export type Client<T> = {
  [Property in keyof T]: T[Property] extends anyFunction
    ? (
        ...req: Parameters<T[Property]>
      ) => ReturnType<T[Property]> extends Promise<any>
        ? ReturnType<T[Property]>
        : Promise<ReturnType<T[Property]>>
    : never;
};

/**
 * Messages is the list of RPC messages that can be sent by the Client
 */
export type Messages<T> = {
  [Command in keyof T]: T[Command] extends anyFunction
    ? {
        command: Command;
        payload: Parameters<T[Command]>;
        requestId: string;
      }
    : never;
};

/**
 * Responses is the list of RPC responses that can be returned to the Client
 */
export type Responses<T> = {
  [Command in keyof T]: T[Command] extends anyFunction
    ? {
        command: Command;
        payload: {
          response: ReturnType<T[Command]>;
          requestId: string;
        };
      }
    : never;
};

interface hasCommand {
  command: string;
}

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
export function isUserConfigInvalidError(e: unknown): e is RPCError & { code: number } {
  return isRPCError(e) && "code" in e && e.code === 1423;
}

/**
 * Error is returned to a RPC request when an error has happened
 */
export type Error<T extends hasCommand> = Pick<T, "command"> & {
  payload: {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    requestId: string;
  };
};
