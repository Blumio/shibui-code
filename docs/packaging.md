# Packaging

Shibui-Code uses CPack for macOS packages.

## macOS

```bash
npm run package:macos
```

Generates:
- A styled drag-and-drop `.dmg` (custom background, app icon placement, Applications shortcut).
- A `.tgz` archive via CPack.

## CI artifacts

GitHub Actions workflow `.github/workflows/ci.yml` builds and uploads macOS artifacts on every push/PR.
