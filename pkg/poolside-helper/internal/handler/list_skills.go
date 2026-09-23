__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"bufio"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"gopkg.in/yaml.v3"

	"github.com/poolsideai/assistant/pkg/common/userconfig"
	protocol "github.com/poolsideai/assistant/pkg/poolside-helper/gopls/pkg/protocol"
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
func (h *PoolsideHandler) listSkillsHandler(_ context.Context, _ *ListSkillsParams, _ *glsp.Context) (*ListSkillsOutput, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = ""
	}
	workspacePaths := make([]string, 0, len(h.GetWorkspaceFolders()))
	for _, folder := range h.GetWorkspaceFolders() {
		if workspacePath := protocol.DocumentURI(folder.URI).Path(); workspacePath != "" {
			workspacePaths = append(workspacePaths, workspacePath)
		}
	}

	return &ListSkillsOutput{
		Skills: discoverSkills(skillRoots(homeDir, userconfig.Directory(), workspacePaths)),
	}, nil
}

// skillRoots lists Claude-compatible roots alongside poolside ones because the
// assistant ships Claude agents whose skills live under `.claude`. Within each
// level the Claude root comes first so a poolside skill wins a name collision,
// and user roots come before workspace roots so workspace skills win overall.
func skillRoots(homeDir, configDir string, workspacePaths []string) []skillRoot {
	roots := make([]skillRoot, 0, 2*len(workspacePaths)+2)
	if homeDir != "" {
		roots = append(roots, skillRoot{
			dir:      filepath.Join(homeDir, ".claude", "skills"),
			location: "user",
		})
	}
	if configDir != "" {
		roots = append(roots, skillRoot{
			dir:      filepath.Join(configDir, "poolside", "skills"),
			location: "user",
		})
	}
	for _, workspacePath := range workspacePaths {
		roots = append(roots, skillRoot{
			dir:      filepath.Join(workspacePath, ".claude", "skills"),
			location: "workspace",
		})
		roots = append(roots, skillRoot{
			dir:      filepath.Join(workspacePath, ".poolside", "skills"),
			location: "workspace",
		})
	}
	return roots
}

type skillRoot struct {
	dir      string
	location string
}

type skillFrontmatter struct {
	Name        string `yaml:"name"`
	Description string `yaml:"description"`
}

const maxSkillFrontmatterBytes = 64 * 1024

func discoverSkills(roots []skillRoot) []SkillSummary {
	byName := make(map[string]SkillSummary)
	for _, root := range roots {
		entries, err := os.ReadDir(root.dir)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			dirPath := filepath.Join(root.dir, entry.Name())
			dirInfo, err := os.Lstat(dirPath)
			if err != nil || !dirInfo.IsDir() || dirInfo.Mode()&os.ModeSymlink != 0 {
				continue
			}
			frontmatter, ok := readSkillFrontmatter(filepath.Join(dirPath, "SKILL.md"))
			if !ok {
				continue
			}
			byName[strings.ToLower(frontmatter.Name)] = SkillSummary{
				Name:        frontmatter.Name,
				Description: frontmatter.Description,
				Location:    root.location,
				DirPath:     dirPath,
			}
		}
	}

	skills := make([]SkillSummary, 0, len(byName))
	for _, skill := range byName {
		skills = append(skills, skill)
	}
	sort.Slice(skills, func(i, j int) bool {
		return strings.ToLower(skills[i].Name) < strings.ToLower(skills[j].Name)
	})
	return skills
}

func readSkillFrontmatter(path string) (skillFrontmatter, bool) {
	pathInfo, err := os.Lstat(path)
	if err != nil || !pathInfo.Mode().IsRegular() {
		return skillFrontmatter{}, false
	}

	file, err := os.Open(path)
	if err != nil {
		return skillFrontmatter{}, false
	}
	defer file.Close()

	openedInfo, err := file.Stat()
	if err != nil || !openedInfo.Mode().IsRegular() || !os.SameFile(pathInfo, openedInfo) {
		return skillFrontmatter{}, false
	}

	scanner := bufio.NewScanner(io.LimitReader(file, maxSkillFrontmatterBytes+1))
	scanner.Buffer(make([]byte, 4096), maxSkillFrontmatterBytes)
	if !scanner.Scan() || strings.TrimSpace(scanner.Text()) != "---" {
		return skillFrontmatter{}, false
	}

	var yamlText strings.Builder
	bytesRead := len(scanner.Bytes()) + 1
	for scanner.Scan() {
		bytesRead += len(scanner.Bytes()) + 1
		if bytesRead > maxSkillFrontmatterBytes {
			return skillFrontmatter{}, false
		}
		if strings.TrimSpace(scanner.Text()) == "---" {
			return parseSkillFrontmatter(yamlText.String())
		}
		yamlText.Write(scanner.Bytes())
		yamlText.WriteByte('\n')
	}
	return skillFrontmatter{}, false
}

func parseSkillFrontmatter(data string) (skillFrontmatter, bool) {
	var frontmatter skillFrontmatter
	if err := yaml.Unmarshal([]byte(data), &frontmatter); err != nil {
		return skillFrontmatter{}, false
	}
	frontmatter.Name = strings.TrimSpace(frontmatter.Name)
	frontmatter.Description = strings.TrimSpace(frontmatter.Description)
	if frontmatter.Name == "" {
		return skillFrontmatter{}, false
	}
	return frontmatter, true
__POOL_SYNTHETIC_IMPORT_BASELINE__
