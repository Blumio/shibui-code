# Release Checklist

Use this checklist before creating a GitHub release and publishing to npm.

## Scope and docs

- [ ] Confirm the release scope is intentional and user-facing value is clear.
- [ ] Update `README.md` if behavior or setup changed.
- [ ] Update `CHANGELOG.md` with version/date and notable entries.
- [ ] Update architecture/packaging docs if relevant.

## Quality gates

- [ ] Run lint/type checks:

```bash
npm run lint
```

- [ ] Run full tests:

```bash
npm test
```

## Package validation

- [ ] Confirm `package.json` metadata is correct (`name`, `version`, `license`, `repository`, `homepage`, `bugs`, `exports`).
- [ ] Confirm `files` whitelist only includes intended publish artifacts.
- [ ] Validate tarball contents:

```bash
npm pack --dry-run
```

## Release and publish

- [ ] Bump version according to semver impact.
- [ ] Create and push a version tag.
- [ ] Publish GitHub release notes.
- [ ] Publish to npm (`--access public` for first scoped public release).

## Post-release

- [ ] Verify install on a clean machine:

```bash
npm install -g shibui-code
shibui-code
```

- [ ] Confirm release artifacts and npm metadata are visible and correct.
