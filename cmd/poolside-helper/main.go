package main

import (
	"fmt"
	"log/slog"
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
	"github.com/spf13/cobra"

	"github.com/poolsideai/assistant/pkg/common/version"
	"github.com/poolsideai/assistant/pkg/poolside-helper/logging"
)

func main() {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	logging.Init()
	rootCmd := rootCommandCreate()

__POOL_SYNTHETIC_IMPORT_BASELINE__

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
	}
}

func rootCommandCreate() *cobra.Command {
	rootCmd := rootCommand()

	// the LSP client will start up the server with its own flag handling
	rootCmd.FParseErrWhitelist.UnknownFlags = true

	rootCmd.AddCommand(apiDocsCommand())
__POOL_SYNTHETIC_IMPORT_BASELINE__

	return rootCmd
}
