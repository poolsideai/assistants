##@ Code generation

export PATH := $(TOOLSBIN):$(PATH)

generate: $(GO_ENUM) $(MOCKGEN) $(MOCKERY) $(SQLC) $(STRINGER) ## Golang code generation
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
