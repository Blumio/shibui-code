import { describe, expect, it } from "vitest";

import {
  clampScrollPosition,
  diagnosticsExtensionForMode,
  filterLanguageItems,
  languageExtensionForMode,
  languageTitle,
  isTabOverflowing,
  tabOverflowState,
  tabStripScrollDelta,
  toggleShortcutMessage,
} from "../app";
import { languageOptions } from "../language";

describe("app utility functions", () => {
  it("filters language items", () => {
    const items = filterLanguageItems(languageOptions(), "py");
    expect(items[0].label).toBe("Python");
  });

  it("returns language title", () => {
    expect(languageTitle("bash")).toBe("Bash");
  });

  it("prefers vertical wheel delta for right-side tab strip scrolling", () => {
    expect(tabStripScrollDelta({ deltaX: 24, deltaY: 120 })).toBe(120);
  });

  it("falls back to horizontal wheel delta when vertical delta is absent", () => {
    expect(tabStripScrollDelta({ deltaX: -90, deltaY: 0 })).toBe(-90);
  });

  it("returns no language extension when analysis mode is disabled", () => {
    expect(languageExtensionForMode("python", false)).toEqual([]);
  });

  it("returns no diagnostics extension when analysis mode is disabled", () => {
    expect(diagnosticsExtensionForMode(false)).toEqual([]);
  });

  it("clamps scroll position to valid tab strip bounds", () => {
    expect(clampScrollPosition(-10, 100)).toBe(0);
    expect(clampScrollPosition(130, 100)).toBe(100);
    expect(clampScrollPosition(24, 100)).toBe(24);
  });

  it("builds shortcut toast messages", () => {
    expect(toggleShortcutMessage("highlighting", true, "Cmd/Ctrl+Shift+Y")).toContain(
      "Syntax highlighting enabled",
    );
    expect(toggleShortcutMessage("lint", false, "Cmd/Ctrl+Shift+U")).toContain(
      "Lint diagnostics disabled",
    );
  });

  it("detects tab-strip overflow", () => {
    expect(isTabOverflowing(420, 400)).toBe(true);
    expect(isTabOverflowing(400, 400)).toBe(false);
  });

  it("computes tab overflow scroll button state", () => {
    expect(tabOverflowState(400, 400, 0)).toEqual({
      hasOverflow: false,
      canScrollUp: false,
      canScrollDown: false,
    });
    expect(tabOverflowState(700, 400, 0)).toEqual({
      hasOverflow: true,
      canScrollUp: false,
      canScrollDown: true,
    });
    expect(tabOverflowState(700, 400, 180)).toEqual({
      hasOverflow: true,
      canScrollUp: true,
      canScrollDown: true,
    });
    expect(tabOverflowState(700, 400, 300)).toEqual({
      hasOverflow: true,
      canScrollUp: true,
      canScrollDown: false,
    });
  });
});
