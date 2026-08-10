// Minimal JSON-RPC 2.0 client over a WebSocket, matching the wire format of
// the helper's remote access endpoint (one JSON object per text frame,
// bidirectional requests/notifications).

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export class RemoteRpcError extends Error {
  code: number;
  data?: unknown;

  constructor(err: JsonRpcError) {
    super(err.message);
    this.code = err.code;
    this.data = err.data;
  }
}

type Pending = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

export type NotificationHandler = (method: string, params: unknown) => void;
export type RequestHandler = (method: string, params: unknown) => Promise<unknown>;

export type WsRpcStatus = "connecting" | "open" | "closed";

// Rejection message for calls that were in flight when the socket dropped.
// Their responses are lost; idempotent callers re-issue on reconnect.
export const CONNECTION_LOST_MESSAGE = "connection to desktop lost";

export interface WsRpcOptions {
  // Resolves the WebSocket URL, fetching a fresh single-use auth ticket each
  // time (tickets expire quickly, so this runs before every connect attempt).
  resolveUrl: () => Promise<string>;
  onNotification: NotificationHandler;
  onRequest: RequestHandler;
  onStatusChange?: (status: WsRpcStatus) => void;
}

export class WsRpc {
  #ws: WebSocket | null = null;
  #nextId = 1;
  #pending = new Map<number, Pending>();
  // Frames queued while the socket is connecting; flushed on open. Without this
  // the UI's first RPC calls (which fire before the async ticket fetch + WS
  // handshake finish) would throw, and the repositories' retry-on-error would
  // spin a tight loop that starves the event loop so the socket never opens.
  #outbox: string[] = [];
  #opts: WsRpcOptions;
  #closed = false;
  #connecting = false;
  #backoffMs = 500;
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(opts: WsRpcOptions) {
    this.#opts = opts;
    void this.#connect();
  }

  get isOpen(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  // Reconnect immediately if disconnected, skipping any pending backoff wait.
  // Called on visibilitychange/pageshow/online — the events that signal iOS
  // gave us CPU back after killing the socket in the background.
  ensureConnected(): void {
    if (this.#closed || this.#connecting) return;
    const state = this.#ws?.readyState;
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;
    if (this.#reconnectTimer != null) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }
    this.#backoffMs = 500;
    void this.#connect();
  }

  // Drop the current socket (triggering the normal reconnect path). Used when
  // a liveness probe times out on a socket that still claims to be OPEN —
  // iOS can leave zombie sockets behind after backgrounding.
  forceReconnect(): void {
    if (this.#closed) return;
    if (this.#ws && this.#ws.readyState !== WebSocket.CLOSED) {
      this.#ws.close();
    } else {
      this.ensureConnected();
    }
  }

  #scheduleReconnect() {
    if (this.#closed || this.#reconnectTimer != null) return;
    // Half jitter: delay in [backoff/2, backoff), so a fleet of tabs/devices
    // doesn't stampede the helper the moment it comes back.
    const delay = this.#backoffMs / 2 + Math.random() * (this.#backoffMs / 2);
    this.#backoffMs = Math.min(this.#backoffMs * 2, 15_000);
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;
      void this.#connect();
    }, delay);
  }

  async #connect() {
    if (this.#closed || this.#connecting) return;
    this.#connecting = true;
    this.#opts.onStatusChange?.("connecting");

    let url: string;
    try {
      url = await this.#opts.resolveUrl();
    } catch {
      // Ticket fetch failed (e.g. session expired); back off and retry.
      this.#connecting = false;
      this.#opts.onStatusChange?.("closed");
      this.#scheduleReconnect();
      return;
    }
    if (this.#closed) {
      this.#connecting = false;
      return;
    }

    const ws = new WebSocket(url);
    this.#ws = ws;

    ws.onopen = () => {
      if (this.#ws !== ws) return;
      this.#connecting = false;
      this.#backoffMs = 500;
      this.#opts.onStatusChange?.("open");
      const queued = this.#outbox;
      this.#outbox = [];
      for (const frame of queued) ws.send(frame);
    };
    ws.onmessage = (event) => {
      void this.#handleMessage(event.data);
    };
    ws.onclose = () => {
      if (this.#ws !== ws) return;
      this.#ws = null;
      this.#connecting = false;
      // Reject in-flight calls (their responses are lost) and drop unsent
      // frames; callers re-issue, and those re-issued calls queue for the next
      // connection rather than throwing.
      this.#failPending(new Error(CONNECTION_LOST_MESSAGE));
      this.#outbox = [];
      this.#opts.onStatusChange?.("closed");
      this.#scheduleReconnect();
    };
  }

  close() {
    this.#closed = true;
    if (this.#reconnectTimer != null) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }
    this.#ws?.close();
  }

  #failPending(reason: Error) {
    for (const pending of this.#pending.values()) {
      pending.reject(reason);
    }
    this.#pending.clear();
  }

  async #handleMessage(data: unknown) {
    if (typeof data !== "string") return;
    let msg: any;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    // Response to one of our calls.
    if (!("method" in msg) && "id" in msg && msg.id != null) {
      const pending = this.#pending.get(msg.id);
      if (!pending) return;
      this.#pending.delete(msg.id);
      if ("error" in msg && msg.error) {
        pending.reject(new RemoteRpcError(msg.error));
      } else {
        pending.resolve(msg.result);
      }
      return;
    }

    // Server -> client request: dispatch and reply.
    if ("method" in msg && "id" in msg && msg.id != null) {
      try {
        const result = await this.#opts.onRequest(msg.method, msg.params);
        this.#send({ jsonrpc: "2.0", id: msg.id, result: result ?? null });
      } catch (error) {
        this.#send({
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32603, message: error instanceof Error ? error.message : String(error) },
        });
      }
      return;
    }

    // Server -> client notification.
    if ("method" in msg) {
      this.#opts.onNotification(msg.method, msg.params);
    }
  }

  // #send transmits immediately when the socket is open, otherwise queues the
  // frame to be flushed on the next open. It never throws, so callers awaiting
  // a response simply wait for the connection instead of erroring in a loop.
  #send(msg: object) {
    const frame = JSON.stringify(msg);
    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(frame);
    } else {
      this.#outbox.push(frame);
    }
  }

  call(method: string, params: unknown): Promise<unknown> {
    const id = this.#nextId++;
    const promise = new Promise<unknown>((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
    });
    this.#send({ jsonrpc: "2.0", id, method, params });
    return promise;
  }

  notify(method: string, params: unknown): void {
    this.#send({ jsonrpc: "2.0", method, params });
  }
}
