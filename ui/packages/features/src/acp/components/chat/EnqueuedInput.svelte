__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    position?: number;
    total?: number;
    turnActive?: boolean;
    steeringAvailable?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onSendNow?: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let {
    content,
    position = 1,
    total = 1,
    turnActive = true,
    steeringAvailable = false,
    onCancel,
    onSendNow,
    class: className = "",
  }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {position === 1 && turnActive ? "Next after current turn" : `Queued ${position} of ${total}`}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <button type="button" class="send-now-button" onclick={onSendNow}>
      {turnActive ? (steeringAvailable ? "Steer" : "Interrupt & Send Now") : "Send Now"}
    </button>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    @apply text-psx-icon flex h-6 w-6 items-center justify-center rounded-full transition-colors;
    @apply hover:bg-black/10;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  .send-now-button {
    @apply text-psx-foreground-secondary flex h-6 items-center rounded-full px-2 text-[0.65rem] font-medium transition-colors;
    @apply hover:text-psx-foreground-primary hover:bg-black/10;
    @apply dark:hover:bg-white/10;
    @apply focus-visible:outline-psx-focus focus-visible:outline-2 focus-visible:outline-offset-1;
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
