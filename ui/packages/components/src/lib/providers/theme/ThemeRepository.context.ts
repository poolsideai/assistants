import { createContext } from "svelte";
import { ThemeRepository, type ThemeRepositoryProps } from "./ThemeRepository.svelte";

const [getThemeContext, setContext] = createContext<ThemeRepository>();

export function setThemeContext(props?: ThemeRepositoryProps) {
  return setContext(new ThemeRepository(props));
}

export { getThemeContext };
