// Copyright 2020 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package stack_test

import (
	"bytes"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

__POOL_SYNTHETIC_IMPORT_BASELINE__
)

func TestProcess(t *testing.T) {
	for _, test := range []struct{ name, input, expect string }{{
		name:   `empty`,
		input:  ``,
		expect: ``,
	}, {
		name:  `no_frame`,
		input: `goroutine 1 [running]:`,
		expect: `
[running]: $1

1 goroutines, 1 unique
`,
	}, {
		name: `one_frame`,
		input: `
goroutine 1 [running]:
package.function(args)
	file.go:10
`,
		expect: `
[running]: $1
file.go:10: function

1 goroutines, 1 unique
`,
	}, {
		name: `one_call`,
		input: `
goroutine 1 [running]:
package1.functionA(args)
	file1.go:10
package2.functionB(args)
	file2.go:20
package3.functionC(args)
	file3.go:30
`,
		expect: `
[running]: $1
file1.go:10: functionA
file2.go:20: functionB
file3.go:30: functionC

1 goroutines, 1 unique
`,
	}, {
		name: `two_call`,
		input: `
goroutine 1 [running]:
package1.functionA(args)
	file1.go:10
goroutine 2 [running]:
package2.functionB(args)
	file2.go:20
`,
		expect: `
[running]: $1
file1.go:10: functionA

[running]: $2
file2.go:20: functionB

2 goroutines, 2 unique
`,
	}, {
		name: `merge_call`,
		input: `
goroutine 1 [running]:
package1.functionA(args)
	file1.go:10
goroutine 2 [running]:
package1.functionA(args)
	file1.go:10
`,
		expect: `
[running]: $1, $2
file1.go:10: functionA

2 goroutines, 1 unique
`,
	}, {
		name: `alternating_call`,
		input: `
goroutine 1 [running]:
package1.functionA(args)
	file1.go:10
goroutine 2 [running]:
package2.functionB(args)
	file2.go:20
goroutine 3 [running]:
package1.functionA(args)
	file1.go:10
goroutine 4 [running]:
package2.functionB(args)
	file2.go:20
goroutine 5 [running]:
package1.functionA(args)
	file1.go:10
goroutine 6 [running]:
package2.functionB(args)
	file2.go:20
`,
		expect: `
[running]: $1, $3, $5
file1.go:10: functionA

[running]: $2, $4, $6
file2.go:20: functionB

6 goroutines, 2 unique
`,
	}, {
		name: `sort_calls`,
		input: `
goroutine 1 [running]:
package3.functionC(args)
	file3.go:30
goroutine 2 [running]:
package2.functionB(args)
	file2.go:20
goroutine 3 [running]:
package1.functionA(args)
	file1.go:10
`,
		expect: `
[running]: $3
file1.go:10: functionA

[running]: $2
file2.go:20: functionB

[running]: $1
file3.go:30: functionC

3 goroutines, 3 unique
`,
	}, {
		name: `real_single`,
		input: `
panic: oops

goroutine 53 [running]:
__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2_test.go:160 +0x74c
__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2.go:187 +0x777
__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2_test.go:131 +0xe2
__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2_test.go:121 +0x263
__POOL_SYNTHETIC_IMPORT_BASELINE__
FAIL
`,
		expect: `
panic: oops

[running]: $53

1 goroutines, 1 unique

__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2_test.go:160 +0x74c
__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2.go:187 +0x777
__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2_test.go:131 +0xe2
__POOL_SYNTHETIC_IMPORT_BASELINE__
	/work/tools/internal/jsonrpc2/jsonrpc2_test.go:121 +0x263
__POOL_SYNTHETIC_IMPORT_BASELINE__
FAIL
`,
	}} {
		t.Run(test.name, func(t *testing.T) {
			buf := &bytes.Buffer{}
			stack.Process(buf, strings.NewReader(test.input))
			expect := strings.TrimSpace(test.expect)
			got := strings.TrimSpace(buf.String())
			assert.Equal(t, expect, got)
		})
	}
}
