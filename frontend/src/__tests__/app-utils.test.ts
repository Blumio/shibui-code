import { describe, expect, it } from "vitest";

import { filterLanguageItems, languageTitle, tabStripScrollDelta } from "../app";
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
});
