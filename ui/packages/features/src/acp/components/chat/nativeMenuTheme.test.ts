import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cssColorToHex,
  FALLBACK_NATIVE_MENU_THEME,
  resolveCssColorToHex,
  resolveNativeMenuTheme,
} from "./nativeMenuTheme";

// Computed colors as an engine would serialize them, answered per probe:
// simple token probes are identified by their utility class, the mounted
// Badge by the "uppercase" class DropdownItem passes it, and the
// highlight-border probe by the var() reference it carries.
type StyleResolver = (element: HTMLElement, property: string) => string;

function stubComputedStyles(resolve: StyleResolver) {
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (element) =>
      ({
        getPropertyValue: (property: string) => resolve(element as HTMLElement, property),
      }) as unknown as CSSStyleDeclaration,
  );
}

function isBadgeProbe(element: HTMLElement): boolean {
  return element.className.includes("uppercase");
}

function isHoverBorderProbe(element: HTMLElement): boolean {
  return element.style.backgroundColor.includes("--psx-highlight-border");
}

describe("resolveNativeMenuTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove("vscode-dark");
  });

  it("samples the menu tokens from the DOM and reports dark from the root class", () => {
    document.documentElement.classList.add("vscode-dark");
    const colorsByClass: Record<string, string> = {
      "text-psx-foreground-primary": "rgb(255 255 255 / 0.85)",
      "text-psx-foreground-secondary": "rgb(149, 157, 165)",
      "text-psx-foreground-tertiary": "rgba(149, 157, 165, 0.975)",
      "bg-psx-menu-hover-background": "rgb(40, 46, 52)",
      "menu-separator": "rgb(27, 31, 35)",
      "text-psx-error-foreground": "oklch(1 0 0)",
      "text-psx-icon": "color(srgb 1 0 0.5)",
    };
    stubComputedStyles((element, property) => {
      if (isBadgeProbe(element)) {
        // The real Badge pill: translucent blue fill with blue text.
        return property === "background-color" ? "rgba(59, 130, 246, 0.1)" : "rgb(96, 165, 250)";
      }
      if (isHoverBorderProbe(element)) return "rgb(9, 105, 218)";
      return colorsByClass[element.className] ?? "";
    });

    expect(resolveNativeMenuTheme()).toEqual({
      isDark: true,
      textPrimary: "#ffffffd9",
      textSecondary: "#959da5",
      textTertiary: "#959da5f9",
      hoverBackground: "#282e34",
      hoverBorder: "#0969da",
      separator: "#1b1f23",
      badgeBackground: "#3b82f61a",
      badgeText: "#60a5fa",
      destructiveText: "#ffffff",
      iconColor: "#ff0080",
    });
    // The probe never leaks into the document.
    expect(document.querySelector(".menu-surface")).toBeNull();
  });

  it("reports light when no dark root class is present", () => {
    stubComputedStyles((element) =>
      element.className === "text-psx-foreground-primary" ? "rgb(0, 0, 0)" : "",
    );

    const theme = resolveNativeMenuTheme();
    expect(theme.isDark).toBe(false);
    expect(theme.textPrimary).toBe("#000000");
  });

  it("falls back per token when a computed color is missing or invisible", () => {
    stubComputedStyles((element) => {
      if (element.className === "text-psx-foreground-primary") return "rgb(10, 20, 30)";
      // Fully transparent means the utility class did not apply.
      if (element.className === "bg-psx-menu-hover-background") return "rgba(0, 0, 0, 0)";
      return "";
    });

    const theme = resolveNativeMenuTheme();
    expect(theme.textPrimary).toBe("#0a141e");
    expect(theme.hoverBackground).toBe(FALLBACK_NATIVE_MENU_THEME.hoverBackground);
    expect(theme.badgeBackground).toBe(FALLBACK_NATIVE_MENU_THEME.badgeBackground);
    expect(theme.badgeText).toBe(FALLBACK_NATIVE_MENU_THEME.badgeText);
    expect(theme.iconColor).toBe(FALLBACK_NATIVE_MENU_THEME.iconColor);
    // A transparent highlight border means no ring: the field is omitted.
    expect(theme).not.toHaveProperty("hoverBorder");
  });

  it("returns the dark fallback values when style resolution throws", () => {
    vi.spyOn(window, "getComputedStyle").mockImplementation(() => {
      throw new Error("no styles");
    });

    expect(resolveNativeMenuTheme()).toEqual({ ...FALLBACK_NATIVE_MENU_THEME, isDark: false });
  });
});

