import type {} from "@vitest/browser/context";
import type {} from "@vitest/browser/providers/playwright";
import type { BrowserCommand } from "vitest/node";

declare module "@vitest/browser/context" {
  interface BrowserCommands {
    checkVisualizationNavigation(documents: Record<string, string>): Promise<string[]>;
  }
}

/** Runs in Playwright, so CSP is enforced and failed tests cannot contact the probe host. */
const checkVisualizationNavigation: BrowserCommand<[documents: Record<string, string>]> = async (
  { context },
  documents,
) => {
  const passed: string[] = [];
  for (const [name, srcdoc] of Object.entries(documents)) {
    const page = await context.newPage();
    const requests: string[] = [];
    await page.route("https://visualization-probe.invalid/**", (route) => {
      requests.push(route.request().url());
      return route.abort();
    });
    try {
      await page.setContent('<iframe title="Preview" sandbox="allow-scripts"></iframe>');
      await page.locator("iframe").evaluate((frame, source) => {
        (frame as HTMLIFrameElement).srcdoc = source;
      }, srcdoc);
      const wrapperHandle = await page.locator("iframe").elementHandle();
      const wrapper = await wrapperHandle!.contentFrame();
      if (!wrapper) throw new Error(`${name}: wrapper frame missing`);
      const innerHandle = await wrapper.locator("iframe").elementHandle();
      const inner = await innerHandle!.contentFrame();
      if (!inner) throw new Error(`${name}: inner frame missing`);

      await inner.locator("#interact").click();
      if ((await inner.locator("#status").textContent()) !== "Interactive; parent access denied") {
        throw new Error(`${name}: scripts must work without access to the parent document`);
      }
      // Observe enforcement on the trusted wrapper without changing its policy.
      await wrapper.evaluate(() => {
        document.addEventListener("securitypolicyviolation", (event) => {
          document.documentElement.dataset.violation = event.effectiveDirective;
        });
      });
      await inner.locator("#navigate").click();
      try {
        await wrapper.waitForFunction(
          () => document.documentElement.dataset.violation === "frame-src",
          undefined,
          { timeout: 5_000 },
        );
      } catch (cause) {
        throw new Error(
          `${name}: no frame-src violation; ${requests.length} intercepted requests`,
          { cause },
        );
      }
      if (requests.length)
        throw new Error(`${name}: navigation escaped CSP: ${requests.join(", ")}`);
      passed.push(name);
    } finally {
      await page.close();
    }
  }
  return passed;
};

export const visualizationCommands = { checkVisualizationNavigation };
