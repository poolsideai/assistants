import type {
  PermissionOptionId,
  RequestPermissionRequest,
  RequestPermissionResponse,
  SessionId,
} from "@agentclientprotocol/sdk";
import { ACP_PERMISSION_OVERRIDE_RULES_META_KEY } from "../permissionMeta";
import type { NotificationShowParams } from "./NotificationRepository.svelte";
import type { ACPPendingPermissionRequest, ACPSession } from "./Session.svelte";

const cancelledPermissionResponse: RequestPermissionResponse = {
  outcome: {
    outcome: "cancelled",
  },
};
interface ACPPermissionCoordinatorOptions {
  markWaitingForUser: (opts: NotificationShowParams) => void;
  clearWaitingForUser: (sessionId: SessionId, agentServer: string) => void;
  publish: () => void;
  // Storage for requests whose session has no live record on this surface
  // (e.g. a broadcast permission prompt reaching a phone that never opened
  // the conversation). Owned by the session repository so it can be reactive.
  getUnbound: () => ACPPendingPermissionRequest[];
  setUnbound: (requests: ACPPendingPermissionRequest[]) => void;
}

export class ACPPermissionCoordinator {
  private requestCounter = 0;
  private resolvers = new Map<string, (response: RequestPermissionResponse) => void>();

  constructor(private options: ACPPermissionCoordinatorOptions) {}

  requestPermission(opts: {
    agentServer: string;
    params?: RequestPermissionRequest;
    session: ACPSession | null;
  }): Promise<RequestPermissionResponse> {
    if (!opts.params || opts.params.options.length === 0) {
      return Promise.resolve(cancelledPermissionResponse);
    }

    const params = opts.params;
    const session = opts.session;
    const id = `permission-${++this.requestCounter}`;
    const pendingRequest: ACPPendingPermissionRequest = {
      id,
      agentServer: opts.agentServer,
      sessionId: params.sessionId,
      toolCall: params.toolCall,
      options: params.options,
    };

    return new Promise((resolve) => {
      this.resolvers.set(id, resolve);
      if (session) {
        session.pendingPermissionRequests = [...session.pendingPermissionRequests, pendingRequest];
      } else {
        // No live session on this surface (broadcast prompt for a conversation
        // that is not open here). Hold the request instead of resolving it
        // cancelled: an instant "cancelled" would win the helper's
        // first-response-wins broadcast and kill the prompt on every surface.
        this.options.setUnbound([...this.options.getUnbound(), pendingRequest]);
      }
      this.options.markWaitingForUser({
        type: "approval",
        sessionId: params.sessionId,
        agentServer: opts.agentServer,
        toolCall: params.toolCall,
      });
      this.options.publish();
    });
  }

  addDebugPermissionRequest(opts: {
    agentServer: string;
    sessionId: SessionId;
    params: RequestPermissionRequest;
    session: ACPSession | null;
  }): void {
    if (!opts.session || !opts.params.toolCall || !Array.isArray(opts.params.options)) return;

    const requestId = `dump:${this.requestCounter++}`;
    opts.session.pendingPermissionRequests = [
      ...opts.session.pendingPermissionRequests,
      {
        id: requestId,
        agentServer: opts.agentServer,
        sessionId: opts.sessionId,
        toolCall: opts.params.toolCall,
        options: opts.params.options,
      },
    ];
    this.options.publish();
  }

  clearDebugPermissionRequests(opts: {
    sessionId: SessionId;
    agentServer: string;
    sessions: Iterable<ACPSession>;
  }): void {
    const sessions = Array.from(opts.sessions);
    let changed = false;
    for (const session of sessions) {
      const nextRequests = session.pendingPermissionRequests.filter(
        (request) =>
          request.sessionId !== opts.sessionId || request.agentServer !== opts.agentServer,
      );
      if (nextRequests.length !== session.pendingPermissionRequests.length) {
        session.pendingPermissionRequests = nextRequests;
        changed = true;
      }
    }
    if (changed) this.options.publish();
  }

