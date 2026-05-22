package helpercli

import (
	"net/http"
	"os"

__POOL_SYNTHETIC_IMPORT_BASELINE__
)

func RunOpenAPIServer() error {
	api := handler.New().OpenAPI()
	addr := os.Getenv("HELPER_OPENAPI_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	return http.ListenAndServe(addr, api.Adapter())
}
