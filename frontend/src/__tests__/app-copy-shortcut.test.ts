import { afterEach, describe, expect, it, vi } from "vitest";

import { ShibuiApp } from "../app";
import * as nativeBridge from "../native";

type KeyBinding = {
  key?: string;
  run?: () => boolean;
};

type EditorLike = {
  state: { doc: { length: number; toString: () => string } };
  dispatch: (spec: {
    changes?: { from: number; to: number; insert: string };
    selection?: { anchor: number; head?: number };
  }) => void;
};

type AppInternals = {
  editor: EditorLike | null;
  editorKeyBindings: () => KeyBinding[];
};

function bindingByKey(bindings: KeyBinding[], key: string): KeyBinding {
  const binding = bindings.find((entry) => entry.key === key);
  expect(binding).toBeDefined();
  expect(typeof binding?.run).toBe("function");
  return binding as KeyBinding;
}

describe("copy shortcut", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("copies selected editor text via Mod-c", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const app = new ShibuiApp(root);
    await app.initialize();

    const internals = app as unknown as AppInternals;
    if (internals.editor === null) {
      throw new Error("Expected editor to be initialized");
    }
    const editor = internals.editor;

    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: "alpha\nbeta",
      },
    });
    editor.dispatch({ selection: { anchor: 0, head: 5 } });

    const copySpy = vi.spyOn(nativeBridge, "copyText").mockResolvedValue(undefined);

    const run = bindingByKey(internals.editorKeyBindings(), "Mod-c").run;
    expect(run?.()).toBe(true);
    expect(copySpy).toHaveBeenCalledWith("alpha");
  });

  it("does nothing when Mod-c is used without a selection", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const app = new ShibuiApp(root);
    await app.initialize();

    const internals = app as unknown as AppInternals;
    if (internals.editor === null) {
      throw new Error("Expected editor to be initialized");
    }
    const editor = internals.editor;
    editor.dispatch({ selection: { anchor: 0 } });

    const copySpy = vi.spyOn(nativeBridge, "copyText").mockResolvedValue(undefined);

    const run = bindingByKey(internals.editorKeyBindings(), "Mod-c").run;
    expect(run?.()).toBe(true);
    expect(copySpy).not.toHaveBeenCalled();
  });

  it("pastes clipboard text via Mod-v", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const app = new ShibuiApp(root);
    await app.initialize();

    const internals = app as unknown as AppInternals;
    if (internals.editor === null) {
      throw new Error("Expected editor to be initialized");
    }
    const editor = internals.editor;

    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: "alpha",
      },
    });
    editor.dispatch({ selection: { anchor: 5 } });

    const pasteSpy = vi.spyOn(nativeBridge, "pasteText").mockResolvedValue(" beta");

    const run = bindingByKey(internals.editorKeyBindings(), "Mod-v").run;
    expect(run?.()).toBe(true);
    await vi.waitFor(() => {
      expect(pasteSpy).toHaveBeenCalled();
      expect(editor.state.doc.toString()).toBe("alpha beta");
    });
  });
});
