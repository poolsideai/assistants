<script lang="ts">
  import type { Except } from "type-fest";
  import { getMenus } from "../context/prompt.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
  import type { Snippet } from "svelte";
  import { getClipboard } from "../../../providers/index.js";

  interface Props extends Except<ActionBaseProps, "icon"> {
    content: string;
    onCopy?: (content: string) => void;
    children?: Snippet;
  }

  let { content, onCopy, children, ...rest }: Props = $props();

  const { close } = getMenus();
  const { write } = getClipboard();
</script>

<BaseAction
  {...rest}
  type="write-to-clipboard"
  icon="copy"
  onAction={async () => {
    write(content);
    close();
    onCopy?.(content);
  }}
>
  {@render children?.()}
</BaseAction>
