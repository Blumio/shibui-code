import { describe, expect, it, vi } from "vitest";

import { bootstrap, ShibuiApp } from "../app";

type KeyBinding = {
  key?: string;
  run?: () => boolean;
};

type AppInternals = {
  editorKeyBindings: () => KeyBinding[];
  newTab: (fromShortcut?: boolean) => void;
  closeActiveTab: (fromShortcut?: boolean) => void;
  renameTab: (fromShortcut?: boolean) => void;
  openThemeSearch: () => Promise<void>;
  openLanguageSearch: () => Promise<void>;
  openPlaceholderConfig: () => Promise<void>;
  openHelpWindow: () => Promise<void>;
  copySelectionToClipboard: () => boolean;
  pasteClipboardToEditor: () => boolean;
  toggleHighlighting: () => boolean;
  toggleDiagnostics: () => boolean;
  switchTabByNumber: (oneBasedIndex: number) => boolean;
  switchToPreviousTab: () => boolean;
  switchToNextTab: () => boolean;
};

function bindingByKey(bindings: KeyBinding[], key: string): KeyBinding {
  const binding = bindings.find((entry) => entry.key === key);
  expect(binding).toBeDefined();
  expect(typeof binding?.run).toBe("function");
  return binding as KeyBinding;
}

describe("app keybinding coverage", () => {
  it("routes all custom keybinding run callbacks", () => {
    const app = new ShibuiApp(document.createElement("div"));
    const internals = app as unknown as AppInternals;

    const newTab = vi.fn();
    const closeActiveTab = vi.fn();
    const renameTab = vi.fn();
    const openThemeSearch = vi.fn(async () => {});
    const openLanguageSearch = vi.fn(async () => {});
    const openPlaceholderConfig = vi.fn(async () => {});
    const openHelpWindow = vi.fn(async () => {});
    const copySelectionToClipboard = vi.fn(() => true);
    const pasteClipboardToEditor = vi.fn(() => true);
    const toggleHighlighting = vi.fn(() => true);
    const toggleDiagnostics = vi.fn(() => true);
    const switchTabByNumber = vi.fn(() => true);
    const switchToPreviousTab = vi.fn(() => true);
    const switchToNextTab = vi.fn(() => true);

    internals.newTab = newTab;
    internals.closeActiveTab = closeActiveTab;
    internals.renameTab = renameTab;
    internals.openThemeSearch = openThemeSearch;
    internals.openLanguageSearch = openLanguageSearch;
    internals.openPlaceholderConfig = openPlaceholderConfig;
    internals.openHelpWindow = openHelpWindow;
    internals.copySelectionToClipboard = copySelectionToClipboard;
    internals.pasteClipboardToEditor = pasteClipboardToEditor;
    internals.toggleHighlighting = toggleHighlighting;
    internals.toggleDiagnostics = toggleDiagnostics;
    internals.switchTabByNumber = switchTabByNumber;
    internals.switchToPreviousTab = switchToPreviousTab;
    internals.switchToNextTab = switchToNextTab;

    const bindings = internals.editorKeyBindings();
    const run = (key: string) => bindingByKey(bindings, key).run?.();

    expect(run("Mod-n")).toBe(true);
    expect(run("Mod-w")).toBe(true);
    expect(run("Mod-r")).toBe(true);
    expect(run("Mod-t")).toBe(true);
    expect(run("Mod-l")).toBe(true);
    expect(run("Mod-p")).toBe(true);
    expect(run("Mod-h")).toBe(true);
    expect(run("Mod-c")).toBe(true);
    expect(run("Mod-v")).toBe(true);
    expect(run("Mod-Shift-y")).toBe(true);
    expect(run("Mod-Shift-x")).toBe(true);
    expect(run("Mod-1")).toBe(true);
    expect(run("Mod-2")).toBe(true);
    expect(run("Mod-3")).toBe(true);
    expect(run("Mod-4")).toBe(true);
    expect(run("Mod-5")).toBe(true);
    expect(run("Mod-6")).toBe(true);
    expect(run("Mod-7")).toBe(true);
    expect(run("Mod-8")).toBe(true);
    expect(run("Mod-9")).toBe(true);
    expect(run("Mod-ArrowLeft")).toBe(true);
    expect(run("Mod-ArrowRight")).toBe(true);

    expect(newTab).toHaveBeenCalledWith(true);
    expect(closeActiveTab).toHaveBeenCalledWith(true);
    expect(renameTab).toHaveBeenCalledWith(true);
    expect(openThemeSearch).toHaveBeenCalledTimes(1);
    expect(openLanguageSearch).toHaveBeenCalledTimes(1);
    expect(openPlaceholderConfig).toHaveBeenCalledTimes(1);
    expect(openHelpWindow).toHaveBeenCalledTimes(1);
    expect(copySelectionToClipboard).toHaveBeenCalledTimes(1);
    expect(pasteClipboardToEditor).toHaveBeenCalledTimes(1);
    expect(toggleHighlighting).toHaveBeenCalledTimes(1);
    expect(toggleDiagnostics).toHaveBeenCalledTimes(1);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(1, 1);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(2, 2);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(3, 3);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(4, 4);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(5, 5);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(6, 6);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(7, 7);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(8, 8);
    expect(switchTabByNumber).toHaveBeenNthCalledWith(9, 9);
    expect(switchToPreviousTab).toHaveBeenCalledTimes(1);
    expect(switchToNextTab).toHaveBeenCalledTimes(1);
  });

  it("bootstraps and initializes the app", async () => {
    const root = document.createElement("div");
    const initializeSpy = vi.spyOn(ShibuiApp.prototype, "initialize").mockResolvedValue(undefined);

    await bootstrap(root);

    expect(initializeSpy).toHaveBeenCalledTimes(1);
    initializeSpy.mockRestore();
  });
});
