__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { ContentBlock, ResourceLink, EmbeddedResource } from "@agentclientprotocol/sdk";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import FileSelection from "../../prompt/menus/context/FileSelection.svelte";
  import { partition } from "lodash";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type UserMessageContextItem =
    | (ResourceLink & { type: "resource_link" })
    | (EmbeddedResource & { type: "resource" });

  function getURI(item: UserMessageContextItem): string {
    return item.type === "resource" ? item.resource.uri : item.uri;
  }

  function getFileLabel(item: UserMessageContextItem): string {
    return item.type === "resource"
      ? getFilenameFromPath(item.resource.uri) || "Untitled"
      : (item.title ?? item.name ?? getFilenameFromPath(item.uri) ?? "Untitled");
  }

  function getTitle(item: UserMessageContextItem): string {
    return item.type === "resource" ? getURI(item) : (item.title ?? item.name ?? getURI(item));
  }

  function getSelectedLines(item: UserMessageContextItem):
    | {
        startLine?: number;
        endLine?: number;
      }
    | undefined {
    const meta = item.type === "resource" ? item.resource._meta : item._meta;
    return meta?.selection as { startLine?: number; endLine?: number } | undefined;
  }

  function isLink(item: UserMessageContextItem): boolean {
    if (item.type === "resource_link") {
      return /^https?:\/\//i.test(item.uri);
    }
    if (item.type === "resource") {
      return /^https?:\/\//i.test(item.resource.uri);
    }
    return false;
  }
  function isRecentFile(item: UserMessageContextItem): boolean {
    if (item.type === "resource_link") {
      return item._meta?.recent === true;
    }
    if (item.type === "resource") {
      return item.resource._meta?.recent === true;
    }
    return false;
  }

  function isActiveFile(item: UserMessageContextItem): boolean {
    if (item.type === "resource_link") {
      return item._meta?.active === true;
    }
    if (item.type === "resource") {
      return item.resource._meta?.active === true;
    }
    return false;
  }

  const { hasResources, urlLinks, recentFiles, activeFiles, attachedFiles } = $derived.by(() => {
    const resources: UserMessageContextItem[] = blocks.filter(
      (b) => b.type === "resource" || b.type === "resource_link",
    );

    const [urlLinks, fileLinks] = partition(resources, (block) => isLink(block));
    const [recentFiles, nonRecentFiles] = partition([...fileLinks], (block) => isRecentFile(block));
    const [activeFiles, attachedFiles] = partition(nonRecentFiles, (block) => isActiveFile(block));
    const hasResources = resources.length > 0;
    return { hasResources, urlLinks, recentFiles, activeFiles, attachedFiles };
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#snippet fileRow(item: UserMessageContextItem)}
  {@const uri = getURI(item)}
  {@const label = getFileLabel(item)}
  {@const selectedLines = getSelectedLines(item)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    data-cursor="link"
    class="text-psx-foreground-primary hover:text-psx-link active:outline-hidden group flex items-center gap-x-1 py-px text-left"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if selectedLines && selectedLines.startLine !== undefined && selectedLines.endLine !== undefined}
      <FileSelection selection={[selectedLines.startLine, selectedLines.endLine]} />
    {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#if hasResources}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    class={["relative -mt-2 flex w-full flex-col self-stretch", customUI ? "" : "-mx-4"]}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <div class={["relative -mb-px flex justify-end", customUI ? "mr-[18px]" : "mr-[20px]"]}>
      <svg
        width="20"
        height="11"
        viewBox="0 0 20 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="9.89948"
          y="3.29289"
          width="15"
          height="15"
          transform="rotate(45 9.89948 3.29289)"
          fill="var(--psx-editor-background)"
          stroke="var(--psx-border)"
        />
      </svg>
    </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "border-psx-border from-psx-editor-background flex w-full flex-col justify-end border-t bg-gradient-to-b to-transparent text-left",
        customUI ? "bubble px-3.5 pb-2 pt-3" : "px-4 py-2.5",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {#if recentFiles.length > 0}
        <span class="title">Recently opened</span>
        {#each recentFiles as item, i (`recent-file-link-${i}`)}
          {@render fileRow(item)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {/if}

      {#if activeFiles.length > 0}
        <span class="title">Active Files</span>
        {#each activeFiles as item, i (`active-file-link-${i}`)}
          {@render fileRow(item)}
        {/each}
      {/if}

      {#if attachedFiles.length > 0}
        <span class="title">Included files</span>
        {#each attachedFiles as item, i (`file-link-${i}`)}
          {@render fileRow(item)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {#each urlLinks as item, i (`url-link-${i}`)}
          {@const uri = getURI(item)}
          {@const title = getTitle(item)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
            href={uri}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            <span class="truncate">{title}</span>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <hr class="border-psx-border mb-1 mt-2 border-t" />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
