<script lang="ts">
  import type { ContentBlock } from "@agentclientprotocol/sdk";
  import ImageBlock from "./ImageBlock.svelte";
  import ResourceBlock from "./ResourceBlock.svelte";
  import ResourceLinkBlock from "./ResourceLinkBlock.svelte";
  import TextBlock from "./TextBlock.svelte";
  import type { WorkspaceFolder } from "@poolsideai/rpc";

  interface Props {
    content?: ContentBlock[];
    isUser?: boolean;
    allowVisualizations?: boolean;
    streaming?: boolean;
    scrollElement?: HTMLElement;
    workspaceFolders?: WorkspaceFolder[];
  }

  let {
    content = [],
    isUser = false,
    allowVisualizations = false,
    streaming = false,
    scrollElement,
    workspaceFolders = [],
  }: Props = $props();
</script>

{#each content as block, i (`${block.type}-${i}`)}
  {#if block.type === "text"}
    <TextBlock {...block} {isUser} {allowVisualizations} {streaming} {scrollElement} />
  {:else if block.type === "image"}
    <ImageBlock {...block} {workspaceFolders} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <ResourceLinkBlock {...block} {workspaceFolders} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <ResourceBlock {...block} />
  {/if}
{/each}
