import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("tab rename", () => {
  it("keeps spaces when renaming a tab", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    await app.initialize();

    const title = root.querySelector(".tab-title") as HTMLElement;
    title.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

    const input = root.querySelector(".tab-title-input") as HTMLInputElement;
    expect(input).not.toBeNull();
    input.value = "My Practice Tab";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    const renamedTitle = root.querySelector(".tab-title") as HTMLElement;
    expect(renamedTitle.textContent).toBe("My Practice Tab");

    root.remove();
  });
});
