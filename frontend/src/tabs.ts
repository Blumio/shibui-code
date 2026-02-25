import { defaultLanguage, languageLabel } from "./language";
import type { LanguageId, SnapshotTab, TabModel } from "./types";

export interface TabState {
  tabs: TabModel[];
  activeTabId: number;
  nextTabId: number;
}

export function createTab(id: number, language: LanguageId = defaultLanguage()): TabModel {
  return {
    id,
    title: `Tab ${id}`,
    language,
    content: "",
  };
}

export function createInitialTabState(): TabState {
  const tab = createTab(1, defaultLanguage());
  return {
    tabs: [tab],
    activeTabId: tab.id,
    nextTabId: 2,
  };
}

export function addTab(state: TabState, language: LanguageId = defaultLanguage()): TabState {
  const tab = createTab(state.nextTabId, language);
  return {
    tabs: [...state.tabs, tab],
    activeTabId: tab.id,
    nextTabId: state.nextTabId + 1,
  };
}

export function closeTab(state: TabState, tabId: number): TabState {
  if (state.tabs.length === 1) {
    return state;
  }

  const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
  if (tabIndex === -1) {
    return state;
  }

  const tabs = state.tabs.filter((tab) => tab.id !== tabId);
  const nextActive =
    state.activeTabId === tabId
      ? tabs[Math.max(0, tabIndex - 1)].id
      : state.activeTabId;

  return {
    ...state,
    tabs,
    activeTabId: nextActive,
  };
}

export function activateTab(state: TabState, tabId: number): TabState {
  if (!state.tabs.some((tab) => tab.id === tabId)) {
    return state;
  }

  return {
    ...state,
    activeTabId: tabId,
  };
}

export function switchTabByShortcut(state: TabState, oneBasedIndex: number): TabState {
  const target = state.tabs[oneBasedIndex - 1];
  if (target === undefined) {
    return state;
  }

  return {
    ...state,
    activeTabId: target.id,
  };
}

export function updateTabContent(state: TabState, tabId: number, content: string): TabState {
  return {
    ...state,
    tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, content } : tab)),
  };
}

export function updateTabLanguage(state: TabState, tabId: number, language: LanguageId): TabState {
  return {
    ...state,
    tabs: state.tabs.map((tab) =>
      tab.id === tabId ? { ...tab, language, title: `Tab ${tab.id} (${languageLabel(language)})` } : tab,
    ),
  };
}

export function activeTab(state: TabState): TabModel {
  const tab = state.tabs.find((entry) => entry.id === state.activeTabId);
  if (tab !== undefined) {
    return tab;
  }

  return state.tabs[0];
}

export function serializeSnapshot(state: TabState): string {
  const tabs: SnapshotTab[] = state.tabs.map((tab) => ({
    title: tab.title,
    language: tab.language,
    content: tab.content,
  }));

  return JSON.stringify({ tabs });
}

export function clearTabs(): TabState {
  return createInitialTabState();
}
