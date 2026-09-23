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
func TestGetProtectedResourceMetadataFromID(t *testing.T) {
	handler := http.NewServeMux()
	server := httptest.NewTLSServer(handler)
	defer server.Close()
__POOL_SYNTHETIC_IMPORT_BASELINE__
	handler.HandleFunc("GET /.well-known/oauth-protected-resource", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(&ProtectedResourceMetadata{Resource: server.URL}); err != nil {
			t.Error(err)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	metadata, err := GetProtectedResourceMetadataFromID(context.Background(), server.URL, server.Client())
	if err != nil {
		t.Fatal(err)
	}
	if metadata == nil || metadata.Resource != server.URL {
		t.Fatalf("metadata = %#v, want resource %q", metadata, server.URL)
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
