import { describe, expect, it } from "vitest";

import {
  diagnosticsExtension,
  hasNonWhitespaceContent,
  longLineRanges,
  trailingWhitespaceRanges,
} from "../linting";

describe("linting", () => {
  it("detects trailing whitespace ranges", () => {
    const ranges = trailingWhitespaceRanges("abc  \ndef\t");
    expect(ranges).toHaveLength(2);
    expect(ranges[0].from).toBe(3);
  });

  it("detects long line ranges", () => {
    const ranges = longLineRanges("short\n0123456789012345", 10);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].from).toBe(16);
  });

  it("builds diagnostics extension", () => {
    expect(diagnosticsExtension()).toBeDefined();
  });

  it("detects whether content is non-whitespace", () => {
    expect(hasNonWhitespaceContent("")).toBe(false);
    expect(hasNonWhitespaceContent("   \n\t")).toBe(false);
    expect(hasNonWhitespaceContent("x")).toBe(true);
  });
});
