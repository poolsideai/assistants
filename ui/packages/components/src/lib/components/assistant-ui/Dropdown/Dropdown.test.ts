import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Dropdown from "./Dropdown.svelte";

describe("Dropdown", () => {
  it("leaves the search box out of spellcheck and autocorrect", async () => {
    // Callers search this box for identifiers — model ids, mode names — so
    // macOS must not rewrite a half-typed name before the list can match it.
    render(Dropdown, {
      props: { icon: "sparkles", label: "Model", searchable: true },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Model" }));

    const search = await waitFor(() => screen.getByRole("textbox", { name: "Search..." }));
    expect(search).toHaveAttribute("spellcheck", "false");
    expect(search).toHaveAttribute("autocorrect", "off");
    expect(search).toHaveAttribute("autocapitalize", "off");
    expect(search).toHaveAttribute("autocomplete", "off");
  });
});
