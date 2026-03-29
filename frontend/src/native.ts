export interface NativeBridge {
  sync_snapshot?: (payload: string) => Promise<boolean>;
  clear_snapshot?: () => Promise<boolean>;
  resize_window?: (direction: string) => Promise<boolean>;
  copy_text?: (payload: string) => Promise<boolean>;
}

function bridge(): NativeBridge {
  return window as unknown as NativeBridge;
}

export async function syncSnapshot(payload: string): Promise<void> {
  const api = bridge().sync_snapshot;
  if (api === undefined) {
    return;
  }
  await api(payload);
}

export async function clearSnapshot(): Promise<void> {
  const api = bridge().clear_snapshot;
  if (api === undefined) {
    return;
  }
  await api();
}

export async function resizeWindow(direction: "up" | "down" | "left" | "right"): Promise<void> {
  const api = bridge().resize_window;
  if (api === undefined) {
    return;
  }
  await api(direction);
}

export async function copyText(payload: string): Promise<void> {
  const nativeApi = bridge().copy_text;
  if (nativeApi !== undefined) {
    await nativeApi(payload);
    return;
  }

  if (typeof navigator === "undefined" || navigator.clipboard?.writeText === undefined) {
    return;
  }

  await navigator.clipboard.writeText(payload);
}
