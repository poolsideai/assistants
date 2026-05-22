// Copyright 2020 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package servertest

import (
	"context"
	"testing"
	"time"

__POOL_SYNTHETIC_IMPORT_BASELINE__
)

type msg struct {
	Msg string
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
	return reply(ctx, &msg{"pong"}, nil)
}

func TestTestServer(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
__POOL_SYNTHETIC_IMPORT_BASELINE__
	tcpTS := NewTCPServer(ctx, server, nil)
	defer tcpTS.Close()
	pipeTS := NewPipeServer(server, nil)
	defer pipeTS.Close()

	tests := []struct {
		name      string
		connector Connector
	}{
		{"tcp", tcpTS},
		{"pipe", pipeTS},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			conn := test.connector.Connect(ctx)
__POOL_SYNTHETIC_IMPORT_BASELINE__
			var got msg
			if _, err := conn.Call(ctx, "ping", &msg{"ping"}, &got); err != nil {
				t.Fatal(err)
			}
			if want := "pong"; got.Msg != want {
				t.Errorf("conn.Call(...): returned %q, want %q", got, want)
			}
		})
	}
}
