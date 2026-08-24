using Microsoft.VisualStudio.Shell;
using Poolside.Assistant.Settings;
using System;
using System.ComponentModel.Design;
using System.Threading.Tasks;

namespace Poolside.Assistant.Commands
{
    /// <summary>
    /// Opens the Poolside Assistant options page. Mirrors VS Code's view/title
    /// "Settings" action (the openSettings command) so the sidebar toolbar exposes
    /// the same New Conversation + Settings pair.
    /// </summary>
    internal class OpenSettingsCommand : BaseSignedInPoolsideCommand
    {
        public const int CommandId = 0x0160;

        private OpenSettingsCommand(AsyncPackage package, OleMenuCommandService commandService)
            : base(package, commandService, CommandId)
        {
        }

        public static OpenSettingsCommand Instance
        {
            get;
            private set;
        }

        public static async Task InitializeAsync(AsyncPackage package)
        {
            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync(package.DisposalToken);
            OleMenuCommandService commandService = await package.GetServiceAsync((typeof(IMenuCommandService))) as OleMenuCommandService;
            Instance = new OpenSettingsCommand(package, commandService);
        }

        protected override void Execute(object sender, EventArgs e)
        {
            ThreadHelper.ThrowIfNotOnUIThread();
            PoolsideAssistantPackage.GetInstance().ShowOptionPage(typeof(PoolsideSettings));
        }
    }
}
