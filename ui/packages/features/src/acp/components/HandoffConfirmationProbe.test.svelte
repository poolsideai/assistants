<script lang="ts">
  // Test-only child: components inside HandoffConfirmationProvider receive
  // the confirmation controller via context, so this probe hands it out to
  // the test driving the dialog.
  import {
    getACPHandoffConfirmation,
    type ACPHandoffConfirmationController,
  } from "../features/HandoffConfirmationContext";

  interface Props {
    onController: (controller: ACPHandoffConfirmationController) => void;
  }

  let { onController }: Props = $props();

  onController(getACPHandoffConfirmation());
</script>
