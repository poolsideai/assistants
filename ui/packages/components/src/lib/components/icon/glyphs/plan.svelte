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
    d="M7.99508 2.33002H3.0382C2.64712 2.33002 2.33008 2.64706 2.33008 3.03814V13.9519C2.33008 14.343 2.64712 14.66 3.0382 14.66H12.952C13.343 14.66 13.6601 14.343 13.6601 13.9519V7.99502"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M7.5 10.4096H11.3806M5.69568 6.52905C5.69568 6.8052 5.47182 7.02905 5.19568 7.02905C4.91954 7.02905 4.69568 6.8052 4.69568 6.52905C4.69568 6.25291 4.91954 6.02905 5.19568 6.02905C5.47182 6.02905 5.69568 6.25291 5.69568 6.52905ZM5.69568 10.4096C5.69568 10.6858 5.47182 10.9096 5.19568 10.9096C4.91954 10.9096 4.69568 10.6858 4.69568 10.4096C4.69568 10.1335 4.91954 9.90964 5.19568 9.90964C5.47182 9.90964 5.69568 10.1335 5.69568 10.4096Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9 7V4.90351L12.6988 1.20468C12.9717 0.931773 13.4142 0.931772 13.6871 1.20468L14.7953 2.31288C15.0682 2.58579 15.0682 3.02826 14.7953 3.30117L11.0965 7H9Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
