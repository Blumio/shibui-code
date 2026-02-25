import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("tab keybinding", () => {
  it("includes a Tab keybinding for indentation", () => {
    const root = document.createElement("div");
    const app = new ShibuiApp(root);
    const bindings = (app as unknown as { editorKeyBindings: () => Array<{ key?: string }> })
      .editorKeyBindings();

    expect(bindings.some((binding) => binding.key === "Tab")).toBe(true);
  });
});
