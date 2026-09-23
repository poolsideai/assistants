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
func TestCreateIgnoredChecker(t *testing.T) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
	root := filepath.Join(string(filepath.Separator), "workspace")
	require.NoError(t, fs.MkdirAll(root, 0o755))
	require.NoError(t, afero.WriteFile(fs, filepath.Join(root, ".poolsideignore"), []byte("ignored.txt\n"), 0o644))
	require.NoError(t, afero.WriteFile(fs, filepath.Join(root, "ignored.txt"), []byte("text"), 0o644))
	require.NoError(t, afero.WriteFile(fs, filepath.Join(root, "regular.txt"), []byte("text"), 0o644))
	require.NoError(t, afero.WriteFile(fs, filepath.Join(root, "binary.dat"), []byte{0, 1, 2}, 0o644))
__POOL_SYNTHETIC_IMPORT_BASELINE__
	checkIgnored, err := CreateIgnoredChecker(fs, root)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	assert.True(t, checkIgnored(filepath.Join(root, "ignored.txt"), false))
	assert.True(t, checkIgnored(filepath.Join(root, "binary.dat"), false))
	assert.False(t, checkIgnored(filepath.Join(root, "regular.txt"), false))
	assert.True(t, checkIgnored(filepath.Join(root, "node_modules"), true))
__POOL_SYNTHETIC_IMPORT_BASELINE__
