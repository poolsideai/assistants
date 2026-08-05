using CefSharp.Wpf;
using Newtonsoft.Json;
using Poolside.Assistant.WebViewInfrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant.Tasks
{
    internal class TasksWebViewCommunicator : WebViewCommunicator
    {
        protected override string ColorThemeChangedMethod => "onColorThemeChange";

        internal TasksWebViewCommunicator(ChromiumWebBrowser browser, PoolsideTaskDTO task, PoolsideTaskVersionDTO version)
            : base(browser, $"this.POOLSIDE_INITIAL_TASK_STATE = {JsonConvert.SerializeObject(task)};\n" +
                  (version != null ? $"this.POOLSIDE_SELECTED_TASK_VERSION_ID = \"{version.id}\";\n" : ""))
        {
        }
    }
}
