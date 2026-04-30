<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
  }

  let { size = 16, ...rest }: Props = $props();
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
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M8 8C9.933 8 11.5 6.433 11.5 4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5C4.5 6.433 6.067 8 8 8ZM2.3172 11.1532C1.49626 11.681 1 12.59 1 13.5659C1 14.3579 1.64207 15 2.4341 15H13.5659C14.3579 15 15 14.3579 15 13.5659C15 12.59 14.5037 11.681 13.6828 11.1532L13.5787 11.0863C13.4139 10.9804 13.3315 10.9274 13.2546 10.8799C10.0339 8.8908 5.96609 8.8908 2.74537 10.8799C2.66846 10.9274 2.58608 10.9804 2.42132 11.0863L2.3172 11.1532Z"
    fill="currentColor"
  />
</svg>
