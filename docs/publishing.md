# Package Publishing Guide

This document describes how to publish Boronix packages to the public npm registry.

## Prerequisites

- Access to the npm registry with authority to publish `boronix` and `create-boronix`.
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
cd packages/boronix && npm publish --dry-run
cd ../create-boronix && npm publish --dry-run
```

### 4. Publish Packages
Publish packages sequentially. Since `create-boronix` depends on the `boronix` framework, publish `boronix` first:

```bash
# 1. Publish boronix framework
cd packages/boronix
npm publish --access public

# 2. Publish create-boronix scaffolder
cd ../create-boronix
npm publish --access public
```

---

## Limitations

- If `npm` CLI is missing or not authenticated locally, publishing will fail. Ensure you are logged in via `npm login` prior to execution.
- If the `boronix` package name is already taken or unavailable on the public registry, update the `name` field in `packages/boronix/package.json` to a scoped name (e.g., `@scoped/boronix`) before publishing.
