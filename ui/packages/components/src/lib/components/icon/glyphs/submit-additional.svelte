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
      d="M11 1.30517C10.0847 0.894768 9.07002 0.666504 8.00199 0.666504C3.95098 0.666504 0.666992 3.9505 0.666992 8.0015C0.666992 12.0525 3.95098 15.3365 8.00199 15.3365C12.053 15.3365 15.337 12.0525 15.337 8.0015C15.337 6.93212 15.1081 5.91618 14.6968 5"
      stroke="currentColor"
      stroke-linejoin="round"
      stroke-width={weight}
    />
    <path
      d="M11 7.38235L8 4.5L5 7.38235M8 11.5L8 4.70588"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={weight}
    />
  </svg>
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="absolute -top-px -right-px"
  >
    <path
      d="M12.5 0C14.433 0 16 1.567 16 3.5C16 5.433 14.433 7 12.5 7C10.567 7 9 5.433 9 3.5C9 1.567 10.567 0 12.5 0ZM12.4355 1.625L11.4336 2.32031V3.05078L12.3848 2.39062H12.4326V5.5H13.2441V1.625H12.4355Z"
      fill="currentColor"
    />
  </svg>
</span>
