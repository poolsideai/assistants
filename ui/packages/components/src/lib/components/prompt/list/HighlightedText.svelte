<script lang="ts">
  import type { HighlightSegment } from "../utils/highlightMatch.js";

  let { segments }: { segments: readonly HighlightSegment[] } = $props();
</script>

<!--
  Renders match segments as text nodes. Titles and subtitles carry
  repository-controlled values (filenames, directories, workspace paths), so
  this must never go through `{@html}`.
-->
{#each segments as segment, index (index)}{#if segment.matched}<span data-state="matched"
      >{segment.text}</span
    >{:else}{segment.text}{/if}{/each}
