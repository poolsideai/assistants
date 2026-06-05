<script lang="ts">
  interface Props {
    text: string;
  }

  let { text }: Props = $props();

  type Segment = { text: string; kind: "plain" | "bold" | "italic" };

  const segments = $derived.by((): Segment[] => {
    const out: Segment[] = [];
    // bold first so **text** wins over *text*
    const re = /\*\*([^*]+)\*\*|\*([^*\s][^*]*?)\*/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      if (match.index > last) {
        out.push({ text: text.slice(last, match.index), kind: "plain" });
      }
      if (match[1] !== undefined) {
        out.push({ text: match[1], kind: "bold" });
      } else {
        out.push({ text: match[2], kind: "italic" });
      }
      last = re.lastIndex;
    }
    if (last < text.length) {
      out.push({ text: text.slice(last), kind: "plain" });
    }
    return out;
  });
</script>

{#each segments as segment, i (i)}
  {#if segment.kind === "bold"}
    <strong>{segment.text}</strong>
  {:else if segment.kind === "italic"}
    <em>{segment.text}</em>
  {:else}
    {segment.text}
  {/if}
{/each}
