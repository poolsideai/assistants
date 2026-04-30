<script lang="ts">
  import type { Snippet } from "svelte";
  import { type IconContext, setIconContext } from "./Icon.svelte";

  interface Props extends IconContext {
    children: Snippet;
  }

  let { getFileIcon, children }: Props = $props();

  setIconContext({ getFileIcon });
</script>

{@render children()}
