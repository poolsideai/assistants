using Microsoft.VisualStudio.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant
{
    public static class PoolsideFileMarkdownRegistration
    {
        [Export(typeof(FileExtensionToContentTypeDefinition))]
        [ContentType("vs-markdown")]
        [FileExtension(".poolside")]
        public static FileExtensionToContentTypeDefinition PoolsideFileExtension;
    }
}
