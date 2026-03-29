# Installation

## Prerequisites

- Node.js 20+
- CMake 3.24+
- C++20 compiler
- Python 3.10+ (for `pytest` checks)

### macOS

Install Xcode command line tools and Homebrew dependencies used by your compiler toolchain.

## Global CLI install

```bash
npm install -g shibui-code
```

Then run:

```bash
shibui-code
```

If the native binary is missing, CLI auto-builds it during install/first launch.

## Local dev install

```bash
npm --prefix frontend install
npm run build:frontend
node cli/scripts/build-native.js
```

Run:

```bash
./dist/bin/darwin-$(node -p "process.arch")/shibui-code
```
