import svelte from "eslint-plugin-svelte";
import ts, { type ConfigArray } from "typescript-eslint";

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    "svelte/button-has-type": "warn",
    "svelte/require-stores-init": "warn",
  },
});

export default config;
