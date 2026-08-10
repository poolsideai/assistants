<script lang="ts">
  import { Checkbox } from "@poolsideai/components/checkbox";
  import Icon from "@poolsideai/components/icon";
  import { slide } from "svelte/transition";
  import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
  } from "@poolsideai/components/collapsible";
  import type { Plan } from "@agentclientprotocol/sdk";

  interface Props {
    plan: Plan;
    isPrompting?: boolean;
    desktop?: boolean;
  }

  let { plan, isPrompting, desktop = false }: Props = $props();

  let dismissedPlanKey = $state<string | null>(null);
  let planKey = $derived(
    JSON.stringify(
      plan.entries.map((entry) => ({
        content: entry.content,
        priority: entry.priority,
        status: entry.status,
      })),
    ),
  );
  let isDismissed = $derived(dismissedPlanKey === planKey);

  let completedCount = $derived(
    plan.entries.filter((entry) => entry.status === "completed").length,
  );

  let entriesCount = $derived(plan.entries.length);
  let progressPercentage = $derived(entriesCount > 0 ? (completedCount / entriesCount) * 100 : 0);
  let currentEntry = $derived(
    plan.entries.find((entry) => entry.status === "in_progress") ??
      plan.entries.find((entry) => entry.status === "pending"),
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let isRunning = $derived(
    isPrompting && plan.entries.some((entry) => entry.status !== "completed"),
  );
</script>

{#snippet progress()}
  <div
    class="absolute -inset-x-px -bottom-px h-3 overflow-hidden rounded-b-[10px]"
    transition:slide={{ duration: 200 }}
  >
    <div class="absolute inset-x-0 bottom-0">
      <div class="relative isolate h-1 w-full overflow-hidden bg-black/5 dark:bg-white/5">
        <div
          class="bg-linear-to-r relative z-10 h-1 from-[#6670fedd] to-[#6670fe] transition-all duration-300 ease-out dark:from-[#7185f8dd] dark:to-[#7185f8]"
          style="width: {progressPercentage}%"
        ></div>
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
      </div>
    </div>
  </div>
{/snippet}

{#if !isDismissed}
  <div class="relative">
    <Collapsible
      open
      data-session-plan
      class={[
        "flex flex-col gap-1.5 rounded-lg p-2 px-2.5 outline-[length:var(--psx-hairline,1px)] outline-black/10 dark:outline-white/15",
        desktop ? "desktop-tinted-glass backdrop-blur-sm" : "bg-psx-menu-hover-background",
      ]}
    >
      <div class="flex justify-between gap-1.5">
        <CollapsibleTrigger appearance="plain" class="min-w-0 grow justify-start">
          <CollapsibleIndicator />
          {#if isRunning}
            <span class="translate-y-0.5">
              <Icon name="roundel" size={14} aria-hidden="true" />
            </span>
            <span
              class="flex min-w-0 flex-1 items-center gap-1 truncate"
              title={currentEntry?.content
                ? `Working on ${currentEntry.content}`
                : "Working on plan"}
            >
              <span class="opacity-75">Working on</span>
              <span class="min-w-0 truncate font-medium">{currentEntry?.content ?? ""}</span>
            </span>
          {:else}
            <span class="translate-y-0.5">
              <Icon name="roundel" size={14} aria-hidden="true" />
            </span>

            Completed {completedCount} of {entriesCount} step{entriesCount === 1 ? "" : "s"}
          {/if}
        </CollapsibleTrigger>

        {#if isRunning}
          <span class="whitespace-nowrap text-sm opacity-75">
            {completedCount} of {entriesCount} steps
          </span>
        {/if}

        <button
          type="button"
          aria-label="Dismiss todo list"
          title="Dismiss Todo List"
          class="text-psx-icon hover:bg-psx-chrome-hover flex size-5 shrink-0 items-center justify-center rounded opacity-70 transition-colors hover:opacity-100"
          onclick={() => {
            dismissedPlanKey = planKey;
          }}
        >
          <Icon name="cross" size={12} />
        </button>
      </div>

      <CollapsibleContent class="flex flex-col gap-1 pb-1">
        {#each plan.entries as entry (`${entry.content}-${entry.priority}-${entry.status}`)}
          <div
            class={[
              "pointer-events-none flex items-start gap-2 leading-tight",
__POOL_SYNTHETIC_IMPORT_BASELINE__
            ]}
          >
            <div class="mt-0.5">
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
            </div>
            <span class:line-through={entry.status === "completed"}>
              {entry.content}
            </span>
          </div>
        {/each}
      </CollapsibleContent>
    </Collapsible>

    {#if isRunning}
      {@render progress()}
    {/if}
  </div>
{/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  :global(.desktop-tinted-glass) {
    background: color-mix(in srgb, var(--psx-menu-hover-background) 70%, transparent);
  }

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
