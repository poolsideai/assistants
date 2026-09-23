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
	// GitDiffOpenMethod opens a bounded, incrementally-readable diff snapshot.
	GitDiffOpenMethod = gitMethodPrefix + "diffOpen"
	// GitDiffListMethod reads the next page of file summaries from a snapshot.
	GitDiffListMethod = gitMethodPrefix + "diffList"
	// GitDiffReadMethod reads one bounded patch chunk for a file in a snapshot.
	GitDiffReadMethod = gitMethodPrefix + "diffRead"
	// GitDiffContentsMethod reads the full before/after contents for one file
	// in a snapshot's scope, so the viewer can expand collapsed context.
	GitDiffContentsMethod = gitMethodPrefix + "diffContents"
	// GitDiffStatsMethod polls asynchronously-computed snapshot totals.
	GitDiffStatsMethod = gitMethodPrefix + "diffStats"
	// GitDiffCloseMethod releases a diff snapshot and its running git commands.
	GitDiffCloseMethod = gitMethodPrefix + "diffClose"
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// unstaged + untracked, binary files excluded) for +n/−n summaries.
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
// GitDiffScope selects which worktree changes a diff snapshot contains.
type GitDiffScope string

const (
	GitDiffScopeUncommitted GitDiffScope = "uncommitted"
	GitDiffScopeStaged      GitDiffScope = "staged"
	GitDiffScopeUnstaged    GitDiffScope = "unstaged"
)

// GitDiffFileSummary is the lightweight file chrome shown before patch data is
// requested. StatsReady indicates whether additions and deletions are final.
type GitDiffFileSummary struct {
	Path       string `json:"path"`
	OrigPath   string `json:"origPath,omitempty"`
	Status     string `json:"status"`
	StatsReady bool   `json:"statsReady,omitempty"`
	Additions  int    `json:"additions,omitempty"`
	Deletions  int    `json:"deletions,omitempty"`
	Binary     bool   `json:"binary,omitempty"`
}

type GitDiffFileStats struct {
	Path      string `json:"path"`
	Additions int    `json:"additions,omitempty"`
	Deletions int    `json:"deletions,omitempty"`
	Binary    bool   `json:"binary,omitempty"`
}

type GitDiffStats struct {
	Files     int                `json:"files"`
	Additions int                `json:"additions"`
	Deletions int                `json:"deletions"`
	FileStats []GitDiffFileStats `json:"fileStats,omitempty"`
}

// GitDiffOpenParams starts a snapshot. TargetPath lets a file-opening gesture
// render that file without waiting for its position in the manifest stream.
type GitDiffOpenParams struct {
	Path       string       `json:"path"`
	Scope      GitDiffScope `json:"scope,omitempty"`
	TargetPath string       `json:"targetPath,omitempty"`
}

func (p GitDiffOpenParams) MethodName() string { return GitDiffOpenMethod }
func (p GitDiffOpenParams) Description() string {
	return "Open an incrementally-readable git diff snapshot"
}

type GitDiffOpenOutput struct {
	// Unavailable is true when Path is not a worktree or git cannot be run.
	// No session is created in that case.
	Unavailable bool                 `json:"unavailable,omitempty"`
	GitMissing  bool                 `json:"gitMissing,omitempty"`
	SessionID   string               `json:"sessionId"`
	Files       []GitDiffFileSummary `json:"files"`
	NextCursor  string               `json:"nextCursor,omitempty"`
	Complete    bool                 `json:"complete"`
	Target      *GitDiffFileSummary  `json:"target,omitempty"`
	Stats       *GitDiffStats        `json:"stats,omitempty"`
}

type GitDiffListParams struct {
	SessionID string `json:"sessionId"`
	Cursor    string `json:"cursor,omitempty"`
}

func (p GitDiffListParams) MethodName() string { return GitDiffListMethod }
func (p GitDiffListParams) Description() string {
	return "Read the next file-summary page from a git diff snapshot"
}

type GitDiffListOutput struct {
	Files      []GitDiffFileSummary `json:"files"`
	NextCursor string               `json:"nextCursor,omitempty"`
	Complete   bool                 `json:"complete"`
	Stats      *GitDiffStats        `json:"stats,omitempty"`
}

// GitDiffChunk is capped by both line count and encoded patch bytes. Patch is
// a self-contained single-file unified patch that can be parsed independently;
// it packs as many whole hunks as fit under the caps.
type GitDiffChunk struct {
	Patch     string `json:"patch"`
	Rows      int    `json:"rows"`
	Additions int    `json:"additions"`
	Deletions int    `json:"deletions"`
	// Hunks is the number of @@ sections in Patch, for row-height estimates.
	Hunks          int  `json:"hunks,omitempty"`
	Binary         bool `json:"binary,omitempty"`
	TruncatedLines int  `json:"truncatedLines,omitempty"`
}

type GitDiffReadParams struct {
	SessionID string `json:"sessionId"`
	File      string `json:"file"`
	Cursor    string `json:"cursor,omitempty"`
}

func (p GitDiffReadParams) MethodName() string { return GitDiffReadMethod }
func (p GitDiffReadParams) Description() string {
	return "Read one bounded file patch chunk from a git diff snapshot"
}

type GitDiffReadOutput struct {
	Chunk      *GitDiffChunk `json:"chunk,omitempty"`
	NextCursor string        `json:"nextCursor,omitempty"`
	Complete   bool          `json:"complete"`
}

type GitDiffContentsParams struct {
	SessionID string `json:"sessionId"`
	// File is the repo-relative path of the file to load.
	File string `json:"file"`
}

func (p GitDiffContentsParams) MethodName() string { return GitDiffContentsMethod }
func (p GitDiffContentsParams) Description() string {
	return "Read the full before/after file contents for a git diff snapshot"
}

type GitDiffContentsOutput struct {
	// HasContents is true when OldContent/NewContent carry the full before and
	// after contents for the snapshot's scope. False when either side is
	// unavailable or oversized; the diff still renders collapsed-only.
	HasContents bool `json:"hasContents,omitempty"`
	// OldContent is the full base-side content (HEAD for uncommitted and
	// staged scopes, the index for unstaged; empty for untracked files).
	OldContent string `json:"oldContent,omitempty"`
	// NewContent is the full result-side content (the index for the staged
	// scope, the worktree file otherwise).
	NewContent string `json:"newContent,omitempty"`
}

type GitDiffStatsParams struct {
	SessionID string `json:"sessionId"`
}

func (p GitDiffStatsParams) MethodName() string { return GitDiffStatsMethod }
func (p GitDiffStatsParams) Description() string {
	return "Poll totals for a git diff snapshot"
}

type GitDiffStatsOutput struct {
	Ready bool          `json:"ready"`
	Stats *GitDiffStats `json:"stats,omitempty"`
}

type GitDiffCloseParams struct {
	SessionID string `json:"sessionId"`
}

func (p GitDiffCloseParams) MethodName() string { return GitDiffCloseMethod }
func (p GitDiffCloseParams) Description() string {
	return "Close a git diff snapshot"
}

type GitDiffCloseOutput struct{}

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
