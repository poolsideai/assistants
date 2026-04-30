<script lang="ts">
  import type { Snippet } from "svelte";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
  import type { PathLike } from "../types/path.js";
  import { getBrowser } from "../../../providers/index.js";
  import { getPrompt } from "../context/prompt.js";

  interface Props extends ActionBaseProps {
    url: PathLike;
    onOpen?: (url: PathLike) => void;
    children?: Snippet;
  }

  let { url, onOpen, children, ...rest }: Props = $props();

  const { open } = getBrowser();
  const { reset } = getPrompt();
</script>

<BaseAction
  {...rest}
  type="open-in-browser"
  onAction={async () => {
    open(url);
    reset();
    onOpen?.(url);
  }}
>
  {@render children?.()}
</BaseAction>
