import { mergeConfig, type UserConfig } from "vite";

export const mergeConfigs = (...configs: [UserConfig, UserConfig, ...UserConfig[]]) =>
  configs.reduceRight((acc, config) => mergeConfig(acc, config));
