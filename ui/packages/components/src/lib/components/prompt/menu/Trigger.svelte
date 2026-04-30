<script lang="ts">
  import { tick } from "svelte";
  import { getMenu } from "../context/menu.js";
  import { getMenus, getPrompt, type Menu } from "../context/prompt.js";
  import { closeMatch } from "../../editor/index.js";
  import Button, { type ButtonProps } from "../../button/Button.svelte";

  interface Props extends ButtonProps {
    value?: Menu["value"];
  }

  let { value, children, onclick, ...rest }: Props = $props();

  const {
    editor,
    elements: { contentEl },
  } = getPrompt();

  const menu = getMenu();

  const { menu: currentMenu, open, close, get } = getMenus();

  let pressed = $state<boolean>();

  $effect(() => {
    if (pressed === false) close();
  });

  $effect(() => {
    if (!$currentMenu) {
      pressed = false;
    }
  });

  const click: ButtonProps["onclick"] = async (e) => {
    onclick?.(e);
    pressed = !pressed;
    if (!pressed) return;

    const targetMenu = value ? get(value) : menu;
    if (targetMenu) {
      $editor?.executeCommand((state, dispatch) => {
        const { tr } = state;
        dispatch?.(closeMatch(tr));
        return true;
      });
      if (targetMenu.id !== $currentMenu?.id) {
        open(targetMenu.id);
        await tick();
        $contentEl?.focus({ preventScroll: true });
      }
    }
  };
</script>

<Button {...rest} data-prompt-trigger data-state={pressed ? "open" : "closed"} onclick={click}>
  {@render children?.()}
</Button>
