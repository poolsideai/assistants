<script lang="ts">
  interface Props {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1 }: Props = $props();
</script>

<svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M8.50003 3.12132L4.50003 7.12132C3.6716 7.94975 3.6716 9.29289 4.50003 10.1213C4.91424 10.5355 5.45712 10.7426 6 10.7426M1.5 7.12132L7 1.62132C7.82843 0.792892 9.17157 0.792894 10 1.62132C10.8284 2.44975 10.8284 3.79289 10 4.62132M10 4.62132L6 8.62132M10 4.62132C10.8284 3.79289 12.1716 3.79289 13 4.62132C13.5109 5.13226 13.7068 5.83899 13.5874 6.5M11.2404 6.38099L11.5 6.12132M11.4 12.9945V13M11.4 11.5V10M14.8 11.5C14.8 13.433 13.233 15 11.3 15C9.367 15 7.8 13.433 7.8 11.5C7.8 9.567 9.367 8 11.3 8C13.233 8 14.8 9.567 14.8 11.5Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
