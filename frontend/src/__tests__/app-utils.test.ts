import { describe, expect, it } from "vitest";

import { filterLanguageItems, languageTitle } from "../app";
import { languageOptions } from "../language";

describe("app utility functions", () => {
  it("filters language items", () => {
    const items = filterLanguageItems(languageOptions(), "py");
    expect(items[0].label).toBe("Python");
  });

  it("returns language title", () => {
    expect(languageTitle("bash")).toBe("Bash");
  });
});
