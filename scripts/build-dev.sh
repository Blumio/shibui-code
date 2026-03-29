#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
cmake --preset dev
cmake --build --preset dev
ctest --preset dev --output-on-failure
