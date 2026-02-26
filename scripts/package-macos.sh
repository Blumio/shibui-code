#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/macos"
VERSION="$(node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")"

cd "$ROOT_DIR"
rm -f "$ROOT_DIR/shibui-code-${VERSION}-Darwin.dmg" "$ROOT_DIR/shibui-code-${VERSION}-Darwin.tar.gz"
npm run build:frontend
cmake -S . -B "$BUILD_DIR" -DSHIBUI_BUILD_TESTS=ON -DCMAKE_BUILD_TYPE=Release
cmake --build "$BUILD_DIR" --config Release
ctest --test-dir "$BUILD_DIR" --output-on-failure
cpack --config "$BUILD_DIR/CPackConfig.cmake"
rm -rf "$ROOT_DIR/_CPack_Packages"
