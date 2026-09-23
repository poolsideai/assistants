async (page) => {
  page.setDefaultTimeout(8000);
  const results = [];
  const failures = [];
  page.on("requestfailed", (request) =>
    failures.push({ url: request.url(), error: request.failure()?.errorText }),
  );
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() });
  });
  await page.setViewportSize({ width: 900, height: 760 });
  for (const entry of ["assistant", "acp-chat"]) {
    for (const phase of ["before", "after"]) {
      const begin = failures.length;
      await page.goto(`http://localhost:5189/__audit_b4_${phase}/${entry}.html`);
      await page.getByRole("button").first().waitFor();
      await page.waitForTimeout(2300);
      if (entry === "assistant") {
        await page.getByText("Review performance", { exact: true }).click();
        await page.getByRole("button", { name: "Show archived conversations" }).click();
        await page.getByRole("button", { name: "Back to Active Chats" }).click();
        await page.getByRole("button", { name: "Settings", exact: true }).click();
      } else {
        const input = page.getByRole("combobox");
        await input.click();
        await page.keyboard.type("Check streaming, splits and tabs.");
        await page.keyboard.press("Shift+ArrowLeft");
        await page.keyboard.press("Shift+ArrowLeft");
      }
      await page.mouse.move(450, 380);
      await page.waitForTimeout(2300);
      await page.screenshot({
        path: `output/playwright/b4-${phase}-${entry}.png`,
        animations: "disabled",
      });
      results.push(
        await page.evaluate(
          ({ phase, entry }) => ({
            phase,
            entry,
            text: document.body.innerText,
            errors: window.__b4.errors,
            commands: window.__b4.requests.map((x) => ({
              command: x.command,
              method: x.command === "jsonrpc" ? x.payload[0] : undefined,
            })),
            draft: document.querySelector('[role="combobox"]')?.textContent,
            selection: window.getSelection()?.toString(),
            focused: document.activeElement?.getAttribute("role"),
            mountedMs: window.__b4.mountedMs,
            resources: performance
              .getEntriesByType("resource")
              .filter((x) => x.initiatorType !== "fetch" || x.name.startsWith(location.origin))
              .map((x) => ({
                name: x.name.replace(/__audit_b4_(before|after)/, "__audit_b4_PHASE"),
                size: x.decodedBodySize,
              })),
          }),
          { phase, entry },
        ),
      );
      results[results.length - 1].failures = failures.slice(begin);
    }
  }
  await page.evaluate((results) => {
    window.__b4Results = results;
  }, results);
};
