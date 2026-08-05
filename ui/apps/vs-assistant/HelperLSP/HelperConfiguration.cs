using Microsoft.VisualStudio.Shell;
__POOL_SYNTHETIC_IMPORT_BASELINE__
using Poolside.Assistant.Settings;
__POOL_SYNTHETIC_IMPORT_BASELINE__
using Poolside.Assistant.WebViewInfrastructure;
using System;
using System.Collections.Generic;
__POOL_SYNTHETIC_IMPORT_BASELINE__
using System.Linq;
__POOL_SYNTHETIC_IMPORT_BASELINE__
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant.HelperLSP
{
    internal class HelperConfiguration
    {
        // A unique identifier for this sessino, that stays the same throughout the IDE instance's lifetime.
        private static readonly string CurrentSessionId = Guid.NewGuid().ToString();

        public string agentId { get; set; }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        public string sessionId { get; set; }
        public string assistantHost { get; set; }
        public string assistantEnvironment { get; set; }
        public ClientCapabilities clientCapabilities { get; set; }
        public EditorSettings editorSettings { get; set; }
        public bool agentHandlerEnabled { get; set; }
__POOL_SYNTHETIC_IMPORT_BASELINE__

        public class EditorSettings
        {
            public bool disableCompletionTelemetry { get; set; }
            public List<string> disabledEnrichments { get; set; }
        }

        public class ClientCapabilities
        {
            public bool taskWorkspaceEdit { get; set; }
        }

        public static HelperConfiguration Build()
        {
            ThreadHelper.ThrowIfNotOnUIThread();
            var settings = PoolsideAssistantPackage.GetInstance().GetSettings();
            var environment = WebViewCommunicator.BuildEnvironment();
            var assemblyPath = System.IO.Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var binaryDirectoryUri = new Uri(System.IO.Path.Combine(assemblyPath, "helper"), UriKind.Absolute).AbsoluteUri;
            return new HelperConfiguration
            {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
                sessionId = CurrentSessionId,
                assistantHost = environment.assistantHost,
                assistantEnvironment = environment.assistantEnv,
                clientCapabilities = new ClientCapabilities
                {
                    taskWorkspaceEdit = true
                },
                editorSettings = new EditorSettings
                {
                    disableCompletionTelemetry = true,
                    disabledEnrichments = settings.DisabledEnrichments
                },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            };
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }
}
