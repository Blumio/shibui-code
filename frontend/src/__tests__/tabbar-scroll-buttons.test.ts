import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("tab bar scroll buttons", () => {
  it("renders left and right overflow scroll buttons", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    await app.initialize();

    const up = root.querySelector(".tab-scroll-up") as HTMLButtonElement;
    const down = root.querySelector(".tab-scroll-down") as HTMLButtonElement;
    const controls = root.querySelector(".tabbar-controls") as HTMLDivElement;
    expect(up).not.toBeNull();
    expect(down).not.toBeNull();
    expect(controls).not.toBeNull();
    expect(up.parentElement).toBe(controls);
    expect(down.parentElement).toBe(controls);

    root.remove();
  });
});
