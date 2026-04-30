/** @type {import("prettier").Config} */
export default {
  plugins: [
    "prettier-plugin-packagejson",
    "prettier-plugin-organize-imports",
    "prettier-plugin-svelte",
    "prettier-plugin-tailwindcss",
  ],
  tabWidth: 2,
  printWidth: 100,
  tailwindFunctions: ["tv", "mergeProps"],
  tailwindStylesheet: "./src/lib/tailwind.css",
  overrides: [
    {
      files: "*.svelte",
      options: { parser: "svelte" },
    },
    {
      files: ["*.json", "*.graphql"],
      options: {
        printWidth: 80,
      },
    },
  ],
};
