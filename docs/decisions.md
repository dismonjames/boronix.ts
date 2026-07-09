# Architectural Decisions Log - Boronix Rebrand

This document outlines design and rebranding decisions made during version `v0.2.5`.

## Decisions

### 1. NPM Registry Name Availability Verification
- Checked name availability for `boronix` and `create-boronix` on the public npm registry.
- Both packages returned `404 Not Found` (confirming they are completely available to claim and publish).

### 2. Configuration File Fallbacks
- We prefer the new `boronix.config.ts` configuration file.
- If it is missing, we fall back to `kumquat.config.ts` if it exists, logging a deprecation warning:
  `⚠ kumquat.config.ts is deprecated. Rename it to boronix.config.ts.`

### 3. Build Manifest Migrations
- Production builds are output to `.boronix/` containing `manifest.json`.
- If a legacy `.kumquat/` folder is detected on server boot, `boronix start` will fail with code 1 and guide the user to rebuild:
  `Found old .kumquat build output. Run \`boronix build\` to generate .boronix.`

### 4. Git Tagging Constraint
- Git tagging is not executed automatically, following the directive: "Do not create tag unless explicitly asked."
