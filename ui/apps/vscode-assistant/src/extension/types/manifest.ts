import type { AllUnionFields, LiteralToPrimitive } from "type-fest";
import packageJson from "../../../package.json";

type Contributes = typeof packageJson.contributes;
type Properties = Contributes["configuration"]["properties"];
type Command = Contributes["commands"][number];

export type PoolsideCommand = Command["command"];
export type PoolsideWhenClause = NonNullable<AllUnionFields<Command>["enablement"]>;

export type PoolsideConfigurationProperty = keyof Properties;
export type PoolsideConfigurationProperties = {
  [K in PoolsideConfigurationProperty]: LiteralToPrimitive<Properties[K]["default"]>;
};

export type PoolsideContextKey = Extract<PoolsideWhenClause, `poolside.${string}`>;

export type PoolsideContextKeys = {
  [K in PoolsideContextKey]: K extends `poolside.can${string}` ? boolean : any;
};
