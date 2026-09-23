<script lang="ts">
  interface Props {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1 }: Props = $props();
</script>

<span class="relative">
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 2C8.34763 2 8.68809 2.03114 9.01953 2.08789C9.0072 2.22364 9 2.36104 9 2.5C9 4.98528 11.0147 7 13.5 7C13.6387 7 13.7757 6.99177 13.9111 6.97949C13.968 7.31129 14 7.65198 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2ZM8 4C7.73478 4 7.4805 4.10543 7.29297 4.29297L4.79297 6.79297C4.40245 7.18349 4.40245 7.81651 4.79297 8.20703C5.18349 8.59756 5.81651 8.59755 6.20703 8.20703L7 7.41406V11C7 11.5523 7.44772 12 8 12C8.55228 12 9 11.5523 9 11V7.41406L9.79297 8.20703C10.1835 8.59756 10.8165 8.59756 11.207 8.20703C11.5976 7.81651 11.5976 7.18349 11.207 6.79297L8.70703 4.29297L8.63379 4.22656C8.45583 4.08073 8.23209 4 8 4Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="miter"
      stroke-width={weight}
    />
  </svg>
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="absolute -top-0.5 -right-0.5"
  >
    <path
      d="M12.5 0C14.433 0 16 1.567 16 3.5C16 5.433 14.433 7 12.5 7C10.567 7 9 5.433 9 3.5C9 1.567 10.567 0 12.5 0ZM12.4355 1.625L11.4336 2.32031V3.05078L12.3848 2.39062H12.4326V5.5H13.2441V1.625H12.4355Z"
      fill="currentColor"
    />
  </svg>
</span>
