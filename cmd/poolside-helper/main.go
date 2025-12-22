package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/danielgtaylor/huma/v2"
	"github.com/spf13/cobra"

	"github.com/poolsideai/assistant/pkg/common/version"
	"github.com/poolsideai/assistant/pkg/poolside-helper/logging"
)

func main() {
	huma.DefaultArrayNullable = false

	logging.Init()
	rootCmd := rootCommandCreate()

	slog.Info("poolside-helper", slog.String("version", version.Human()), "pid", os.Getpid())

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
	}
}

func rootCommandCreate() *cobra.Command {
	rootCmd := rootCommand()

	// the LSP client will start up the server with its own flag handling
	rootCmd.FParseErrWhitelist.UnknownFlags = true

	rootCmd.AddCommand(apiDocsCommand())
	rootCmd.AddCommand(tailCommand())

	return rootCmd
}
