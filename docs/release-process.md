# Release Process

This document describes the workflow for tagging, documenting, and releasing a new version of Boronix.

## Release Workflow

### 1. Update Versions
Bump the package versions in all package descriptors:
- `packages/boronix/package.json`
- `packages/create-boronix/package.json`
- Scaffolding target versions in `packages/create-boronix/src/index.ts`
- Template default files:
  - `packages/create-boronix/src/templates/basic/package.json`
  - `packages/create-boronix/src/templates/homework/package.json`

### 2. Update CHANGELOG
Document all new changes under the corresponding version heading in `CHANGELOG.md`.

### 3. Run Checks
Verify compile stages, unit tests, and smoke scenarios pass cleanly:

```bash
bun run release:check
bun run smoke:pack
```

### 4. Commit and Tag
Commit all metadata modifications and generate a signed git tag:

```bash
git add .
git commit -m "chore(release): bump version to <version>"
git tag -a v<version> -m "v<version>"
git push origin master --follow-tags
```

### 5. Create GitHub Release
1. Copy the draft release notes from `docs/releases/github-v<version>.md`.
2. Navigate to GitHub releases and draft a new release matching the pushed tag.
3. Attach packed `.tgz` tarballs as release assets if needed.
