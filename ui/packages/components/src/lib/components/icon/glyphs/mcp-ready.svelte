<script lang="ts">
  interface Props {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1 }: Props = $props();
</script>

<svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M9.00003 3.49998L5.00003 7.49998C4.1716 8.32841 4.1716 9.67156 5.00003 10.5C5.82846 11.3284 7.1716 11.3284 8.00003 10.5L12 6.49998M2 7.49998L7.5 1.99998C8.32843 1.17155 9.67157 1.17156 10.5 1.99998C11.3284 2.82841 11.3284 4.17156 10.5 4.99998M10.5 4.99998L6.5 8.99998M10.5 4.99998C11.3284 4.17156 12.6716 4.17156 13.5 4.99998C14.3284 5.82841 14.3284 7.17156 13.5 7.99998L10 11.5M14 11.3333L11 15L9.66666 13.6667"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
