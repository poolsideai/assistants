<script lang="ts">
  import "prosemirror-view/style/prosemirror.css";
  import { type Command, type EditorState } from "prosemirror-state";
  import type { DirectEditorProps } from "prosemirror-view";
  import { EditorView } from "prosemirror-view";
  import type { ActionReturn } from "svelte/action";
  import type { Except } from "type-fest";
  import { isDocEmpty } from "./utils/isDocEmpty.js";

  export interface EditorProps extends DirectEditorProps {}

  interface Props extends Except<EditorProps, "dispatchTransaction"> {
    isDefault?: boolean;
    isComposing?: boolean;
    onUpdate?: (state: EditorState) => void;
  }

  let {
    isDefault = $bindable(true),
    isComposing = $bindable(),
    state: editorState,
    attributes,
    editable,
    onUpdate,
    handleDOMEvents,
    ...rest
  }: Props = $props();

  let view = $state<EditorView>();

  // Composition state must be tracked from the DOM events, not only from
  // transaction snapshots: a composition can end without ProseMirror
  // dispatching a transaction (e.g. macOS predictive text cancelled by a
  // caret move), and a snapshot-only `isComposing` then stays stale-true
  // until some unrelated transaction happens to resync it.
  // `compositionstart`/`compositionend` always fire in pairs, so they keep
  // the flag honest; `dispatchTransaction` below still resyncs it as a
  // fallback.
  const compositionHandlers: NonNullable<EditorProps["handleDOMEvents"]> = {
    compositionstart: (view, event) => {
      isComposing = true;
      return handleDOMEvents?.compositionstart?.(view, event) ?? false;
    },
    compositionupdate: (view, event) => {
      isComposing = true;
      return handleDOMEvents?.compositionupdate?.(view, event) ?? false;
    },
    compositionend: (view, event) => {
      isComposing = false;
      return handleDOMEvents?.compositionend?.(view, event) ?? false;
    },
  };

  export function executeCommand(command: Command) {
    if (!view) return false;
    return command(view.state, view.dispatch, view);
  }

  export function hasFocus() {
    return view?.hasFocus() ?? false;
  }

  export function focus() {
    view?.focus();
  }

  const dispatchTransaction: EditorProps["dispatchTransaction"] = (tr) => {
    if (!view) return;
    const newState = view.state.apply(tr);
    view.updateState(newState);
    isDefault = isDocEmpty(newState);
    isComposing = view.composing;
    onUpdate?.(newState);
  };

  function editor(node: HTMLElement, initialState: EditorState) {
    view = new EditorView(
      { mount: node },
      {
        state: initialState,
        dispatchTransaction,
        editable,
        handleDOMEvents: { ...handleDOMEvents, ...compositionHandlers },
        ...rest,
      },
    );

    return {
      update: (newState) => {
        view?.updateState(newState);
      },
      destroy: () => {
        view?.destroy();
        view = undefined;
      },
    } satisfies ActionReturn<EditorState>;
  }

  $effect.pre(() => {
    if (view && attributes) {
      view.setProps({ attributes });
    }
  });

  $effect.pre(() => {
    if (view && editable) {
      view.setProps({ editable });
    }
  });
</script>

<div use:editor={editorState}></div>

<style>
  :global {
    .ProseMirror-selectednode {
      outline: none !important;
    }
  }
</style>
