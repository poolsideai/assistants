//go:build tools

// Package tools pins nogo analyzer dependencies so they appear as direct deps
// in go.mod, making them available as Bazel external repositories.
package tools

import (
	_ "github.com/gordonklaus/ineffassign/pkg/ineffassign"
	_ "honnef.co/go/tools/staticcheck/sa1000"
)
