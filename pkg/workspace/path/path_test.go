package path

import (
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParse(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected Path
	}{
		{
			name:     "empty string",
			input:    "",
			expected: nil,
		},
		{
			name:     "root path",
			input:    "/",
			expected: nil,
		},
		{
			name:     "single directory",
			input:    "/usr",
			expected: Path{"usr"},
		},
		{
			name:     "multiple directories",
			input:    "/usr/local/bin",
			expected: Path{"usr", "local", "bin"},
		},
		{
			name:     "clean double slashes",
			input:    "/usr//local/bin",
			expected: Path{"usr", "local", "bin"},
		},
		{
			name:     "clean dot",
			input:    "/usr/./local/bin",
			expected: Path{"usr", "local", "bin"},
		},
		{
			name:     "clean parent directory",
			input:    "/usr/local/../bin",
			expected: Path{"usr", "bin"},
		},
		{
			name:     "no leading slash",
			input:    "usr/local/bin",
			expected: Path{"usr", "local", "bin"},
		},
		{
			name:     "trailing slash",
			input:    "/usr/local/bin/",
			expected: Path{"usr", "local", "bin"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, Parse(tt.input))
		})
	}
}

func TestPathString(t *testing.T) {
	tests := []struct {
		name     string
		path     Path
		expected string
	}{
		{
			name:     "empty path",
			path:     Path{},
__POOL_SYNTHETIC_IMPORT_BASELINE__
		},
		{
			name:     "single component",
			path:     Path{"usr"},
__POOL_SYNTHETIC_IMPORT_BASELINE__
		},
		{
			name:     "multiple components",
			path:     Path{"usr", "local", "bin"},
__POOL_SYNTHETIC_IMPORT_BASELINE__
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, tt.path.String())
		})
	}
}
