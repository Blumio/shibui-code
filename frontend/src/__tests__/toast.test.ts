import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("shortcut toast", () => {
  it("renders a toast message in the app root", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const app = new ShibuiApp(root);

    try {
      (
        app as unknown as {
          showShortcutToast: (message: string) => void;
        }
      ).showShortcutToast("Test toast message");

      const toast = root.querySelector(".shortcut-toast");
      expect(toast).not.toBeNull();
      expect(toast?.textContent).toBe("Test toast message");
    } finally {
      app.destroy();
      root.remove();
    }
  });
});
