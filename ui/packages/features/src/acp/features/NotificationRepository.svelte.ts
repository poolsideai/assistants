import type { SessionId, ToolCallUpdate, ToolKind } from "@agentclientprotocol/sdk";
import { createContext } from "svelte";

declare global {
  interface Window {
    notificationIconUri?: string;
  }
}

export interface Notifier {
  isSupported(): boolean;
  ensurePermission(): Promise<boolean>;
  send(opts: { title: string; body: string; onClick: () => void }): (() => void) | undefined;
}

const webNotifier: Notifier = {
  isSupported: () => "Notification" in window,
  async ensurePermission() {
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    return (await Notification.requestPermission()) === "granted";
  },
  send({ title, body, onClick }) {
    const n = new Notification(title, {
      body,
      icon: window.notificationIconUri,
      requireInteraction: true,
    });
    n.onclick = () => {
      onClick();
      n.close();
    };
    return () => n.close();
  },
};

type NoSetters<T> = { readonly [K in keyof T]: T[K] };

export type NotificationRepository = NoSetters<NotificationRepositoryWriter>;

function notificationKey(sessionId: string, agentServer: string): string {
  return `${sessionId}\0${agentServer}`;
}

export type NotificationType = "approval" | "elicitation" | "turn_completed";

export interface NotificationShowParams {
  type: NotificationType;
  sessionId: SessionId;
  agentServer: string;
  toolCall?: ToolCallUpdate;
}

function notificationBody(type: NotificationType, toolCall?: ToolCallUpdate): string {
  switch (type) {
    case "approval":
      return approvalAction(toolCall?.kind);
    case "elicitation":
      return "Input needed to continue";
    case "turn_completed":
      return "Agent finished responding";
  }
}

function approvalAction(kind: ToolKind | null | undefined): string {
  switch (kind) {
    case "read":
    case "search":
    case "fetch":
      return "Approval needed to read file";
    case "edit":
    case "delete":
    case "move":
      return "Approval needed to write to file";
    case "execute":
      return "Approval needed to run command";
    default:
      return "Approval needed to continue";
  }
}

export class NotificationRepositoryWriter {
  private active = new Map<string, (() => void) | undefined>();

  constructor(
    private showSession: (agentServer: string, sessionId: SessionId) => void,
    private getAgentName: (agentServer: string) => string,
    private notifyOnApproval: () => boolean,
    private isEditorFocused: () => boolean,
    private notifier: Notifier = webNotifier,
  ) {}

  async show({ type, sessionId, agentServer, toolCall }: NotificationShowParams): Promise<void> {
    if (!this.notifyOnApproval() || this.isEditorFocused()) {
      return;
    }

    const key = notificationKey(sessionId, agentServer);
    if (this.active.has(key)) {
      return;
    }

    if (!this.notifier.isSupported()) {
      return;
    }

    this.active.set(key, undefined);

    try {
      const granted = await this.notifier.ensurePermission();
      if (!this.active.has(key)) return;
      if (granted) {
        this.createNotification(type, sessionId, agentServer, toolCall);
      } else {
        this.active.delete(key);
      }
    } catch (e) {
      this.active.delete(key);
      console.error("Notification permission check failed", e);
    }
  }

  dismiss(sessionId: string, agentServer: string): void {
    const key = notificationKey(sessionId, agentServer);
    const close = this.active.get(key);
    this.active.delete(key);
    close?.();
  }

  createNotification(
    type: NotificationType,
    sessionId: SessionId,
    agentServer: string,
    toolCall?: ToolCallUpdate,
  ) {
    const key = notificationKey(sessionId, agentServer);
    try {
      const body = notificationBody(type, toolCall);
      const close = this.notifier.send({
        title: this.getAgentName(agentServer),
        body,
        onClick: () => {
          this.showSession(agentServer, sessionId);
          this.active.delete(key);
        },
      });
      if (this.active.has(key)) {
        this.active.set(key, close);
      } else {
        close?.();
      }
    } catch (e) {
      console.error("Failed to create notification", e);
      this.active.delete(key);
    }
  }

  publicAPI(): NotificationRepository {
    return this as NotificationRepository;
  }
}

const [getNotificationContext, setNotificationRepositoryContext] =
  createContext<NotificationRepository>();

export { getNotificationContext };

export function setNotificationContext(
  showSession: (agentServer: string, sessionId: SessionId) => void,
  resolveAgentName: (agentServer: string) => string,
  notifyOnApproval: () => boolean,
  isEditorFocused: () => boolean,
  notifier?: Notifier,
): NotificationRepositoryWriter {
  const repo = new NotificationRepositoryWriter(
    showSession,
    resolveAgentName,
    notifyOnApproval,
    isEditorFocused,
    notifier,
  );
  setNotificationRepositoryContext(repo.publicAPI());
  return repo;
}
