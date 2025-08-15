##@ Running

run: ## Run a command. Usage: make run ACMD=foo ARGS="--bar --baz" -> bazel run //cmd:foo -- --bar --baz
	@if [ -z "$(CMD)" ]; then \
	  echo 'usage:   make run ACMD=foo ARGS="--bar --baz"'; \
	  echo 'same as: bazel run //cmd:foo -- --bar --baz'; \
	  echo ; \
	  exit 1; \
	fi
	$(BAZEL_RUN) //cmd/$(CMD) -- $(ARGS)
