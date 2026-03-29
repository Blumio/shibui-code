import { afterEach, describe, expect, it, vi } from "vitest";

import { BRIDGE_METHODS, BRIDGE_VERSION, resizeWindow } from "../native";

describe("bridge contract", () => {
  afterEach(() => {
    delete (window as unknown as { resize_window?: unknown }).resize_window;
  });

  it("pins a versioned bridge contract", () => {
    expect(BRIDGE_VERSION).toBe(2);
  });

  it("uses stable native operation names", () => {
    expect(BRIDGE_METHODS).toEqual({
      syncSnapshot: "sync_snapshot",
      clearSnapshot: "clear_snapshot",
      resizeWindow: "resize_window",
      copyText: "copy_text",
      pasteText: "paste_text",
    });
  });

  it("drops unknown resize direction values", async () => {
    const resizeBridge = vi.fn().mockResolvedValue(true);
    (window as unknown as { resize_window: (direction: string) => Promise<boolean> }).resize_window = resizeBridge;

    await resizeWindow("diagonal" as unknown as "up");

    expect(resizeBridge).not.toHaveBeenCalled();
  });
});
