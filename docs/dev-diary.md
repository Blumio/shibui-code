# Shibui-Code Dev Diary

## Project Goal
Build a distraction-free macOS desktop code scribbling app with syntax highlighting and static diagnostics, no file I/O, and global CLI launch support.

## Build Journey
1. **Initial architecture selection**
- Native shell in C++ using `webview` with the macOS native backend.
- Editor frontend in TypeScript using CodeMirror 6.
- Build + packaging via CMake/CPack.
- Global install/launch via npm (`shibui-code`).

2. **From empty repository to runnable app**
- Generated full project structure from scratch.
- Implemented native runtime, clipboard integration, frontend embedding, and CLI launcher.
- Implemented editor features: temporary tabs, language switching, theme search modal, keyboard shortcuts, diagnostics.
- Added docs, packaging scripts, and CI workflow.

3. **Test and validation setup**
- Added C++ unit tests for snapshot normalization.
- Added TypeScript unit tests for tab state, keybindings, fuzzy search, theme registry, lint helpers, and bridge utilities.
- Added Python repo-contract tests for required files and feature expectations.

## Major Roadblocks and Fixes
1. **Dependency resolution failures in Docker**
- `@codemirror/lang-bash` did not exist in npm registry.
- Fix: switched Bash highlighting to `@codemirror/legacy-modes` shell mode.

2. **Version pin breakage (`ETARGET`)**
- Pinned versions like `@codemirror/lang-go@^6.0.2` failed in target environment.
- Fix: relaxed CodeMirror package ranges to stable major-compatible constraints.

3. **Native API mismatch with webview**
- Compile failed due to outdated `bind` callback signature.
- Fix: migrated bindings to `std::string(const std::string&)` and adjusted return format.

4. **Docker test contract failure from missing CI file**
- Python test expected `.github/workflows/ci.yml`, but `.dockerignore` excluded `.github`.
- Fix: stopped excluding `.github` from Docker context.

5. **Frontend runtime parse failures in embedded bundle**
- Browser-side errors like `SyntaxError: Unexpected token '<'` and `Unexpected EOF` occurred from inline script embedding edge cases.
- Fix: rewrote embedding pipeline to load frontend JS as a base64 `data:` module URL and inject CSS safely.

6. **Container GUI setup issues on macOS**
- Dockerized Linux GUI required an X11 server on host.
- XQuartz was missing or not configured, resulting in `GTK init failed` and display errors.
- Fix: install/configure XQuartz, enable network clients, set `DISPLAY`, allow local X access.

7. **Environment constraints while iterating**
- Restricted sandbox/network conditions caused intermittent package installation and Docker daemon limitations during development.
- Fix: iterated with local unit checks plus user-side Docker executions for final confirmation.

## Outcome
A working Docker image (`shibui-code:local`) was built and the GUI launched successfully through XQuartz, confirming end-to-end functionality of the current prototype.

## Current Prototype Characteristics
- macOS-focused architecture (C++ + webview + CodeMirror frontend).
- Temporary in-memory tabs only.
- Syntax highlighting across required languages.
- Static diagnostics (syntax errors + warning markers).
- Theme search mode and keyboard-first operation.
- No AI/completion/refactoring/file persistence.
