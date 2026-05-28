##@ Tools

ifeq ($(origin ROOTDIR),undefined)
ROOTDIR := $(abspath $(shell git rev-parse --show-toplevel))
endif

TOOLSBIN := $(ROOTDIR)/bin

GO_ENUM ?= go-enum
GO_ENUM_BIN := $(TOOLSBIN)/$(GO_ENUM)
GO_ENUM_SRC ?= github.com/abice/go-enum
GO_ENUM_VERSION ?= v0.9.1
GO_ENUM_VERSION_CMD_ARG := "--version"

MOCKERY ?= mockery
MOCKERY_BIN := $(TOOLSBIN)/$(MOCKERY)
MOCKERY_SRC ?= github.com/vektra/mockery/v3
MOCKERY_VERSION ?= v3.7.0
MOCKERY_VERSION_CMD_ARG := "version"

MOCKGEN ?= mockgen
MOCKGEN_BIN := $(TOOLSBIN)/$(MOCKGEN)
MOCKGEN_SRC ?= go.uber.org/mock/mockgen
MOCKGEN_VERSION ?= v0.6.0
MOCKGEN_VERSION_CMD_ARG := "-version"

SQLC ?= sqlc
SQLC_BIN := $(TOOLSBIN)/$(SQLC)
SQLC_SRC ?= github.com/sqlc-dev/sqlc/cmd/sqlc
SQLC_VERSION ?= v1.29.0
SQLC_VERSION_CMD_ARG := "version"

STRINGER ?= stringer
STRINGER_BIN := $(TOOLSBIN)/$(STRINGER)
STRINGER_SRC ?= golang.org/x/tools/cmd/stringer
STRINGER_VERSION ?= latest

define install_tool
@if [ ! -x $(TOOLSBIN)/$(1) ]; then \
	GOBIN=$(TOOLSBIN) bazelisk run @rules_go//go -- install $(2)@$(3); \
fi
endef

define install_tool_version
@if [ ! -x $(TOOLSBIN)/$(1) ] || [ "$(shell $(TOOLSBIN)/$(1) $(4) 2>/dev/null | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+')" != "$(3)" ]; then \
	GOBIN=$(TOOLSBIN) bazelisk run @rules_go//go -- install $(2)@$(3); \
fi
endef

$(GO_ENUM):
	$(call install_tool_version,$(GO_ENUM),$(GO_ENUM_SRC),$(GO_ENUM_VERSION),$(GO_ENUM_VERSION_CMD_ARG))

$(MOCKERY):
	$(call install_tool_version,$(MOCKERY),$(MOCKERY_SRC),$(MOCKERY_VERSION),$(MOCKERY_VERSION_CMD_ARG))

$(MOCKGEN):
	$(call install_tool_version,$(MOCKGEN),$(MOCKGEN_SRC),$(MOCKGEN_VERSION),$(MOCKGEN_VERSION_CMD_ARG))

$(SQLC):
	$(call install_tool_version,$(SQLC),$(SQLC_SRC),$(SQLC_VERSION),$(SQLC_VERSION_CMD_ARG))

$(STRINGER):
	$(call install_tool,$(STRINGER),$(STRINGER_SRC),$(STRINGER_VERSION))

tools: $(GO_ENUM) $(MOCKERY) $(MOCKGEN) $(SQLC) $(STRINGER) ## Install internal tools
