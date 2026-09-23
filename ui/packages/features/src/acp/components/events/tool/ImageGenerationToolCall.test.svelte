<script lang="ts">
  import { EnvironmentProvider, LogProvider } from "@poolsideai/components/providers";
  import type { WorkspaceFolder } from "@poolsideai/rpc";
  import type { ToolCall } from "../../../types";
  import ToolCallComponent from "../ToolCall.svelte";

  interface Props {
    event: ToolCall;
    workspaceFolders?: WorkspaceFolder[];
  }

  let { event, workspaceFolders = [] }: Props = $props();
</script>

<EnvironmentProvider name="test">
  <LogProvider onInfo={() => {}} onError={() => {}}>
    <ToolCallComponent {event} {workspaceFolders} />
  </LogProvider>
</EnvironmentProvider>
