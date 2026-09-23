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
	h.applyWorkspaceFolderChange(params)
	if h.fileSearchHandler != nil {
		h.fileSearchHandler.Invalidate()
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return nil, h.handleWorkspaceDidChangeWatchedFiles(ctx, params)
}

func (h *PoolsideHandler) handleWorkspaceDidChangeWatchedFiles(ctx context.Context, params *protocol3.DidChangeWatchedFilesParams) error {
	if h.fileSearchHandler != nil {
		h.fileSearchHandler.Invalidate()
	}
	return nil
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if h.fileSearchHandler != nil {
		h.fileSearchHandler.Invalidate()
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if h.fileSearchHandler != nil {
		h.fileSearchHandler.Invalidate()
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	if h.fileSearchHandler != nil {
		h.fileSearchHandler.Invalidate()
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func (h *PoolsideHandler) applyWorkspaceFolderChange(params *protocol3.DidChangeWorkspaceFoldersParams) {
	if params == nil {
		return
	}
	h.mx.Lock()
	defer h.mx.Unlock()

	removed := make(map[string]struct{}, len(params.Event.Removed))
	for _, folder := range params.Event.Removed {
		removed[string(folder.URI)] = struct{}{}
	}
	capacity := max(len(h.workspaceFolders)-len(removed)+len(params.Event.Added), 0)
	next := make([]protocol.WorkspaceFolder, 0, capacity)
	for _, folder := range h.workspaceFolders {
		if _, ok := removed[string(folder.URI)]; ok {
			continue
		}
		next = append(next, folder)
	}
	for _, folder := range params.Event.Added {
		next = append(next, protocol.WorkspaceFolder{
			URI:  protocol.DocumentUri(folder.URI),
			Name: folder.Name,
		})
	}
	h.workspaceFolders = next
}
