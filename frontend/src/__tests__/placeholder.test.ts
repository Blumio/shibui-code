import { describe, expect, it } from "vitest";

import { emptyPlaceholderExtension, normalizePlaceholderInput } from "../placeholder";

describe("placeholder", () => {
  it("normalizes placeholder input", () => {
    expect(normalizePlaceholderInput("  hello\r\nworld  ")).toBe("hello\nworld");
  });

  it("builds an extension", () => {
    expect(emptyPlaceholderExtension("sample")).toBeDefined();
  });
});
