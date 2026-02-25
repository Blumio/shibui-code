import { syntaxTree } from "@codemirror/language";
import type { Diagnostic } from "@codemirror/lint";
import { lintGutter, linter } from "@codemirror/lint";
import type { Extension } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

export interface Range {
  from: number;
  to: number;
}

export function hasNonWhitespaceContent(content: string): boolean {
  return content.trim().length > 0;
}

export function trailingWhitespaceRanges(content: string): Range[] {
  const ranges: Range[] = [];
  const lines = content.split("\n");
  let offset = 0;

  for (const line of lines) {
    const trailingStart = line.search(/[ \t]+$/u);
    if (trailingStart !== -1) {
      ranges.push({
        from: offset + trailingStart,
        to: offset + line.length,
      });
    }

    offset += line.length + 1;
  }

  return ranges;
}

export function longLineRanges(content: string, maxLength = 120): Range[] {
  const ranges: Range[] = [];
  const lines = content.split("\n");
  let offset = 0;

  for (const line of lines) {
    if (line.length > maxLength) {
      ranges.push({
        from: offset + maxLength,
        to: offset + line.length,
      });
    }

    offset += line.length + 1;
  }

  return ranges;
}

function syntaxErrorDiagnostics(view: EditorView): Diagnostic[] {
  if (!hasNonWhitespaceContent(view.state.doc.toString())) {
    return [];
  }

  const diagnostics: Diagnostic[] = [];

  syntaxTree(view.state).iterate({
    enter(node) {
      if (node.type.isError) {
        diagnostics.push({
          from: node.from,
          to: Math.max(node.to, node.from + 1),
          severity: "error",
          message: "Syntax error",
        });
      }
    },
  });

  return diagnostics;
}

function warningDiagnostics(view: EditorView): Diagnostic[] {
  const content = view.state.doc.toString();

  const trailing = trailingWhitespaceRanges(content).map<Diagnostic>((range) => ({
    from: range.from,
    to: Math.max(range.to, range.from + 1),
    severity: "warning",
    message: "Trailing whitespace",
  }));

  const longLines = longLineRanges(content).map<Diagnostic>((range) => ({
    from: range.from,
    to: Math.max(range.to, range.from + 1),
    severity: "warning",
    message: "Line exceeds 120 characters",
  }));

  return [...trailing, ...longLines];
}

export function diagnosticsExtension(): Extension {
  return [
    lintGutter(),
    linter((view) => {
      return [...syntaxErrorDiagnostics(view), ...warningDiagnostics(view)];
    }),
  ];
}
