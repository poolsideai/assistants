// Navigation contract between the mobile shell and a URL-owning host (the
// mobile web app). The host maps routes onto real history entries so the
// platform back button (Android system back, browser back/swipe) pops pages
// like a native app: the shell reports its own navigation through
// routeChanged and applies externally popped routes delivered via onPopRoute.

export type MobileView = "list" | "chat" | "settings" | "file";

export interface MobileRoute {
  view: MobileView;
  /** Conversation shown when view is "chat", or the one a "file" was opened from; null otherwise. */
  conversationId: string | null;
  /** Absolute path previewed when view is "file"; null/absent otherwise. */
  filePath?: string | null;
}

export interface MobileNavigation {
  /** Route the shell should restore on mount. */
  initialRoute: MobileRoute;
  /** Pop one page (in-app back buttons); the result arrives via onPopRoute. */
  back(): void;
  /** Report shell-initiated navigation so the host can sync the URL. */
  routeChanged(route: MobileRoute): void;
  /** Subscribe to routes popped outside the shell (native back/forward). Returns unsubscribe. */
  onPopRoute(handler: (route: MobileRoute) => void): () => void;
}
