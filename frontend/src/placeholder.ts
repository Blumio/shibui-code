import type { Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";

class EmptyPlaceholderWidget extends WidgetType {
  private readonly text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  toDOM(): HTMLElement {
    const element = document.createElement("span");
    element.className = "cm-empty-placeholder";
    element.textContent = this.text;
    element.setAttribute("aria-hidden", "true");
    return element;
  }

  override eq(other: EmptyPlaceholderWidget): boolean {
    return other.text === this.text;
  }
}

export function normalizePlaceholderInput(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export function emptyPlaceholderExtension(placeholder: string): Extension {
  const normalized = normalizePlaceholderInput(placeholder);
  const widget = Decoration.widget({
    widget: new EmptyPlaceholderWidget(normalized),
    side: 1,
  });

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate): void {
        if (!update.docChanged) {
          return;
        }
        this.decorations = this.buildDecorations(update.view);
      }

      private buildDecorations(view: EditorView): DecorationSet {
        if (normalized.length === 0 || view.state.doc.length > 0) {
          return Decoration.none;
        }

        return Decoration.set([widget.range(0)]);
      }
    },
    {
      decorations: (pluginValue) => pluginValue.decorations,
    },
  );
}
