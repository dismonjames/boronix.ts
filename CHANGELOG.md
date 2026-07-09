# Changelog

All notable changes to this project will be documented in this file.

## v0.2.5 - Rebrand to Goros

- Rebranded Kumquat.ts to Goros.
- Renamed package `kumquat` to `goros`.
- Renamed creator package `create-kumquat` to `create-goros`.
- Renamed CLI command `kumquat` to `goros`.
- Renamed config file to `goros.config.ts`.
- Renamed build output to `.goros`.
- Updated docs, examples, package metadata, and smoke tests.
- Verified npm tarball packaging and local install flow.

Note: Goros was formerly developed as Kumquat.ts during early alpha.

## v0.2.4 - Publish Readiness

- Stabilized package metadata for npm registry standard compliance.
- Added release check script (`scripts/release-check.ts`).
- Added tarball smoke test script (`scripts/smoke-pack.ts`).
- Included README.md and LICENSE inside package tarballs.
- Documented package publishing process.
- Implemented non-interactive scaffolding option flags for `create-goros`.

## v0.2.3-cli-visual

- Added visual CLI experience with startup cards, request logging, and ASCII trees.
- Added routes tree visualization and inspect route utilities.
- Styled custom error outputs and hint helpers.
- Added network LAN IP detection.
