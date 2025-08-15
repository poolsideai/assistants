##@ Dependencies

.PHONY: setup
setup: ## Install asdf tools, Rust toolchain, and UI workspace dependencies
	bash $(CURDIR)/scripts/asdf-setup.sh
	pnpm install

go_deps_sync: gazelle

gazelle: ## Recompute dependencies for Bazel
	$(BAZEL_RUN) @rules_go//go -- mod tidy
	$(BAZEL_RUN) //:gazelle
