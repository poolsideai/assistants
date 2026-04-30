Boundary handles errors thrown by code run in rendering and effects.
This prevents these errors breaking larger parts of the app's rendering.
N.B. Errors occurring outside the rendering process (for example, in event handlers or after a
setTimeout or async work) are not caught by error boundaries.

Still throws and informs developers in development environment.

```sveltehtml
<Boundary>
  <SomeComponent /> <!-- errors in rendering SomeComponent will be recorded by Boundary -->
</Boundary>

<OtherComponent /> <!-- unaffected -->
```

See: https://svelte.dev/docs/svelte/svelte-boundary
