// Copyright 2018 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package protocol

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"

	"golang.org/x/telemetry/crashmonitor"

	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/gopls/gotoolsinternal/event"
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/gopls/gotoolsinternal/jsonrpc2"
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/gopls/gotoolsinternal/xcontext"
	"github.com/poolsideai/assistant/pkg/poolside-helper/internal/gopls/pkg/util/bug"
)

var (
	// RequestCancelledError should be used when a request is cancelled early.
__POOL_SYNTHETIC_IMPORT_BASELINE__
)

type ClientCloser interface {
	Client
	io.Closer
}

type connSender interface {
	io.Closer

	Notify(ctx context.Context, method string, params interface{}) error
	Call(ctx context.Context, method string, params, result interface{}) error
}

type clientDispatcher struct {
	sender connSender
}

func (c *clientDispatcher) Close() error {
	return c.sender.Close()
}

// ClientDispatcher returns a Client that dispatches LSP requests across the
// given jsonrpc2 connection.
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return &clientDispatcher{sender: clientConn{conn}}
}

type clientConn struct {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

func (c clientConn) Close() error {
	return c.conn.Close()
}

func (c clientConn) Notify(ctx context.Context, method string, params interface{}) error {
	return c.conn.Notify(ctx, method, params)
}

func (c clientConn) Call(ctx context.Context, method string, params interface{}, result interface{}) error {
	id, err := c.conn.Call(ctx, method, params, result)
	if ctx.Err() != nil {
		cancelCall(ctx, c, id)
	}
	return err
}

// ServerDispatcher returns a Server that dispatches LSP requests across the
// given jsonrpc2 connection.
__POOL_SYNTHETIC_IMPORT_BASELINE__
	return &serverDispatcher{sender: clientConn{conn}}
}

type serverDispatcher struct {
	sender connSender
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if ctx.Err() != nil {
			ctx := xcontext.Detach(ctx)
			return reply(ctx, nil, RequestCancelledError)
		}
		handled, err := clientDispatch(ctx, client, reply, req)
		if handled || err != nil {
			return err
		}
		return handler(ctx, reply, req)
	}
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if ctx.Err() != nil {
			ctx := xcontext.Detach(ctx)
			return reply(ctx, nil, RequestCancelledError)
		}
		handled, err := serverDispatch(ctx, server, reply, req)
		if handled || err != nil {
			return err
		}
		return handler(ctx, reply, req)
	}
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
	return CancelHandler(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
		if req.Method() != "$/cancelRequest" {
			// TODO(iancottrell): See if we can generate a reply for the request to be cancelled
			// at the point of cancellation rather than waiting for gopls to naturally reply.
			// To do that, we need to keep track of whether a reply has been sent already and
			// be careful about racing between the two paths.
			// TODO(iancottrell): Add a test that watches the stream and verifies the response
			// for the cancelled request flows.
			replyWithDetachedContext := func(ctx context.Context, resp interface{}, err error) error {
				// https://microsoft.github.io/language-server-protocol/specifications/specification-current/#cancelRequest
				if ctx.Err() != nil && err == nil {
					err = RequestCancelledError
				}
				ctx = xcontext.Detach(ctx)
				return reply(ctx, resp, err)
			}
			return handler(ctx, replyWithDetachedContext, req)
		}
		var params CancelParams
		if err := UnmarshalJSON(req.Params(), &params); err != nil {
			return sendParseError(ctx, reply, err)
		}
		if n, ok := params.ID.(float64); ok {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		} else if s, ok := params.ID.(string); ok {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		} else {
			return sendParseError(ctx, reply, fmt.Errorf("request ID %v malformed", params.ID))
		}
		return reply(ctx, nil, nil)
	}
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
	id, err := conn.Call(ctx, method, params, result)
	if ctx.Err() != nil {
		cancelCall(ctx, clientConn{conn}, id)
	}
	return err
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
	ctx = xcontext.Detach(ctx)
	ctx, done := event.Start(ctx, "protocol.canceller")
	defer done()
	// Note that only *jsonrpc2.ID implements json.Marshaler.
	sender.Notify(ctx, "$/cancelRequest", &CancelParams{ID: &id})
}

// UnmarshalJSON unmarshals msg into the variable pointed to by
// params. In JSONRPC, optional messages may be
// "null", in which case it is a no-op.
func UnmarshalJSON(msg json.RawMessage, v any) error {
	if len(msg) == 0 || bytes.Equal(msg, []byte("null")) {
		return nil
	}
	return json.Unmarshal(msg, v)
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

// NonNilSlice returns x, or an empty slice if x was nil.
//
// (Many slice fields of protocol structs must be non-nil
// to avoid being encoded as JSON "null".)
func NonNilSlice[T comparable](x []T) []T {
	if x == nil {
		return []T{}
	}
	return x
}

func recoverHandlerPanic(method string) {
	// Report panics in the handler goroutine,
	// unless we have enabled the monitor,
	// which reports all crashes.
	if !crashmonitor.Supported() {
		defer func() {
			if x := recover(); x != nil {
				bug.Reportf("panic in %s request", method)
				panic(x)
			}
		}()
	}
}
