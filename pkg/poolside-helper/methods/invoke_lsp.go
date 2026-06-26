package methods

import (
	"encoding/json"
	"fmt"

	pkgerrors "github.com/pkg/errors"

	protocol2 "github.com/poolsideai/assistant/pkg/poolside-helper/gopls/pkg/protocol"
)

// InvokeLSPCommand is useful for callbacks via LSP `command` fields, as poolside.invokeLSP is
// specified to invoke the method on this LSP server.
func InvokeLSPCommand(name string, params any) (*protocol2.Command, error) {
	bytes, err := json.Marshal(params)
	if err != nil {
		return nil, pkgerrors.WithStack(err)
	}

	return &protocol2.Command{
		Title:   "-",
		Command: "poolside.invokeLSP",
		Arguments: []json.RawMessage{
			[]byte(fmt.Sprintf("%q", name)),
			bytes,
		},
	}, nil
}
