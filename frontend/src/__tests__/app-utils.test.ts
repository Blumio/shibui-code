import { describe, expect, it } from "vitest";

import {
  clampScrollPosition,
  diagnosticsExtensionForMode,
  filterLanguageItems,
  languageExtensionForMode,
  languageTitle,
  tabStripScrollDelta,
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

  it("prefers horizontal wheel delta for tab strip scrolling", () => {
    expect(tabStripScrollDelta({ deltaX: 24, deltaY: 120 })).toBe(24);
  });

  it("uses vertical wheel delta when horizontal delta is absent", () => {
    expect(tabStripScrollDelta({ deltaX: 0, deltaY: -90 })).toBe(-90);
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
});
