<script lang="ts">
  import {
    PoolsideButton as SharedPoolsideButton,
    type ButtonProps,
  } from "@poolsideai/components/assistant-ui";
  import { trackClick } from "../telemetry/interactions";

  let { children, prefix, suffix, trackClick: _trackClick, ...rest }: ButtonProps = $props();
</script>

<SharedPoolsideButton {...rest} {prefix} {suffix} {trackClick}>
  {@render children?.()}
</SharedPoolsideButton>
