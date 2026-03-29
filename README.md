# Shibui-Code

Shibui-Code is a distraction-free macOS code scribbling app for deliberate coding practice.

![Shibui-Code icon](assets/icons/shibui-code.png)

## Why this exists

Most editors optimize for large projects and productivity workflows. Shibui-Code optimizes for focused thinking in temporary scratch sessions.

## Who it is for

- Developers practicing syntax and problem-solving
- Interview prep sessions
- Teaching/demo sessions where persistence is unnecessary
- Anyone who wants a clean, low-distraction editor shell without any helping tools

## Why it is technically interesting

- Native desktop host in C++20 with macOS webview backend
- Embedded CodeMirror 6 frontend bundled into a native header
- Strict no-persistence runtime constraints
- macOS packaging via CMake + CPack

## Install

### Global CLI install

```bash
npm install -g shibui-code
```

### Launch

```bash
shibui-code
```

The package builds a native binary during install/first launch when needed.

## Hello world in 30 seconds

```bash
shibui-code
```

Inside the app:

1. Press `Ctrl+N` for a new tab.
2. Press `Ctrl+L` and choose a language.
3. Type code.
4. Close the app to copy the full session snapshot to your clipboard.

See [examples/hello-world/README.md](examples/hello-world/README.md) for a minimal walkthrough.

## Key features

- Multi-tab temporary editor sessions
- Language selection for common programming languages
- Theme search mode (`Ctrl+S`) with fuzzy matching
- Static diagnostics (syntax errors, trailing whitespace, long lines)
- Clipboard snapshot export on app close
- No telemetry, plugins, cloud sync, or hidden background services

## Keyboard shortcuts

- `Ctrl+N`: new tab
- `Ctrl+W`: close tab
- `Ctrl+S`: open theme search mode
- `Ctrl+L`: open language selector
- `Ctrl+1..9`: switch tabs

## Architecture and design choices

- Native shell: C++20 + webview
- Frontend: TypeScript + CodeMirror 6
- Build/package: CMake + CPack
- CLI distribution: npm package with `shibui-code` bin

Details:
- [docs/packaging.md](docs/packaging.md)

## Tradeoffs and limitations

Shibui-Code intentionally does not support:

- File save/load
- Session persistence
- Code completion/snippets/refactoring
- Plugin ecosystems
- External API calls and telemetry

This app is not meant as a full IDE and is intentionally kept bare bones for maximum focus.

## Local development

```bash
npm --prefix frontend install
npm run build:frontend
npm run build
```

## Quality checks

```bash
npm run lint
npm test
```

## Packaging

```bash
npm run package:macos
```

## Roadmap

- Add macOS clean-machine install smoke tests in CI
- Publish reproducible release notes per version
- Expand theme packs while keeping startup fast
- Tighten native error reporting for missing runtime deps

## Security and contribution

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Release process

Use [docs/release-checklist.md](docs/release-checklist.md) before tagging and publishing.
