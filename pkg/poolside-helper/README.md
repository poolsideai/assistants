# Poolside Helper

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
holds packages either implementing or relating to Helper. Helper client
implementors should use this README, `methods/`, and the generated helper API
bindings in `../../ui/packages/helperapi`.

Communication between the editor and the poolside-helper happens over
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
defined by LSP. While some LSP features may be implemented, the methods supported by
__POOL_SYNTHETIC_IMPORT_BASELINE__
methods with `poolside/` to avoid collisions.

e.g.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "poolside/exampleMethod",
  "params": {
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
}
```

Some important details about LSP:

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

## Startup readiness diagnostics

`initialize` responds after configuration, navigation schema migration and agent
configuration migration/seeding. Runtime-install repair already runs in the
background. Do not defer migrations past this boundary or serve partially
initialized stores.

Debug logs report `helper startup phase` with a phase, duration and success flag.
Go execution traces also include `helper.initialize.*`, `acpnav.open` and
`acpnav.migrations` regions. `BenchmarkInitializeReady` covers fresh and existing
stores, including 10,000 conversations; `BenchmarkOpenUpgrade` checks migration
from a populated older schema. The benchmarks use temporary configuration and
databases and do not launch agents. Their in-process timings exclude process
launch, host transport and the client's subsequent navigation reads.

## Release

Every VS Code or Desktop release allocates or reuses an independent
`helper/vM.m.p` patch version. A new helper version is built and signed from
the exact product source SHA and published as a permanent GitHub release before
the product may publish. Retries reuse the published assets without rebuilding,
and every live product package consumes those immutable assets. Coordinated
product releases build that runtime once and share it.

The product manifests do not pin helper versions. Fresh local binary installs
and Visual Studio resolve the highest published `helper/v*` version; set
`POOLSIDE_HELPER_VERSION=helper/vM.m.p` to reproduce an exact one. Cached
Desktop binary installs remain offline-safe and can be explicitly refreshed.
VS Code debug sessions run the helper from local Go source. Desktop development
can opt into a local helper build with `POOLSIDE_DESKTOP_LOCAL_HELPER=1`.

Use the manual **Release · Helper** workflow only when a helper-only release is
needed. Release workflows own `helper/v*` creation; do not push these tags by
hand.

## Adding methods

For LSP types, use the gopls types we have vendored. For JSONRPC methods not in LSP,
add types to the methods/ package. Use huma godoc comments, as then the `poolside-helper openapi`
command will allow clients to auto-generate types for their language (although Helper is not an HTTP
API, huma was a convenient library which we already use).

Then:

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

### RPC standards

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

### Sub-handlers

To avoid all methods living in a single package, we define sub-handlers. These
__POOL_SYNTHETIC_IMPORT_BASELINE__

New sets of handlers should go in a sub-package like this rather than the main
`handler` package; keep `handler.go` itself to core JSON-RPC and server state.

If your handler cannot be constructed before `initialize` - for example
__POOL_SYNTHETIC_IMPORT_BASELINE__

```go
package handler

// handler.go
type PoolsideHandler struct {
  *foo.FooHandler
}

func newHandlerBaseState(httpClient httpClientDo) *PoolsideHandler {
  // ...
  h := &PoolsideHandler{
    // ...
    // initialize pointer we can use for registration of method addresses,
    // and we'll assign into this address when constructing Handler
    FooHandler: new(foo.Handler),
  }
}

func New(/* ... */) {
  //...
  registerExtensionMethod(handler, JSONRPCOperation{
    Method:      "poolside/fooDidChange",
__POOL_SYNTHETIC_IMPORT_BASELINE__
}


// initialize.go
func (h *PoolsideHandler) setInitializeState(params *protocol.InitializeParams) error {
  // ...
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // to by the various method handlers
  *h.FooHandler = *foo.NewHandler()
}
```

## Standards and Conventions

These are internal standards and conventions for the helper codebase.

### Error-handling

We handle runtime errors as follows:

__POOL_SYNTHETIC_IMPORT_BASELINE__
1. don't use `fmt.Errorf` etc for defining non-constant errors, use `pkgerrors.Errorf` which includes the stack
__POOL_SYNTHETIC_IMPORT_BASELINE__
1. don't log errors you return. Rely on our logging of errors higher up the stack
1. conversely, if you handle an error and it adds important information, do log it

This example indicates how to handle errors:

```go
func someMethod(...) error {
  if err := thirdparty.Something(); err != nil {
    // if you have something useful to add beyond stack + original err, use Wrap:
    // return pkgerrors.Wrap("useful info", err)
    return pkgerrors.WithStack(err)
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if err := helpercode.Something(); err != nil {
    // since we rely on all helper code following the "wrap third-party err" rule, we can confidently return err unchanged
    // when calling other helper code
    return err
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
  if badThing() {
    // when we return constant errors, we should add a runtime stacktrace to aid debugging
    return pkgerrors.WithStack(ErrTheThing)
  }
}
```

Never use `==` or `err.(SomeType)` to compare or cast errors, [use](https://go.dev/blog/go1.13-errors) `errors.Is` and `errors.As`.

__POOL_SYNTHETIC_IMPORT_BASELINE__
go stdlib: `context.WithTimeout(nil, time.Second)` will panic, but we do not panic for validation errors or a failure to read a file.

Ensure you _do not_ use `pkgerrors.New` and friends for defining constant errors, use the standard `errors` library.
Name errors `ErrBadThing`. Return such errors

```go
// good example. When _returning_ this err constant, use pkgerrors.WithStack to capture the runtime stack
var ErrGoodExample = errors.New("the bad thing")

__POOL_SYNTHETIC_IMPORT_BASELINE__
var ErrBadExample = pkgerrors.New("the bad thing")
```

Together this will ensure that:

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
3. we aim to have a single log for each error, rather than noisy re-logging of the same error throughout the stack

### Paths

A filepath is a path as per `filepath`'s POSIX normalized
FP, i.e. `foo/bar` never `C:\foo\bar` (aka "filepath.ToSlash"). Name variables
with POSIX-normalized paths `fooFP` or `fooFilepath`. OS
paths should be `fooOS` or `fooFSPath`.

In LSP, file identifiers are URIs. Generally we adopt this,
as it makes it possible to support non-local editing in the future.
If your code does not support non-`file:` URIs, return an error.

### File locations

__POOL_SYNTHETIC_IMPORT_BASELINE__
file location as _byte_ positions for complete clarity. When we modify files,
we can then be certain we're applying them in the right place, independent of
__POOL_SYNTHETIC_IMPORT_BASELINE__

### Handler

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   - output in `poolside` tab should show:
__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```json
   { "port": 21370, "message": "debugging poolside Helper via delve, connect debugger on port" }
   ```

   - there should be no output from helper yet - it has started (give it a sec or two), but delve is waiting for a client to connect

__POOL_SYNTHETIC_IMPORT_BASELINE__
   - this will attach debugging client to the running dlv/helper process
   - once successful, you should start seeing logs from helper in `poolside Helper` tab
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
## Profiling

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

## DB forward-version compatibility

Helper-owned SQLite DBs (e.g. the acpnav conversation store) run their
migrations through `internal/dbmigrate`, which wraps `golang-migrate` with a
"forward-version tolerance" policy: when a DB records a migration version
ahead of what this binary embeds (i.e. the user downgraded), the helper
logs and proceeds instead of hard-failing at startup.

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
