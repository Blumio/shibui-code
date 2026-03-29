export const BRIDGE_VERSION = 2;

export const BRIDGE_METHODS = {
  syncSnapshot: "sync_snapshot",
  clearSnapshot: "clear_snapshot",
  resizeWindow: "resize_window",
  copyText: "copy_text",
  pasteText: "paste_text",
} as const;

export type ResizeDirection = "up" | "down" | "left" | "right";

type BridgeCall = (...args: string[]) => Promise<boolean>;

interface NativeBridge {
  [BRIDGE_METHODS.syncSnapshot]?: BridgeCall;
  [BRIDGE_METHODS.clearSnapshot]?: () => Promise<boolean>;
  [BRIDGE_METHODS.resizeWindow]?: (direction: ResizeDirection) => Promise<boolean>;
  [BRIDGE_METHODS.copyText]?: BridgeCall;
  [BRIDGE_METHODS.pasteText]?: () => Promise<string | null>;
}

function bridge(): NativeBridge {
  return window as unknown as NativeBridge;
}

function isResizeDirection(value: string): value is ResizeDirection {
  return value === "up" || value === "down" || value === "left" || value === "right";
}

export async function syncSnapshot(payload: string): Promise<void> {
  const api = bridge()[BRIDGE_METHODS.syncSnapshot];
  if (api === undefined) {
    return;
  }

  await api(payload);
}

export async function clearSnapshot(): Promise<void> {
  const api = bridge()[BRIDGE_METHODS.clearSnapshot];
  if (api === undefined) {
    return;
  }

  await api();
}

export async function resizeWindow(direction: ResizeDirection): Promise<void> {
  if (!isResizeDirection(direction)) {
    return;
  }

  const api = bridge()[BRIDGE_METHODS.resizeWindow];
  if (api === undefined) {
    return;
  }

  await api(direction);
}

export async function copyText(payload: string): Promise<void> {
  const nativeApi = bridge()[BRIDGE_METHODS.copyText];
  if (nativeApi !== undefined) {
    await nativeApi(payload);
    return;
  }

  if (typeof navigator === "undefined" || navigator.clipboard?.writeText === undefined) {
    return;
  }

  await navigator.clipboard.writeText(payload);
}

export async function pasteText(): Promise<string | null> {
  const nativeApi = bridge()[BRIDGE_METHODS.pasteText];
  if (nativeApi !== undefined) {
    const value = await nativeApi();
    return typeof value === "string" ? value : null;
  }

  if (typeof navigator === "undefined" || navigator.clipboard?.readText === undefined) {
    return null;
  }

  return navigator.clipboard.readText();
}
