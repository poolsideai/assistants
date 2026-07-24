<script lang="ts" module>
  import type { SwitchRootProps } from "bits-ui";
  export type SwitchProps = SwitchRootProps;
</script>

<script lang="ts">
  import { Switch } from "bits-ui";

  let { class: className, checked = $bindable(false), ...rest }: SwitchProps = $props();
</script>

<Switch.Root
  bind:checked
  {...rest}
  class={[
    "group/switch inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors",
    "outline-hidden focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-psx-focus",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // The unchecked track must contrast with chrome surfaces in every theme;
    // psx-chrome IS the surface color, so use the secondary-button fill.
    "data-[state=checked]:bg-psx-button-primary-background data-[state=unchecked]:bg-psx-button-secondary-background",
    className,
  ]}
>
  <Switch.Thumb
    class={[
      "pointer-events-none block size-3.5 rounded-full bg-white shadow-sm transition-transform",
      "translate-x-0 group-data-[state=checked]/switch:translate-x-3.5",
    ]}
  />
</Switch.Root>
