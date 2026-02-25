export function isPrimaryModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

export function shortcutDigit(event: KeyboardEvent): number | null {
  if (!isPrimaryModifier(event)) {
    return null;
  }

  if (event.key < "1" || event.key > "9") {
    return null;
  }

  return Number(event.key);
}

export type ResizeDirection = "up" | "down" | "left" | "right";

export function resizeDirectionShortcut(event: KeyboardEvent, isMac: boolean): ResizeDirection | null {
  if (!isMac || !event.ctrlKey || event.metaKey) {
    return null;
  }

  switch (event.key) {
    case "PageUp":
      return "up";
    case "PageDown":
      return "down";
    case "Home":
      return "left";
    case "End":
      return "right";
    default:
      return null;
  }
}
