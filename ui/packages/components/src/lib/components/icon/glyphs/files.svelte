<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
    dashed?: boolean;
  }

  let { size = 16, weight = 1, dashed, ...rest }: Props = $props();
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
    d="M11.6667 12.3332V13.6665C11.6667 14.0347 11.3682 14.3332 11 14.3332H3.66667C3.29848 14.3332 3 14.0347 3 13.6665V4.33317C3 3.96498 3.29848 3.6665 3.66667 3.6665H5M10.3333 1.6665H5.66667C5.29848 1.6665 5 1.96498 5 2.33317V11.6665C5 12.0347 5.29848 12.3332 5.66667 12.3332H13C13.3682 12.3332 13.6667 12.0347 13.6667 11.6665V4.99984M10.3333 1.6665L13.6667 4.99984M10.3333 1.6665V4.33317C10.3333 4.70136 10.6318 4.99984 11 4.99984H13.6667"
    stroke="currentColor"
    stroke-dasharray={dashed ? "3 2" : "none"}
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
