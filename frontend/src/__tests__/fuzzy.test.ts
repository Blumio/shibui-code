import { describe, expect, it } from "vitest";

import { fuzzyFilter, fuzzyScore } from "../fuzzy";

describe("fuzzy", () => {
  it("scores exact matches higher", () => {
    const exact = fuzzyScore("abc", "abc");
    const partial = fuzzyScore("abc", "a_b_c");
    expect(exact).toBeGreaterThan(partial);
  });

  it("returns zero for non-match", () => {
    expect(fuzzyScore("xyz", "alpha")).toBe(0);
  });

  it("filters and sorts items", () => {
    const items = [
      { id: "1", label: "Monokai", searchText: "monokai" },
      { id: "2", label: "Dracula", searchText: "dracula" },
      { id: "3", label: "Solarized", searchText: "solarized" },
    ];

    const results = fuzzyFilter(items, "dra");
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("Dracula");
  });
});
