package git

import (
	"path"
	"path/filepath"
	"testing"

	gogit "github.com/go-git/go-git/v5"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestFS(t *testing.T) afero.Fs {
	fs := afero.NewMemMapFs()

	// Create a basic git directory structure
	require.NoError(t, fs.MkdirAll("/project/.git", 0o755))
	require.NoError(t, fs.MkdirAll("/project/src", 0o755))

	// Create a git file for testing worktrees/submodules
	require.NoError(t, fs.MkdirAll("/worktree", 0o755))
	gitFileContent := "gitdir: /project/.git/worktrees/feature"
	require.NoError(t, afero.WriteFile(fs, "/worktree/.git", []byte(gitFileContent), 0o644))

	return fs
}

func TestLocate(t *testing.T) {
	tests := []struct {
		name      string
		startPath string
		wantErr   error
		dotGit    string
		worktree  string
	}{
		{
			name:      "finds .git in current directory",
			startPath: "/project/src",
			dotGit:    "/project/.git",
			worktree:  "/project",
		},
		{
			name:      "finds .git in parent directory",
			startPath: "/project/src/nested",
			dotGit:    "/project/.git",
			worktree:  "/project",
		},
		{
			name:      "returns error when no .git found",
			startPath: "/other",
			wantErr:   ErrNoDotGitDir,
		},
		{
			name:      "handles .git file (worktree)",
			startPath: "/worktree",
			dotGit:    "/project/.git/worktrees/feature",
			worktree:  "/worktree",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fs := setupTestFS(t)

			dot, wt, err := Locate(fs, tt.startPath)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}

			require.NoError(t, err)
			require.NotEmpty(t, dot)
			require.NotEmpty(t, wt)

			assert.Equal(t, tt.dotGit, dot.Path, "dot git dir")
			assert.Equal(t, tt.worktree, wt.Path, "worktree")
		})
	}
}

func TestParseDotGitFile(t *testing.T) {
	const rootPath = "/test"
	tests := []struct {
		name        string
		fileContent string
		wantErr     bool
		path        string
	}{
		{
			name:        "valid absolute path",
			fileContent: "gitdir: /absolute/path/to/.git",
			path:        "/absolute/path/to/.git",
		},
		{
			name:        "valid relative path",
			fileContent: "gitdir: relative/path/to/.git",
			path:        path.Join(rootPath, "relative/path/to/.git"),
		},
		{
			name:        "invalid format",
			fileContent: "not a git dir",
			wantErr:     true,
		},
		{
			name:    "empty file",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fs := afero.NewMemMapFs()
			require.NoError(t, fs.MkdirAll(rootPath, 0o755))
			require.NoError(t, afero.WriteFile(fs, filepath.Join(rootPath, gogit.GitDirName), []byte(tt.fileContent), 0o644))

			bfs, err := parseDotGitFile(fs, rootPath)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, bfs)
				return
			}

			require.NoError(t, err)
			require.NotEmpty(t, bfs)
			assert.Equal(t, tt.path, bfs.Path)
		})
	}
}
