import {
  generateVerbImports,
  toObjectString,
  type ClientGeneratorsBuilder,
  type GeneratorOptions,
  type GeneratorVerbOptions,
} from "orval";

const JSONRPC_DEPENDENCIES = [
  {
    exports: [
      { name: "runtime", values: true },
      { name: "toJsonrpcMethod", values: true },
    ],
    dependency: "../orval/clientHelpers",
  },
];

const generateJsonrpcImplementation = (
  { operationName, response, body, props }: GeneratorVerbOptions,
  { route }: GeneratorOptions,
) => {
  const propsImplementation = toObjectString(props, "implementation");

  return `export const ${operationName} = async (
  ${propsImplementation}
): Promise<${response.definition.success || "unknown"}> => {
  return await runtime.jsonrpcCall(toJsonrpcMethod('${route}'), ${body.implementation});
};`;
};

export const generateJsonrpc = (verbOptions: GeneratorVerbOptions, options: GeneratorOptions) => {
  const imports = generateVerbImports(verbOptions);
  const implementation = generateJsonrpcImplementation(verbOptions, options);

  return { implementation, imports };
};

export const jsonrpcClientBuilder: ClientGeneratorsBuilder = {
  client: generateJsonrpc,
  dependencies: () => JSONRPC_DEPENDENCIES,
};
