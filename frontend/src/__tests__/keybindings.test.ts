import { describe, expect, it } from "vitest";

import { isPrimaryModifier, resizeDirectionShortcut, shortcutDigit } from "../keybindings";

function keyboardEvent(key: string, ctrlKey = false, metaKey = false): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, ctrlKey, metaKey });
}

describe("keybindings", () => {
  it("detects primary modifier", () => {
    expect(isPrimaryModifier(keyboardEvent("s", true, false))).toBe(true);
    expect(isPrimaryModifier(keyboardEvent("s", false, true))).toBe(true);
    expect(isPrimaryModifier(keyboardEvent("s", false, false))).toBe(false);
  });

  it("extracts shortcut digit only with modifier", () => {
    expect(shortcutDigit(keyboardEvent("3", true, false))).toBe(3);
    expect(shortcutDigit(keyboardEvent("3", false, false))).toBeNull();
    expect(shortcutDigit(keyboardEvent("a", true, false))).toBeNull();
  });

  it("maps mac resize shortcuts", () => {
    expect(resizeDirectionShortcut(keyboardEvent("PageUp", true, false), true)).toBe("up");
    expect(resizeDirectionShortcut(keyboardEvent("PageDown", true, false), true)).toBe("down");
    expect(resizeDirectionShortcut(keyboardEvent("Home", true, false), true)).toBe("left");
    expect(resizeDirectionShortcut(keyboardEvent("End", true, false), true)).toBe("right");
    expect(resizeDirectionShortcut(keyboardEvent("PageUp", false, false), true)).toBeNull();
    expect(resizeDirectionShortcut(keyboardEvent("PageUp", true, false), false)).toBeNull();
  });
});
