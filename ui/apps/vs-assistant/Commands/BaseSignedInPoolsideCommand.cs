using Microsoft.VisualStudio.Shell;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant.Commands
{
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    internal abstract class BaseSignedInPoolsideCommand : BasePoolsideToolsCommand
    {
        protected BaseSignedInPoolsideCommand(AsyncPackage package, OleMenuCommandService commandService, int commandId) : base(package, commandService, commandId)
        {
        }

        protected override bool IsVisible()
        {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        }
    }
}
