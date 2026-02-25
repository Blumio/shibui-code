export interface NativeBridge {
  sync_snapshot?: (payload: string) => Promise<boolean>;
  clear_snapshot?: () => Promise<boolean>;
  resize_window?: (direction: string) => Promise<boolean>;
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
