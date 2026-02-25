import { describe, expect, it } from "vitest";

import {
  activeTab,
  activateTab,
  addTab,
  clearTabs,
  closeTab,
  createInitialTabState,
  createTab,
  serializeSnapshot,
  switchTabByShortcut,
  updateTabContent,
  updateTabLanguage,
  updateTabTitle,
} from "../tabs";

describe("tabs", () => {
  it("creates a new tab", () => {
    const tab = createTab(5, "go");
    expect(tab.id).toBe(5);
    expect(tab.language).toBe("go");
    expect(tab.content).toBe("");
  });

  it("creates default state", () => {
    const state = createInitialTabState();
    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBe(1);
    expect(state.nextTabId).toBe(2);
  });

  it("adds a tab and activates it", () => {
    const state = addTab(createInitialTabState(), "rust");
    expect(state.tabs).toHaveLength(2);
    expect(state.activeTabId).toBe(2);
    expect(state.tabs[1].language).toBe("rust");
  });

  it("closes existing tab", () => {
    let state = addTab(createInitialTabState(), "python");
    state = closeTab(state, 2);
    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBe(1);
  });

  it("does not close last tab", () => {
    const initial = createInitialTabState();
    const next = closeTab(initial, 1);
    expect(next.tabs).toHaveLength(1);
    expect(next).toEqual(initial);
  });

  it("activates a valid tab", () => {
    let state = addTab(createInitialTabState(), "python");
    state = activateTab(state, 1);
    expect(state.activeTabId).toBe(1);
  });

  it("switches by keyboard shortcut index", () => {
    let state = addTab(createInitialTabState(), "python");
    state = addTab(state, "go");
    const next = switchTabByShortcut(state, 2);
    expect(next.activeTabId).toBe(2);
  });

  it("updates content", () => {
    const state = updateTabContent(createInitialTabState(), 1, "print('x')");
    expect(state.tabs[0].content).toBe("print('x')");
  });

  it("updates language", () => {
    const state = updateTabLanguage(createInitialTabState(), 1, "rust");
    expect(state.tabs[0].language).toBe("rust");
    expect(state.tabs[0].title).toBe("Tab 1");
  });

  it("updates title", () => {
    const state = updateTabTitle(createInitialTabState(), 1, "Practice Tab");
    expect(state.tabs[0].title).toBe("Practice Tab");
  });

  it("returns active tab", () => {
    let state = addTab(createInitialTabState(), "python");
    state = activateTab(state, 2);
    expect(activeTab(state).id).toBe(2);
  });

  it("serializes snapshot payload", () => {
    const payload = serializeSnapshot(createInitialTabState());
    expect(payload).toContain("tabs");
  });

  it("clears tabs to initial state", () => {
    let state = addTab(createInitialTabState(), "go");
    state = clearTabs();
    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBe(1);
  });
});
