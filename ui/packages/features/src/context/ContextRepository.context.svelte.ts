import { createContext } from "svelte";
import { ContextRepositoryWriter, type ContextRepository } from "./ContextRepository.svelte";

const [getContextRepoContext, setContext] = createContext<ContextRepository>();

function setContextRepoContext(
  repo: ContextRepositoryWriter = new ContextRepositoryWriter(),
): ContextRepositoryWriter {
  setContext(repo.publicAPI());
  return repo;
}

function _setContextRepoContextForTests(
  repo: ContextRepositoryWriter = new ContextRepositoryWriter(),
): ContextRepositoryWriter {
  setContext(repo.publicAPI());
  return repo;
}

export { _setContextRepoContextForTests, getContextRepoContext, setContextRepoContext };
