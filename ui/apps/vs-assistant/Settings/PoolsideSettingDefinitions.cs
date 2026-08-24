#pragma warning disable VSEXTPREVIEW_SETTINGS

using Microsoft.VisualStudio.Extensibility;
using Microsoft.VisualStudio.Extensibility.Settings;

namespace Poolside.Assistant.Settings
{
    internal static class PoolsideSettingDefinitions
    {
        [VisualStudioContribution]
        internal static SettingCategory PoolsideAssistant { get; } =
            new SettingCategory("poolsideAssistant", "Poolside Assistant");

        [VisualStudioContribution]
        internal static Setting.String BaseUri { get; } =
            new Setting.String("baseUri", "Base URI", PoolsideAssistant, defaultValue: "")
            {
                Description = "The base URI of the Poolside API",
            };

        [VisualStudioContribution]
        internal static Setting.Boolean WrapLines { get; } =
            new Setting.Boolean("wrapLines", "Wrap Lines", PoolsideAssistant, defaultValue: true)
            {
                Description = "Wrap lines in code snippets",
            };

        [VisualStudioContribution]
        internal static Setting.Boolean NotifyOnApproval { get; } =
            new Setting.Boolean("notifyOnApproval", "Notify On Approval", PoolsideAssistant, defaultValue: true)
            {
                Description = "Show a system notification when approval is needed and the window is not focused",
            };

        [VisualStudioContribution]
        internal static Setting.Boolean ShowMermaidDiagrams { get; } =
            new Setting.Boolean("showMermaidDiagrams", "Show Mermaid Diagrams", PoolsideAssistant, defaultValue: false)
            {
                Description = "Visualise Mermaid diagrams in code blocks (experimental)",
            };

        [VisualStudioContribution]
        internal static Setting.Enum ToolActivity { get; } =
            new Setting.Enum(
                "toolActivity",
                "Tool Activity",
                PoolsideAssistant,
                new[]
                {
                    new EnumSettingEntry("detailed", "Detailed"),
                    new EnumSettingEntry("grouped", "Grouped"),
                    new EnumSettingEntry("compact", "Compact"),
                },
                defaultValue: "grouped")
            {
                Description = "How much detail to show while the agent works. Finished replies always collapse into a summary.",
            };

        [VisualStudioContribution]
        internal static Setting.String DefaultWorkingDirectory { get; } =
            new Setting.String("defaultWorkingDirectory", "Default Working Directory", PoolsideAssistant, defaultValue: "")
            {
                Description = "Working directory the assistant uses when no folder or solution is open. Leave empty to use a scratch directory (%LOCALAPPDATA%\\poolside\\scratch) so the assistant's file tools start there instead of at your profile directory.",
            };

        [VisualStudioContribution]
        internal static Setting.String AcpAgentServers { get; } =
            new Setting.String("acpAgentServers", "ACP Agent Servers", PoolsideAssistant, defaultValue: "")
            {
                Description = "Named ACP servers available to the Poolside ACP client, as a JSON object (name -> { command, args, env, default_config_options }). Use {{SELF}} as the command for the bundled Poolside agent. Leave empty to use the default.",
            };
    }
}
