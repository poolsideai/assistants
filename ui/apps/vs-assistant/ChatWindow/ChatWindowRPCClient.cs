using Microsoft.VisualStudio.Shell;
using Poolside.Assistant.Context;
using Poolside.Assistant.HelperLSP;
using Poolside.Assistant.Settings;
using Poolside.Assistant.Telemetry;
using Poolside.Assistant.WebViewInfrastructure;
using System;
using System.Threading;
using System.Threading.Tasks;

// Disable some C# style warnings, since we're following naming of the web view RPC interface,
// and also don't care to make everything handle tasks when there's no result.
#pragma warning disable VSTHRD200 // Use "Async" suffix for async methods
#pragma warning disable IDE1006 // Naming Styles
#pragma warning disable VSTHRD110 // Observe result of async calls
#pragma warning disable CS4014 // Lack of await

namespace Poolside.Assistant.ChatWindow
{
    internal static class ChatWindowRPCClient
    {
        internal static void setContext(ActiveFileContext context)
        {
            CallWebView("setContext", context);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        }

        internal static void focusInput()
        {
            CallWebView("focusInput");
        }

__POOL_SYNTHETIC_IMPORT_BASELINE__
        {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
        internal static Task setEditorFocused(bool focused)
        {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            return CallWebView("setEditorFocused", focused);
        }

        private static async Task CallWebView(string method, params object[] arguments)
        {
            bool gotCommunicator = false;
            try
            {
                var communicator = await GetCommunicator();
                if (communicator == null)
                    return;
                gotCommunicator = true;
                await communicator.CallWebView(method, arguments);
            }
            catch (Exception ex)
            {
                // If we failed to get the communicator, that typically means we're during shutdown, so don't ingest an error.
                if (!gotCommunicator)
                    return;
                PoolsideTelemetryLogger.Instance.reportError(ex, new System.Collections.Generic.Dictionary<string, object>
                {
                    { "method", method }
                });
            }
        }

        private static async Task<TResult> CallWebView<TResult>(string method, params object[] arguments)
        {
            var communicator = await GetCommunicator();
            if (communicator == null)
                return default;
            return await communicator.CallWebView<TResult>(method, arguments);
        }

        // We only have one web view communicator for the lifetime of the extension, so we can cache it here.
        // The caching means that we typically don't need a trip via the UI thread, which is not only important
        // so far as performance goes, but also removes an opportunity for messages to get dis-ordered in streaming
        // responses.
        private static WebViewCommunicator cachedCommunicator;

        private static async Task<WebViewCommunicator> GetCommunicator()
        {
            if (cachedCommunicator == null)
            {
                await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync();
                var package = PoolsideAssistantPackage.GetInstance();
                if (package == null)
                    return null;
                var poolsideToolWindow = await ChatToolWindow.GetInstanceAsync(PoolsideAssistantPackage.GetInstance());
                cachedCommunicator = poolsideToolWindow.GetCommunicator();
            }
            return cachedCommunicator;
        }

        internal static void ClearCachedCommunicator() => cachedCommunicator = null;
    }
}
