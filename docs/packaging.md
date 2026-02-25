# Packaging

Shibui-Code uses CPack with platform-specific generators.

## Linux

```bash
npm run package:linux
```

Outputs in build folder and root packaging output depending on generator (`.tgz`, `.deb`).

## macOS

```bash
npm run package:macos
```

Generates `.dmg` / `.tgz` with CPack (depending on available generator support).

## Windows

```powershell
npm run package:windows
```

Generates `.zip` / NSIS installer (`.exe`) when NSIS is available.

## CI artifacts

GitHub Actions workflow `.github/workflows/ci.yml` builds and uploads artifacts for Linux, macOS, and Windows on every push/PR.
