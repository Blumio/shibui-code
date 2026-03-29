# Packaging

Shibui-Code uses CPack for macOS distribution artifacts.

## Build/package command

```bash
bash scripts/package-macos.sh
```

The script uses CMake preset `release`, runs CTest, and then runs CPack.

## Outputs

- Drag-and-drop `.dmg`
- `.tar.gz` archive

## Signing and notarization

The packaging script supports command-line signing/notarization without Xcode UI.

### Enable signing (Hardened Runtime)

Set:

- `SHIBUI_MACOS_SIGN_IDENTITY`

### Enable notarization

Set all three:

- `SHIBUI_NOTARY_APPLE_ID`
- `SHIBUI_NOTARY_TEAM_ID`
- `SHIBUI_NOTARY_PASSWORD`

When enabled, the script submits the DMG with `notarytool` and staples it.

## CI artifacts

`.github/workflows/ci.yml` builds and uploads macOS artifacts for every push/PR.