describe("resolveCssColorToHex", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes raw colors without needing the cascade", () => {
    expect(resolveCssColorToHex("#d97757")).toBe("#d97757");
    expect(resolveCssColorToHex("rgb(217, 119, 87)")).toBe("#d97757");
    expect(resolveCssColorToHex(undefined)).toBeUndefined();
    expect(resolveCssColorToHex("transparent")).toBeUndefined();
  });

  it("resolves var() references by computing them on a probe", () => {
    stubComputedStyles((element) => (element.tagName === "SPAN" ? "rgb(0, 200, 150)" : ""));

    expect(resolveCssColorToHex("var(--psx-vibrant)")).toBe("#00c896");
  });

  it("returns undefined for unresolvable references", () => {
    stubComputedStyles(() => "");

    expect(resolveCssColorToHex("var(--unknown-token)")).toBeUndefined();
    expect(resolveCssColorToHex("not-a-color")).toBeUndefined();
  });
});

describe("cssColorToHex", () => {
  it("normalizes hex forms", () => {
    expect(cssColorToHex("#abc")).toBe("#aabbcc");
    expect(cssColorToHex("#abcd")).toBe("#aabbccdd");
    expect(cssColorToHex("#A1B2C3")).toBe("#a1b2c3");
    expect(cssColorToHex("#a1b2c3ff")).toBe("#a1b2c3");
    expect(cssColorToHex("#a1b2c380")).toBe("#a1b2c380");
  });

  it("parses rgb() and rgba() in comma and slash syntax", () => {
    expect(cssColorToHex("rgb(255, 0, 128)")).toBe("#ff0080");
    expect(cssColorToHex("rgba(255, 0, 128, 0.5)")).toBe("#ff008080");
    expect(cssColorToHex("rgb(255 0 128 / 0.25)")).toBe("#ff008040");
    expect(cssColorToHex("rgb(100% 0% 50%)")).toBe("#ff0080");
  });

  it("parses color(srgb) components", () => {
    expect(cssColorToHex("color(srgb 1 0 0.5)")).toBe("#ff0080");
    expect(cssColorToHex("color(srgb 1 0 0.5 / 0.5)")).toBe("#ff008080");
    expect(cssColorToHex("color(srgb 100% 0% 50%)")).toBe("#ff0080");
  });

  it("converts color(display-p3) to sRGB, clamping out-of-gamut components", () => {
    // P3 primaries sit outside sRGB; they clamp to the sRGB primaries.
    expect(cssColorToHex("color(display-p3 1 0 0)")).toBe("#ff0000");
    expect(cssColorToHex("color(display-p3 0 1 0)")).toBe("#00ff00");
    expect(cssColorToHex("color(display-p3 1 1 1)")).toBe("#ffffff");
    expect(cssColorToHex("color(display-p3 1 0 0 / 0.5)")).toBe("#ff000080");
  });

  it("converts oklch() to sRGB hex", () => {
    expect(cssColorToHex("oklch(1 0 0)")).toBe("#ffffff");
    expect(cssColorToHex("oklch(0 0 0)")).toBe("#000000");
    expect(cssColorToHex("oklch(100% 0 0 / 50%)")).toBe("#ffffff80");

    // oklch of pure red; allow one unit of rounding per channel.
    const red = cssColorToHex("oklch(0.62796 0.25768 29.234)");
    expect(red).toMatch(/^#[0-9a-f]{6}$/);
    const [r, g, b] = [red!.slice(1, 3), red!.slice(3, 5), red!.slice(5, 7)].map((pair) =>
      Number.parseInt(pair, 16),
    );
    expect(Math.abs(r - 255)).toBeLessThanOrEqual(1);
    expect(g).toBeLessThanOrEqual(1);
    expect(Math.abs(b - 0)).toBeLessThanOrEqual(1);
  });

  it("handles transparent and rejects unknown syntax", () => {
    expect(cssColorToHex("transparent")).toBe("#00000000");
    expect(cssColorToHex("")).toBeUndefined();
    expect(cssColorToHex("currentcolor")).toBeUndefined();
    expect(cssColorToHex("var(--psx-icon)")).toBeUndefined();
    expect(cssColorToHex("color(rec2020 1 0 0)")).toBeUndefined();
  });
});
