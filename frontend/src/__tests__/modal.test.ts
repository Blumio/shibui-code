import { describe, expect, it } from "vitest";

import { openHelpModal, openTextInputModal } from "../modal";

describe("modal", () => {
  it("resolves with text on enter", async () => {
    const promise = openTextInputModal({
      title: "Placeholder",
      placeholder: "Type your placeholder for an empty page.",
      initialValue: "seed",
    });

    const input = document.querySelector(".modal-input") as HTMLInputElement;
    expect(input).not.toBeNull();
    input.value = "hello";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    await expect(promise).resolves.toBe("hello");
  });

  it("resolves null on escape", async () => {
    const promise = openTextInputModal({
      title: "Placeholder",
      placeholder: "Type your placeholder for an empty page.",
    });

    const input = document.querySelector(".modal-input") as HTMLInputElement;
    expect(input).not.toBeNull();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    await expect(promise).resolves.toBeNull();
  });

  it("renders help shortcuts and closes on escape", async () => {
    const promise = openHelpModal({
      title: "Keyboard Shortcuts",
      shortcuts: [
        { shortcut: "Cmd/Ctrl+H", description: "Open help." },
        { shortcut: "Cmd/Ctrl+N", description: "New tab." },
      ],
    });

    const rows = document.querySelectorAll(".modal-help-item");
    expect(rows.length).toBe(2);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await expect(promise).resolves.toBeUndefined();
  });
});
