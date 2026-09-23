__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const wanted = $derived(
    kind === "mode" || chatSession.collaborationModeSurface === "picker" ? kind : null,
  );

  // The leading (left) promptbox mode controls, sitting between the slash
  // trigger and the context (@) trigger.
  const option = $derived(
    wanted ? chatSession.configOptions.find((o) => promptConfigKind(o) === wanted) : undefined,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#if option}
  <ModeControl {option} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
