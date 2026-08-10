import { poolsideAcpNavList } from "@poolsideai/helperapi";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

export async function refreshACPNavState(
  projects: Pick<ACPProjectRepositoryWriter, "applyNavState" | "refresh">,
  conversations: Pick<ACPConversationRepositoryWriter, "applyNavState" | "refresh">,
): Promise<void> {
  try {
    const state = await poolsideAcpNavList({});
    projects.applyNavState(state);
    conversations.applyNavState(state);
  } catch {
    await Promise.allSettled([
      projects.refresh({ showLoading: false }),
      conversations.refresh({ showLoading: false }),
    ]);
  }
}
