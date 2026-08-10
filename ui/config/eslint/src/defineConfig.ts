import { readPackageSync } from "read-pkg";
import ts from "typescript-eslint";
import base from "./configs/base.js";
import svelte from "./plugins/svelte.js";

const defineConfig: typeof ts.config = (...configs) => {
  const pkg = readPackageSync();
  const includesSvelte =
    Object.hasOwn(pkg.dependencies ?? {}, "svelte") ||
    Object.hasOwn(pkg.devDependencies ?? {}, "svelte") ||
    Object.hasOwn(pkg.peerDependencies ?? {}, "svelte") ||
    Object.hasOwn(pkg.optionalDependencies ?? {}, "svelte") ||
    Object.hasOwn(pkg.dependencies ?? {}, "@sveltejs/kit") ||
    Object.hasOwn(pkg.devDependencies ?? {}, "@sveltejs/kit") ||
    Object.hasOwn(pkg.peerDependencies ?? {}, "@sveltejs/kit") ||
    Object.hasOwn(pkg.optionalDependencies ?? {}, "@sveltejs/kit");

  const allConfigs = includesSvelte ? [...svelte, ...configs] : configs;

  return ts.config(...base, ...allConfigs);
};

export default defineConfig;
