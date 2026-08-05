using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant.Context
{
    public class ActiveFileContext
    {
        public Workspace[] workspaces { get; set; }
        public string homeDirectory { get; set; }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }

    public class Workspace
    {
        public string path { get; set; }
        public string name { get; set; }
        public int index { get; set; }
    }

    public class AttachedFile
    {
        public string path { get; set; }
        public string content { get; set; }
        public int[] selection { get; set; }
        public string selectedCode { get; set; }
        public TextRange visibleRange { get; set; }
        public bool codeSymbolsAvailable { get; set; }
    }

    public class TextRange
    {
        public int start { get; set; }
        public int end { get; set; }
    }
}
