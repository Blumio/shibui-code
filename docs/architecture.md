# Shibui-Code Architecture

Shibui-Code is a cross-platform desktop app built from two layers:

1. **Native shell (C++ + GTK-compatible runtime)**
- Uses [`webview`](https://github.com/webview/webview) from C++.
- Linux backend uses GTK/WebKit.
- macOS and Windows use native webview implementations.
- Native layer receives editor snapshots and copies them to the system clipboard when the app closes.

2. **Editor frontend (TypeScript + CodeMirror 6)**
- Runs fully local inside the embedded webview.
- Manages temporary tabs, language mode switching, themes, keyboard shortcuts, and lint diagnostics.
- Does not read/write files or persist session state.

## Data Flow

- User edits code in CodeMirror tab.
- Frontend serializes session content and sends it to native `sync_snapshot` bridge.
- Native stores latest snapshot in memory only.
- On process exit, native writes snapshot to clipboard and clears memory.

## Security / Constraint Model

- No project file browsing, save/load, or persistence APIs.
- No analytics or telemetry.
- No auto-update or plugin model.
- No AI/completion/refactoring services.

## Testing Strategy

- TypeScript unit tests (Vitest) for frontend state logic, keybindings, filtering, themes, lint helpers, and bridge behavior.
- C++ unit tests (CTest) for snapshot normalization.
- Python repository contract tests (pytest) to assert required files/sections/language coverage.
