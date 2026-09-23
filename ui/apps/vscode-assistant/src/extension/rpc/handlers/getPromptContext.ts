import { type PromptContextFacet } from "@poolsideai/rpc";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
type Generator = (system: System) => Promise<PromptContextFacet | undefined>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
const branchProviders: Generator[] = [getGitBranchNamesContext, getGitBranchCommitMessagesContext];
__POOL_SYNTHETIC_IMPORT_BASELINE__
export async function getPromptContext(system: System): Promise<Array<PromptContextFacet>> {
  return (await Promise.all(branchProviders.map((provider) => provider(system)))).flatMap(
    (result) => (result && result.items ? result : []),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
