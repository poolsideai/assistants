async (page) => {
  // Set window.b3Browser from the CLI before invoking this script.
  const browser = await page.evaluate(() => window.b3Browser || "chrome");
  const results = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1000, height: 850 });
  for (const phase of ["before", "after"]) {
    await page.goto(`http://127.0.0.1:5189/__audit_b3.html?phase=${phase}`);
    await page.waitForFunction(
      () =>
        window.b3UI?.replies.some((r) => r.requestType === "diff") &&
        window.b3UI?.replies.some((r) => r.requestType === "file") &&
        window.b3UI?.replies.filter((r) => r.html).length >= 2,
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    await page.locator('input[aria-label="Draft"]').fill("Keep this draft — typed");
    await page
      .locator('input[aria-label="Draft"]')
      .evaluate((input) => input.setSelectionRange(2, 12));
    const state = () =>
      page.evaluate(() => {
        const input = document.querySelector('input[aria-label="Draft"]');
        return {
          draft: input.value,
          selection: [input.selectionStart, input.selectionEnd],
          focused: document.activeElement === input,
          failures: window.b3UI.replies.filter((r) => r.type === "error" || r.error),
          workers: window.b3UI.workers.length,
        };
      });
    await page.screenshot({
      path: `output/playwright/b3-${browser}-${phase}-initial.png`,
      caret: "hide",
    });
    const initial = await state();
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
    if (engines.length !== 5 || engines.some((engine) => engine !== "wasm"))
      throw Error("Normal fixture retained a CSP test response");

    await page.evaluate(() => window.b3Actions.update());
    await page.waitForFunction(
      () =>
        document.querySelector(".highlightedCode")?.textContent.includes("streamed latest line") &&
        window.b3UI.replies.some(
          (r) =>
            r.requestType === "file" && JSON.stringify(r.result).includes("streamed latest line"),
        ),
    );
    await page.evaluate(() => {
      window.b3Actions.theme();
      window.b3Actions.layout();
    });
    await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 200));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    const updated = await state();
    const rendered = await page.evaluate(() =>
      window.b3UI.replies
        .filter((r) => r.result)
        .map((r) => ({ type: r.requestType, result: r.result }))
        .map((r) => JSON.stringify(r))
        .sort(),
    );
    await page.screenshot({
      path: `output/playwright/b3-${browser}-${phase}-updated.png`,
      caret: "hide",
    });
    await page.evaluate(() => window.b3Actions.hide());
    await page.waitForFunction(() => !document.querySelector(".highlightedCode"));
    results.push({ phase, engines, initial, updated, hidden: await state(), rendered });
  }
  await page.evaluate((data) => (window.b3Scenarios = data), { browser, results, errors });
};
