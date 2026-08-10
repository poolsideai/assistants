import { createContext } from "svelte";
import { SecretsRepository, type SecretsRepositoryDependencies } from "./SecretsRepository.svelte";

const [getSecretsContext, setContext] = createContext<SecretsRepository>();

export function setSecretsContext(deps: SecretsRepositoryDependencies) {
  return setContext(new SecretsRepository(deps));
}

export { setContext as _setSecretsContextForTests, getSecretsContext };
