<script lang="ts">
  import type { LocalInferenceState } from "@poolsideai/helperapi/schemas";
  import type { Snippet } from "svelte";
  import { appState } from "../hostAdapter";
  import type { Capabilities } from "../hostAdapter";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { setLocalInferenceContext } from "../features/LocalInferenceRepository.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__

  interface Props {
    children: Snippet;
    projects?: ACPNavProject[];
    conversations?: ACPNavConversation[];
    capabilities?: Partial<Capabilities>;
    // Seeds the local-inference repository, e.g. with a resident model so the
    // sidebar runtime pill renders.
    localInference?: LocalInferenceState;
  }

  let {
    children,
    projects = [],
    conversations = [],
    capabilities,
    localInference,
  }: Props = $props();

  if (capabilities) {
    appState.update((state) => ({
      ...state,
      environment: {
        ...state.environment,
        capabilities: { ...state.environment.capabilities, ...capabilities },
      },
    }));
  }

  const projectRepo = getACPProjectRepo();
  const conversationRepo = getACPConversationRepo();
  const localInferenceRepo = setLocalInferenceContext();

  projectRepo.replaceProjects(projects);
  conversationRepo.replaceConversations(conversations);

  // The sidebars call `refresh()` from onMount whenever the list arrives empty,
  // which would hit the real helper RPC and surface a failure banner.
  (projectRepo as { refresh: () => Promise<void> }).refresh = async () => {};
  (conversationRepo as { refresh: () => Promise<void> }).refresh = async () => {};
  localInferenceRepo.refresh = async () => {};
  localInferenceRepo.unloadModel = async () => {};
  if (localInference) {
    localInferenceRepo.state = localInference;
  }
</script>

{@render children()}
