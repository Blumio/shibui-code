import { describe, expect, it } from "vitest";

import {
  isPrimaryModifier,
  resizeDirectionShortcut,
  shouldHandleGlobalShortcut,
  shortcutDigit,
} from "../keybindings";

function keyboardEvent(key: string, ctrlKey = false, metaKey = false): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, ctrlKey, metaKey, cancelable: true });
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

  it("maps resize shortcuts", () => {
    expect(resizeDirectionShortcut(keyboardEvent("PageUp", true, false))).toBe("up");
    expect(resizeDirectionShortcut(keyboardEvent("PageDown", true, false))).toBe("down");
    expect(resizeDirectionShortcut(keyboardEvent("Home", true, false))).toBe("left");
    expect(resizeDirectionShortcut(keyboardEvent("End", true, false))).toBe("right");
    expect(resizeDirectionShortcut(keyboardEvent("PageUp", false, false))).toBeNull();
    expect(resizeDirectionShortcut(keyboardEvent("PageUp", true, true))).toBeNull();
  });

  it("skips global handling when event is already handled", () => {
    const event = keyboardEvent("n", true, false);
    expect(shouldHandleGlobalShortcut(event)).toBe(true);
    event.preventDefault();
    expect(shouldHandleGlobalShortcut(event)).toBe(false);
  });
});
