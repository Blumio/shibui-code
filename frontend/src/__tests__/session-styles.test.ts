import { describe, expect, it } from "vitest";

import {
  applySessionCss,
  normalizeSessionCss,
  sessionStyleContent,
  sessionStyleElementId,
} from "../session-styles";

describe("session styles", () => {
  it("normalizes css input", () => {
    expect(normalizeSessionCss("  .cm-content { color: red; }  ")).toBe(
      ".cm-content { color: red; }",
    );
  });

  it("builds style element ids by kind", () => {
    expect(sessionStyleElementId("highlight")).toBe("shibui-session-style-highlight");
    expect(sessionStyleElementId("lint")).toBe("shibui-session-style-lint");
  });

  it("builds style content", () => {
    expect(sessionStyleContent("lint", " .cm-lintRange-error { text-decoration: none; } ")).toContain(
      ".cm-lintRange-error",
    );
  });

  it("applies and updates session css in document head", () => {
    applySessionCss("highlight", ".cm-content { color: #123456; }");
    applySessionCss("highlight", ".cm-content { color: #abcdef; }");

    const style = document.getElementById("shibui-session-style-highlight");
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain("#abcdef");
  });
});
