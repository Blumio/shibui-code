#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/release"
VERSION="$(node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")"
APP_BUNDLE="$BUILD_DIR/shibui-code.app"

SIGN_IDENTITY="${SHIBUI_MACOS_SIGN_IDENTITY:-}"
NOTARY_APPLE_ID="${SHIBUI_NOTARY_APPLE_ID:-}"
NOTARY_TEAM_ID="${SHIBUI_NOTARY_TEAM_ID:-}"
NOTARY_PASSWORD="${SHIBUI_NOTARY_PASSWORD:-}"

cd "$ROOT_DIR"

rm -f \
  "$BUILD_DIR/shibui-code-${VERSION}-Darwin.dmg" \
  "$BUILD_DIR/shibui-code-${VERSION}-Darwin.tar.gz" \
  "$ROOT_DIR/shibui-code-${VERSION}-Darwin.dmg" \
  "$ROOT_DIR/shibui-code-${VERSION}-Darwin.tar.gz"

echo "[1/5] Configure + build release preset"
cmake --preset release
cmake --build --preset release

echo "[2/5] Run full CTest suite"
ctest --test-dir "$BUILD_DIR" --output-on-failure

if [[ -n "$SIGN_IDENTITY" ]]; then
  echo "[3/5] Sign app bundle with Hardened Runtime"
  codesign \
    --force \
    --sign "$SIGN_IDENTITY" \
    --options runtime \
    --timestamp \
    "$APP_BUNDLE"

  codesign --verify --strict --verbose=2 "$APP_BUNDLE"
else
  echo "[3/5] Skipping signing (set SHIBUI_MACOS_SIGN_IDENTITY to enable)."
fi

echo "[4/5] Build release packages"
cpack --config "$BUILD_DIR/CPackConfig.cmake"

DMG_PATH="$BUILD_DIR/shibui-code-${VERSION}-Darwin.dmg"
TGZ_PATH="$BUILD_DIR/shibui-code-${VERSION}-Darwin.tar.gz"

if [[ -f "$DMG_PATH" ]]; then
  cp "$DMG_PATH" "$ROOT_DIR/"
fi
if [[ -f "$TGZ_PATH" ]]; then
  cp "$TGZ_PATH" "$ROOT_DIR/"
fi

if [[ -n "$NOTARY_APPLE_ID" || -n "$NOTARY_TEAM_ID" || -n "$NOTARY_PASSWORD" ]]; then
  if [[ -z "$SIGN_IDENTITY" ]]; then
    echo "Notarization requested, but SHIBUI_MACOS_SIGN_IDENTITY is not set."
    exit 1
  fi

  if [[ -z "$NOTARY_APPLE_ID" || -z "$NOTARY_TEAM_ID" || -z "$NOTARY_PASSWORD" ]]; then
    echo "To notarize, set SHIBUI_NOTARY_APPLE_ID, SHIBUI_NOTARY_TEAM_ID, and SHIBUI_NOTARY_PASSWORD."
    exit 1
  fi

  if [[ ! -f "$DMG_PATH" ]]; then
    echo "DMG artifact not found for notarization: $DMG_PATH"
    exit 1
  fi

  echo "[5/5] Notarize + staple DMG"
  xcrun notarytool submit "$DMG_PATH" \
    --apple-id "$NOTARY_APPLE_ID" \
    --team-id "$NOTARY_TEAM_ID" \
    --password "$NOTARY_PASSWORD" \
    --wait

  xcrun stapler staple "$DMG_PATH"
else
  echo "[5/5] Skipping notarization (set SHIBUI_NOTARY_* env vars to enable)."
fi

echo "Artifacts:"
echo "- $ROOT_DIR/shibui-code-${VERSION}-Darwin.dmg"
echo "- $ROOT_DIR/shibui-code-${VERSION}-Darwin.tar.gz"
