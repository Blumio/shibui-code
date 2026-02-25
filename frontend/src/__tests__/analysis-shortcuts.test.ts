import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("analysis shortcuts", () => {
  it("uses dedicated shortcuts and leaves Mod-z available for undo", () => {
    const root = document.createElement("div");
    const app = new ShibuiApp(root);
    const bindings = (
      app as unknown as { editorKeyBindings: () => Array<{ key?: string }> }
    ).editorKeyBindings();
    const keys = bindings
      .map((binding) => binding.key)
      .filter((key): key is string => typeof key === "string");

    expect(keys.includes("Mod-z")).toBe(false);
    expect(keys.includes("Mod-Shift-y")).toBe(true);
    expect(keys.includes("Mod-Shift-u")).toBe(true);
  });
});
