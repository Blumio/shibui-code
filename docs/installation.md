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
cmake --preset dev
cmake --build --preset dev
```

Run:

```bash
./build/dev/app/shibui-code.app/Contents/MacOS/shibui-code
```
