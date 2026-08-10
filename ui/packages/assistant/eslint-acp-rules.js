// @ts-nocheck

const repositoryNamePattern = /Repository(?:Writer)?$/;
const productionFilePattern = /ui\/packages\/assistant\/src\/lib\/acp\//;
const assistantProductionFilePattern = /ui\/packages\/assistant\/src\//;
const testOrStoryPattern = /\.(?:test|stories|mock)\./;

function normalizedFilename(context) {
  return context.filename.replaceAll("\\", "/");
}

function isProductionACPFile(context) {
  const filename = normalizedFilename(context);
  return productionFilePattern.test(filename) && !testOrStoryPattern.test(filename);
}

function isAssistantProductionFile(context) {
  const filename = normalizedFilename(context);
  return assistantProductionFilePattern.test(filename) && !testOrStoryPattern.test(filename);
}

/**
 * Application code should use our typed helper api. Only transport-layer code should need raw jsonrpc.
 **/
function isAllowedRawJsonrpcFile(context) {
  const filename = normalizedFilename(context);
  return (
    filename.endsWith("/RPCTransport.ts") ||
    filename.endsWith("/rpc/client.ts") ||
    filename.includes("/helperapi/src/gen/")
  );
}

function isRepositoryFile(context) {
  return /Repository(?:\.svelte)?\.ts$/.test(normalizedFilename(context));
}

function isComponentFile(context) {
  return normalizedFilename(context).endsWith(".svelte");
}

function isBoundaryComponent(context) {
  const filename = normalizedFilename(context);
  return /Provider\.svelte$/.test(filename) || testOrStoryPattern.test(filename);
}

function calleeName(node) {
  if (!node) return null;
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression" && !node.computed) return calleeName(node.property);
  return null;
}

function propertyName(node) {
  if (!node) return null;
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return null;
}

function sourceText(context, node) {
  return context.sourceCode.getText(node);
}

function containsEnvironmentBranch(context, node) {
  return /\bhelperApiClient\b|\bappState\)\.environment\b|\bappState\.environment\b|\benvironment\.assistantHost\b|\benvironment\.capabilities\b|\bcapabilities\.terminalPanel\b/.test(
    sourceText(context, node),
  );
}

function containsRepositoryType(context, node) {
  return /\b[A-Za-z0-9_]*(Repository|RepositoryWriter)\b/.test(sourceText(context, node));
}

const rules = {
  "no-raw-helper-jsonrpc": {
    meta: {
      type: "problem",
      docs: {
        description: "Require typed helper API methods instead of raw jsonrpcCall/jsonrpcNotify.",
      },
      messages: {
        rawJsonrpc:
          "Do not call {{method}} directly from ACP production code. Use a generated helper API method instead of adding another raw JSON-RPC transport adapter.",
      },
      schema: [],
    },
    create(context) {
      if (!isAssistantProductionFile(context) || isAllowedRawJsonrpcFile(context)) return {};

      return {
        CallExpression(node) {
          if (node.callee?.type !== "MemberExpression") return;
          const name = propertyName(node.callee.property);
          if (name !== "jsonrpcCall" && name !== "jsonrpcNotify") return;

          context.report({
            node: node.callee.property,
            messageId: "rawJsonrpc",
            data: { method: name },
          });
        },
      };
    },
  },

  "no-environment-branching-in-repositories": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Keep ACP repository behavior behind environment ports instead of local host/helper branches.",
      },
      messages: {
        environmentBranch:
          "Move ACP helper/host branching out of repositories. Depend on a typed environment port/null object instead.",
      },
      schema: [],
    },
    create(context) {
      if (!isProductionACPFile(context) || !isRepositoryFile(context)) return {};

      function reportIfBranching(node) {
        if (!containsEnvironmentBranch(context, node.test)) return;
        context.report({ node: node.test, messageId: "environmentBranch" });
      }

      return {
        IfStatement: reportIfBranching,
        ConditionalExpression: reportIfBranching,
      };
    },
  },

  "no-repository-construction-in-components": {
    meta: {
      type: "problem",
      docs: {
        description: "Construct repositories in providers or contexts, not leaf Svelte components.",
      },
      messages: {
        repositoryConstruction:
          "Do not construct {{name}} inside a component. Register it in a provider/context and read it with a get...Context helper.",
      },
      schema: [],
    },
    create(context) {
      if (
        !isAssistantProductionFile(context) ||
        !isComponentFile(context) ||
        isBoundaryComponent(context)
      ) {
        return {};
      }

      return {
        NewExpression(node) {
          const name = calleeName(node.callee);
          if (!name || !repositoryNamePattern.test(name)) return;
          context.report({
            node,
            messageId: "repositoryConstruction",
            data: { name },
          });
        },
      };
    },
  },

  "no-repository-prop-drilling": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Use repository contexts instead of passing repositories through component props.",
      },
      messages: {
        repositoryProp:
          "Do not pass repositories through component props. Read {{name}} from context in the component that needs it.",
      },
      schema: [],
    },
    create(context) {
      if (
        !isAssistantProductionFile(context) ||
        !isComponentFile(context) ||
        isBoundaryComponent(context)
      ) {
        return {};
      }

      const propsInterfaces = new Set();

      return {
        TSInterfaceDeclaration(node) {
          if (node.id?.name === "Props") {
            propsInterfaces.add(node.body);
          }
        },
        TSPropertySignature(node) {
          const parent = node.parent;
          if (!propsInterfaces.has(parent)) return;

          const name = propertyName(node.key) ?? "repository prop";
          if (
            !containsRepositoryType(context, node) &&
            !["repo", "history", "registry"].includes(name)
          ) {
            return;
          }

          context.report({
            node,
            messageId: "repositoryProp",
            data: { name },
          });
        },
      };
    },
  },
};

export default { rules };
