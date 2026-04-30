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
    d="M3 6.9593C1.99319 7.63173 1.33008 8.77843 1.33008 10.08C1.33008 12.0978 2.92372 13.7433 4.921 13.8267M3 6.9593C3.59523 6.56177 4.31059 6.33 5.08008 6.33C6.39871 6.33 7.55838 7.0106 8.22697 8.03968M3 6.9593V4C3 2.89543 3.89543 2 5 2H12C13.1046 2 14 2.89543 14 4V11C14 11.8725 13.4413 12.6146 12.6621 12.8878M4.921 13.8267C5.06845 14.1746 5.40818 14.4385 5.84268 14.4385H11.8273C12.6208 14.4385 13.0982 13.5587 12.6658 12.8935L12.6621 12.8878M4.921 13.8267C4.79921 13.5393 4.80863 13.1944 5.00424 12.8935L7.99656 8.28991C8.06145 8.19007 8.13972 8.10666 8.22697 8.03968M8.22697 8.03968C8.66986 7.69966 9.344 7.78307 9.67344 8.28991L12.6621 12.8878"
    stroke="currentColor"
    stroke-dasharray={dashed ? "3 2" : "none"}
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
