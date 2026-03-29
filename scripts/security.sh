#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/5] AddressSanitizer build + backend tests"
cmake --preset asan
cmake --build --preset asan
ctest --test-dir "$ROOT_DIR/build/asan" --output-on-failure -L backend

echo "[2/5] UndefinedBehaviorSanitizer build + backend tests"
cmake --preset ubsan
cmake --build --preset ubsan
ctest --test-dir "$ROOT_DIR/build/ubsan" --output-on-failure -L backend

echo "[3/5] Contract tests (backend + frontend + integration)"
cmake --preset ci
cmake --build --preset ci
ctest --preset ci --output-on-failure -L contract

echo "[4/5] Frontend dependency audit"
npm --prefix "$ROOT_DIR/frontend" audit --audit-level=high || {
  echo "npm audit reported vulnerabilities."
  exit 1
}

echo "[5/5] Optional ThreadSanitizer"
if [[ "${SHIBUI_RUN_TSAN:-0}" == "1" ]]; then
  cmake --preset tsan
  cmake --build --preset tsan
  ctest --test-dir "$ROOT_DIR/build/tsan" --output-on-failure -L backend
else
  echo "Skipping ThreadSanitizer. Set SHIBUI_RUN_TSAN=1 to enable."
fi
