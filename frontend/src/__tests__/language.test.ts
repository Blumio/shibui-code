import { describe, expect, it } from "vitest";

import { defaultLanguage, languageExtension, languageLabel, languageOptions } from "../language";

describe("language", () => {
  it("returns python as default", () => {
    expect(defaultLanguage()).toBe("python");
  });

  it("exposes supported options", () => {
    const options = languageOptions();
    expect(options.length).toBeGreaterThanOrEqual(13);
    expect(options.map((entry) => entry.id)).toContain("typescript");
  });

  it("returns label for known language", () => {
    expect(languageLabel("cpp")).toBe("C++");
  });

  it("returns extension for a language", () => {
    const extension = languageExtension("python");
    expect(extension).toBeDefined();
  });
});
