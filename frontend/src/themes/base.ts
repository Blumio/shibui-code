import type { Extension } from "@codemirror/state";
import { syntaxHighlighting } from "@codemirror/language";
import { HighlightStyle } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

import type { ThemeSpec } from "../types";

export interface ThemePalette {
  background: string;
  foreground: string;
  gutterBackground: string;
  gutterForeground: string;
  caret: string;
  selection: string;
  lineHighlight: string;
  keyword: string;
  variable: string;
  functionName: string;
  string: string;
  number: string;
  comment: string;
  type: string;
  operator: string;
  punctuation: string;
}

function buildThemeExtension(palette: ThemePalette, isDark: boolean): Extension {
  const editorTheme = EditorView.theme(
    {
      "&": {
        color: palette.foreground,
        backgroundColor: palette.background,
        height: "100%",
      },
      ".cm-content": {
        caretColor: palette.caret,
        fontFamily: '"Iosevka", "JetBrains Mono", "Fira Code", monospace',
        fontSize: "14px",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: palette.caret,
      },
      ".cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: palette.selection,
      },
      ".cm-gutters": {
        backgroundColor: palette.gutterBackground,
        color: palette.gutterForeground,
        border: "none",
      },
      ".cm-activeLine": {
        backgroundColor: palette.lineHighlight,
      },
      ".cm-activeLineGutter": {
        backgroundColor: palette.lineHighlight,
      },
      ".cm-panels": {
        backgroundColor: palette.background,
        color: palette.foreground,
      },
      ".cm-searchMatch": {
        backgroundColor: palette.selection,
      },
      ".cm-tooltip": {
        border: `1px solid ${palette.lineHighlight}`,
      },
      ".cm-diagnostic.cm-diagnostic-warning": {
        borderBottom: "2px solid #e7a94d",
      },
      ".cm-diagnostic.cm-diagnostic-error": {
        borderBottom: "2px solid #f14c4c",
      },
    },
    { dark: isDark },
  );

  const highlighting = syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.keyword, color: palette.keyword },
      { tag: [tags.name, tags.variableName], color: palette.variable },
      { tag: tags.function(tags.variableName), color: palette.functionName },
      { tag: tags.string, color: palette.string },
      { tag: [tags.number, tags.bool], color: palette.number },
      { tag: tags.comment, color: palette.comment, fontStyle: "italic" },
      { tag: tags.typeName, color: palette.type },
      { tag: [tags.operator, tags.logicOperator], color: palette.operator },
      { tag: [tags.punctuation, tags.bracket], color: palette.punctuation },
    ]),
  );

  return [editorTheme, highlighting];
}

export function createTheme(
  id: string,
  displayName: string,
  palette: ThemePalette,
  isDark: boolean,
): ThemeSpec {
  return {
    id,
    displayName,
    extension: buildThemeExtension(palette, isDark),
    editorClassName: `theme-${id}`,
  };
}
