<script lang="ts">
  import Separator from "../../separator/Separator.svelte";
  import { getMenus } from "../context/prompt.js";

  interface Props {
    alwaysRender?: boolean;
  }

  let { alwaysRender }: Props = $props();

  const { search } = getMenus();

  let shouldRender = $derived(alwaysRender === true || !$search);

  /**
   * We use `hidden` instead of conditionally rendering because we want to maintain the
   * original list order when clearing the prompt.
   */
  let hidden = $derived(shouldRender ? undefined : true);
</script>

<Separator {hidden} />
