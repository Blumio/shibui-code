# Installation

## Prerequisites

- Node.js 20+
- CMake 3.24+
- C++20 compiler
- Python 3.10+ (for `pytest` checks)

### Linux extra packages

Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev
```

### macOS

Install Xcode command line tools and Homebrew dependencies used by your compiler toolchain.

### Windows

- Visual Studio 2022 Build Tools with C++ workload
- CMake in PATH

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
./dist/bin/$(node -p "process.platform + '-' + process.arch")/$(node -p "process.platform==='win32'?'shibui-code.exe':'shibui-code'")
```
