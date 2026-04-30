<script lang="ts">
  import { Button } from "../button/index.js";

  let mouse = $state({ x: 0, y: 0 });
</script>

<svelte:window
  onmousemove={(e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }}
/>

<p>{mouse.x}x{mouse.y}</p>

<Button
  onclick={() => {
    // @ts-ignore-error
    mouse = null;
  }}
>
  Don't click this button
</Button>
