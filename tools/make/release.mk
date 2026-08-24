__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
# Manual releases record their tag in the managed vs-assistant/v* lineage so
# the CI nightly planner sees them and continues from the released version.
# The planner requires the released commit to be on origin/main, so run this
# after the release PR is merged.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	@if [ ! -f "ui/apps/vs-assistant/bin/Release/net472/poolside-assistant.vsix" ]; then \
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	cp ui/apps/vs-assistant/bin/Release/net472/poolside-assistant.vsix ui/apps/vs-assistant/bin/Release/poolside-assistant-$(VS_ASSISTANT_VERSION).vsix
	@set -e; \
	version="$(VS_ASSISTANT_VERSION)"; \
	minor=$${version#*.}; minor=$${minor%%.*}; \
	if [ $$((minor % 2)) -eq 0 ]; then channel=stable; else channel=nightly; fi; \
	plan=$$(pnpm -s -F @poolsideai/release-helper find-version plan vs \
		--channel "$$channel" --version "$$version" \
		--tag-prefix vs-assistant \
		--destination "$$(ui/apps/vs-assistant/scripts/extension-identity.sh)" \
		--create-lineage); \
	tag=$$(printf '%s' "$$plan" | jq -r '.tag'); \
	annotation=$$(printf '%s' "$$plan" | jq -r '.tagAnnotation'); \
	sha=$$(printf '%s' "$$plan" | jq -r '.sourceSha'); \
	git tag --annotate --message "$$annotation" "$$tag" "$$sha"; \
	git push origin "$$tag"; \
	if [ "$$channel" = stable ]; then release_flags="--latest"; else release_flags="--prerelease --latest=false"; fi; \
	gh release create "$$tag" "ui/apps/vs-assistant/bin/Release/poolside-assistant-$$version.vsix" \
		$$release_flags --title "$$tag" --generate-notes
