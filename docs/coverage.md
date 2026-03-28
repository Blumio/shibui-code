# Unified Code Coverage

Shibui-Code has a single coverage entrypoint that runs all test suites and emits a merged LCOV report.

## Command

```bash
npm run coverage
```

## What it runs

1. Frontend tests via Vitest with coverage enabled.
2. Python tests via pytest + coverage.py.
3. Native C++ tests via CMake/CTest built with coverage flags, exported through gcovr.
4. LCOV merge into one file.

## Prerequisites

- Node.js 20+
- Python 3.10+
- CMake 3.24+
- Frontend deps installed (includes `@vitest/coverage-v8@1.6.1`):

```bash
npm --prefix frontend install
```

- `coverage.py` and `gcovr`:

```bash
python3 -m pip install coverage gcovr
```

## Output

The command writes per-suite reports and a merged report:

- `/Users/matthiasblum/projects/shibui-code/coverage/frontend/lcov.info`
- `/Users/matthiasblum/projects/shibui-code/coverage/python/lcov.info`
- `/Users/matthiasblum/projects/shibui-code/coverage/native/lcov.info`
- `/Users/matthiasblum/projects/shibui-code/coverage/lcov.info` (merged)

Use the merged file with coverage platforms (for example Codecov) or local LCOV viewers.
