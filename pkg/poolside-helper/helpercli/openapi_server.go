package helpercli

import (
	"net/http"
	"os"

	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/handler"
)

func RunOpenAPIServer() error {
	api := handler.New().OpenAPI()
	addr := os.Getenv("HELPER_OPENAPI_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	return http.ListenAndServe(addr, api.Adapter())
}
