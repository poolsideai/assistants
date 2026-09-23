async (page) => {
  await page.route("**/__audit_b3/**", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "content-security-policy": "script-src 'self' 'unsafe-inline'; worker-src 'self'",
        "cache-control": "no-store",
      },
    });
  });
  await page.goto("http://127.0.0.1:5189/__audit_b3/bench.html");
  const outputs = await page.evaluate(async () => {
    const manifest = await fetch("./manifest.json").then((r) => r.json());
    window.cspWorkers = [];
    const outputs = [];
    for (const phase of ["before", "after"]) {
      const worker = new Worker(manifest[phase].mobile.chat + "?qa=csp-verified", {
        type: "module",
      });
      window.cspWorkers.push(worker);
      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(Error("CSP worker timed out")), 15000);
        worker.onmessage = (event) => {
          clearTimeout(timeout);
          resolve(event.data);
        };
        worker.onerror = (event) => {
          clearTimeout(timeout);
          reject(Error(event.message));
        };
        worker.postMessage({
          id: 1,
          code: 'const answer: number = 42;\nconsole.log("<safe>&value");',
          language: "typescript",
        });
      });
      outputs.push({ phase, ...response });
    }
    return outputs;
  });
  const engines = [];
  for (const worker of page.workers())
    engines.push(
      await worker.evaluate(() => {
        try {
          new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
          return "wasm";
        } catch {
          return "js";
        }
      }),
    );
  await page.evaluate(() => window.cspWorkers.forEach((worker) => worker.terminate()));
  await page.unroute("**/__audit_b3/**");
  if (engines.length !== 2 || engines.some((engine) => engine !== "js"))
    throw Error("CSP did not deny WASM in both workers");
  if (!outputs[0].html?.includes("<span") || outputs[0].html !== outputs[1].html)
    throw Error("CSP output differs");
  await page.evaluate((result) => (window.b3CspVerified = result), { outputs, engines });
};
