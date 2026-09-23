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

func TestNormalizePath(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		want        string
		expectError bool
	}{
		{
			name:        "empty string should error",
			input:       "",
			expectError: true,
		},
		{
			name:        "unix absolute path",
			input:       "/home/user/file.txt",
			want:        "/home/user/file.txt",
			expectError: false,
		},
		{
			name:        "unix relative path should error",
			input:       "home/user/file.txt",
			expectError: true,
		},
		{
			name:        "windows absolute path with backslashes",
			input:       `C:\Users\user\file.txt`,
			want:        "/c:/Users/user/file.txt",
			expectError: false,
		},
		{
			name:        "windows absolute path with forward slashes",
			input:       "C:/Users/user/file.txt",
			want:        "/c:/Users/user/file.txt",
			expectError: false,
		},
		{
			name:        "windows path with uppercase drive",
			input:       `D:\Program Files\app.exe`,
			want:        "/d:/Program Files/app.exe",
			expectError: false,
		},
		{
			name:        "windows path with lowercase drive",
			input:       `c:\temp\test.log`,
			want:        "/c:/temp/test.log",
			expectError: false,
		},
		{
			name:        "windows relative path should error",
			input:       `folder\subfolder\file.txt`,
			expectError: true,
		},
		{
			name:        "mixed separators",
			input:       `C:\folder/subfolder\file.txt`,
			want:        "/c:/folder/subfolder/file.txt",
			expectError: false,
		},
		{
			name:        "root path",
			input:       "/",
			want:        "/",
			expectError: false,
		},
		{
			name:        "windows root drive",
			input:       `C:\`,
			want:        "/c:/",
			expectError: false,
		},
		{
			name:        "single folder should error",
			input:       "folder",
			expectError: true,
		},
		{
			name:        "already normalized posix path",
			input:       "/already/normalized/path",
			want:        "/already/normalized/path",
			expectError: false,
		},
		{
			name:        "already normalized windows path",
			input:       "/c:/already/normalized/path",
			want:        "/c:/already/normalized/path",
			expectError: false,
		},
		{
			name:        "relative path with dots should error",
			input:       "./relative/path",
			expectError: true,
		},
		{
			name:        "relative path with parent should error",
			input:       "../relative/path",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := NormalizePath(tt.input)
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, result)
			}
		})
	}
}

func TestNormalizeAndParsePath(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		want        DocumentURI
		expectError bool
	}{
		{
			name:        "unix absolute path",
			input:       "/home/user/file.txt",
			want:        "file:///home/user/file.txt",
			expectError: false,
		},
		{
			name:        "windows absolute path with backslashes",
			input:       `C:\Users\user\file.txt`,
			want:        "file:///c:/Users/user/file.txt",
			expectError: false,
		},
		{
			name:        "windows absolute path with forward slashes",
			input:       "C:/Users/user/file.txt",
			want:        "file:///c:/Users/user/file.txt",
			expectError: false,
		},
		{
			name:        "relative path should error",
			input:       "relative/path",
			expectError: true,
		},
		{
			name:        "empty string should error",
			input:       "",
			expectError: true,
		},
		{
			name:        "root path",
			input:       "/",
			want:        "file:///",
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := NormalizeAndParsePath(tt.input)
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, result)
			}
		})
	}
}
