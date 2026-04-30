<script lang="ts">
  import { getClipboard } from "../../providers/index.js";
  import Button, { type ButtonProps } from "../button/Button.svelte";
  import { getClipboardContext } from "./Clipboard.svelte";

  type Props = ButtonProps;

  let { onclick, children, ...rest }: Props = $props();

  const clipboard = getClipboard();
  const context = getClipboardContext();

  const handleClick: Props["onclick"] = async (e) => {
    onclick?.(e);
    if (context.copied) return;
    try {
      await clipboard.write(context.value);
      context.copied = true;
      context.onCopy?.(context.value);
    } catch (e) {
      const error = new Error(`${e instanceof Error ? e.message : e}`, {
        cause: e,
      });
      context.onError?.(error);
    } finally {
      setTimeout(() => {
        context.copied = false;
      }, context.duration);
    }
  };
</script>

<Button
  aria-label={context.copied ? "copied to clipboard" : "copy to clipboard"}
  onclick={handleClick}
  {...rest}
>
  {@render children?.()}
</Button>
