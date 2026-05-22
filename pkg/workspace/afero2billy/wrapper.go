// Package afero2billy provides a wrapper to convert spf13/afero filesystem implementations
// to go-git/go-billy filesystem interfaces. This allows using afero filesystems with go-git.
package afero2billy

import (
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"os"
	"path/filepath"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-billy/v5/helper/chroot"
	"github.com/go-git/go-billy/v5/util"
	"github.com/spf13/afero"
)

// New creates a new Wrapper around an afero.Fs at the given path.
func New(fs afero.Fs, path string) Wrapper {
	return Wrapper{Fs: fs, Path: path}
}

// Wrapper adapts an afero.Fs to implement the billy.Filesystem interface.
type Wrapper struct {
	afero.Fs
	Path string
}

// ReadOnly returns a new Wrapper that provides read-only access to the underlying filesystem.
func (w Wrapper) ReadOnly() Wrapper {
	return Wrapper{
		Fs:   afero.NewReadOnlyFs(w.Fs),
		Path: w.Path,
	}
}

// fileWrapper adapts an afero.File to implement the billy.File interface.
type fileWrapper struct {
	afero.File
}

var (
	_ billy.Filesystem = (*Wrapper)(nil)
	_ billy.File       = (*fileWrapper)(nil)
)

// Lock implements billy.File interface but is a no-op for this implementation.
func (f fileWrapper) Lock() error {
	// not necessary
	return nil
}

// Unlock implements billy.File interface but is a no-op for this implementation.
func (f fileWrapper) Unlock() error {
	// not necessary
	return nil
}

// Create creates a new file with the specified name.
func (w Wrapper) Create(filename string) (billy.File, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
	}
	return fileWrapper{file}, nil
}

// Open opens a file for reading.
func (w Wrapper) Open(filename string) (billy.File, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
	}
	return fileWrapper{file}, nil
}

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
// OpenFile opens a file using the given flags and permissions.
func (w Wrapper) OpenFile(filename string, flag int, perm os.FileMode) (billy.File, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		return nil, err
	}
	return fileWrapper{file}, nil
}

// Join joins the given path elements into a single path.
func (w Wrapper) Join(elem ...string) string {
	return filepath.Join(elem...)
}

// ReadDir reads the directory named by path and returns a list of directory entries.
func (w Wrapper) ReadDir(path string) ([]os.FileInfo, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if err != nil {
		return nil, err
	}
	defer d.Close()
	return d.Readdir(0)
}

// TempFile creates a new temporary file in the directory dir with a name beginning with prefix.
func (w Wrapper) TempFile(dir, prefix string) (billy.File, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

// Lstat returns a FileInfo describing the named file. If the file is a symbolic link,
// it returns info about the link itself, not the target.
func (w Wrapper) Lstat(filename string) (os.FileInfo, error) {
	if fs, ok := w.Fs.(afero.Lstater); ok {
		stat, _, err := fs.LstatIfPossible(filename)
		return stat, err
	}

	return w.Stat(filename)
}

// Symlink creates a symbolic link link pointing to target.
func (w Wrapper) Symlink(target, link string) error {
	if fs, ok := w.Fs.(afero.Linker); ok {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}

	return afero.ErrNoSymlink
}

// Readlink returns the destination of the named symbolic link.
func (w Wrapper) Readlink(link string) (string, error) {
	if fs, ok := w.Fs.(afero.LinkReader); ok {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	}

	return "", afero.ErrNoReadlink
}

// Chroot creates a new filesystem from the same type providing a new root.
func (w Wrapper) Chroot(path string) (billy.Filesystem, error) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

// Root returns the root path of the filesystem.
func (w Wrapper) Root() string {
	return w.Path
}
