<script lang="ts">
  import type { Except } from "type-fest";
  import { getMenus, getPrompt } from "../context/prompt.js";
  import BaseAction, { type ActionBaseProps } from "./BaseAction.svelte";
  import type { Snippet } from "svelte";
  import { getFilesystem } from "../../../providers/index.js";

  interface Props extends Except<ActionBaseProps, "icon"> {
    path: string;
    onOpen?: (path: string) => void;
    children?: Snippet;
  }

  let { path, onOpen, children, ...rest }: Props = $props();

  const { clear } = getPrompt();
  const { close } = getMenus();
  const filesystem = getFilesystem();
</script>

<BaseAction
  {...rest}
  type="open-file"
  icon="file-go"
  onAction={() => {
    filesystem.open(path);
    close();
    clear();
    onOpen?.(path);
  }}
>
  {@render children?.()}
</BaseAction>
