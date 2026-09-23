import SplitsStoryHarness from "../src/storybook/SplitsStoryHarness.svelte";

export default {
  title: "Splits/SplitsView",
  component: SplitsStoryHarness,
  args: {
    height: "620px",
    scenario: "workspace",
  },
};

export const Workspace = {};

export const SinglePane = {
  args: {
    height: "520px",
    scenario: "single",
  },
};

export const EmptyPanes = {
  args: {
    height: "420px",
    scenario: "empty",
  },
};

export const CompactReadOnly = {
  args: {
    height: "420px",
    scenario: "compact",
  },
};

export const KeepAlive = {
  args: {
    height: "520px",
    scenario: "keepAlive",
  },
};
