export type SessionStyleKind = "highlight" | "lint";

export function normalizeSessionCss(input: string): string {
  return input.trim();
}

export function sessionStyleElementId(kind: SessionStyleKind): string {
  return `shibui-session-style-${kind}`;
}

export function sessionStyleContent(kind: SessionStyleKind, css: string): string {
  const normalized = normalizeSessionCss(css);
  if (normalized.length === 0) {
    return "";
  }

  return `/* ${kind} session style */\n${normalized}`;
}

export function applySessionCss(
  kind: SessionStyleKind,
  css: string,
  targetDocument: Document = document,
): void {
  const styleId = sessionStyleElementId(kind);
  let style = targetDocument.getElementById(styleId) as HTMLStyleElement | null;

  if (style === null) {
    style = targetDocument.createElement("style");
    style.id = styleId;
    targetDocument.head.appendChild(style);
  }

  style.textContent = sessionStyleContent(kind, css);
}
