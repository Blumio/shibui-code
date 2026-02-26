import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("tab navigation shortcuts", () => {
  it("uses Cmd/Ctrl+Up/Down for switching tabs", () => {
    const root = document.createElement("div");
    const app = new ShibuiApp(root);
    const bindings = (
      app as unknown as { editorKeyBindings: () => Array<{ key?: string }> }
    ).editorKeyBindings();
    const keys = bindings
      .map((binding) => binding.key)
      .filter((key): key is string => typeof key === "string");

    expect(keys.includes("Mod-ArrowUp")).toBe(true);
    expect(keys.includes("Mod-ArrowDown")).toBe(true);
    expect(keys.includes("Mod-ArrowLeft")).toBe(false);
    expect(keys.includes("Mod-ArrowRight")).toBe(false);
  });
});
