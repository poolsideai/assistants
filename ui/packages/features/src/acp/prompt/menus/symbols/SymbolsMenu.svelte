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
  let files = $derived(contextRepo.symbolsFiles);
  let fileLabel = $derived(
    files.length === 1 ? getFilenameFromPath(files[0]?.path ?? "") : "active files",
  );
  let getAllCodeSymbols = $derived(
    Promise.all(
      files.map(async (file) => ({
        file,
        symbols: (await rpc.getCodeSymbols(file.path)).symbols,
      })),
    ),
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            Type to filter symbols in <span class="font-medium">{fileLabel}</span>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#await getAllCodeSymbols then fileSymbols}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              >{fileLabel}</span
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {#each fileSymbols as { file, symbols } (file.path)}
          {#if symbols.length > 0 && file.path}
            <Prompt.Menu.Popup.Section title={getFilenameFromPath(file.path)}>
              {#each symbols as { name, kind } (`${file.path}:${name}`)}
                {@const icon = getIcon(kind)}
                <Prompt.Menu.Popup.Item title={name} {icon} class="font-mono text-xs">
                  <Prompt.Actions.Insert
                    type="chip"
                    content={{
                      label: name,
                      icon,
                      clipboard: `\`${name}\``,
                    }}
                  />
                </Prompt.Menu.Popup.Item>
              {/each}
            </Prompt.Menu.Popup.Section>
          {/if}
        {/each}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
