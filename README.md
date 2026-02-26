# Shibui-Code

Shibui-Code is a distraction-free desktop code scribbling editor for deliberate practice.

It is intentionally constrained:
- Syntax highlighting for common languages
- Lint-style static diagnostics (errors/warnings)
- Temporary tabs only
- No file save/load
- No completion, snippets, refactoring, AI, or IntelliSense

## Stack

- Native shell: **C++20**
- Cross-platform desktop runtime: **webview** (GTK/WebKit backend on Linux)
- Editor: **CodeMirror 6** (TypeScript frontend)
- Build: **CMake + CPack**
- CLI install/launch: **npm global package with `shibui-code` bin**

## Features

- Supported languages:
  - JavaScript
  - TypeScript
  - Python
  - C++
  - C
  - Rust
  - Java
  - Go
  - HTML
  - CSS
  - JSON
  - Bash
  - Markdown
- Line numbers
- Multi-tab editor with top tab bar
- Theme Search Mode (`Ctrl+S`) with fuzzy search and instant apply
- Built-in themes at top:
  - VS Code Dark+
  - Monokai
  - Dracula
  - Solarized Dark
  - Solarized Light
  - GitHub Light
- Static diagnostics:
  - Syntax error underlines when parser reports errors
  - Warning markers for trailing whitespace
  - Warning markers for long lines (>120 chars)
- Clipboard export on close:
  - Editor session snapshot copied to system clipboard on app exit
  - In-memory tab data cleared on close

## Keyboard Shortcuts

- `Ctrl+N` -> New tab
- `Ctrl+W` -> Close tab
- `Ctrl+S` -> Open Theme Search Mode
- `Ctrl+L` -> Open language selection palette
- `Ctrl+1..9` -> Switch tabs

## Strict Runtime Constraints

The app does not:
- Save files
- Load files
- Persist sessions
- Call external APIs
- Send telemetry/analytics
- Load plugins/extensions
- Auto-update

## Prerequisites

- Node.js 20+
- CMake 3.24+
- C++20 compiler toolchain
- Python 3.10+ (for repo tests)

### Linux packages (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev
```

## Global CLI Installation

```bash
npm install -g shibui-code
```

Launch:

```bash
shibui-code
```

The package postinstall builds a native binary for the current platform. First launch also triggers build if needed.

## Local Development

1. Install frontend deps:

```bash
npm --prefix frontend install
```

2. Build frontend bundle and embed into C++ header:

```bash
npm run build:frontend
```

3. Build native binary:

```bash
node cli/scripts/build-native.js --with-tests
```

4. Run native unit tests:

```bash
ctest --test-dir .native-build/$(node -p "process.platform + '-' + process.arch") --output-on-failure
```

5. Run frontend unit tests:

```bash
npm --prefix frontend run test
```

6. Run python contract tests:

```bash
pytest -q
```

## Build Commands

- Full build:

```bash
npm run build
```

- Full test run:

```bash
npm test
```

## Packaging

- Linux package build:

```bash
npm run package:linux
```

- macOS package build:

```bash
npm run package:macos
```

- Windows package build:

```powershell
npm run package:windows
```

Packaging outputs:
- Linux: `TGZ`, `DEB`
- macOS: styled drag-and-drop `DMG` + `TGZ`
- Windows: `ZIP`, `NSIS`

## CLI Publishing Instructions

1. Ensure clean repository state.
2. Update version in `/Users/matthiasblum/projects/shibui-code/package.json`.
3. Run full tests:

```bash
npm test
```

4. Login to npm:

```bash
npm login
```

5. Publish:

```bash
npm publish --access public
```

After publish, users install globally with:

```bash
npm install -g shibui-code
```

## Project Structure

```text
.
├── .github/workflows/ci.yml
├── CMakeLists.txt
├── README.md
├── cli/
│   ├── shibui-code.js
│   └── scripts/
│       ├── build-native.js
│       ├── detect-platform.js
│       └── postinstall.js
├── docs/
│   ├── architecture.md
│   ├── installation.md
│   └── packaging.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── src/
│       ├── __tests__/
│       ├── app.ts
│       ├── fuzzy.ts
│       ├── keybindings.ts
│       ├── language.ts
│       ├── linting.ts
│       ├── main.ts
│       ├── modal.ts
│       ├── native.ts
│       ├── style.css
│       ├── tabs.ts
│       ├── theme-registry.ts
│       ├── themes/
│       │   ├── base.ts
│       │   ├── dracula.ts
│       │   ├── github-light.ts
│       │   ├── monokai.ts
│       │   ├── solarized-dark.ts
│       │   ├── solarized-light.ts
│       │   └── vscode-dark-plus.ts
│       └── types.ts
├── scripts/
│   ├── build-dev.sh
│   ├── embed-frontend.mjs
│   ├── package-linux.sh
│   ├── package-macos.sh
│   └── package-windows.ps1
├── src/
│   ├── app.cpp
│   ├── app.hpp
│   ├── clipboard.hpp
│   ├── clipboard_linux.cpp
│   ├── clipboard_mac.mm
│   ├── clipboard_win.cpp
│   ├── frontend_bundle.hpp
│   ├── main.cpp
│   ├── snapshot.cpp
│   └── snapshot.hpp
└── tests/
    ├── cpp/test_snapshot.cpp
    └── test_repository_contract.py
```
