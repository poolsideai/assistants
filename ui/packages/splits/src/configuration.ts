import type {
  SplitsAppearance,
  SplitsConfigurationInput,
  SplitsConfiguration as SplitsConfigurationShape,
} from "./types.js";

export const defaultSplitsAppearance: SplitsAppearance = {
  tabBarHeight: 33,
  tabMinWidth: 140,
  tabMaxWidth: 220,
  tabSpacing: 0,
  minimumPaneWidth: 100,
  minimumPaneHeight: 100,
  showSplitButtons: true,
  animationDuration: 0.12,
  enableAnimations: true,
};

export const compactSplitsAppearance: SplitsAppearance = {
  ...defaultSplitsAppearance,
  tabBarHeight: 28,
  tabMinWidth: 100,
  tabMaxWidth: 160,
};

export const spaciousSplitsAppearance: SplitsAppearance = {
  ...defaultSplitsAppearance,
  tabBarHeight: 38,
  tabMinWidth: 160,
  tabMaxWidth: 280,
  tabSpacing: 2,
};

export function normalizeSplitsConfiguration(
  configuration: SplitsConfigurationInput = {},
): SplitsConfigurationShape {
  return {
    allowSplits: configuration.allowSplits ?? true,
    allowCloseTabs: configuration.allowCloseTabs ?? true,
    allowCloseLastPane: configuration.allowCloseLastPane ?? false,
    allowTabReordering: configuration.allowTabReordering ?? true,
    allowCrossPaneTabMove: configuration.allowCrossPaneTabMove ?? true,
    allowCrossControllerTabMove: configuration.allowCrossControllerTabMove ?? false,
    autoCloseEmptyPanes: configuration.autoCloseEmptyPanes ?? true,
    contentViewLifecycle: configuration.contentViewLifecycle ?? "recreateOnSwitch",
    newTabPosition: configuration.newTabPosition ?? "current",
    preserveZoomOnNavigation: configuration.preserveZoomOnNavigation ?? false,
    appearance: {
      ...defaultSplitsAppearance,
      ...configuration.appearance,
    },
  };
}

export const SplitsConfiguration = {
  default: normalizeSplitsConfiguration(),
  singlePane: normalizeSplitsConfiguration({
    allowSplits: false,
    allowCloseLastPane: false,
  }),
  readOnly: normalizeSplitsConfiguration({
    allowSplits: false,
    allowCloseTabs: false,
    allowTabReordering: false,
    allowCrossPaneTabMove: false,
    allowCrossControllerTabMove: false,
  }),
  appearance: {
    default: defaultSplitsAppearance,
    compact: compactSplitsAppearance,
    spacious: spaciousSplitsAppearance,
  },
} as const;
