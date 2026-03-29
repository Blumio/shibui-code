# Unified Code Coverage

Shibui-Code has a single coverage entrypoint that emits backend + frontend reports and a merged Cobertura/HTML view.

## Command

```bash
bash scripts/coverage.sh
```

## What it runs

1. Frontend coverage via Vitest (`lcov`, `cobertura`, `html`).
2. Backend tests via CTest on the `coverage` CMake preset.
3. Backend coverage export via `gcovr` (`cobertura` + `html`).
4. Merge frontend/backend Cobertura reports into one Cobertura + HTML summary.

If `reportgenerator` is installed, it is used for merge output. Otherwise a built-in merge script is used.

## Prerequisites

- Node.js 20+
- Python 3.10+
- CMake 3.24+
- gcovr (`python3 -m pip install gcovr`)
- Optional: ReportGenerator (`reportgenerator` command on `PATH`)

## Output

- `coverage/frontend/cobertura-coverage.xml`
- `coverage/backend/backend-cobertura.xml`
- `coverage/backend/index.html`
- `coverage/merged/coverage-cobertura.xml`
- `coverage/merged/index.html`
