# Package Publishing Guide

This document describes how to publish Goros packages to the public npm registry.

## Prerequisites

- Access to the npm registry with authority to publish `goros` and `create-goros`.
- Bun installed on the development machine.

## Step-by-Step Publishing Flow

### 1. Run Pre-Release Audits
Verify that the workspace is fully stabilized, tests are passing, and types compile correctly:

```bash
bun run release:check
```

### 2. Verify Tarball Integrity
Run the end-to-end smoke test to verify package tarball installations outside the repository:

```bash
bun run smoke:pack
```

### 3. Dry-Run Verification
Verify packed file structure without uploading to npm:

```bash
cd packages/goros && npm publish --dry-run
cd ../create-goros && npm publish --dry-run
```

### 4. Publish Packages
Publish packages sequentially. Since `create-goros` depends on the `goros` framework, publish `goros` first:

```bash
# 1. Publish goros framework
cd packages/goros
npm publish --access public

# 2. Publish create-goros scaffolder
cd ../create-goros
npm publish --access public
```

---

## Limitations

- If `npm` CLI is missing or not authenticated locally, publishing will fail. Ensure you are logged in via `npm login` prior to execution.
- If the `goros` package name is already taken or unavailable on the public registry, update the `name` field in `packages/goros/package.json` to a scoped name (e.g., `@scoped/goros`) before publishing.
