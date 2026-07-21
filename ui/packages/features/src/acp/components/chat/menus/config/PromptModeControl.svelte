<script lang="ts">
  import { getACPChatSessionScope } from "../../../../features/ChatSessionScope.svelte";
  import ModeControl from "./ModeControl.svelte";
  import { promptConfigKind, type PromptModeKind } from "./configOptions";

  interface Props {
    /**
     * Which mode selector to render: the approval policy ("mode"), or the
     * collaboration mode for agents whose option offers more than a build/plan
     * switch. A plain switch has no control of its own — it rides on /plan and
     * the plan chip — so nothing renders for it here.
     */
    kind?: PromptModeKind;
  }

  let { kind = "mode" }: Props = $props();

  const chatSession = getACPChatSessionScope();

  const wanted = $derived(
    kind === "mode" || chatSession.collaborationModeSurface === "picker" ? kind : null,
  );

  // The leading (left) promptbox mode controls, sitting between the slash
  // trigger and the context (@) trigger.
  const option = $derived(
    wanted ? chatSession.configOptions.find((o) => promptConfigKind(o) === wanted) : undefined,
  );
</script>

{#if option}
  <ModeControl {option} />
{/if}
