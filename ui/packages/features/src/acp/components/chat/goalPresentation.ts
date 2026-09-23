import type { IconName } from "@poolsideai/components/icon";

export const GOAL_ICON = "target" satisfies IconName;

export function slashCommandIcon(commandName: string): IconName {
  return commandName.toLocaleLowerCase() === "goal" ? GOAL_ICON : "command";
}
