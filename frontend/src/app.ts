import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { Compartment, EditorState } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import { codeFolding, foldGutter, foldKeymap } from "@codemirror/language";
import { EditorView, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";

import { fuzzyFilter } from "./fuzzy";
import {
  isPrimaryModifier,
  resizeDirectionShortcut,
  shouldHandleGlobalShortcut,
  shortcutDigit,
} from "./keybindings";
import { diagnosticsExtension } from "./linting";
import {
  languageExtension,
  languageLabel,
  languageOptions,
  type LanguageOption,
} from "./language";
import {
  openHelpModal,
  openSearchModal,
  openTextInputModal,
} from "./modal";
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
  switchToNextTab,
  switchToPreviousTab,
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

  private readonly shellElement: HTMLDivElement;

  private readonly tabBarElement: HTMLDivElement;

  private readonly tabsElement: HTMLDivElement;

  private readonly tabControlsElement: HTMLDivElement;

  private readonly tabScrollLeftButton: HTMLButtonElement;

  private readonly tabScrollRightButton: HTMLButtonElement;

  private readonly tabBarToggleButton: HTMLButtonElement;

  private readonly editorElement: HTMLDivElement;

  private readonly themeCompartment = new Compartment();

  private readonly languageCompartment = new Compartment();

  private readonly diagnosticsCompartment = new Compartment();

  private readonly placeholderCompartment = new Compartment();

  private tabState: TabState = createInitialTabState();

  private editor: EditorView | null = null;

  private applyingEditorUpdate = false;

  private currentTheme: ThemeSpec = defaultTheme;

  private emptyPagePlaceholder = "Cmd+H to show shortcuts";

  private highlightingEnabled = true;

  private diagnosticsEnabled = true;

  private editingTabId: number | null = null;

  private editingTabTitle = "";

  private modalOpen = false;

  private tabBarCollapsed = true;

  private toastTimerId: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;

    this.shellElement = document.createElement("div");
    this.shellElement.className = "app-shell";

    this.tabBarElement = document.createElement("div");
    this.tabBarElement.className = "tabbar";
    this.tabBarElement.addEventListener(
      "wheel",
      (event) => {
        this.handleTabStripWheel(event);
      },
      { passive: false },
    );

    this.tabsElement = document.createElement("div");
    this.tabsElement.className = "tabs";
    this.tabsElement.addEventListener("scroll", () => {
      this.updateTabOverflowState();
    });

    this.tabControlsElement = document.createElement("div");
    this.tabControlsElement.className = "tabbar-controls";

    this.tabScrollLeftButton = document.createElement("button");
    this.tabScrollLeftButton.type = "button";
    this.tabScrollLeftButton.className = "tab-scroll tab-scroll-left";
    this.tabScrollLeftButton.textContent = "<";
    this.tabScrollLeftButton.title = "Scroll tabs left";
    this.tabScrollLeftButton.addEventListener("click", () => {
      this.scrollTabsBy(-220);
    });

    this.tabScrollRightButton = document.createElement("button");
    this.tabScrollRightButton.type = "button";
    this.tabScrollRightButton.className = "tab-scroll tab-scroll-right";
    this.tabScrollRightButton.textContent = ">";
    this.tabScrollRightButton.title = "Scroll tabs right";
    this.tabScrollRightButton.addEventListener("click", () => {
      this.scrollTabsBy(220);
    });

    const newTabButton = document.createElement("button");
    newTabButton.type = "button";
    newTabButton.className = "tab-new";
    newTabButton.textContent = "+";
    newTabButton.title = "New tab (Ctrl+N)";
    newTabButton.addEventListener("click", () => {
      this.newTab();
    });

    this.tabBarToggleButton = document.createElement("button");
    this.tabBarToggleButton.type = "button";
    this.tabBarToggleButton.className = "tabbar-toggle";
    this.tabBarToggleButton.textContent = "";
    this.tabBarToggleButton.dataset.icon = "^";
    this.tabBarToggleButton.title = "Hide tab bar";
    this.tabBarToggleButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.toggleTabBar();
    });

    this.tabControlsElement.append(this.tabScrollLeftButton, this.tabScrollRightButton, newTabButton);
    this.tabBarElement.append(this.tabsElement, this.tabControlsElement);

    this.editorElement = document.createElement("div");
    this.editorElement.className = "editor-root";

    this.shellElement.append(this.tabBarElement, this.tabBarToggleButton, this.editorElement);
    this.root.appendChild(this.shellElement);
    this.updateTabBarVisibility();
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

    window.addEventListener("resize", () => {
      this.updateTabOverflowState();
    });

    await clearSnapshot();
    this.flushSnapshot();
    this.updateTabOverflowState();
  }

  private buildBaseExtensions(): Extension[] {
    return [
      lineNumbers(),
      foldGutter(),
      highlightActiveLineGutter(),
      history(),
      codeFolding(),
      this.themeCompartment.of(this.currentTheme.extension),
      this.languageCompartment.of(
        languageExtensionForMode(activeTab(this.tabState).language, this.highlightingEnabled),
      ),
      this.diagnosticsCompartment.of(diagnosticsExtensionForMode(this.diagnosticsEnabled)),
      this.placeholderCompartment.of(emptyPlaceholderExtension(this.emptyPagePlaceholder)),
      keymap.of([...this.editorKeyBindings(), ...foldKeymap, ...historyKeymap, ...defaultKeymap]),
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
      indentWithTab,
      {
        key: "Mod-n",
        preventDefault: true,
        run: () => {
          this.newTab(true);
          return true;
        },
      },
      {
        key: "Mod-w",
        preventDefault: true,
        run: () => {
          this.closeActiveTab(true);
          return true;
        },
      },
      {
        key: "Mod-t",
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
        key: "Mod-Shift-h",
        preventDefault: true,
        run: () => this.toggleHighlighting(),
      },
      {
        key: "Mod-Shift-l",
        preventDefault: true,
        run: () => this.toggleDiagnostics(),
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
      {
        key: "Mod-ArrowLeft",
        preventDefault: true,
        run: () => this.switchToPreviousTab(),
      },
      {
        key: "Mod-ArrowRight",
        preventDefault: true,
        run: () => this.switchToNextTab(),
      },
    ];
  }

  private handleGlobalShortcuts(event: KeyboardEvent): void {
    if (!shouldHandleGlobalShortcut(event)) {
      return;
    }

    const resizeDirection = resizeDirectionShortcut(event);
    if (resizeDirection !== null) {
      event.preventDefault();
      void resizeWindow(resizeDirection);
      return;
    }

    if (!isPrimaryModifier(event)) {
      return;
    }

    if (event.key.toLowerCase() === "t") {
      event.preventDefault();
      void this.openThemeSearch();
      return;
    }

    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      this.newTab(true);
      return;
    }

    if (event.key.toLowerCase() === "w") {
      event.preventDefault();
      this.closeActiveTab(true);
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

    if (event.shiftKey && event.key.toLowerCase() === "y") {
      event.preventDefault();
      this.toggleHighlighting();
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === "u") {
      event.preventDefault();
      this.toggleDiagnostics();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.switchToPreviousTab();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      this.switchToNextTab();
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
      effects: [
        this.languageCompartment.reconfigure(
          languageExtensionForMode(currentTab.language, this.highlightingEnabled),
        ),
      ],
    });
    this.applyingEditorUpdate = false;

    this.editor.focus();
  }

  private renderTabs(): void {
    this.tabsElement.replaceChildren();

    this.tabState.tabs.forEach((tab) => {
      const tabElement = document.createElement("div");
      tabElement.className = "tab";
      if (tab.id === this.tabState.activeTabId) {
        tabElement.classList.add("tab-active");
      }

      const title = document.createElement("span");
      title.className = "tab-title";
      title.textContent = tab.title;

      if (this.editingTabId === tab.id) {
        tabElement.classList.add("tab-editing");
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
          event.stopPropagation();
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

        tabElement.append(input);
      } else {
        title.addEventListener("dblclick", (event) => {
          event.stopPropagation();
          this.startTabRename(tab.id);
        });
        tabElement.append(title);
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

      if (this.editingTabId !== tab.id) {
        tabElement.classList.add("tab-interactive");
        tabElement.setAttribute("role", "button");
        tabElement.setAttribute("tabindex", "0");
        tabElement.addEventListener("click", () => {
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
        tabElement.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            tabElement.click();
          }
        });
      }

      tabElement.append(close);
      this.tabsElement.appendChild(tabElement);
    });

    this.updateTabOverflowState();
  }

  private toggleTabBar(): void {
    this.tabBarCollapsed = !this.tabBarCollapsed;
    this.updateTabBarVisibility();
  }

  private updateTabBarVisibility(): void {
    if (this.tabBarCollapsed) {
      this.tabBarElement.classList.add("tabbar-collapsed");
      this.tabBarToggleButton.dataset.icon = "v";
      this.tabBarToggleButton.title = "Show tab bar";
      this.updateTabOverflowState();
      return;
    }

    this.tabBarElement.classList.remove("tabbar-collapsed");
    this.tabBarToggleButton.dataset.icon = "^";
    this.tabBarToggleButton.title = "Hide tab bar";
    this.updateTabOverflowState();
  }

  private updateTabOverflowState(): void {
    const overflow = tabOverflowState(
      this.tabsElement.scrollWidth,
      this.tabsElement.clientWidth,
      this.tabsElement.scrollLeft,
    );
    "TODO: The tab overflow is obsolete, failed to implement correctly."
    this.tabBarElement.classList.toggle("tabbar-overflowing", overflow.hasOverflow);
    this.tabsElement.classList.toggle("tabs-overflowing", overflow.hasOverflow);
    this.tabScrollLeftButton.disabled = !overflow.canScrollLeft;
    this.tabScrollRightButton.disabled = !overflow.canScrollRight;
  }

  private handleTabStripWheel(event: WheelEvent): void {
    if (this.tabBarCollapsed) {
      return;
    }

    const maxScroll = this.tabsElement.scrollWidth - this.tabsElement.clientWidth;
    if (maxScroll <= 0) {
      return;
    }

    const delta = tabStripScrollDelta(event);
    if (delta === 0) {
      return;
    }

    const nextScroll = clampScrollPosition(this.tabsElement.scrollLeft + delta, maxScroll);
    if (nextScroll === this.tabsElement.scrollLeft) {
      return;
    }

    this.tabsElement.scrollLeft = nextScroll;
    this.updateTabOverflowState();
    event.preventDefault();
  }

  private scrollTabsBy(delta: number): void {
    const maxScroll = this.tabsElement.scrollWidth - this.tabsElement.clientWidth;
    if (maxScroll <= 0) {
      return;
    }

    const target = clampScrollPosition(this.tabsElement.scrollLeft + delta, maxScroll);
    if (target === this.tabsElement.scrollLeft) {
      return;
    }

    this.tabsElement.scrollTo({ left: target, behavior: "smooth" });
    this.updateTabOverflowState();
  }

  private revealTabBarForShortcut(): void {
    if (!this.tabBarCollapsed) {
      return;
    }

    this.tabBarCollapsed = false;
    this.updateTabBarVisibility();
  }

  private newTab(fromShortcut = false): void {
    if (fromShortcut) {
      this.revealTabBarForShortcut();
    }

    this.cancelTabRename();
    this.persistEditor();
    this.tabState = addTab(this.tabState);
    this.renderTabs();
    this.applyActiveTabToEditor();
    this.scheduleSnapshotSync();
  }

  private closeTabById(tabId: number, fromShortcut = false): void {
    if (fromShortcut) {
      this.revealTabBarForShortcut();
    }

    this.cancelTabRename();
    this.persistEditor();
    this.tabState = closeTab(this.tabState, tabId);
    this.renderTabs();
    this.applyActiveTabToEditor();
    this.scheduleSnapshotSync();
  }

  private closeActiveTab(fromShortcut = false): void {
    this.closeTabById(this.tabState.activeTabId, fromShortcut);
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

  private switchToNextTab(): boolean {
    this.cancelTabRename();
    this.persistEditor();
    this.tabState = switchToNextTab(this.tabState);
    this.renderTabs();
    this.applyActiveTabToEditor();
    this.scheduleSnapshotSync();
    return true;
  }

  private switchToPreviousTab(): boolean {
    this.cancelTabRename();
    this.persistEditor();
    this.tabState = switchToPreviousTab(this.tabState);
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

    const nextTitle = this.editingTabTitle;
    const normalizedTitle = nextTitle.trim().length === 0 ? tab.title : nextTitle;

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
      { shortcut: "Help", description: "Write code without distractions." },
      { shortcut: "Cmd/Ctrl+N", description: "Create a new tab." },
      { shortcut: "Cmd/Ctrl+W", description: "Close the active tab." },
      { shortcut: "Cmd/Ctrl+R", description: "Rename active tab." },
      { shortcut: "Cmd/Ctrl+T", description: "Open Theme Search Mode." },
      { shortcut: "Cmd/Ctrl+L", description: "Open language selection." },
      { shortcut: "Cmd/Ctrl+P", description: "Configure empty-page placeholder text." },
      { shortcut: "Cmd/Ctrl+H", description: "Show this help window." },
      { shortcut: "Cmd/Ctrl+Shift+H", description: "Toggle syntax highlighting." },
      { shortcut: "Cmd/Ctrl+Shift+L", description: "Toggle lint diagnostics." },
      { shortcut: "Cmd/Ctrl+1..9", description: "Switch to tab by index." },
      { shortcut: "Cmd/Ctrl+Left/Right", description: "Switch to previous/next tab." },
      { shortcut: "Info", description: "Tab contents are copied to clipboard upon closing this app." },
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

  private toggleHighlighting(): boolean {
    if (this.editor === null) {
      return false;
    }

    this.highlightingEnabled = !this.highlightingEnabled;
    const currentTab = activeTab(this.tabState);
    this.editor.dispatch({
      effects: this.languageCompartment.reconfigure(
        languageExtensionForMode(currentTab.language, this.highlightingEnabled),
      ),
    });
    this.showShortcutToast(
      toggleShortcutMessage("highlighting", this.highlightingEnabled, "Cmd/Ctrl+Shift+Y"),
    );
    return true;
  }

  private toggleDiagnostics(): boolean {
    if (this.editor === null) {
      return false;
    }

    this.diagnosticsEnabled = !this.diagnosticsEnabled;
    this.editor.dispatch({
      effects: this.diagnosticsCompartment.reconfigure(
        diagnosticsExtensionForMode(this.diagnosticsEnabled),
      ),
    });
    this.showShortcutToast(toggleShortcutMessage("lint", this.diagnosticsEnabled, "Cmd/Ctrl+Shift+U"));
    return true;
  }

  private showShortcutToast(message: string): void {
    const existing = this.root.querySelector(".shortcut-toast");
    if (existing !== null) {
      existing.remove();
    }

    const toast = document.createElement("div");
    toast.className = "shortcut-toast";
    toast.textContent = message;
    this.root.appendChild(toast);

    if (this.toastTimerId !== null) {
      window.clearTimeout(this.toastTimerId);
    }

    this.toastTimerId = window.setTimeout(() => {
      toast.remove();
      this.toastTimerId = null;
    }, 1800);
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

export function languageExtensionForMode(
  languageId: LanguageOption["id"],
  analysisEnabled: boolean,
): Extension {
  if (!analysisEnabled) {
    return [];
  }

  return languageExtension(languageId);
}

export function diagnosticsExtensionForMode(analysisEnabled: boolean): Extension {
  if (!analysisEnabled) {
    return [];
  }

  return diagnosticsExtension();
}

export function toggleShortcutMessage(
  feature: "highlighting" | "lint",
  enabled: boolean,
  shortcut: string,
): string {
  const featureLabel = feature === "highlighting" ? "Syntax highlighting" : "Lint diagnostics";
  const stateLabel = enabled ? "enabled" : "disabled";
  return `${featureLabel} ${stateLabel} (${shortcut})`;
}

export function tabStripScrollDelta(event: Pick<WheelEvent, "deltaX" | "deltaY">): number {
  if (Math.abs(event.deltaX) > 0) {
    return event.deltaX;
  }

  if (Math.abs(event.deltaY) > 0) {
    return event.deltaY;
  }

  return 0;
}

export function clampScrollPosition(nextValue: number, maxValue: number): number {
  if (nextValue < 0) {
    return 0;
  }

  if (nextValue > maxValue) {
    return maxValue;
  }

  return nextValue;
}

export function isTabOverflowing(scrollWidth: number, clientWidth: number): boolean {
  return scrollWidth - clientWidth > 1;
}

export interface TabOverflowState {
  hasOverflow: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export function tabOverflowState(
  scrollWidth: number,
  clientWidth: number,
  scrollLeft: number,
): TabOverflowState {
  const hasOverflow = isTabOverflowing(scrollWidth, clientWidth);
  if (!hasOverflow) {
    return {
      hasOverflow: false,
      canScrollLeft: false,
      canScrollRight: false,
    };
  }

  const maxScroll = Math.max(0, scrollWidth - clientWidth);
  return {
    hasOverflow: true,
    canScrollLeft: scrollLeft > 1,
    canScrollRight: scrollLeft < maxScroll - 1,
  };
}
