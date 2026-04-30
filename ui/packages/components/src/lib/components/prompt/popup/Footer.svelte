<script lang="ts">
  import Icon, { type IconName } from "../../icon/index.js";

  interface Props {
    title: string;
    subtitle: string;
    icon: IconName;
  }

  let { title, subtitle, icon }: Props = $props();
</script>

<footer data-prompt-footer class="bg-psx-panel px-2.5 py-2 text-psx-warning-badge">
  <p class="flex items-center gap-1">
    <Icon name={icon} size={16} />
    <span>{title}</span>
  </p>
  <span class="truncate text-xs">{subtitle}</span>
</footer>
