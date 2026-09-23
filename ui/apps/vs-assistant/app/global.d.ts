__POOL_SYNTHETIC_IMPORT_BASELINE__

export default {};

/**
 * global adds a type definition for the window.POOLSIDE_APP_STATE variable
 * which is injected into the global scope of the webview window on start up.
 */
declare global {
  var POOLSIDE_INITIAL_STATE: {
    accessToken?: string | undefined;
    keybindings?: Keybindings;
    disabledEnrichments?: EnrichedContextSource[];
    homeDirectory?: string;
  };
}
