__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
lint: bazel-lint go-fmt ## All the linters

fix: bazel-fmt go-fmt-fix ## All the lint fixers
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

go-fmt: ## Check Go formatting (run go-fmt-fix to apply)
	@unformatted=$$(gofmt -l $$(find . -name '*.go' \
		-not -path './third_party/*' \
		-not -path './pkg/poolside-helper/gopls/*' \
		-not -path './pkg/poolside-helper/internal/gopls/*')); \
	if [ -n "$$unformatted" ]; then \
		echo "The following files are not gofmt'd:"; \
		echo "$$unformatted"; \
		exit 1; \
	fi

go-fmt-fix: ## Fix Go formatting
	@find . -name '*.go' \
		-not -path './third_party/*' \
		-not -path './pkg/poolside-helper/gopls/*' \
		-not -path './pkg/poolside-helper/internal/gopls/*' \
		| xargs gofmt -w
