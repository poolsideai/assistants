<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    BrowserProvider,
    ClipboardProvider,
    DisplayProvider,
    LanguagesProvider,
    LogProvider,
    EnvironmentProvider,
  } from "../providers/index.js";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<EnvironmentProvider>
  <LogProvider>
    <LanguagesProvider>
      <DisplayProvider>
        <ClipboardProvider>
          <BrowserProvider>
            {@render children()}
          </BrowserProvider>
        </ClipboardProvider>
      </DisplayProvider>
    </LanguagesProvider>
  </LogProvider>
</EnvironmentProvider>
