package data

import (
	"bytes"
	"fmt"
	"log"
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func ExampleIsBinaryFile() {
	isBinary, err := IsBinaryFile("testdata/document.pdf")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Is binary: %v\n", isBinary)
	// Output: Is binary: true
}

func TestIsBinaryFile(t *testing.T) {
	tests := []struct {
		name    string
		content []byte
		wantBin bool
		wantErr bool
		setup   func(fs afero.Fs) string
	}{
		{
			name: "text file",
			content: []byte(`Hello, this is a text file
				with multiple lines and some special chars: !@#$
				It should be detected as text.`),
			wantBin: false,
		},
		{
			name:    "empty file",
			content: []byte{},
			wantBin: false,
		},
		{
			name:    "null bytes",
			content: []byte("hello\x00world"),
			wantBin: true,
		},
		{
			name:    "ELF binary",
			content: append([]byte{0x7F, 'E', 'L', 'F'}, bytes.Repeat([]byte{1}, 100)...),
			wantBin: true,
		},
		{
			name:    "UTF-16 BE BOM",
			content: append([]byte{0xFE, 0xFF}, []byte("hello")...),
			wantBin: true,
		},
		{
			name:    "high control char ratio",
			content: bytes.Repeat([]byte{0x01, 0x02, 0x03, 0x04}, 100),
			wantBin: true,
		},
		{
			name:    "JSON file",
			content: []byte(`{"hello": "world", "numbers": [1,2,3]}`),
			wantBin: false,
		},
		{
			name: "binary extension",
			setup: func(fs afero.Fs) string {
				path := "test.exe"
				_ = afero.WriteFile(fs, path, []byte("not actually binary"), 0o644)
				return path
			},
			wantBin: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fs := afero.NewMemMapFs()
			path := "test.txt"

			if tt.setup != nil {
				path = tt.setup(fs)
			} else {
				err := afero.WriteFile(fs, path, tt.content, 0o644)
				assert.NoError(t, err)
			}

			got, err := IsBinaryFile(path, WithFS(fs))
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tt.wantBin, got)
		})
	}
}
