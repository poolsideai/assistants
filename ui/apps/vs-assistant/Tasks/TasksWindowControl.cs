using CefSharp;
using Poolside.Assistant.HelperLSP;
using Poolside.Assistant.WebViewInfrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant.Tasks
{
    internal class TasksWindowControl : WebViewControl
    {
        internal TasksWindowControl(PoolsideTaskDTO task, PoolsideTaskVersionDTO version)
            : base("tasks.html", browser => new TasksWebViewCommunicator(browser, task, version))
        {
        }
    }
}
