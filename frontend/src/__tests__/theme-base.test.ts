import { describe, expect, it } from "vitest";

import { createTheme } from "../themes/base";

describe("theme base", () => {
  it("creates a theme spec", () => {
    const theme = createTheme(
      "sample",
      "Sample",
      {
        background: "#000",
        foreground: "#fff",
        gutterBackground: "#000",
        gutterForeground: "#666",
        caret: "#fff",
        selection: "#222",
        lineHighlight: "#111",
        keyword: "#f00",
        variable: "#0f0",
        functionName: "#00f",
        string: "#0ff",
        number: "#ff0",
        comment: "#777",
        type: "#f0f",
        operator: "#888",
        punctuation: "#999",
      },
      true,
    );

    expect(theme.id).toBe("sample");
    expect(theme.displayName).toBe("Sample");
    expect(theme.extension).toBeDefined();
  });
});
