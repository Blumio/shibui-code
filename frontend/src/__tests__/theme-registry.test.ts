import { describe, expect, it } from "vitest";

import { findThemeLoader, themeListItems, themeLoaders } from "../theme-registry";

describe("theme registry", () => {
  it("returns built-in themes in fixed order", () => {
    const loaders = themeLoaders();
    expect(loaders.map((entry) => entry.displayName).slice(0, 3)).toEqual([
      "VS Code Dark+",
      "Monokai",
      "Dracula",
    ]);
  });

  it("creates search items", () => {
    const items = themeListItems();
    expect(items.length).toBeGreaterThanOrEqual(6);
  });

  it("finds a theme loader by id", () => {
    const loader = findThemeLoader("monokai");
    expect(loader?.displayName).toBe("Monokai");
  });
});
