<script lang="ts">
  import type { Except } from "type-fest";
  import { getDiffContext } from "./Diff.svelte";
  import Badge, { type BadgeProps, type BadgeVariants } from "../badge/Badge.svelte";

  type Props = Except<BadgeProps, "intent">;

  let { class: className, ...rest }: Props = $props();

  const context = getDiffContext();

  const status = $derived.by(() => {
    if (!context.oldFilename) return "create";
    if (!context.newFilename) return "delete";
    if (context.oldFilename !== context.newFilename) return "rename";
    return "modify";
  });

  const intentMap = {
    create: "positive",
    delete: "critical",
    modify: "info",
    rename: "info",
  } satisfies Record<typeof status, BadgeVariants["intent"]>;

  const indicatorMap = {
    create: "A",
    delete: "D",
    modify: "M",
    rename: "R",
  } satisfies Record<typeof status, string>;
</script>

<Badge {...rest} class={["font-mono", className]} intent={intentMap[status]}>
  {indicatorMap[status]}
</Badge>
