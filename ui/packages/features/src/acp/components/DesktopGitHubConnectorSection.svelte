<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "@poolsideai/components/button";
  import { Spinner } from "@poolsideai/components/spinner";
  import type { GitHubAuthStatusOutput } from "@poolsideai/helperapi";
  import { getACPGithubRepo } from "../features/GithubRepository.svelte";
  import { GITHUB_COLOR_MODES, type GitHubColorMode } from "../github/githubStatus";
__POOL_SYNTHETIC_IMPORT_BASELINE__

  interface Props {
    showHeading?: boolean;
  }

  let { showHeading = true }: Props = $props();

  const github = getACPGithubRepo();

  let status = $state<GitHubAuthStatusOutput | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let tokenInput = $state("");
  let error = $state("");

  async function refresh(): Promise<void> {
    loading = true;
    error = "";
    try {
      status = await github.authStatus();
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load GitHub status";
    } finally {
      loading = false;
    }
  }

  onMount(refresh);

  async function saveToken(): Promise<void> {
    const token = tokenInput.trim();
    if (!token) return;
    saving = true;
    error = "";
    try {
      await github.setToken(token);
      tokenInput = "";
      await refresh();
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to save token";
    } finally {
      saving = false;
    }
  }

  async function clearToken(): Promise<void> {
    saving = true;
    error = "";
    try {
      await github.setToken("");
      await refresh();
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to remove token";
    } finally {
      saving = false;
    }
  }

  let connected = $derived(status?.source === "cli" || status?.source === "token");

  function selectColorMode(mode: GitHubColorMode): void {
    github.setColorMode(mode);
  }
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
  title="GitHub Awareness"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <div class="flex items-start gap-2.5">
      <div class="min-w-0 flex-1">
        {#if loading}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          </div>
        {:else if status}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            {#if status.source === "cli"}
__POOL_SYNTHETIC_IMPORT_BASELINE__
            {:else if status.source === "token"}
__POOL_SYNTHETIC_IMPORT_BASELINE__
            {:else}
__POOL_SYNTHETIC_IMPORT_BASELINE__
            {/if}
          </div>

          {#if status.source !== "cli"}
            <div class="mt-3">
              {#if status.ghInstalled}
                <p class="text-psx-foreground-secondary text-[13px]/[18px]">
                  Tip: run <code class="bg-psx-menu-hover-background rounded px-1 py-0.5"
                    >gh auth login</code
                  > to use the GitHub CLI instead of a token.
                </p>
              {/if}
              <label class="mt-2 block">
                <span class="text-psx-foreground-primary text-[13px]/[18px] font-medium">
                  Personal access token
                </span>
                <input
                  type="password"
                  bind:value={tokenInput}
                  placeholder={status.hasStoredToken ? "•••••••• (saved)" : "ghp_…"}
                  spellcheck="false"
                  autocorrect="off"
                  autocapitalize="off"
                  autocomplete="off"
                  class="border-psx-input-border bg-psx-input-background text-psx-input-foreground placeholder:text-psx-input-placeholder-foreground focus-visible:outline-psx-focus mt-1 w-full rounded-[6px] border px-2 py-1.5 text-[13px]/[18px] focus-visible:outline-2"
                />
              </label>
              <div class="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  prominence="increased"
                  size="sm"
                  disabled={saving || !tokenInput.trim()}
                  onclick={saveToken}
                >
                  {saving ? "Saving…" : "Save token"}
                </Button>
                {#if status.hasStoredToken}
                  <Button
                    type="button"
                    appearance="outline"
                    size="sm"
                    disabled={saving}
                    onclick={clearToken}
                  >
                    Remove token
                  </Button>
                {/if}
              </div>
            </div>
          {/if}
        {/if}

        {#if error}
          <p class="text-psx-error-foreground mt-2 text-[13px]/[18px]">{error}</p>
        {/if}
      </div>
    </div>
  </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  title="Worktree Status Color"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
