import { createContext } from "svelte";
import type { ACPConnectionPool } from "./ConnectionPool";

const [getACPConnectionPoolContext, setACPConnectionPoolContext] =
  createContext<ACPConnectionPool>();

function getOptionalACPConnectionPoolContext(): ACPConnectionPool | undefined {
  try {
    return getACPConnectionPoolContext();
  } catch {
    return undefined;
  }
}

export {
  setACPConnectionPoolContext as _setACPConnectionPoolContextForTests,
  getACPConnectionPoolContext,
  getOptionalACPConnectionPoolContext,
  setACPConnectionPoolContext,
};
