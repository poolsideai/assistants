__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// bundle has been embedded (via scripts/embed-webui.mjs), the app shell is
// present — as index.html.gz since the embed step gzips compressible assets
// — and FS reports built=true; a bare checkout reports built=false.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if !built {
		return
	}
	for _, name := range []string{"index.html", "index.html.gz"} {
		if _, err := fs.Stat(fsys, name); err == nil {
			return
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	t.Fatal("FS() reported built=true but no index.html or index.html.gz is present")
__POOL_SYNTHETIC_IMPORT_BASELINE__
