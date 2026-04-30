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
    d="M7.69689 1.19063C7.81864 0.936457 8.18144 0.936457 8.30319 1.19063L10.0634 4.86538C10.1124 4.96768 10.21 5.03834 10.3227 5.05314L14.3742 5.58517C14.6545 5.62198 14.7667 5.9665 14.5615 6.16049L11.5982 8.96283C11.5156 9.04093 11.4783 9.15542 11.499 9.26703L12.243 13.2697C12.2945 13.5468 12.0009 13.7597 11.7526 13.6254L8.16016 11.683C8.06028 11.629 7.9398 11.629 7.83992 11.683L4.24752 13.6254C3.99914 13.7597 3.70557 13.5468 3.75707 13.2697L4.50108 9.26703C4.52183 9.15542 4.48451 9.04093 4.40192 8.96283L1.43856 6.16049C1.23342 5.9665 1.34559 5.62198 1.62586 5.58517L5.67741 5.05314C5.79013 5.03834 5.88769 4.96768 5.9367 4.86537L7.69689 1.19063Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-dasharray={dashed ? "3 2" : "none"}
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
