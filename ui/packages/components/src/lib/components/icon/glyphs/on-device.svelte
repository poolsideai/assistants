<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M3.66667 12.3334V13.3334C3.66667 13.8856 4.11438 14.3334 4.66667 14.3334H12.3333C12.8856 14.3334 13.3333 13.8856 13.3333 13.3334V12.3334M3.66667 12.3334H13.3333M3.66667 12.3334C3.29848 12.3334 3 12.0349 3 11.6667V9M13.3333 12.3334C13.7015 12.3334 14 12.0349 14 11.6667V2.66669C14 2.1144 13.5523 1.66669 13 1.66669H9M10 10.3334H12M8 3.5H12.5V8.5H4.5V8"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M5.22223 1.55551L5.66668 0.666626L6.11112 1.55551L7.00001 1.99996L6.11112 2.4444L5.66668 3.33329L5.22223 2.4444L4.33334 1.99996L5.22223 1.55551Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M2.44445 4.4444L3.00001 3.33329L3.55557 4.4444L4.66668 4.99996L3.55557 5.55551L3.00001 6.66663L2.44445 5.55551L1.33334 4.99996L2.44445 4.4444Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
