type CallFn = (method: string, req: object) => Promise<any>;
type NotifyFn = (method: string, req: object) => Promise<void>;

type Initialize = Pick<Runtime, "jsonrpcNotify" | "jsonrpcCall">;

// Runtime is a singleton which is initialized with the implementation
class Runtime {
  jsonrpcCall: CallFn = (method, req) => this._call(method, req);
  jsonrpcNotify: NotifyFn = (method, req) => this._notify(method, req);

  _notify: NotifyFn = () => {
    throw Error("uninitialized");
  };
  _call: CallFn = () => {
    throw Error("uninitialized");
  };

  setImplementation = (runtime: Initialize) => {
    this._notify = runtime.jsonrpcNotify;
    this._call = runtime.jsonrpcCall;
  };
}

export const runtime = new Runtime();

export function toJsonrpcMethod(path: string): string {
  return path.slice(1);
}
