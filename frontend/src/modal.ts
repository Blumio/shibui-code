import { fuzzyFilter } from "./fuzzy";
import type { ListItem } from "./types";

export interface SearchModalOptions {
  title: string;
  placeholder: string;
  items: ListItem[];
}

export interface TextInputModalOptions {
  title: string;
  placeholder: string;
  initialValue?: string;
}

export interface HelpShortcutItem {
  shortcut: string;
  description: string;
}

export interface HelpModalOptions {
  title: string;
  shortcuts: HelpShortcutItem[];
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

export async function openSearchModal(options: SearchModalOptions): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const overlay = createElement("div", "modal-overlay");
    const modal = createElement("div", "modal-window");
    const title = createElement("div", "modal-title");
    const input = createElement("input", "modal-input");
    const list = createElement("div", "modal-list");

    title.textContent = options.title;
    input.type = "text";
    input.placeholder = options.placeholder;

    let selectedIndex = 0;
    let visibleItems = [...options.items];

    const cleanup = (value: string | null) => {
      overlay.remove();
      resolve(value);
    };

    const render = () => {
      list.replaceChildren();
      if (visibleItems.length === 0) {
        const empty = createElement("div", "modal-item modal-item-empty");
        empty.textContent = "No matches";
        list.appendChild(empty);
        return;
      }

      visibleItems.forEach((item, index) => {
        const option = createElement("div", "modal-item");
        if (index === selectedIndex) {
          option.classList.add("modal-item-selected");
        }
        option.setAttribute("role", "button");
        option.setAttribute("tabindex", "0");
        option.textContent = item.label;
        option.addEventListener("click", () => cleanup(item.id));
        option.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            cleanup(item.id);
          }
        });
        list.appendChild(option);
      });
    };

    const updateItems = () => {
      visibleItems = fuzzyFilter(options.items, input.value.trim());
      selectedIndex = Math.min(selectedIndex, Math.max(0, visibleItems.length - 1));
      render();
    };

    input.addEventListener("input", updateItems);
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, Math.max(0, visibleItems.length - 1));
        render();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        render();
      } else if (event.key === "Enter") {
        event.preventDefault();
        const selected = visibleItems[selectedIndex];
        cleanup(selected === undefined ? null : selected.id);
      } else if (event.key === "Escape") {
        event.preventDefault();
        cleanup(null);
      }
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        cleanup(null);
      }
    });

    modal.append(title, input, list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    updateItems();
    input.focus();
  });
}

export async function openTextInputModal(options: TextInputModalOptions): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const overlay = createElement("div", "modal-overlay");
    const modal = createElement("div", "modal-window");
    modal.classList.add("modal-window-compact");
    const title = createElement("div", "modal-title");
    const input = createElement("input", "modal-input");
    const hint = createElement("div", "modal-item modal-item-empty");

    title.textContent = options.title;
    input.type = "text";
    input.placeholder = options.placeholder;
    input.value = options.initialValue ?? "";
    hint.textContent = "Press Enter to apply, Escape to cancel";

    const cleanup = (value: string | null) => {
      overlay.remove();
      resolve(value);
    };

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        cleanup(input.value);
      } else if (event.key === "Escape") {
        event.preventDefault();
        cleanup(null);
      }
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        cleanup(null);
      }
    });

    modal.append(title, input, hint);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
}

export async function openHelpModal(options: HelpModalOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    const overlay = createElement("div", "modal-overlay");
    const modal = createElement("div", "modal-window");
    const title = createElement("div", "modal-title");
    const list = createElement("div", "modal-list");

    title.textContent = options.title;

    options.shortcuts.forEach((item) => {
      const row = createElement("div", "modal-help-item");
      const shortcut = createElement("span", "modal-help-shortcut");
      const description = createElement("span", "modal-help-description");

      shortcut.textContent = item.shortcut;
      description.textContent = item.description;

      row.append(shortcut, description);
      list.appendChild(row);
    });

    const cleanup = () => {
      window.removeEventListener("keydown", handleKeydown);
      overlay.remove();
      resolve();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        cleanup();
      }
    });

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    modal.append(title, list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  });
}
