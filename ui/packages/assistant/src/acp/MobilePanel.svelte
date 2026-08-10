<script lang="ts">
  import { onDestroy } from "svelte";

  import { installMobileViewportTracking } from "../lib/utils/mobileViewport";
  import { installPinchZoomBlocker } from "../lib/utils/pinchZoom";
  import type { MobileAppearance } from "./mobile/appearance";
  import type { MobileHostStatus } from "./mobile/hostStatus";
  import type { MobileNavigation } from "./mobile/navigation";
  import MobileShell from "./MobileShell.svelte";
  import RuntimeProviders from "./RuntimeProviders.svelte";
  import { CoreRuntime, type TargetProps } from "./runtime/CoreRuntime.svelte";

  interface Props extends TargetProps {
    // History-backed navigation for host surfaces with a URL (the mobile web
    // app): restores the route on mount, mirrors shell navigation into
    // history entries, and delivers native back/forward pops to the shell.
    navigation?: MobileNavigation;
    // Hands the host a resync function used after a transport reconnect: it
    // refreshes the conversation list and force-reloads the sessions whose
    // live event stream could not be resumed (their transcripts may be
    // missing messages).
    registerResync?: (
      resync: (staleSessions?: { agentServer: string; sessionId: string }[]) => void,
    ) => void;
    // Hands the host the shell's file-open handler, so the transport's
    // openFile host RPC can push the file viewer page.
    registerOpenFile?: (open: (path: string, line?: number) => void) => void;
    // Mobile-local appearance settings (theme); owned and persisted by the host.
    appearance?: MobileAppearance;
    // Name + liveness of the controlled desktop, shown in the list top bar.
    hostStatus?: MobileHostStatus;
  }

  const {
    navigation,
    registerResync,
    registerOpenFile,
    appearance,
    hostStatus,
    ...runtimeProps
  }: Props = $props();

  const core = new CoreRuntime({ target: "chat-only", ...runtimeProps });
  core.initialize();
  onDestroy(installPinchZoomBlocker());
  onDestroy(installMobileViewportTracking());
</script>

<RuntimeProviders runtime={core}>
  <MobileShell {core} {navigation} {registerResync} {registerOpenFile} {appearance} {hostStatus} />
</RuntimeProviders>
