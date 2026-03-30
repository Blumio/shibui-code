import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("tab bar toggle", () => {
  it("collapses and expands tab bar from the tiny toggle button", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    try {
      await app.initialize();

      const toggle = root.querySelector(".tabbar-toggle") as HTMLButtonElement;
      const tabbar = root.querySelector(".tabbar") as HTMLDivElement;

      expect(toggle.dataset.icon).toBe("v");
      expect(tabbar.classList.contains("tabbar-collapsed")).toBe(true);

      toggle.click();
      expect(toggle.dataset.icon).toBe("^");
      expect(tabbar.classList.contains("tabbar-collapsed")).toBe(false);

      toggle.click();
      expect(toggle.dataset.icon).toBe("v");
      expect(tabbar.classList.contains("tabbar-collapsed")).toBe(true);
    } finally {
      app.destroy();
      root.remove();
    }
  });

  it("reveals the tab bar when opening or closing tabs via keyboard shortcuts", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    try {
      await app.initialize();

      const toggle = root.querySelector(".tabbar-toggle") as HTMLButtonElement;
      const tabbar = root.querySelector(".tabbar") as HTMLDivElement;
      const bindings = (
        app as unknown as {
          editorKeyBindings: () => Array<{ key?: string; run?: () => boolean }>;
        }
      ).editorKeyBindings();
      const newTabBinding = bindings.find((binding) => binding.key === "Mod-n");
      const closeTabBinding = bindings.find((binding) => binding.key === "Mod-w");

      expect(tabbar.classList.contains("tabbar-collapsed")).toBe(true);
      expect(newTabBinding?.run?.()).toBe(true);
      expect(tabbar.classList.contains("tabbar-collapsed")).toBe(false);

      toggle.click();
      expect(tabbar.classList.contains("tabbar-collapsed")).toBe(true);
      expect(closeTabBinding?.run?.()).toBe(true);
      expect(tabbar.classList.contains("tabbar-collapsed")).toBe(false);
    } finally {
      app.destroy();
      root.remove();
    }
  });

  it("supports idempotent teardown", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    await app.initialize();
    expect(root.querySelector(".app-shell")).not.toBeNull();

    app.destroy();
    app.destroy();

    expect(root.querySelector(".app-shell")).toBeNull();
    root.remove();
  });
});
