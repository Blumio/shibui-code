import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("folding", () => {
  it("renders a fold gutter next to line numbers", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    try {
      await app.initialize();

      expect(root.querySelector(".cm-foldGutter")).not.toBeNull();
    } finally {
      app.destroy();
      root.remove();
    }
  });
});
