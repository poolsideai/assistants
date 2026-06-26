#!/usr/bin/env bash
echo GIT_COMMIT "${GITHUB_SHA:-$(git rev-parse --short HEAD)}"
echo BUILD_TIME "$(TZ=UTC date +%Y%m%d.%H%M%S)"
echo STABLE_VERSION_TAG "${VERSION_TAG:-untagged}"
echo GIT_BRANCH "${GITHUB_REF_NAME:-$(git symbolic-ref --short HEAD 2>/dev/null || echo "")}"
if [ "${GITHUB_REF_TYPE:-}" = "tag" ]; then
    echo GIT_TAG "$GITHUB_REF_NAME"
fi
