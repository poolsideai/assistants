using Microsoft.VisualStudio.Shell;
using Poolside.Assistant.ChatWindow;
using System.ComponentModel.Design;
using System.Threading.Tasks;
using System;

namespace Poolside.Assistant.Commands
{
    /// <summary>
    ///  Command handler
    /// </summary>
    internal class FocusInputPoolsideCommand : BaseSignedInPoolsideCommand
    {
        public const int CommandId = 0x0106;

        private FocusInputPoolsideCommand(AsyncPackage package, OleMenuCommandService commandService)
            : base(package, commandService, CommandId)
        {
        }

        public static FocusInputPoolsideCommand Instance
        {
            get;
            private set;
        }

        public static async Task InitializeAsync(AsyncPackage package)
        {
            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync(package.DisposalToken);
            OleMenuCommandService commandService = await package.GetServiceAsync((typeof(IMenuCommandService))) as OleMenuCommandService;
            Instance = new FocusInputPoolsideCommand(package, commandService);
        }

        protected override void Execute(object sender, EventArgs e)
        {
            FocusToolWindow();
        }
    }
}
