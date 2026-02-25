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
