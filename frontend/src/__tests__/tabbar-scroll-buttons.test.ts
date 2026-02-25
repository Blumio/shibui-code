import { describe, expect, it } from "vitest";

import { ShibuiApp } from "../app";

describe("tab bar scroll buttons", () => {
  it("renders left and right overflow scroll buttons", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const app = new ShibuiApp(root);
    await app.initialize();

    const left = root.querySelector(".tab-scroll-left") as HTMLButtonElement;
    const right = root.querySelector(".tab-scroll-right") as HTMLButtonElement;
    const controls = root.querySelector(".tabbar-controls") as HTMLDivElement;
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
    expect(controls).not.toBeNull();
    expect(left.parentElement).toBe(controls);
    expect(right.parentElement).toBe(controls);

    root.remove();
  });
});