  selectPermissionOption(
    requestId: string,
    optionId: PermissionOptionId,
    overrideRules: string[] | undefined,
    sessions: Iterable<ACPSession>,
  ): void {
    const sessionList = Array.from(sessions);
    const request = this.findPendingRequest(requestId, sessionList);
    if (!request || !request.options.some((option) => option.optionId === optionId)) {
      return;
    }

    this.resolvePermissionRequest(
      requestId,
      {
        outcome: {
          outcome: "selected",
          optionId,
          ...(overrideRules && overrideRules.length > 0
            ? { _meta: { [ACP_PERMISSION_OVERRIDE_RULES_META_KEY]: overrideRules } }
            : {}),
        },
      },
      sessionList,
    );
  }

  cancelPermissionRequests(
    sessionId: SessionId,
    agentServer: string | undefined,
    sessions: Iterable<ACPSession>,
  ): void {
    const sessionList = Array.from(sessions);
    const matchingIds = new Set<string>();
    const matches = (request: ACPPendingPermissionRequest) =>
      request.sessionId === sessionId && (!agentServer || request.agentServer === agentServer);
    for (const session of sessionList) {
      for (const request of session.pendingPermissionRequests) {
        if (matches(request)) {
          matchingIds.add(request.id);
        }
      }
    }
    for (const request of this.options.getUnbound()) {
      if (matches(request)) {
        matchingIds.add(request.id);
      }
    }

    for (const requestId of matchingIds) {
      this.resolvePermissionRequest(requestId, cancelledPermissionResponse, sessionList);
    }
  }

  /**
   * Resolve (as cancelled) the request for a specific tool call, wherever it
   * lives on this surface — a live session or the held unbound list. Used when
   * another surface has already answered a broadcast prompt, so this surface's
   * now-dead card must come down. Matches on the identity every surface shares.
   */
  resolveByToolCall(
    sessionId: SessionId,
    agentServer: string,
    toolCallId: string,
    sessions: Iterable<ACPSession>,
  ): void {
    const sessionList = Array.from(sessions);
    const matchingIds = new Set<string>();
    const matches = (request: ACPPendingPermissionRequest) =>
      request.sessionId === sessionId &&
      request.agentServer === agentServer &&
      request.toolCall.toolCallId === toolCallId;
    for (const session of sessionList) {
      for (const request of session.pendingPermissionRequests) {
        if (matches(request)) matchingIds.add(request.id);
      }
    }
    for (const request of this.options.getUnbound()) {
      if (matches(request)) matchingIds.add(request.id);
    }
    for (const requestId of matchingIds) {
      this.resolvePermissionRequest(requestId, cancelledPermissionResponse, sessionList);
    }
  }

  private findPendingRequest(
    requestId: string,
    sessions: Iterable<ACPSession>,
  ): ACPPendingPermissionRequest | undefined {
    for (const session of sessions) {
      const request = session.pendingPermissionRequests.find(({ id }) => id === requestId);
      if (request) return request;
    }
    return this.options.getUnbound().find(({ id }) => id === requestId);
  }

  private resolvePermissionRequest(
    requestId: string,
    response: RequestPermissionResponse,
    sessions: Iterable<ACPSession>,
  ): void {
    const resolve = this.resolvers.get(requestId);
    if (!resolve) return;

    this.resolvers.delete(requestId);
    this.removePendingRequest(requestId, sessions);
    resolve(response);
  }

  private removePendingRequest(requestId: string, sessions: Iterable<ACPSession>): void {
    let changed = false;
    for (const session of sessions) {
      const request = session.pendingPermissionRequests.find(({ id }) => id === requestId);
      const nextRequests = session.pendingPermissionRequests.filter(({ id }) => id !== requestId);
      if (nextRequests.length !== session.pendingPermissionRequests.length) {
        if (request) {
          this.options.clearWaitingForUser(request.sessionId, request.agentServer);
        }
        session.pendingPermissionRequests = nextRequests;
        changed = true;
      }
    }
    const unbound = this.options.getUnbound();
    const request = unbound.find(({ id }) => id === requestId);
    if (request) {
      this.options.clearWaitingForUser(request.sessionId, request.agentServer);
      this.options.setUnbound(unbound.filter(({ id }) => id !== requestId));
      changed = true;
    }
    if (changed) this.options.publish();
  }
}
