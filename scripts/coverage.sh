#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COVERAGE_DIR="$ROOT_DIR/coverage"
NATIVE_BUILD_DIR="$ROOT_DIR/build-coverage"
PLATFORM_ID="$(node -p "process.platform + '-' + process.arch")"

if ! command -v cmake >/dev/null 2>&1; then
  echo "cmake is required but was not found."
  exit 1
fi

if ! command -v ctest >/dev/null 2>&1; then
  echo "ctest is required but was not found."
  exit 1
fi

if ! python3 -m coverage --version >/dev/null 2>&1; then
  echo "coverage.py is required. Install with: python3 -m pip install coverage"
  exit 1
fi

if ! python3 -m gcovr --version >/dev/null 2>&1; then
  echo "gcovr is required. Install with: python3 -m pip install gcovr"
  exit 1
fi

if ! node -e "require.resolve('@vitest/coverage-v8/package.json', { paths: ['$ROOT_DIR/frontend'] })" >/dev/null 2>&1; then
  echo "@vitest/coverage-v8 is required and must match Vitest 1.x."
  echo "Run: npm --prefix \"$ROOT_DIR/frontend\" install"
  exit 1
fi

rm -rf "$COVERAGE_DIR"
mkdir -p "$COVERAGE_DIR/frontend" "$COVERAGE_DIR/python" "$COVERAGE_DIR/native"

echo "[1/4] Frontend coverage (Vitest)"
npm --prefix "$ROOT_DIR/frontend" run test -- --coverage

echo "[2/4] Python coverage (pytest + coverage.py)"
python3 -m coverage erase
python3 -m coverage run -m pytest -q
python3 -m coverage lcov -o "$COVERAGE_DIR/python/lcov.info"

echo "[3/4] Native coverage (CTest + gcovr)"
rm -rf "$NATIVE_BUILD_DIR"

WEBVIEW_SOURCE_DIR=""
for candidate in \
  "$ROOT_DIR/.native-build/$PLATFORM_ID/_deps/webview-src" \
  "$ROOT_DIR/build/_deps/webview-src"
do
  if [ -d "$candidate" ]; then
    WEBVIEW_SOURCE_DIR="$candidate"
    break
  fi
done

CMAKE_ARGS=(
  -DSHIBUI_BUILD_TESTS=ON
  -DCMAKE_BUILD_TYPE=Debug
  -DCMAKE_CXX_FLAGS="--coverage -O0 -g"
  -DCMAKE_EXE_LINKER_FLAGS="--coverage"
)

if [ -n "$WEBVIEW_SOURCE_DIR" ]; then
  echo "Using cached webview source: $WEBVIEW_SOURCE_DIR"
  CMAKE_ARGS+=(
    -DFETCHCONTENT_SOURCE_DIR_WEBVIEW="$WEBVIEW_SOURCE_DIR"
    -DFETCHCONTENT_UPDATES_DISCONNECTED=ON
  )
fi

cmake -S "$ROOT_DIR" -B "$NATIVE_BUILD_DIR" "${CMAKE_ARGS[@]}"
cmake --build "$NATIVE_BUILD_DIR"
ctest --test-dir "$NATIVE_BUILD_DIR" --output-on-failure
python3 -m gcovr \
  -r "$ROOT_DIR" \
  --object-directory "$NATIVE_BUILD_DIR" \
  --filter "$ROOT_DIR/src" \
  --exclude "$ROOT_DIR/tests" \
  --exclude-directories ".*CompilerId(C|CXX).*" \
  --exclude "$NATIVE_BUILD_DIR/_deps" \
  --gcov-ignore-errors source_not_found \
  --gcov-ignore-errors no_working_dir_found \
  --lcov "$COVERAGE_DIR/native/lcov.info"

echo "[4/4] Merge LCOV files"
cat \
  "$COVERAGE_DIR/frontend/lcov.info" \
  "$COVERAGE_DIR/python/lcov.info" \
  "$COVERAGE_DIR/native/lcov.info" \
  > "$COVERAGE_DIR/lcov.info"

echo "Unified coverage report written to: $COVERAGE_DIR/lcov.info"
