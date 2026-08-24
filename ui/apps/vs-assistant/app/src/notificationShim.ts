import { rpcHostRequestHandler } from "./vs-handlers";

// Replace the browser Notification API with a shim that forwards to the host, so
// notifications raised inside any webview surface through Visual Studio's
// notification UI. Shared by every webview entry (assistant sidebar, acp chat).
export function installNotificationShim(): void {
  class NotificationShim {
    static permission: NotificationPermission = "granted";

    static requestPermission(): Promise<NotificationPermission> {
      return Promise.resolve("granted");
    }

    constructor(title: string, options?: NotificationOptions) {
      rpcHostRequestHandler("showNotification", [title, options?.body ?? ""]);
    }

    close() {}
  }
  (window as any).Notification = NotificationShim;
}
