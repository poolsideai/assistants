<script lang="ts">
  import { getOptionalACPConnectionPoolContext } from "../../connectionPoolContext";
  import { MAX_ACP_DEBUG_LOG_BYTES_PER_AGENT } from "../../debugDump";
  import ConfirmationDialog from "../ui/ConfirmationDialog.svelte";
  import type { ACPLogCaptureTarget } from "./acpLogCapture";

  interface Props {
    target: ACPLogCaptureTarget;
    onClose: () => void;
  }

  let { target, onClose }: Props = $props();
  const connectionPool = getOptionalACPConnectionPoolContext();
  const memoryLimitMb = MAX_ACP_DEBUG_LOG_BYTES_PER_AGENT / (1024 * 1024);

  function enableCollection() {
    const capture = connectionPool?.debug?.capture;
    if (!capture) throw new Error("ACP event collection is unavailable");
    capture.setConversationCollecting(
      target.agentServer,
      target.conversationId,
      target.sessionId,
      true,
    );
    onClose();
  }
</script>

<ConfirmationDialog
  title="Collect ACP events?"
  description={`Collect new ACP events for this conversation until the app quits. Warning: collection increases memory use and may retain up to ${memoryLimitMb} MB per agent.`}
  confirmLabel="Collect Events"
  onCancel={onClose}
  onConfirm={enableCollection}
/>
