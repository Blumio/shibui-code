# Shibui-Code Architecture

Shibui-Code is a macOS desktop app with a strict split between core logic, native shell, and UI.

## Layers

1. **Backend core (`backend/`)**
- C++20 static library (`shibui_core`).
- Owns snapshot normalization, window snap geometry logic, and bridge contract parsing.
- Tested with GoogleTest/gMock.

2. **Native app shell (`app/`)**
- Cocoa/webview wrapper around the backend core.
- Binds the approved bridge operations and delegates logic to `shibui_core`.
- Owns clipboard and native window APIs.

3. **Frontend (`frontend/`)**
- TypeScript + CodeMirror 6 UI.
- Sends only typed bridge calls (`sync_snapshot`, `clear_snapshot`, `resize_window`, `copy_text`, `paste_text`).
- No persistence APIs and no direct privileged operations.

## Data Flow

- User edits code in frontend tabs.
- Frontend serializes session text and sends it through `sync_snapshot`.
- Backend contract parser validates operation + payload.
- Native shell stores latest normalized snapshot in-memory only.
- On close, native shell copies snapshot to system clipboard and clears memory.

## Bridge Contract Rules

- Fixed operation allowlist.
- Payload parsing/validation per operation.
- Explicit direction validation for `resize_window`.
- Unsupported operations and malformed payloads are rejected.

## Build/Test Orchestration

- CMake presets are the single source of configure/build settings.
- CTest is the unified runner for backend, frontend, integration, and e2e tests.
- Test labels: `backend`, `frontend`, `integration`, `unit`, `contract`, `e2e`.

## Testing Strategy

- **Backend unit + contract:** GoogleTest/gMock (`backend/tests`).
- **Frontend unit + contract:** Vitest (`frontend/src/__tests__`).
- **Frontend e2e flows:** Playwright (`frontend/tests/e2e`).
- **Repository integration contracts:** pytest (`tests/integration`).

## Security Model

- Frontend input is treated as untrusted.
- Native bridge has a narrow command surface and explicit validation.
- Sanitizer presets (`asan`, `ubsan`, optional `tsan`) are part of the workflow.
- CodeQL runs for C++ and JS/TS in CI.
