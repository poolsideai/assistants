using Microsoft.VisualStudio.Shell;
using Poolside.Assistant.ChatWindow;
using System.ComponentModel.Design;
using System.Threading.Tasks;
using System;

namespace Poolside.Assistant.Commands
{
    internal class TogglePlanModeCommand : BaseSignedInPoolsideCommand
    {
        public const int CommandId = 0x0150;

        private TogglePlanModeCommand(AsyncPackage package, OleMenuCommandService commandService)
            : base(package, commandService, CommandId)
        {
        }

        public static TogglePlanModeCommand Instance
        {
            get;
            private set;
        }

        public static async Task InitializeAsync(AsyncPackage package)
        {
            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync(package.DisposalToken);
            OleMenuCommandService commandService = await package.GetServiceAsync((typeof(IMenuCommandService))) as OleMenuCommandService;
            Instance = new TogglePlanModeCommand(package, commandService);
        }

        protected override void Execute(object sender, EventArgs e)
        {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
                return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        }
    }
}
