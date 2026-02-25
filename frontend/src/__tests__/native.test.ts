import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearSnapshot, syncSnapshot } from "../native";

describe("native bridge", () => {
  beforeEach(() => {
    delete (window as unknown as { sync_snapshot?: unknown }).sync_snapshot;
    delete (window as unknown as { clear_snapshot?: unknown }).clear_snapshot;
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
});
