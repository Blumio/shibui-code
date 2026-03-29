#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COVERAGE_DIR="$ROOT_DIR/coverage"
FRONTEND_COVERAGE_DIR="$COVERAGE_DIR/frontend"
BACKEND_COVERAGE_DIR="$COVERAGE_DIR/backend"
MERGED_COVERAGE_DIR="$COVERAGE_DIR/merged"
BUILD_DIR="$ROOT_DIR/build/coverage"

for cmd in cmake ctest npm node python3; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "$cmd is required but was not found."
    exit 1
  fi
done

if ! python3 -m gcovr --version >/dev/null 2>&1; then
  echo "gcovr is required. Install with: python3 -m pip install gcovr"
  exit 1
fi

rm -rf "$COVERAGE_DIR"
rm -rf "$BUILD_DIR"
mkdir -p "$FRONTEND_COVERAGE_DIR" "$BACKEND_COVERAGE_DIR" "$MERGED_COVERAGE_DIR"

echo "[1/6] Install frontend dependencies"
npm --prefix "$ROOT_DIR/frontend" ci

echo "[2/6] Frontend coverage (Vitest)"
npm --prefix "$ROOT_DIR/frontend" run test:coverage

FRONTEND_COBERTURA="$FRONTEND_COVERAGE_DIR/cobertura-coverage.xml"
if [[ ! -f "$FRONTEND_COBERTURA" ]]; then
  echo "Frontend Cobertura report not found at $FRONTEND_COBERTURA"
  exit 1
fi

echo "[3/6] Configure/build C++ coverage preset"
cmake --preset coverage
cmake --build --preset coverage

echo "[4/6] Run backend + integration tests"
ctest --preset coverage --output-on-failure -L backend
ctest --preset coverage --output-on-failure -L integration

echo "[5/6] Backend coverage (gcovr Cobertura + HTML)"
python3 -m gcovr \
  -r "$ROOT_DIR" \
  --object-directory "$BUILD_DIR" \
  --filter "$ROOT_DIR/backend/src" \
  --exclude "$ROOT_DIR/backend/tests" \
  --exclude-directories ".*CompilerId(C|CXX).*" \
  --exclude "$BUILD_DIR/_deps" \
  --gcov-ignore-errors source_not_found \
  --gcov-ignore-errors no_working_dir_found \
  --cobertura "$BACKEND_COVERAGE_DIR/backend-cobertura.xml"

python3 -m gcovr \
  -r "$ROOT_DIR" \
  --object-directory "$BUILD_DIR" \
  --filter "$ROOT_DIR/backend/src" \
  --exclude "$ROOT_DIR/backend/tests" \
  --exclude-directories ".*CompilerId(C|CXX).*" \
  --exclude "$BUILD_DIR/_deps" \
  --gcov-ignore-errors source_not_found \
  --gcov-ignore-errors no_working_dir_found \
  --html-details "$BACKEND_COVERAGE_DIR/index.html"

BACKEND_COBERTURA="$BACKEND_COVERAGE_DIR/backend-cobertura.xml"
MERGED_COBERTURA="$MERGED_COVERAGE_DIR/coverage-cobertura.xml"
MERGED_HTML_INDEX="$MERGED_COVERAGE_DIR/index.html"

echo "[6/6] Merge frontend + backend coverage"
if command -v reportgenerator >/dev/null 2>&1; then
  reportgenerator \
    "-reports:${BACKEND_COBERTURA};${FRONTEND_COBERTURA}" \
    "-targetdir:${MERGED_COVERAGE_DIR}" \
    "-reporttypes:Cobertura;Html"

  if [[ -f "$MERGED_COVERAGE_DIR/Cobertura.xml" ]]; then
    cp "$MERGED_COVERAGE_DIR/Cobertura.xml" "$MERGED_COBERTURA"
  fi
else
  python3 "$ROOT_DIR/scripts/merge_cobertura.py" \
    --output-xml "$MERGED_COBERTURA" \
    --output-html "$MERGED_HTML_INDEX" \
    "$BACKEND_COBERTURA" \
    "$FRONTEND_COBERTURA"
fi

echo "Coverage outputs:"
echo "- Frontend: $FRONTEND_COBERTURA"
echo "- Backend: $BACKEND_COBERTURA"
echo "- Merged Cobertura: $MERGED_COBERTURA"
echo "- Merged HTML: $MERGED_HTML_INDEX"
