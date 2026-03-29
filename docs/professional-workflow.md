# Professional Workflow Profile

This repository is configured around a single build/test orchestration path:

- Build system: CMake + Ninja
- Native core: C++ library (`backend/`)
- Frontend: TypeScript (`frontend/`)
- Unified runner: CTest
- C++ tests: GoogleTest/gMock
- Frontend unit/contract tests: Vitest
- E2E UI flows: Playwright
- Coverage: gcovr + Vitest, merged into Cobertura/HTML

## Primary commands

```bash
cmake --preset dev
cmake --build --preset dev
ctest --preset dev --output-on-failure
```

CI uses `ci` preset; coverage and sanitizers use dedicated presets.

## Presets

- `dev`: Debug local development.
- `ci`: RelWithDebInfo CI-quality build.
- `release`: Release packaging build.
- `coverage`: Coverage-instrumented backend build.
- `asan` / `ubsan` / `tsan`: sanitizer builds.

## CTest labels

- `backend`
- `frontend`
- `integration`
- `unit`
- `contract`
- `e2e`

Examples:

```bash
ctest --preset ci -L backend
ctest --preset ci -L contract
ctest --preset ci -L e2e
```

## Security and release commands

```bash
bash scripts/security.sh
bash scripts/package-macos.sh
```

`package-macos.sh` supports optional Developer ID signing + notarization via env vars.
