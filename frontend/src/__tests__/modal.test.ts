import { describe, expect, it } from "vitest";

import { openHelpModal, openMultilineInputModal, openTextInputModal } from "../modal";

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

    expect(document.querySelector(".modal-window-help")).not.toBeNull();
    const rows = document.querySelectorAll(".modal-help-item");
    expect(rows.length).toBe(2);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves multiline modal on Cmd/Ctrl+Enter", async () => {
    const promise = openMultilineInputModal({
      title: "Import Highlight Style",
      placeholder: "Paste CSS...",
      initialValue: ".cm-content { color: red; }",
    });

    const textarea = document.querySelector(".modal-textarea") as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    textarea.value = ".cm-content { color: #fff; }";
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true }));

    await expect(promise).resolves.toBe(".cm-content { color: #fff; }");
  });
});
