<script lang="ts">
  import type { ToolActivityMode } from "./SessionEventsState.svelte";

  interface Props {
    disabled?: boolean;
    value: ToolActivityMode;
    onChange?: (value: ToolActivityMode) => void;
  }

  type PreviewRow = { width: number; group?: boolean; active?: boolean };

  // Each option renders a miniature transcript: plain bars are tool rows, a
  // leading pill marks a collapsed ••• summary line, and the pulsing dot is
  // the tool that is currently running.
  const OPTIONS: Array<{
    value: ToolActivityMode;
    label: string;
    sub: string;
    rows: PreviewRow[];
  }> = [
    {
      value: "detailed",
      label: "Detailed",
      sub: "Every step, as it happens",
      rows: [{ width: 74 }, { width: 60 }, { width: 82 }, { width: 50, active: true }],
    },
    {
      value: "grouped",
      label: "Grouped",
      sub: "Group tools, show agent messages",
      rows: [
        { width: 58, group: true },
        { width: 46, group: true },
        { width: 66, active: true },
      ],
    },
    {
      value: "compact",
      label: "Compact",
      sub: "Only show the current step",
      rows: [
        { width: 70, group: true },
        { width: 52, active: true },
      ],
    },
  ];

  let { disabled = false, value = $bindable(), onChange }: Props = $props();
</script>

<div
  class="grid w-full max-w-[360px] grid-cols-3 gap-2"
  role="radiogroup"
  aria-label="Tool activity"
>
  {#each OPTIONS as option (option.value)}
    <label
      class={[
        "border-psx-border bg-psx-input-background text-psx-foreground-secondary flex cursor-pointer flex-col gap-1.5 rounded-md border p-2 transition-colors",
        "hover:text-psx-foreground-primary has-[:checked]:border-psx-focus has-[:checked]:text-psx-foreground-primary",
        "has-[:focus-visible]:outline-psx-focus has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
        disabled && "pointer-events-none opacity-60",
      ]}
    >
      <input
        class="sr-only"
        type="radio"
        name="toolActivity"
        {disabled}
        value={option.value}
        bind:group={value}
        onchange={() => onChange?.(option.value)}
      />
      <span class="flex h-[46px] flex-col justify-center gap-[5px]" aria-hidden="true">
        {#each option.rows as row, index (index)}
          <span class="flex items-center gap-1">
            {#if row.group}
              <span class="h-[3px] w-2 shrink-0 rounded-full bg-current opacity-80"></span>
            {/if}
            {#if row.active}
              <span
                class="bg-psx-button-primary-background size-[5px] shrink-0 animate-pulse rounded-full motion-reduce:animate-none"
              ></span>
            {/if}
            <span class="h-[3px] rounded-full bg-current opacity-40" style={`width: ${row.width}%`}
            ></span>
          </span>
        {/each}
      </span>
      <span class="flex flex-col gap-0.5">
        <span class="text-center text-[11px]/[14px] text-current">{option.label}</span>
        <span class="text-psx-foreground-tertiary text-center text-[10px]/[13px]">
          {option.sub}
        </span>
      </span>
    </label>
  {/each}
</div>
