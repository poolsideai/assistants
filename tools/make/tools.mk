##@ Tools

ifeq ($(origin ROOTDIR),undefined)
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
MOCKERY_VERSION_CMD_ARG := "version"

MOCKGEN ?= mockgen
MOCKGEN_BIN := $(TOOLSBIN)/$(MOCKGEN)
MOCKGEN_SRC ?= go.uber.org/mock/mockgen
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
fi
endef

define install_tool_version
@if [ ! -x $(TOOLSBIN)/$(1) ] || [ "$(shell $(TOOLSBIN)/$(1) $(4) 2>/dev/null | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+')" != "$(3)" ]; then \
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
