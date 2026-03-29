#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
npm run build:frontend
node cli/scripts/build-native.js --with-tests
ctest --test-dir .native-build/darwin-"$(node -p "process.arch")" --output-on-failure
