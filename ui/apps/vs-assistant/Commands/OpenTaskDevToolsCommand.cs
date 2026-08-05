using Microsoft.VisualStudio.Shell;
using Poolside.Assistant.Tasks;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant.Commands
{
    internal class OpenTaskDevToolsCommand : BasePoolsideHelpCommand
    {
        public const int CommandId = 0x0110;

        private OpenTaskDevToolsCommand(AsyncPackage package, OleMenuCommandService commandService)
            : base(package, commandService, CommandId)
        {
        }

        public static OpenTaskDevToolsCommand Instance
        {
            get;
            private set;
        }

        public static async Task InitializeAsync(AsyncPackage package)
        {
            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync(package.DisposalToken);
            OleMenuCommandService commandService = await package.GetServiceAsync((typeof(IMenuCommandService))) as OleMenuCommandService;
            Instance = new OpenTaskDevToolsCommand(package, commandService);
        }

        protected override bool IsVisible()
        {
            ThreadHelper.ThrowIfNotOnUIThread();
            return TasksToolWindow.HaveOpenTaskWindow();
        }

        protected override void Execute(object sender, EventArgs e)
        {
            ThreadHelper.ThrowIfNotOnUIThread();
            TasksToolWindow.OpenTaskWindowDevTools();
        }
    }
}
