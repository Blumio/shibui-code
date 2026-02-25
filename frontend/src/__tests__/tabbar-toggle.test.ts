import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("tab bar toggle", () => {
  it("collapses and expands tab bar from the tiny toggle button", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    await app.initialize();

    const toggle = root.querySelector(".tabbar-toggle") as HTMLButtonElement;
    const tabbar = root.querySelector(".tabbar") as HTMLDivElement;

    expect(toggle.dataset.icon).toBe("^");
    expect(tabbar.classList.contains("tabbar-collapsed")).toBe(false);

    toggle.click();
    expect(toggle.dataset.icon).toBe("v");
    expect(tabbar.classList.contains("tabbar-collapsed")).toBe(true);

    toggle.click();
    expect(toggle.dataset.icon).toBe("^");
    expect(tabbar.classList.contains("tabbar-collapsed")).toBe(false);

    root.remove();
  });
});
