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
    d="M6.99999 7.24999H7.99998L7.99999 10.5833M7.99998 5.4V5.41M14.3333 7.99999C14.3333 11.4978 11.4978 14.3333 7.99999 14.3333C4.50219 14.3333 1.66666 11.4978 1.66666 7.99999C1.66666 4.50219 4.50219 1.66666 7.99999 1.66666C11.4978 1.66666 14.3333 4.50219 14.3333 7.99999Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
