##@ Testing

test: ## Run tests
	$(BAZEL_TEST) //...

test-target: ## Run tests for a specific target. Usage: make test-target TARGET=//pkg/...
	@if [ -z "$(TARGET)" ]; then \
	  echo 'usage: make test-target TARGET=//pkg/...'; \
	  exit 1; \
	fi
	$(BAZEL_TEST) $(TARGET)

test-ci: ## Run CI integration tests (tagged as "test-ci")
	$(BAZEL_TEST) --test_timeout=600 --spawn_strategy=local \
		$$($(BAZEL) query --output=label 'attr(tags, test_ci, tests(//...))')

test-integration: ## Run all integration tests (tagged as "integration")
	@echo 'This make target changed to run all *integration* tests, not just the CI ones. Use make test-ci for the old behavior. Waiting 5s before continuing'
	@sleep 5
	$(BAZEL_TEST) --test_timeout=600 --spawn_strategy=local \
		$$($(BAZEL) query --output=label 'attr(tags, integration, tests(//...))')
