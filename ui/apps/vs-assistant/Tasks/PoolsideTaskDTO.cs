using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Poolside.Assistant.Tasks
{
    /** The form of a task when it is being transmitted between web view and host. */
    public class PoolsideTaskDTO
    {
        public string id { get; set; }
        public string conversationId { get; set; }
        public string fromConversationMessageId { get; set; }
        public string toConversationMessageId { get; set; }
        public int? baseVersionId { get; set; }
        public string status { get; set; }
        public PoolsideTaskVersionDTO[] versions { get; set; }
        public string createdAt { get; set; }
        public string endedAt { get; set; }
    }

    public class PoolsideTaskVersionDTO
    {
        public string id { get; set; }
        public int? number { get; set; }
        public int? versionId { get; set; }
        public PoolsideTaskVersionAuthorDTO author { get; set; }
        public string operation { get; set; }
        public string title { get; set; }
        public string conversationMessageId { get; set; }
        public string rollbackTaskVersionId { get; set; }
        public string kind { get; set; }
        public PoolsideTaskVersionFileDTO[] files { get; set; }
        public string createdAt { get; set; }
        public string failureReason { get; set; }
    }

    public class PoolsideTaskVersionAuthorDTO
    {
        public string name { get; set; }
        public string pictureUrl { get; set; }
    }

    public class PoolsideTaskVersionFileDTO
    {
        public string path { get; set; }
        public string oldPath { get; set; }
        public string operation { get; set; }
        public string status { get; set; }
        public List<TaskVersionFileLineChange> revertedLines { get; set; }
    }

    public class TaskVersionFileLineChange {
        public int originalLine { get; set; }
        public int modifiedLine { get; set; }
        public bool isAdd { get; set; }
        public bool isDel { get; set; }
    }
}
