import svelte from "eslint-plugin-svelte";
import ts, { type ConfigArray } from "typescript-eslint";

const restrictedUnscopedLodashMessage =
  'Avoid unscoped lodash imports. Import specific functions instead, e.g. import { isEqual } from "lodash".';

const config: ConfigArray = ts.config(...svelte.configs["flat/prettier"], {
  name: "svelte:typescript",
  files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
  languageOptions: {
    parserOptions: {
      extraFileExtensions: [".svelte"],
      parser: ts.parser,
    },
  },
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: 'ImportDeclaration[source.value="lodash"] > ImportDefaultSpecifier',
        message: restrictedUnscopedLodashMessage,
      },
      {
        selector: 'ImportDeclaration[source.value="lodash"] > ImportNamespaceSpecifier',
        message: restrictedUnscopedLodashMessage,
      },
    ],
    "svelte/button-has-type": "warn",
    "svelte/require-stores-init": "warn",
  },
});

export default config;
