##@ Code generation

export PATH := $(TOOLSBIN):$(PATH)

generate: $(GO_ENUM) $(MOCKGEN) $(MOCKERY) $(SQLC) $(STRINGER) ## Golang code generation
	GOBIN=$(TOOLSBIN) bazelisk run @rules_go//go --  generate ./...
	GOBIN=$(TOOLSBIN) bazelisk run @rules_go//go --  mod tidy
