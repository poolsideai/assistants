using Microsoft.VisualStudio.Extensibility;

namespace Poolside.Assistant
{
    [VisualStudioContribution]
    internal class PoolsideExtension : Extension
    {
        public override ExtensionConfiguration ExtensionConfiguration =>
            new ExtensionConfiguration() { RequiresInProcessHosting = true };
    }
}
