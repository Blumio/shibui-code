import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Compartment, EditorState } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import { EditorView, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";

import { fuzzyFilter } from "./fuzzy";
import { isPrimaryModifier, resizeDirectionShortcut, shortcutDigit } from "./keybindings";
import { diagnosticsExtension } from "./linting";
import {
  languageExtension,
  languageLabel,
  languageOptions,
  type LanguageOption,
} from "./language";
import { openHelpModal, openSearchModal, openTextInputModal } from "./modal";
import { clearSnapshot, resizeWindow, syncSnapshot } from "./native";
import { emptyPlaceholderExtension, normalizePlaceholderInput } from "./placeholder";
import {
  activeTab,
  activateTab,
  addTab,
  clearTabs,
  closeTab,
  createInitialTabState,
  serializeSnapshot,
  switchTabByShortcut,
  type TabState,
  updateTabContent,
  updateTabLanguage,
  updateTabTitle,
} from "./tabs";
import { findThemeLoader, themeListItems } from "./theme-registry";
import defaultTheme from "./themes/vscode-dark-plus";
import type { ListItem, ThemeSpec } from "./types";

export class ShibuiApp {
  private readonly root: HTMLElement;

  private readonly tabsElement: HTMLDivElement;

  private readonly editorElement: HTMLDivElement;

  private readonly themeCompartment = new Compartment();

  private readonly languageCompartment = new Compartment();

  private readonly placeholderCompartment = new Compartment();

  private tabState: TabState = createInitialTabState();

  private editor: EditorView | null = null;

  private applyingEditorUpdate = false;

  private currentTheme: ThemeSpec = defaultTheme;

  private emptyPagePlaceholder = "";

  private editingTabId: number | null = null;

  private editingTabTitle = "";

  private modalOpen = false;

  private readonly isMac = navigator.platform.toLowerCase().includes("mac");

  constructor(root: HTMLElement) {
    this.root = root;

    const shell = document.createElement("div");
    shell.className = "app-shell";

    const tabBar = document.createElement("div");
    tabBar.className = "tabbar";

    this.tabsElement = document.createElement("div");
    this.tabsElement.className = "tabs";

    const newTabButton = document.createElement("button");
    newTabButton.type = "button";
    newTabButton.className = "tab-new";
    newTabButton.textContent = "+";
    newTabButton.title = "New tab (Ctrl+N)";
    newTabButton.addEventListener("click", () => {
      this.newTab();
    });

    tabBar.append(this.tabsElement, newTabButton);

    this.editorElement = document.createElement("div");
    this.editorElement.className = "editor-root";

    shell.append(tabBar, this.editorElement);
    this.root.appendChild(shell);
  }

  async initialize(): Promise<void> {
    this.root.classList.add(this.currentTheme.editorClassName);
    this.renderTabs();
    this.createEditor();

    window.addEventListener("keydown", (event) => {
      this.handleGlobalShortcuts(event);
    });

    window.addEventListener("beforeunload", () => {
      this.flushSnapshot();
      this.tabState = clearTabs();
    });

    await clearSnapshot();
    this.flushSnapshot();
  }

  private buildBaseExtensions(): Extension[] {
    return [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      diagnosticsExtension(),
      this.themeCompartment.of(this.currentTheme.extension),
      this.languageCompartment.of(languageExtension(activeTab(this.tabState).language)),
      this.placeholderCompartment.of(emptyPlaceholderExtension(this.emptyPagePlaceholder)),
      keymap.of([...this.editorKeyBindings(), ...historyKeymap, ...defaultKeymap]),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || this.applyingEditorUpdate) {
          return;
        }

        this.tabState = updateTabContent(
          this.tabState,
          this.tabState.activeTabId,
          update.state.doc.toString(),
        );
        this.scheduleSnapshotSync();
      }),
    ];
  }

  private createEditor(): void {
    const currentTab = activeTab(this.tabState);

    const state = EditorState.create({
      doc: currentTab.content,
      extensions: this.buildBaseExtensions(),
    });

    this.editor = new EditorView({
      parent: this.editorElement,
      state,
    });
  }

  private editorKeyBindings() {
    return [
      {
        key: "Mod-n",
        preventDefault: true,
        run: () => {
          this.newTab();
          return true;
        },
      },
      {
        key: "Mod-w",
        preventDefault: true,
        run: () => {
          this.closeActiveTab();
          return true;
        },
      },
      {
        key: "Mod-s",
        preventDefault: true,
        run: () => {
          void this.openThemeSearch();
          return true;
        },
      },
      {
        key: "Mod-l",
        preventDefault: true,
        run: () => {
          void this.openLanguageSearch();
          return true;
        },
      },
      {
        key: "Mod-p",
        preventDefault: true,
        run: () => {
          void this.openPlaceholderConfig();
          return true;
        },
      },
      {
        key: "Mod-h",
        preventDefault: true,
        run: () => {
          void this.openHelpWindow();
          return true;
        },
      },
      {
        key: "Mod-1",
        run: () => this.switchTabByNumber(1),
      },
      {
        key: "Mod-2",
        run: () => this.switchTabByNumber(2),
      },
      {
        key: "Mod-3",
        run: () => this.switchTabByNumber(3),
      },
      {
        key: "Mod-4",
        run: () => this.switchTabByNumber(4),
      },
      {
        key: "Mod-5",
        run: () => this.switchTabByNumber(5),
      },
      {
        key: "Mod-6",
        run: () => this.switchTabByNumber(6),
      },
      {
        key: "Mod-7",
        run: () => this.switchTabByNumber(7),
      },
      {
        key: "Mod-8",
        run: () => this.switchTabByNumber(8),
      },
      {
        key: "Mod-9",
        run: () => this.switchTabByNumber(9),
      },
    ];
  }

  private handleGlobalShortcuts(event: KeyboardEvent): void {
    const resizeDirection = resizeDirectionShortcut(event, this.isMac);
    if (resizeDirection !== null) {
      event.preventDefault();
      void resizeWindow(resizeDirection);
      return;
    }

    if (!isPrimaryModifier(event)) {
      return;
    }

    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      void this.openThemeSearch();
      return;
    }

    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      this.newTab();
      return;
    }

    if (event.key.toLowerCase() === "w") {
      event.preventDefault();
      this.closeActiveTab();
      return;
    }

    if (event.key.toLowerCase() === "l") {
      event.preventDefault();
      void this.openLanguageSearch();
      return;
    }

    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      void this.openPlaceholderConfig();
      return;
    }

    if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      void this.openHelpWindow();
      return;
    }

    const digit = shortcutDigit(event);
    if (digit !== null) {
      event.preventDefault();
      this.switchTabByNumber(digit);
    }
  }

  private persistEditor(): void {
    if (this.editor === null) {
      return;
    }

    this.tabState = updateTabContent(this.tabState, this.tabState.activeTabId, this.editor.state.doc.toString());
  }

  private applyActiveTabToEditor(): void {
    if (this.editor === null) {
      return;
    }

    const currentTab = activeTab(this.tabState);

    this.applyingEditorUpdate = true;
    this.editor.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: currentTab.content,
      },
      effects: [this.languageCompartment.reconfigure(languageExtension(currentTab.language))],
    });
    this.applyingEditorUpdate = false;

    this.editor.focus();
  }

  private renderTabs(): void {
    this.tabsElement.replaceChildren();

    this.tabState.tabs.forEach((tab) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab";
      if (tab.id === this.tabState.activeTabId) {
        button.classList.add("tab-active");
      }

      const title = document.createElement("span");
      title.className = "tab-title";
      title.textContent = tab.title;

      if (this.editingTabId === tab.id) {
        button.classList.add("tab-editing");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "tab-title-input";
        input.value = this.editingTabTitle;
        input.addEventListener("click", (event) => {
          event.stopPropagation();
        });
        input.addEventListener("dblclick", (event) => {
          event.stopPropagation();
        });
        input.addEventListener("input", () => {
          this.editingTabTitle = input.value;
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.commitTabRename(tab.id);
          } else if (event.key === "Escape") {
            event.preventDefault();
            this.cancelTabRename();
          }
        });
        input.addEventListener("blur", () => {
          this.commitTabRename(tab.id);
        });

        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });

        button.append(input);
      } else {
        title.addEventListener("dblclick", (event) => {
          event.stopPropagation();
          this.startTabRename(tab.id);
        });
        button.append(title);
      }

      const close = document.createElement("button");
      close.type = "button";
      close.className = "tab-close";
      close.textContent = "x";
      close.title = "Close tab";
      close.addEventListener("click", (event) => {
        event.stopPropagation();
        this.closeTabById(tab.id);
      });

      button.addEventListener("click", () => {
        if (this.editingTabId !== null && this.editingTabId !== tab.id) {
          this.commitTabRename(this.editingTabId);
        }

        this.persistEditor();
        this.tabState = activateTab(this.tabState, tab.id);
        this.editingTabId = null;
        this.editingTabTitle = "";
        this.renderTabs();
        this.applyActiveTabToEditor();
      });

      button.append(close);
      this.tabsElement.appendChild(button);
    });
  }

  private newTab(): void {
    this.cancelTabRename();
    this.persistEditor();
    this.tabState = addTab(this.tabState);
    this.renderTabs();
    this.applyActiveTabToEditor();
    this.scheduleSnapshotSync();
  }

  private closeTabById(tabId: number): void {
    this.cancelTabRename();
    this.persistEditor();
    this.tabState = closeTab(this.tabState, tabId);
    this.renderTabs();
    this.applyActiveTabToEditor();
    this.scheduleSnapshotSync();
  }

  private closeActiveTab(): void {
    this.closeTabById(this.tabState.activeTabId);
  }

  private switchTabByNumber(oneBasedIndex: number): boolean {
    this.cancelTabRename();
    this.persistEditor();
    this.tabState = switchTabByShortcut(this.tabState, oneBasedIndex);
    this.renderTabs();
    this.applyActiveTabToEditor();
    this.scheduleSnapshotSync();
    return true;
  }

  private async openThemeSearch(): Promise<void> {
    if (this.modalOpen) {
      return;
    }

    this.modalOpen = true;
    const selectedId = await openSearchModal({
      title: "Theme Search Mode",
      placeholder: "Search theme",
      items: themeListItems(),
    });
    this.modalOpen = false;

    if (selectedId === null) {
      return;
    }

    const loader = findThemeLoader(selectedId);
    if (loader === undefined) {
      return;
    }

    const nextTheme = await loader.load();
    await this.applyTheme(nextTheme);
  }

  private async applyTheme(nextTheme: ThemeSpec): Promise<void> {
    if (this.editor === null) {
      return;
    }

    this.root.classList.remove(this.currentTheme.editorClassName);
    this.root.classList.add(nextTheme.editorClassName);
    this.currentTheme = nextTheme;

    this.editor.dispatch({
      effects: this.themeCompartment.reconfigure(nextTheme.extension),
    });
  }

  private languageListItems(): ListItem[] {
    return languageOptions().map((option) => ({
      id: option.id,
      label: option.label,
      searchText: `${option.id} ${option.label}`,
    }));
  }

  private async openLanguageSearch(): Promise<void> {
    if (this.modalOpen) {
      return;
    }

    this.modalOpen = true;
    const selectedId = await openSearchModal({
      title: "Select Language",
      placeholder: "Search language",
      items: this.languageListItems(),
    });
    this.modalOpen = false;

    if (selectedId === null) {
      return;
    }

    const selected = languageOptions().find((entry) => entry.id === selectedId);
    if (selected === undefined) {
      return;
    }

    this.applyLanguage(selected);
  }

  private applyLanguage(language: LanguageOption): void {
    this.cancelTabRename();
    this.persistEditor();
    this.tabState = updateTabLanguage(this.tabState, this.tabState.activeTabId, language.id);
    this.renderTabs();
    this.applyActiveTabToEditor();
    this.scheduleSnapshotSync();
  }

  private startTabRename(tabId: number): void {
    const tab = this.tabState.tabs.find((entry) => entry.id === tabId);
    if (tab === undefined) {
      return;
    }

    this.editingTabId = tabId;
    this.editingTabTitle = tab.title;
    this.renderTabs();
  }

  private commitTabRename(tabId: number): void {
    if (this.editingTabId !== tabId) {
      return;
    }

    const tab = this.tabState.tabs.find((entry) => entry.id === tabId);
    if (tab === undefined) {
      this.cancelTabRename();
      return;
    }

    const nextTitle = this.editingTabTitle.trim();
    const normalizedTitle = nextTitle.length === 0 ? tab.title : nextTitle;

    this.tabState = updateTabTitle(this.tabState, tabId, normalizedTitle);
    this.editingTabId = null;
    this.editingTabTitle = "";
    this.renderTabs();
    this.scheduleSnapshotSync();
  }

  private cancelTabRename(): void {
    if (this.editingTabId === null) {
      return;
    }

    this.editingTabId = null;
    this.editingTabTitle = "";
    this.renderTabs();
  }

  private async openPlaceholderConfig(): Promise<void> {
    if (this.modalOpen) {
      return;
    }

    this.modalOpen = true;
    const placeholder = await openTextInputModal({
      title: "Configure Empty Page Placeholder",
      placeholder: "Type your placeholder for an empty page.",
      initialValue: this.emptyPagePlaceholder,
    });
    this.modalOpen = false;

    if (placeholder === null) {
      return;
    }

    this.applyEmptyPlaceholder(placeholder);
  }

  private applyEmptyPlaceholder(value: string): void {
    if (this.editor === null) {
      return;
    }

    this.emptyPagePlaceholder = normalizePlaceholderInput(value);
    this.editor.dispatch({
      effects: this.placeholderCompartment.reconfigure(
        emptyPlaceholderExtension(this.emptyPagePlaceholder),
      ),
    });
  }

  private helpShortcuts(): Array<{ shortcut: string; description: string }> {
    return [
      { shortcut: "Cmd/Ctrl+N", description: "Create a new temporary tab." },
      { shortcut: "Cmd/Ctrl+W", description: "Close the active tab." },
      { shortcut: "Cmd/Ctrl+S", description: "Open Theme Search Mode." },
      { shortcut: "Cmd/Ctrl+L", description: "Open language selection." },
      { shortcut: "Cmd/Ctrl+P", description: "Configure empty-page placeholder text." },
      { shortcut: "Cmd/Ctrl+H", description: "Show this help window." },
      { shortcut: "Cmd/Ctrl+1..9", description: "Switch to tab by index." },
      { shortcut: "Escape", description: "Close open modal dialogs." },
    ];
  }

  private async openHelpWindow(): Promise<void> {
    if (this.modalOpen) {
      return;
    }

    this.modalOpen = true;
    await openHelpModal({
      title: "Keyboard Shortcuts",
      shortcuts: this.helpShortcuts(),
    });
    this.modalOpen = false;
  }

  private scheduleSnapshotSync(): void {
    void this.sendSnapshot();
  }

  private async sendSnapshot(): Promise<void> {
    this.persistEditor();
    const payload = serializeSnapshot(this.tabState);
    await syncSnapshot(payload);
  }

  private flushSnapshot(): void {
    this.persistEditor();
    void syncSnapshot(serializeSnapshot(this.tabState));
  }
}

export function bootstrap(root: HTMLElement): Promise<void> {
  const app = new ShibuiApp(root);
  return app.initialize();
}

export function filterLanguageItems(options: LanguageOption[], query: string): ListItem[] {
  const items = options.map((option) => ({
    id: option.id,
    label: option.label,
    searchText: `${option.id} ${option.label}`,
  }));

  return fuzzyFilter(items, query);
}

export function languageTitle(languageId: LanguageOption["id"]): string {
  return languageLabel(languageId);
}
