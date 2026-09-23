<script lang="ts">
  import { EditorState } from "prosemirror-state";
  import { schema } from "../prompt/editor/schema.js";
  import Editor from "./Editor.svelte";

  let isComposing = $state(false);

  const editorState = EditorState.create({ schema });
</script>

<Editor bind:isComposing state={editorState} attributes={{ "data-testid": "editor" }} />
<div data-testid="composing">{String(isComposing)}</div>
