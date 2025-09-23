.PHONY: *
.DEFAULT_GOAL:=help

include tools/make/tools.mk
include tools/make/dependencies.mk
include tools/make/generate.mk
include tools/make/lint.mk
include tools/make/build.mk
include tools/make/test.mk
include tools/make/run.mk
include tools/make/release.mk
include tools/make/help.mk

CMD?=
ACMD?=$(CMD) # alias for CMD so that it's the first alphabetically to expand in shell autocompletion
ARGS?=
BAZEL_CMD_ARGS?=
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
BAZEL=bazelisk
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
BAZEL_QUERY=$(BAZEL) query $(BAZEL_CMD_ARGS)

__POOL_SYNTHETIC_IMPORT_BASELINE__
