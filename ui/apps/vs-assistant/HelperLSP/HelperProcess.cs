using Microsoft.VisualStudio.Imaging;
using Microsoft.VisualStudio.Shell;
using OmniSharp.Extensions.LanguageServer.Client;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.General;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Window;
__POOL_SYNTHETIC_IMPORT_BASELINE__
using Poolside.Assistant.ChatWindow;
using Poolside.Assistant.Context;
using Poolside.Assistant.Tasks;
using Poolside.Assistant.Telemetry;
using Poolside.Assistant.WebViewInfrastructure;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Poolside.Assistant.HelperLSP
{
    // A running instance of the LSP helper process and the LSP client that communicates with it.
    // If we restart it due to a crash, then a new instance of this class would be created.
    internal class HelperProcess
    {
        // The OS process for the helper
        private Process process;

        // The LSP client we're running
        private LanguageClient client;

        // Log of what was communicated between helper and IDE.
        private Queue<string> protocolLog;

        // Maximum number of protocol log entries
        const int maxProtocolLogEntries = 32768;

        private HelperProcess(Process process, LanguageClient client, Queue<string> protocolLog)
        {
            this.process = process;
            this.client = client;
            this.protocolLog = protocolLog;
        }

        internal LanguageClient Client
        {
            get { return this.client; }
        }

        internal static async Task<HelperProcess> StartAsync(IEnumerable<string> workspaceDirectories, Action onExit, HelperLog helperLog)
        {
            // Start the LSP process and wire up exit handler.
            var assemblyPath = System.IO.Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var languageServerPath = System.IO.Path.Combine(assemblyPath, "helper", "poolside-helper.exe");
            Process process;
            try
            {
                process = StartProcess(languageServerPath, onExit, helperLog);
            }
            catch (Exception ex) when (ex is System.ComponentModel.Win32Exception || ex is IOException)
            {
                // Probably access denied. Let's try the temp directory instead.
                helperLog.Log($"Failed to start Poolside Helper in {languageServerPath} ({ex.Message}), trying temp directory instead");
                try
                {
                    var tempDir = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "PoolsideHelper");
                    Directory.CreateDirectory(tempDir);

                    var tempHelperPath = System.IO.Path.Combine(tempDir, "poolside-helper.exe");
                    if (!File.Exists(tempHelperPath) ||
                        File.GetLastWriteTimeUtc(tempHelperPath) != File.GetLastWriteTimeUtc(languageServerPath))
                    {
                        File.Copy(languageServerPath, tempHelperPath, overwrite: true);
                    }

                    process = StartProcess(tempHelperPath, onExit, helperLog);
                }
                catch (Exception tempEx)
                {
                    helperLog.Log($"Also failed to start helper from temp path: {tempEx}");
                    throw;
                }
            }

            // Wire up logging of helper output.
            process.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    helperLog.Log(args.Data);
                }
            };
            process.BeginErrorReadLine();

            // Ensure we're on the UI thread to build configuration.
            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync();
            var configuration = HelperConfiguration.Build();

            // Prepare logging at LSP protocol level.
            var protocolLog = new Queue<string>();
            void appendLogLine(string line)
            {
                if (protocolLog.Count >= maxProtocolLogEntries)
                {
                    protocolLog.Dequeue();
                }
                protocolLog.Enqueue(line);
            }
            var processInput = new LoggingStream(process.StandardInput.BaseStream, message => appendLogLine($"OUT: {message}"));
            var processOutput = new LoggingStream(process.StandardOutput.BaseStream, message => appendLogLine($"IN: {message}"));

            // Set up the language client.
            var client = await LanguageClient
                .From(options =>
                {
                    var dirs = (workspaceDirectories ?? Enumerable.Empty<string>()).ToList();
                    if (dirs.Count > 0)
                        options.WithRootUri(DocumentUri.FromFileSystemPath(dirs[0]));
                    foreach (var dir in dirs)
                    {
                        options.WithWorkspaceFolder(new OmniSharp.Extensions.LanguageServer.Protocol.Models.WorkspaceFolder
                        {
                            Uri = DocumentUri.FromFileSystemPath(dir)
                        });
                    }
                    options
                        .WithInput(processOutput)
                        .WithOutput(processInput)
                        .WithInitializationOptions(configuration)
                        // In these various request handlers, we use `object` as the type in the case
                        // that we are doing a simple pass through of the value to the assistant
                        // without looking at any of its content. This reduces the risk of
                        // schema-related issues.
                        .OnRequest("poolside/taskWorkspaceEdit",
                            async (dynamic editJson) =>
                            {
                                try
                                {
                                    var edit = new TaskWorkspaceEdit(editJson);
                                    await FileOperations.ApplyTaskWorkspaceEdit(edit);
                                    return new TaskWorkspaceEditResult { Applied = true };
                                }
                                catch (Exception ex)
                                {
                                    PoolsideTelemetryLogger.Instance.reportException(ex);
                                    return new TaskWorkspaceEditResult
                                    {
                                        Applied = false,
                                        FailureReason = ex.Message
                                    };
                                }
                            })
                        .OnRequest("poolside/searchSymbolDefinitions",
                            async (SearchSymbolDefinitionsParams searchParams) => new SearchSymbolDefinitionsOutput
                            {
                                Defs = await SymbolSearch.SearchSymbolsAsync(searchParams.Symbol, searchParams.Type)
                            })
                        .OnRequest("poolside/getDiagnostics",
                            async (GetDiagnosticsParams diagParams) =>
                            {

                                return new GetDiagnosticsOutput
                                {
                                    Diagnostics = await PoolsideAssistantPackage.GetInstance().GetErrorTableWatcher()
                                        .GetDiagnosticsForFileAsync(FileOperations.UriToPath(diagParams.Uri), diagParams.WaitMs, diagParams.Severity)
                                };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
                        {
                            // We need to use Task.Run here to get the processing of this off the
                            // LSP message dispatch thread, otherwise we can't process any other
                            // concurrent notifications or requests, and the assistant relies on us
                            // being able to.
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
                        })
                        .OnShowMessageRequest(async (ShowMessageRequestParams requestParams) =>
                        {
                            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync();

                            // If no actions provided, just show a simple message
                            if (requestParams.Actions == null || !requestParams.Actions.Any())
                            {
                                var messageType = requestParams.Type == MessageType.Error ? "error" : null;
                                await Util.ShowInfoMessageAsync(requestParams.Message, messageType);
                                return null;
                            }

                            // Map actions to dictionary for the utility
                            var actions = requestParams.Actions.ToDictionary(
                                action => action.Title,
                                action => action
                            );

                            var moniker = requestParams.Type switch
                            {
                                MessageType.Error => KnownMonikers.StatusError,
                                MessageType.Warning => KnownMonikers.StatusWarning,
                                _ => KnownMonikers.StatusInformation,
                            };

                            return await Util.ShowInfoBarWithActionsAsync(requestParams.Message, actions, moniker);
                        })
                        .OnRequest("window/showDocument", async (ShowDocumentRequest showDocumentRequest) =>
                        {
                            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync();
                            var path = FileOperations.UriToPath(showDocumentRequest.uri);
                            Util.OpenFileInEditor(path);
                        })
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
                        .OnNotification("poolside/mcpOAuthURL", (MCPOAuthURLParams parameters) =>
                        {
                            Util.OpenUrlInBrowser(parameters.AuthURL);
__POOL_SYNTHETIC_IMPORT_BASELINE__
                },
                    CancellationToken.None);

            return new HelperProcess(process, client, protocolLog);
        }

        internal static Process StartProcess(string path, Action onExit, HelperLog helperLog)
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = path,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };
            process.Exited += (sender, args) =>
            {
                try
                {
                    helperLog.Log($"[{DateTime.Now:HH:mm:ss.fff}] Poolside helper process exited with code {process.ExitCode}");
                }
                catch (Exception)
                {
                    helperLog.Log($"[{DateTime.Now:HH:mm:ss.fff}] Poolside helper process exit callback fired but no exit code available");
                }
                onExit();
            };
            process.EnableRaisingEvents = true;
            process.Start();
            return process;
        }

        internal string GetProtocolLog() => string.Join("\n", protocolLog);

        internal async Task StopAsync(HelperLog helperLog = null)
        {
            helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: beginning shutdown sequence");
            if (this.client != null)
            {
                try
                {
                    // Send shutdown request but skip exit notification to work around
                    // helper bug where "exit" tool registration shadows LSP exit handler.
                    helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: sending shutdown request");
                    await client.RequestShutdown(CancellationToken.None);
                    helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: shutdown request completed");
                }
                catch (Exception ex)
                {
                    // Ignore shutdown errors - we're terminating anyway
                    helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: shutdown request failed: {ex.Message}");
                }
                helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: disposing client");
                client.Dispose();
                helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: client disposed");
                this.client = null;
            }
            if (this.process != null)
            {
                try
                {
                    if (!this.process.HasExited)
                    {
                        helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: killing process");
                        this.process.Kill();
                    }
                    else
                    {
                        helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: process already exited");
                    }
                }
                catch (Exception ex)
                {
                    // Process may have already exited
                    helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: kill failed: {ex.Message}");
                }
                this.process.Dispose();
                this.process = null;
            }
            helperLog?.Log($"[{DateTime.Now:HH:mm:ss.fff}] StopAsync: shutdown sequence complete");
        }

        internal class ShowDocumentRequest
        {
            public string uri { get; set; }
        }

        private class LoggingStream : Stream
        {
            private readonly Stream baseStream;
            private readonly Action<string> onLogEntry;

            public LoggingStream(Stream baseStream, Action<string> onLogEntry)
            {
                this.baseStream = baseStream;
                this.onLogEntry = onLogEntry;
            }

            public override async Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
            {
                var message = Encoding.UTF8.GetString(buffer, offset, count);
                onLogEntry(message);
                await baseStream.WriteAsync(buffer, offset, count, cancellationToken);
            }

            public override async Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
            {
                int bytesRead = await baseStream.ReadAsync(buffer, offset, count, cancellationToken);
                if (bytesRead > 0)
                {
                    var message = Encoding.UTF8.GetString(buffer, offset, bytesRead);
                    onLogEntry(message);
                }
                return bytesRead;
            }

            // Required overrides
            public override void Flush() => baseStream.Flush();
            public override bool CanRead => baseStream.CanRead;
            public override bool CanSeek => baseStream.CanSeek;
            public override bool CanWrite => baseStream.CanWrite;
            public override long Length => baseStream.Length;
            public override long Position { get => baseStream.Position; set => baseStream.Position = value; }
            public override int Read(byte[] buffer, int offset, int count) => baseStream.Read(buffer, offset, count);
            public override long Seek(long offset, SeekOrigin origin) => baseStream.Seek(offset, origin);
            public override void SetLength(long value) => baseStream.SetLength(value);
            public override void Write(byte[] buffer, int offset, int count) => baseStream.Write(buffer, offset, count);
        }
    }
}
