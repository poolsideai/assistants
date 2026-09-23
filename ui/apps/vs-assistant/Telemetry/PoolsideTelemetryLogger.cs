__POOL_SYNTHETIC_IMPORT_BASELINE__
using Microsoft.VisualStudio.Shell.Interop;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Diagnostics are written to the "Poolside Assistant Diagnostics" output window pane and
    // are never sent to a reporting service.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        public static readonly PoolsideTelemetryLogger Instance = new PoolsideTelemetryLogger();
__POOL_SYNTHETIC_IMPORT_BASELINE__
        private const string paneName = "Poolside Assistant Diagnostics";
        private static Guid paneGuid = new Guid("E0360EA9-B75B-4748-A1E9-688FCA900626");
__POOL_SYNTHETIC_IMPORT_BASELINE__
        private IVsOutputWindowPane outputPane;
__POOL_SYNTHETIC_IMPORT_BASELINE__
        private PoolsideTelemetryLogger() { }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            Write(ex.ToString());
            if (data != null)
                Write(JsonConvert.SerializeObject(data));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            if (error != null)
                Write(JsonConvert.SerializeObject(error));
            if (data != null)
                Write(JsonConvert.SerializeObject(data));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        public void reportException(Exception ex) => reportError(ex, null);
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // Writes a diagnostic line to the output window pane. Debug.WriteLine is compiled out of
        // Release builds (the shipped VSIX), so the pane is the only sink that survives there.
        private void Write(string message)
        {
            var line = $"[{DateTime.Now:HH:mm:ss.fff}] {message}";
            Debug.WriteLine(line);
            _ = ThreadHelper.JoinableTaskFactory.StartOnIdle(() =>
__POOL_SYNTHETIC_IMPORT_BASELINE__
                ThreadHelper.ThrowIfNotOnUIThread();
                var pane = GetOutputPane();
                if (pane == null)
                    return;
                pane.OutputStringThreadSafe($"{line}\n");
            });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // Lazily creates the output pane on first use. Must be called on the UI thread. Returns
        // null if the output window service isn't available (for example, during shutdown), in
        // which case the caller should just skip writing.
        private IVsOutputWindowPane GetOutputPane()
__POOL_SYNTHETIC_IMPORT_BASELINE__
            ThreadHelper.ThrowIfNotOnUIThread();
            if (outputPane != null)
                return outputPane;
            var outputWindow = Package.GetGlobalService(typeof(SVsOutputWindow)) as IVsOutputWindow;
            if (outputWindow == null)
                return null;
            outputWindow.CreatePane(ref paneGuid, paneName, 1, 1); // visible and clearWithSolution = true
            outputWindow.GetPane(ref paneGuid, out outputPane);
            return outputPane;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
