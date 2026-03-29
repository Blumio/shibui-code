import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearSnapshot, copyText, resizeWindow, syncSnapshot } from "../native";

describe("native bridge", () => {
  beforeEach(() => {
    delete (window as unknown as { sync_snapshot?: unknown }).sync_snapshot;
    delete (window as unknown as { clear_snapshot?: unknown }).clear_snapshot;
    delete (window as unknown as { resize_window?: unknown }).resize_window;
    delete (window as unknown as { copy_text?: unknown }).copy_text;
  });

  it("no-ops when sync bridge is absent", async () => {
    await expect(syncSnapshot("payload")).resolves.toBeUndefined();
  });

  it("calls sync bridge when present", async () => {
    const fn = vi.fn().mockResolvedValue(true);
    (window as unknown as { sync_snapshot: (payload: string) => Promise<boolean> }).sync_snapshot = fn;
    await syncSnapshot("abc");
    expect(fn).toHaveBeenCalledWith("abc");
  });

  it("calls clear bridge when present", async () => {
    const fn = vi.fn().mockResolvedValue(true);
    (window as unknown as { clear_snapshot: () => Promise<boolean> }).clear_snapshot = fn;
    await clearSnapshot();
    expect(fn).toHaveBeenCalled();
  });

  it("calls resize bridge when present", async () => {
    const fn = vi.fn().mockResolvedValue(true);
    (window as unknown as { resize_window: (direction: string) => Promise<boolean> }).resize_window = fn;
    await resizeWindow("up");
    expect(fn).toHaveBeenCalledWith("up");
  });

  it("calls copy bridge when present", async () => {
    const fn = vi.fn().mockResolvedValue(true);
    (window as unknown as { copy_text: (payload: string) => Promise<boolean> }).copy_text = fn;
    await copyText("abc");
    expect(fn).toHaveBeenCalledWith("abc");
  });

  it("falls back to browser clipboard when copy bridge is absent", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    await copyText("hello");

    expect(writeText).toHaveBeenCalledWith("hello");
  });
});
